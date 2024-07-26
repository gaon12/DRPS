# route/air/quality/index.py
import mysql.connector
from mysql.connector import Error
from datetime import datetime, date
from decimal import Decimal
import sys
import os
import math

# db_config.py 파일의 경로를 시스템 경로에 추가
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'db')))
from db_config import get_db_config

# 데이터베이스 연결 함수
def connect_to_database():
    try:
        connection = mysql.connector.connect(**get_db_config())
        if connection.is_connected():
            return connection
    except Error:
        return None

# 쿼리 실행 함수
def execute_query(connection, query, params=None):
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params)
        results = cursor.fetchall()
        cursor.close()
        return results
    except Error:
        return None

# 응답 형식화 함수
def format_response(status_code, message, data=None, include_notice=True):
    response = {
        "statusCode": status_code,
        "message": message
    }
    if data is not None and data:
        response["data"] = data
    if include_notice:
        response["notice"] = "라이선스: 공공누리 제 2유형(https://www.data.go.kr/data/15073861/openapi.do) / 데이터 오류가능성 존재"
    return response

# 데이터 직렬화 함수 (날짜, Decimal, 문자열 등 처리)
def serialize_data(data):
    if isinstance(data, (datetime, date)):
        return data.isoformat()
    elif isinstance(data, Decimal):
        return str(data)
    elif isinstance(data, str):
        return data
    return data

# 하버사인 공식을 사용하여 두 좌표 간의 거리 계산 함수
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # 지구 반경 (킬로미터)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lat2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance

# 요청 처리 함수
async def process_request(params):
    connection = connect_to_database()
    if not connection:
        return format_response(500, "Database connection failed", include_notice=False), 500
    
    stationname = params.get('stationname')
    stationcode = params.get('stationcode')
    lat = params.get('lat')
    lon = params.get('lon')
    distance = params.get('distance')
    
    if not stationname and not stationcode and not (lat and lon and distance):
        connection.close()
        return format_response(400, "Require parameter 'stationname' or 'stationcode' or '(lat, lon, distance)'", include_notice=False), 400
    
    if lat and lon and distance:
        try:
            lat = float(lat)
            lon = float(lon)
            distance = float(distance)
            if distance < 1 or distance > 10:
                distance = 5
        except (ValueError, TypeError) as ve:
            connection.close()
            return format_response(400, str(ve), include_notice=False), 400
        
        station_query = "SELECT stationName, dmX, dmY FROM AirKoreaStation"
        stations = execute_query(connection, station_query)
        
        if not stations:
            connection.close()
            return format_response(404, "No stations found.", include_notice=False), 404
        
        filtered_station_names = []
        station_coords = {}
        for station in stations:
            dmX = station.get('dmX')
            dmY = station.get('dmY')
            if dmX is None or dmY is None:
                continue
            try:
                station_lat = float(dmX)
                station_lon = float(dmY)
            except ValueError:
                continue
            dist = haversine(lat, lon, station_lat, station_lon)
            if dist <= distance:
                filtered_station_names.append(station['stationName'])
                station_coords[station['stationName']] = (station_lat, station_lon)
        
        if not filtered_station_names:
            connection.close()
            return format_response(404, "No stations found within the specified distance.", include_notice=False), 404
        
        air_quality_query = "SELECT * FROM AirQuality WHERE stationName IN (%s)" % ','.join(['%s'] * len(filtered_station_names))
        air_quality_results = execute_query(connection, air_quality_query, filtered_station_names)
        
        if not air_quality_results:
            connection.close()
            return format_response(404, "No data found.", include_notice=False), 404
        
        filtered_results = []
        for result in air_quality_results:
            station_name = result['stationName']
            if station_name in station_coords:
                station_lat, station_lon = station_coords[station_name]
                dist = haversine(lat, lon, station_lat, station_lon)
                result['distance'] = dist
                filtered_results.append(result)
        
        filtered_results.sort(key=lambda x: x['distance'])
        filtered_results = filtered_results[:10]
        
        for result in filtered_results:
            for key in result:
                result[key] = serialize_data(result[key])
        
        connection.close()
        return format_response(200, "Data found.", filtered_results), 200
    
    query = "SELECT * FROM AirQuality"
    query_params = []
    
    if stationname:
        query += " WHERE stationName = %s"
        query_params.append(stationname)
    elif stationcode:
        query += " WHERE stationCode = %s"
        query_params.append(stationcode)
    
    results = execute_query(connection, query, query_params)
    connection.close()
    
    if results:
        for result in results:
            for key in result:
                result[key] = serialize_data(result[key])
        return format_response(200, "Data found.", results), 200
    else:
        return format_response(404, "No data found.", include_notice=False), 404

# GET 요청 처리 함수
async def get_response(params):
    return await process_request(params)

# POST 요청 처리 함수
async def post_response(data):
    return await get_response(data)
