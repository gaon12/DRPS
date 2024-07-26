import os
import sys
import requests
import json
import mysql.connector
from dotenv import load_dotenv
from datetime import datetime
from requests.exceptions import SSLError

# db_config.py 파일의 경로를 시스템 경로에 추가
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'db')))
from db_config import get_db_config

# .env 파일에서 환경 변수 로드
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '.env')))

# 서비스 키 및 기본 설정
service_key = os.getenv('AirQuality_Station_API_KEY')

# DB 설정 가져오기
db_config = get_db_config()

# API 호출 파라미터
base_url = "apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getMsrstnList"
params = {
    "serviceKey": service_key,
    "pageNo": 1,
    "numOfRows": 1000,
    "returnType": "json"
}

# 데이터 삽입 및 업데이트 쿼리
insert_update_query = """
INSERT INTO AirKoreaStation (
    stationName, addr, dmX, dmY, mangName, item, year, api_update_date
) VALUES (
    %s, %s, %s, %s, %s, %s, %s, %s
) ON DUPLICATE KEY UPDATE 
    addr=VALUES(addr),
    dmX=VALUES(dmX),
    dmY=VALUES(dmY),
    mangName=VALUES(mangName),
    item=VALUES(item),
    year=VALUES(year),
    api_update_date=VALUES(api_update_date)
"""

def fetch_api_data(service_key, page_no, num_of_rows, api_url, use_https=True):
    scheme = "https" if use_https else "http"
    url = f"{scheme}://{api_url}?serviceKey={service_key}&pageNo={page_no}&numOfRows={num_of_rows}&returnType=json"
    print(f"Fetching data from URL: {url}")
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.SSLError as e:
        print(f"HTTPS connection failed: {e}, retrying with HTTP.")
        return fetch_api_data(service_key, page_no, num_of_rows, api_url, use_https=False)
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {e}")
        return None

def process_and_insert_data(cursor, items):
    for item in items:
        try:
            # year 값이 None인 경우 0000으로 변환
            year_value = item['year'] if item['year'] is not None else '0000'

            # 데이터 삽입 및 업데이트
            cursor.execute(insert_update_query, (
                item['stationName'], item['addr'], item['dmX'], item['dmY'], item['mangName'],
                item['item'], year_value, datetime.now()
            ))
        except Exception as e:
            print(f"Error processing item {item}: {e}")

def main():
    # DB 연결 설정
    connection = mysql.connector.connect(
        host=db_config['host'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database']
    )

    cursor = connection.cursor()

    while True:
        data = fetch_api_data(service_key, params['pageNo'], params['numOfRows'], base_url)
        if data is None:
            break

        items = data['response']['body']['items']
        total_count = data['response']['body']['totalCount']

        if not items:
            break

        process_and_insert_data(cursor, items)

        if len(items) < params["numOfRows"]:
            break

        params["pageNo"] += 1

    # DB에 변경사항 저장
    connection.commit()

    # DB 연결 종료
    cursor.close()
    connection.close()

if __name__ == "__main__":
    main()
