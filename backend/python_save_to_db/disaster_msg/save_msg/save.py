import os
import sys
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import requests
import xml.etree.ElementTree as ET

# db_config.py 파일의 경로를 시스템 경로에 추가
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'db')))
from db_config import get_db_config

# .env 파일에서 환경 변수 로드
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '.env')))

# 서비스 키 및 기본 설정
service_key = os.getenv('disaster_msg_api_key')
page_no = 1
num_of_rows = 999
api_url = "apis.data.go.kr/1741000/DisasterMsg3/getDisasterMsg1List"
category = 'na'

# 데이터베이스 연결 함수
def connect_db(host, user, password, database):
    """
    데이터베이스에 연결하는 함수
    
    :param host: 데이터베이스 호스트
    :param user: 데이터베이스 사용자 이름
    :param password: 데이터베이스 비밀번호
    :param database: 사용할 데이터베이스 이름
    :return: 데이터베이스 연결 객체
    """
    try:
        connection = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        if connection.is_connected():
            print("데이터베이스에 성공적으로 연결되었습니다.")
            return connection
    except Error as e:
        print(f"데이터베이스 연결 중 오류 발생: {e}")
        return None

# 가장 최근에 저장된 md101_sn을 가져오는 함수
def get_last_md101_sn(connection):
    """
    데이터베이스에서 가장 최근에 저장된 md101_sn을 조회하는 함수
    
    :param connection: 데이터베이스 연결 객체
    :return: 가장 최근의 md101_sn 값 또는 None
    """
    try:
        cursor = connection.cursor()
        query = "SELECT md101_sn FROM disaster_msg ORDER BY create_date DESC LIMIT 1"
        cursor.execute(query)
        result = cursor.fetchone()
        if result:
            return result[0]
        return None
    except Error as e:
        print(f"최근 md101_sn 조회 중 오류 발생: {e}")
        return None
    finally:
        if cursor:
            cursor.close()

# 데이터 저장 함수
def save_data(connection, data, category):
    """
    데이터를 데이터베이스에 저장하는 함수
    
    :param connection: 데이터베이스 연결 객체
    :param data: 저장할 데이터 리스트
    :param category: 데이터 카테고리
    """
    try:
        cursor = connection.cursor()
        query = """INSERT INTO disaster_msg 
                   (create_date, location_id, location_name, md101_sn, msg, send_platform, category) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s)"""
        for row in data:
            values = (row['create_date'], row['location_id'], row['location_name'],
                      row['md101_sn'], row['msg'], row['send_platform'], category)
            cursor.execute(query, values)
        connection.commit()
        print(f"{len(data)}개의 새로운 레코드가 데이터베이스에 저장되었습니다.")
    except Error as e:
        print(f"데이터 저장 중 오류 발생: {e}")
    finally:
        if cursor:
            cursor.close()

# API 요청 함수
def fetch_api_data(service_key, page_no, num_of_rows, api_url, use_https=True):
    """
    API에서 데이터를 가져오는 함수
    
    :param service_key: API 서비스 키
    :param page_no: 페이지 번호
    :param num_of_rows: 한 페이지당 행 수
    :param api_url: API URL
    :return: XML 응답 데이터
    """
    scheme = "https" if use_https else "http"
    url = f"{scheme}://{api_url}?serviceKey={service_key}&pageNo={page_no}&numOfRows={num_of_rows}&type=xml"
    print(f"다음 URL에서 데이터를 가져오는 중: {url}")
    try:
        response = requests.get(url)
        response.raise_for_status()
    except requests.exceptions.SSLError as e:
        print(f"HTTPS 연결 실패: {e}, HTTP로 재시도합니다.")
        return fetch_api_data(service_key, page_no, num_of_rows, api_url, use_https=False)
    except requests.exceptions.RequestException as e:
        print(f"API 요청 실패: {e}")
        return None
    return ET.fromstring(response.content)

# 메인 스크립트
def main():
    # db_config.py에서 데이터베이스 연결 정보 가져오기
    db_config = get_db_config()
    
    connection = connect_db(**db_config)
    if not connection:
        return

    last_md101_sn = get_last_md101_sn(connection)
    if last_md101_sn is None:
        print("데이터베이스에 저장된 데이터가 없습니다. 처음부터 데이터를 가져와 저장합니다.")
    else:
        print("데이터베이스에서 데이터를 찾았습니다. 최신 데이터 정보를 가져옵니다.")

    new_records = 0
    continue_fetching = True
    page_no = 1

    while continue_fetching:
        xml_data = fetch_api_data(service_key, page_no, num_of_rows, api_url)
        if xml_data is None:
            break

        rows = xml_data.findall(".//row")
        if not rows:
            print("API 응답에서 더 이상 데이터를 찾을 수 없습니다.")
            break

        data = []
        for row in rows:
            md101_sn = row.find('md101_sn').text
            if md101_sn == last_md101_sn:
                print("이미 데이터베이스에 저장된 데이터에 도달했습니다.")
                continue_fetching = False
                break
            
            data.append({
                'create_date': row.find('create_date').text,
                'location_id': row.find('location_id').text,
                'location_name': row.find('location_name').text,
                'md101_sn': md101_sn,
                'msg': row.find('msg').text,
                'send_platform': row.find('send_platform').text
            })

        if data:
            print(f"데이터베이스에 {len(data)}개의 새로운 레코드를 저장합니다.")
            save_data(connection, data, category)
            new_records += len(data)
        else:
            print("저장할 새로운 레코드가 없습니다.")

        page_no += 1

    if connection:
        connection.close()

    if new_records > 0:
        print(f"최신 데이터를 데이터베이스에 가져와 저장했습니다. 총 {new_records}개의 새로운 레코드가 저장되었습니다.")
    else:
        if last_md101_sn is not None:
            print("최신 데이터가 이미 데이터베이스에 저장되어 있습니다.")

if __name__ == "__main__":
    main()