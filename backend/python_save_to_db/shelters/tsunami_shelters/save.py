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
service_key = os.getenv('Tsunami_API_KEY')
page_no = 1
num_of_rows = 999
api_url = "apis.data.go.kr/1741000/TsunamiShelter4/getTsunamiShelter4List"

# 데이터베이스 연결 함수
def connect_db(host, user, password, database):
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

# 데이터 조회 함수
def get_existing_data(connection):
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM TsunamiShelters")
        existing_data = cursor.fetchall()
        return {f"{row['id']}": row for row in existing_data}
    except Error as e:
        print(f"데이터 조회 중 오류 발생: {e}")
        return {}
    finally:
        if cursor:
            cursor.close()

# 데이터 저장 함수
def save_data(connection, new_data, existing_data):
    try:
        cursor = connection.cursor()
        insert_query = """INSERT INTO TsunamiShelters 
                          (id, sido_name, sigungu_name, remarks, shel_nm, address, lon, lat, shel_av, lenth, 
                           shel_div_type, seismic, height, tel, new_address, manage_gov_nm) 
                          VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        update_query = """UPDATE TsunamiShelters SET
                          sido_name = %s,
                          sigungu_name = %s,
                          remarks = %s,
                          shel_nm = %s,
                          address = %s,
                          lon = %s,
                          lat = %s,
                          shel_av = %s,
                          lenth = %s,
                          shel_div_type = %s,
                          seismic = %s,
                          height = %s,
                          tel = %s,
                          new_address = %s,
                          manage_gov_nm = %s
                          WHERE id = %s"""
        
        for row in new_data:
            key = f"{row['id']}"
            if key in existing_data:
                existing_row = existing_data[key]
                if any(existing_row[col] != row[col] for col in row if col != 'id'):
                    update_values = (
                        row['sido_name'], row['sigungu_name'], row['remarks'], row['shel_nm'], row['address'], 
                        row['lon'], row['lat'], row['shel_av'], row['lenth'], row['shel_div_type'], 
                        row['seismic'], row['height'], row['tel'], row['new_address'], row['manage_gov_nm'], 
                        row['id']
                    )
                    cursor.execute(update_query, update_values)
            else:
                insert_values = (
                    row['id'], row['sido_name'], row['sigungu_name'], row['remarks'], row['shel_nm'], row['address'], 
                    row['lon'], row['lat'], row['shel_av'], row['lenth'], row['shel_div_type'], 
                    row['seismic'], row['height'], row['tel'], row['new_address'], row['manage_gov_nm']
                )
                cursor.execute(insert_query, insert_values)
                
        connection.commit()
        print(f"{len(new_data)}개의 레코드가 저장 또는 업데이트되었습니다.")
    except Error as e:
        print(f"데이터 저장 중 오류 발생: {e}")
    finally:
        if cursor:
            cursor.close()

# API 요청 함수
def fetch_api_data(service_key, page_no, num_of_rows, api_url, use_https=True):
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

    existing_data = get_existing_data(connection)
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
            data.append({
                'id': int(row.find('id').text),
                'sido_name': row.find('sido_name').text,
                'sigungu_name': row.find('sigungu_name').text,
                'remarks': row.find('remarks').text,
                'shel_nm': row.find('shel_nm').text,
                'address': row.find('address').text,
                'lon': float(row.find('lon').text),
                'lat': float(row.find('lat').text),
                'shel_av': int(row.find('shel_av').text),
                'lenth': int(row.find('lenth').text),
                'shel_div_type': row.find('shel_div_type').text if row.find('shel_div_type') is not None else None,
                'seismic': row.find('seismic').text if row.find('seismic') is not None else None,
                'height': float(row.find('height').text),
                'tel': row.find('tel').text if row.find('tel') is not None else None,
                'new_address': row.find('new_address').text,
                'manage_gov_nm': row.find('manage_gov_nm').text if row.find('manage_gov_nm') is not None else None
            })

        if data:
            save_data(connection, data, existing_data)
            new_records += len(data)
        else:
            print("저장할 새로운 레코드가 없습니다.")
            continue_fetching = False

        page_no += 1

    if connection:
        connection.close()

    if new_records > 0:
        print(f"총 {new_records}개의 새로운 레코드가 저장 또는 업데이트되었습니다.")
    else:
        print("저장된 새로운 레코드가 없습니다.")

if __name__ == "__main__":
    main()
