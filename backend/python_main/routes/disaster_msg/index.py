# routes/disaster_msg/index.py

import mysql.connector
from mysql.connector import Error
from datetime import datetime
import json
import sys
import os
import html

# db_config.py 파일의 경로를 시스템 경로에 추가
# db_config.py는 데이터베이스 접속 설정을 포함한 파일입니다.
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'db')))
from db_config import get_db_config

# 데이터베이스에 연결하는 함수
def connect_to_database():
    try:
        # 데이터베이스 설정을 불러와서 연결 시도
        connection = mysql.connector.connect(**get_db_config())
        if connection.is_connected():
            return connection
    except Error as e:
        # 연결 실패 시 에러 메시지 출력
        print(f"Error connecting to MySQL database: {e}")
        return None

# 데이터베이스 쿼리를 실행하는 함수
def execute_query(connection, query, params=None):
    try:
        cursor = connection.cursor(dictionary=True)
        if params:
            # 파라미터가 있을 경우 쿼리 실행
            cursor.execute(query, params)
        else:
            # 파라미터가 없을 경우 쿼리 실행
            cursor.execute(query)
        # 결과를 모두 가져와서 반환
        results = cursor.fetchall()
        cursor.close()
        return results
    except Error as e:
        # 쿼리 실행 실패 시 에러 메시지 출력
        print(f"Error executing query: {e}")
        return None

# HTTP 응답을 포맷하는 함수
def format_response(status_code, message, data=None):
    response = {
        "statusCode": status_code,
        "message": html.escape(message)
    }
    if data:
        response["data"] = data
    return response

# 페이지 번호에 따른 오프셋 계산 함수
def get_offset(pageno):
    try:
        pageno = int(pageno)
        if pageno < 1:
            pageno = 1
    except (ValueError, TypeError):
        pageno = 1
    return (pageno - 1) * 10

# 요청을 처리하는 메인 함수
async def process_request(params):
    connection = connect_to_database()
    if not connection:
        return format_response(500, "Database connection failed"), 500

    try:
        # 페이지 번호를 받아와서 오프셋 계산 (기본값 1)
        pageno = params.get('pageno', 1)
        offset = get_offset(pageno)
        
        # 각 파라미터에 따른 쿼리 작성 및 실행
        if 'all_msg' in params and params['all_msg'].lower() == 'true':
            query = "SELECT * FROM disaster_msg ORDER BY create_date DESC LIMIT 10 OFFSET %s"
            results = execute_query(connection, query, (offset,))
        elif 'md101_sn' in params:
            query = "SELECT * FROM disaster_msg WHERE md101_sn = %s"
            results = execute_query(connection, query, (params['md101_sn'],))
        elif 'location_id' in params:
            query = "SELECT * FROM disaster_msg WHERE location_id LIKE %s ORDER BY create_date DESC LIMIT 10 OFFSET %s"
            results = execute_query(connection, query, (f"%{html.escape(params['location_id'])}%", offset))
        elif 'location_name' in params:
            query = "SELECT * FROM disaster_msg WHERE location_name LIKE %s ORDER BY create_date DESC LIMIT 10 OFFSET %s"
            results = execute_query(connection, query, (f"%{html.escape(params['location_name'])}%", offset))
        elif 'category' in params:
            categories = [html.escape(category.strip()) for category in params['category'].split(',')]
            placeholders = ','.join(['%s'] * len(categories))
            query = f"SELECT * FROM disaster_msg WHERE category IN ({placeholders}) ORDER BY create_date DESC LIMIT 10 OFFSET %s"
            results = execute_query(connection, query, categories + [offset])
        else:
            return format_response(400, "Invalid request parameters"), 400
    finally:
        connection.close()

    # 결과를 처리하여 ISO 포맷으로 날짜 변환 후 응답 반환
    if results:
        for result in results:
            result['create_date'] = result['create_date'].isoformat() if isinstance(result['create_date'], datetime) else result['create_date']
        return format_response(200, "Disaster message found.", results), 200
    else:
        return format_response(404, "No disaster messages found."), 404

# GET 요청을 처리하는 함수
async def get_response(params):
    return await process_request(params)

# POST 요청을 처리하는 함수
async def post_response(data):
    return await process_request(data)
