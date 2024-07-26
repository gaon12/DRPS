# routes/air/station/index.py
import mysql.connector
from mysql.connector import Error
from datetime import datetime, date
import json
import sys
import os
import math
import html
import re
from decimal import Decimal

# db_config.py 파일의 경로를 시스템 경로에 추가
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'db')))
from db_config import get_db_config

# 데이터베이스 연결 함수
def connect_to_database():
    try:
        connection = mysql.connector.connect(**get_db_config())
        if connection.is_connected():
            return connection
    except Error as e:
        return None

# 쿼리 실행 함수
def execute_query(connection, query, params=None):
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params)  # 쿼리 실행
        results = cursor.fetchall()  # 결과 가져오기
        cursor.close()
        return results
    except Error as e:
        return None

# 응답 형식화 함수
def format_response(status_code, message, data=None, include_notice=True):
    response = {
        "statusCode": status_code,
        "message": html.escape(message)  # 메시지 HTML 이스케이프 처리
    }
    if data is not None and data:
        response["data"] = data
    if include_notice:
        response["notice"] = "라이선스: 공공누리 제 2유형(https://www.data.go.kr/data/15073877/openapi.do) / 데이터 오류가능성 존재"
    return response

# 거리 계산 함수 (위도와 경도를 이용한 두 지점 사이의 거리)
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371  # 지구 반지름 (단위: km)
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance

# 데이터 직렬화 함수 (날짜, Decimal, 문자열 등 처리)
def serialize_data(data):
    if isinstance(data, (datetime, date)):
        return data.isoformat()
    elif isinstance(data, Decimal):
        return str(data)
    elif isinstance(data, str):
        return html.escape(data)
    return data

# 스테이션 필터링 및 정렬 함수 (거리 기준)
def filter_and_sort_stations(stations, lat, lon, distance):
    filtered_stations = []
    for station in stations:
        station_lat = station.get('dmX')  # dmX를 위도로 사용
        station_lon = station.get('dmY')  # dmY를 경도로 사용
        if station_lat is None or station_lon is None:
            continue
        try:
            station_lat = float(station_lat)
            station_lon = float(station_lon)
        except ValueError:
            continue
        dist = calculate_distance(lat, lon, station_lat, station_lon)
        if dist <= distance:
            station['distance'] = dist
            for key in station:
                station[key] = serialize_data(station[key])
            filtered_stations.append(station)

    # 거리 기준으로 정렬
    filtered_stations.sort(key=lambda x: x['distance'])
    return filtered_stations

# 요청 처리 함수
async def process_request(params):
    connection = connect_to_database()
    if not connection:
        return format_response(500, "Database connection failed"), 500

    distance = params.get('distance')
    lat = params.get('lat')
    lon = params.get('lon')
    address = params.get('address')
    measurenet = params.get('measurenet')
    measurelist = params.get('measurelist')
    pageno = params.get('pageno', 1)

    # 페이지 번호 유효성 검사 및 기본값 설정
    try:
        pageno = int(pageno)
        if pageno < 1:
            pageno = 1
    except ValueError:
        pageno = 1

    query = "SELECT * FROM AirKoreaStation"
    query_params = []

    # 주소 기반 검색
    if address:
        query += " WHERE addr LIKE %s"
        query_params.append(f'%{html.escape(address)}%')
    # 위도, 경도, 거리 기반 검색
    elif lat is not None and lon is not None and distance is not None:
        try:
            lat = float(lat)
            lon = float(lon)
            distance = float(distance)
            # distance 값의 범위 검증 및 조정 (예: 1km에서 10km, 범위 벗어나면 5로 설정)
            if distance < 1 or distance > 10:
                distance = 5
        except ValueError:
            connection.close()
            return format_response(400, "Invalid latitude, longitude, or distance format"), 400

        query += " WHERE dmY IS NOT NULL AND dmX IS NOT NULL"
        results = execute_query(connection, query)
        if results:
            filtered_stations = filter_and_sort_stations(results, lat, lon, distance)
            if not filtered_stations:
                connection.close()
                return format_response(404, "No data found.", include_notice=False), 404
            paginated_results = filtered_stations[(pageno-1)*5:pageno*5]
            connection.close()
            return format_response(200, "Stations found.", paginated_results), 200
        else:
            connection.close()
            return format_response(404, "No data found.", include_notice=False), 404
    # 측정망 이름 기반 검색
    elif measurenet:
        query += " WHERE mangName = %s"
        query_params.append(html.escape(measurenet))
    # 측정 항목 리스트 기반 검색
    elif measurelist:
        measurelist = [html.escape(item.strip().lower()) for item in measurelist.split(',')]
        query += " WHERE " + " OR ".join([f"LOWER(item) LIKE %s" for _ in measurelist])
        query_params.extend([f'%{item}%' for item in measurelist])

    results = execute_query(connection, query, query_params)
    connection.close()

    if results:
        start_index = (pageno -1) * 5
        end_index = start_index + 5
        paginated_results = results[start_index:end_index]
        for result in paginated_results:
            for key in result:
                result[key] = serialize_data(result[key])
        return format_response(200, "Stations found.", paginated_results), 200
    else:
        return format_response(404, "No data found.", include_notice=False), 404

# GET 요청 처리 함수
async def get_response(params):
    return await process_request(params)

# POST 요청 처리 함수
async def post_response(data):
    return await process_request(data)
