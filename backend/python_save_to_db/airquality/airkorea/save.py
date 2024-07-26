import os
import sys
import requests
import json
import mysql.connector
from dotenv import load_dotenv
from datetime import datetime, timedelta
from requests.exceptions import SSLError

# db_config.py 파일의 경로를 시스템 경로에 추가
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'db')))
from db_config import get_db_config

# .env 파일에서 환경 변수 로드
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '.env')))

# 서비스 키 및 기본 설정
service_key = os.getenv('AirQuality_API_KEY')

# DB 설정 가져오기
db_config = get_db_config()

# API 호출 파라미터
base_url = "apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty"
params = {
    "serviceKey": service_key,
    "pageNo": 1,
    "numOfRows": 1000,
    "sidoName": "전국",
    "ver": "1.5",
    "returnType": "json"
}

# 데이터 삽입 쿼리
insert_query = """
INSERT INTO AirQuality (
    stationName, stationCode, mangName, sidoName, dataTime,
    so2Value, coValue, o3Value, no2Value, pm10Value, pm10Value24,
    pm25Value, pm25Value24, khaiValue, khaiGrade, so2Grade, coGrade,
    o3Grade, no2Grade, pm10Grade, pm25Grade, pm10Grade1h, pm25Grade1h,
    so2Flag, coFlag, o3Flag, no2Flag, pm10Flag, pm25Flag, api_update_date
) VALUES (
    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
)
"""

# 데이터 중복 체크 쿼리
check_query = """
SELECT 1 FROM AirQuality 
WHERE stationName=%s AND dataTime=%s
"""

# 72시간이 지난 데이터 삭제 쿼리
delete_old_data_query = """
DELETE FROM AirQuality 
WHERE api_update_date < %s
"""

def fetch_api_data(service_key, page_no, num_of_rows, api_url, use_https=True):
    scheme = "https" if use_https else "http"
    url = f"{scheme}://{api_url}?serviceKey={service_key}&pageNo={page_no}&numOfRows={num_of_rows}&sidoName=전국&ver=1.5&returnType=json"
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

def process_and_insert_data(cursor, items, default_data_time):
    for item in items:
        try:
            # 비정상값 처리 및 데이터 타입 변환
            so2_value = float(item['so2Value']) if item['so2Value'] not in ['-', None] else None
            co_value = float(item['coValue']) if item['coValue'] not in ['-', None] else None
            o3_value = float(item['o3Value']) if item['o3Value'] not in ['-', None] else None
            no2_value = float(item['no2Value']) if item['no2Value'] not in ['-', None] else None
            pm10_value = int(item['pm10Value']) if item['pm10Value'] not in ['-', None] else None
            pm10_value24 = int(item['pm10Value24']) if item['pm10Value24'] not in ['-', None] else None
            pm25_value = int(item['pm25Value']) if item['pm25Value'] not in ['-', None] else None
            pm25_value24 = int(item['pm25Value24']) if item['pm25Value24'] not in ['-', None] else None
            khai_value = int(item['khaiValue']) if item['khaiValue'] not in ['-', None] else None
            khai_grade = int(item['khaiGrade']) if item['khaiGrade'] not in ['-', None] else None
            so2_grade = int(item['so2Grade']) if item['so2Grade'] not in ['-', None] else None
            co_grade = int(item['coGrade']) if item['coGrade'] not in ['-', None] else None
            o3_grade = int(item['o3Grade']) if item['o3Grade'] not in ['-', None] else None
            no2_grade = int(item['no2Grade']) if item['no2Grade'] not in ['-', None] else None
            pm10_grade = int(item['pm10Grade']) if item['pm10Grade'] not in ['-', None] else None
            pm25_grade = int(item['pm25Grade']) if item['pm25Grade'] not in ['-', None] else None
            pm10_grade1h = int(item['pm10Grade1h']) if item['pm10Grade1h'] not in ['-', None] else None
            pm25_grade1h = int(item['pm25Grade1h']) if item['pm25Grade1h'] not in ['-', None] else None

            # 기본 데이터 시간 설정
            data_time = item['dataTime'] if item['dataTime'] else default_data_time

            # 중복 데이터 체크
            cursor.execute(check_query, (item['stationName'], data_time))
            if cursor.fetchone():
                continue

            # 데이터 삽입
            cursor.execute(insert_query, (
                item['stationName'], item['stationCode'], item['mangName'], item['sidoName'],
                data_time, so2_value, co_value, o3_value, no2_value, pm10_value,
                pm10_value24, pm25_value, pm25_value24, khai_value, khai_grade, so2_grade,
                co_grade, o3_grade, no2_grade, pm10_grade, pm25_grade, pm10_grade1h,
                pm25_grade1h, item['so2Flag'], item['coFlag'], item['o3Flag'], item['no2Flag'],
                item['pm10Flag'], item['pm25Flag'], datetime.now()
            ))
        except Exception as e:
            print(f"Error processing item {item}: {e}")

def delete_old_data(cursor):
    threshold_date = datetime.now() - timedelta(hours=72)
    cursor.execute(delete_old_data_query, (threshold_date,))
    print(f"Deleted rows older than {threshold_date}")

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

        default_data_time = items[0]['dataTime'] if items[0]['dataTime'] else None
        process_and_insert_data(cursor, items, default_data_time)

        if len(items) < params["numOfRows"]:
            break

        params["pageNo"] += 1

    # 72시간 지난 데이터 삭제
    delete_old_data(cursor)

    # DB에 변경사항 저장
    connection.commit()

    # DB 연결 종료
    cursor.close()
    connection.close()

if __name__ == "__main__":
    main()
