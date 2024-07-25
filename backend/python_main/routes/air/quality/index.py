import mysql.connector
from mysql.connector import Error
from datetime import datetime, date
import json
import sys
import os
import html
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
    except Error:
        return None

# 쿼리 실행 함수
def execute_query(connection, query, params=None):
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params)  # 쿼리 실행
        results = cursor.fetchall()  # 결과 가져오기
        cursor.close()
        return results
    except Error:
        return None

# 응답 형식화 함수
def format_response(status_code, message, data=None):
    response = {
        "statusCode": status_code,
        "message": html.escape(message)  # 메시지 HTML 이스케이프 처리
    }
    if data is not None and data:
        response["data"] = data
    return response

# 데이터 직렬화 함수 (날짜, Decimal, 문자열 등 처리)
def serialize_data(data):
    if isinstance(data, (datetime, date)):
        return data.isoformat()
    elif isinstance(data, Decimal):
        return str(data)
    elif isinstance(data, str):
        return html.escape(data)
    return data

# 요청 처리 함수
async def process_request(params):
    connection = connect_to_database()
    if not connection:
        return format_response(500, "Database connection failed"), 500

    stationname = params.get('stationname')
    stationcode = params.get('stationcode')

    if not stationname and not stationcode:
        connection.close()
        return format_response(400, "stationname 또는 stationcode 파라미터가 필요합니다."), 400

    query = "SELECT * FROM AirQuality"
    query_params = []

    # stationname 또는 stationcode 기반 검색
    if stationname:
        query += " WHERE stationName = %s"
        query_params.append(html.escape(stationname))
    elif stationcode:
        query += " WHERE stationCode = %s"
        query_params.append(html.escape(stationcode))

    results = execute_query(connection, query, query_params)
    connection.close()

    if results:
        for result in results:
            for key in result:
                result[key] = serialize_data(result[key])
        return format_response(200, "Data found.", results), 200
    else:
        return format_response(404, "No data found."), 404

# GET 요청 처리 함수
async def get_response(params):
    return await process_request(params)

# POST 요청 처리 함수
async def post_response(data):
    return await process_request(data)
