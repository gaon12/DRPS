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
service_key = os.getenv('EarthQuake_API_KEY')
page_no = 1
num_of_rows = 999
api_url = "apis.data.go.kr/1741000/EmergencyAssemblyArea_Earthquake5/getArea4List2"

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
        cursor.execute("SELECT * FROM EarthquakeShelters")
        existing_data = cursor.fetchall()
        return {f"{row['arcd']}-{row['acmdfclty_sn']}": row for row in existing_data}
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
        insert_query = """INSERT INTO EarthquakeShelters 
                          (arcd, acmdfclty_sn, ctprvn_nm, sgg_nm, vt_acmdfclty_nm, rdnmadr_cd, bdong_cd, hdong_cd, 
                           dtl_adres, fclty_ar, lon, lat, mngps_nm, mngps_telno, vt_acmd_psbl_nmpr, acmdfclty_se_nm, rn_adres) 
                          VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        update_query = """UPDATE EarthquakeShelters SET
                          ctprvn_nm = %s,
                          sgg_nm = %s,
                          vt_acmdfclty_nm = %s,
                          rdnmadr_cd = %s,
                          bdong_cd = %s,
                          hdong_cd = %s,
                          dtl_adres = %s,
                          fclty_ar = %s,
                          lon = %s,
                          lat = %s,
                          mngps_nm = %s,
                          mngps_telno = %s,
                          vt_acmd_psbl_nmpr = %s,
                          acmdfclty_se_nm = %s,
                          rn_adres = %s
                          WHERE arcd = %s AND acmdfclty_sn = %s"""
        
        for row in new_data:
            key = f"{row['arcd']}-{row['acmdfclty_sn']}"
            if key in existing_data:
                existing_row = existing_data[key]
                if any(existing_row[col] != row[col] for col in row if col != 'arcd' and col != 'acmdfclty_sn'):
                    update_values = (
                        row['ctprvn_nm'], row['sgg_nm'], row['vt_acmdfclty_nm'], row['rdnmadr_cd'], row['bdong_cd'], 
                        row['hdong_cd'], row['dtl_adres'], row['fclty_ar'], row['lon'], row['lat'], 
                        row['mngps_nm'], row['mngps_telno'], row['vt_acmd_psbl_nmpr'], row['acmdfclty_se_nm'], 
                        row['rn_adres'], row['arcd'], row['acmdfclty_sn']
                    )
                    cursor.execute(update_query, update_values)
            else:
                insert_values = (
                    row['arcd'], row['acmdfclty_sn'], row['ctprvn_nm'], row['sgg_nm'], row['vt_acmdfclty_nm'], 
                    row['rdnmadr_cd'], row['bdong_cd'], row['hdong_cd'], row['dtl_adres'], row['fclty_ar'], 
                    row['lon'], row['lat'], row['mngps_nm'], row['mngps_telno'], row['vt_acmd_psbl_nmpr'], 
                    row['acmdfclty_se_nm'], row['rn_adres']
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
                'arcd': row.find('arcd').text,
                'acmdfclty_sn': int(row.find('acmdfclty_sn').text),
                'ctprvn_nm': row.find('ctprvn_nm').text,
                'sgg_nm': row.find('sgg_nm').text,
                'vt_acmdfclty_nm': row.find('vt_acmdfclty_nm').text,
                'rdnmadr_cd': row.find('rdnmadr_cd').text,
                'bdong_cd': row.find('bdong_cd').text,
                'hdong_cd': row.find('hdong_cd').text,
                'dtl_adres': row.find('dtl_adres').text,
                'fclty_ar': float(row.find('fclty_ar').text),
                'lon': float(row.find('xcord').text),
                'lat': float(row.find('ycord').text),
                'mngps_nm': row.find('mngps_nm').text if row.find('mngps_nm') is not None else None,
                'mngps_telno': row.find('mngps_telno').text if row.find('mngps_telno') is not None else None,
                'vt_acmd_psbl_nmpr': int(row.find('vt_acmd_psbl_nmpr').text),
                'acmdfclty_se_nm': row.find('acmdfclty_se_nm').text,
                'rn_adres': row.find('rn_adres').text
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
