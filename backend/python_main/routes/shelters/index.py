# routes/shelters/index.py

import mysql.connector
from mysql.connector import Error
from datetime import datetime, date
import json
import sys
import os
import math
import html
import logging
import re
from decimal import Decimal

# db_config.py 파일의 경로를 시스템 경로에 추가
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'db')))
from db_config import get_db_config

# Logging 설정
logging.basicConfig(level=logging.ERROR)

def connect_to_database():
    try:
        connection = mysql.connector.connect(**get_db_config())
        if connection.is_connected():
            return connection
    except Error as e:
        logging.error(f"Error connecting to MySQL database: {e}")
        return None

def execute_query(connection, query, params=None):
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params)
        results = cursor.fetchall()
        cursor.close()
        return results
    except Error as e:
        logging.error(f"Error executing query: {e}")
        return None

def format_response(status_code, message, data=None):
    response = {
        "statusCode": status_code,
        "message": html.escape(message)
    }
    if data is not None:
        response["data"] = data
    return response

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Radius of the Earth in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance

def serialize_data(data, key=None, shelter_type=None):
    if isinstance(data, (datetime, date)):
        return data.isoformat()
    elif isinstance(data, Decimal):
        if key == 'postal_code' and shelter_type == 'CivilDefenseShelters':
            return str(data).replace('.', '')
        return str(data)  # Decimal을 문자열로 변환
    elif isinstance(data, str):
        if key == 'postal_code' and shelter_type == 'CivilDefenseShelters':
            return data.replace('.', '')
        return html.escape(data)
    return data

async def process_request(params):
    connection = connect_to_database()
    if not connection:
        return format_response(500, "Database connection failed"), 500

    distance = params.get('distance', 5)
    try:
        distance = int(distance)
        if not (1 <= distance <= 10):
            distance = 5
    except ValueError:
        distance = 5

    pageno = params.get('pageno', 1)
    try:
        pageno = int(pageno)
        if pageno < 1:
            pageno = 1
    except ValueError:
        pageno = 1

    lat = params.get('lat')
    lon = params.get('lon')
    address = params.get('address')

    shelter_type = params.get('shelter_type', 'CivilDefenseShelters')
    
    if shelter_type == 'EarthquakeShelters':
        table_name = 'EarthquakeShelters'
        address_columns = ['dtl_adres', 'rn_adres']
    elif shelter_type == 'TsunamiShelters':
        table_name = 'TsunamiShelters'
        address_columns = ['address', 'new_address']
    else:
        table_name = 'CivilDefenseShelters'
        address_columns = ['road_address', 'full_address']

    if address:
        query = f"SELECT * FROM {table_name} WHERE " + " OR ".join([f"{col} LIKE %s" for col in address_columns])
        query_params = [f'%{address}%'] * len(address_columns)
        results = execute_query(connection, query, query_params)
    elif lat is not None and lon is not None:
        try:
            lat = float(lat)
            lon = float(lon)
        except ValueError:
            connection.close()
            return format_response(400, "Invalid latitude or longitude format"), 400
        query = f"SELECT * FROM {table_name}"
        results = execute_query(connection, query)
    else:
        query = f"SELECT * FROM {table_name} LIMIT 10"
        results = execute_query(connection, query)

    connection.close()

    if results:
        if lat is not None and lon is not None:
            filtered_results = []
            for result in results:
                shelter_lat = result.get('lat')
                shelter_lon = result.get('lon')
                if shelter_lat is None or shelter_lon is None:
                    continue
                try:
                    shelter_lat = float(shelter_lat)
                    shelter_lon = float(shelter_lon)
                except ValueError:
                    continue
                dist = calculate_distance(lat, lon, shelter_lat, shelter_lon)
                if dist <= distance:
                    result['distance'] = dist
                    for key in result:
                        result[key] = serialize_data(result[key], key, shelter_type)
                    filtered_results.append(result)
            
            filtered_results = sorted(filtered_results, key=lambda x: x['distance'])
            start_index = (pageno - 1) * 10
            end_index = start_index + 10
            paginated_results = filtered_results[start_index:end_index]
            return format_response(200, "Shelters found.", paginated_results), 200
        else:
            start_index = (pageno - 1) * 10
            end_index = start_index + 10
            paginated_results = results[start_index:end_index]
            for result in paginated_results:
                for key in result:
                    result[key] = serialize_data(result[key], key, shelter_type)
            return format_response(200, "Shelters found.", paginated_results), 200
    else:
        return format_response(404, "No shelters found."), 404

async def get_response(params):
    return await process_request(params)

async def post_response(data):
    return await process_request(data)
