import os
import sys
import pandas as pd
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import requests
import warnings

# openpyxl 경고 억제
warnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")

# db_config.py 파일의 경로를 시스템 경로에 추가
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'db')))
from db_config import get_db_config

# .env 파일에서 환경 변수 로드
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '.env')))

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
        cursor.execute("SELECT * FROM CivilDefenseShelters")
        existing_data = cursor.fetchall()
        return {row['management_number']: row for row in existing_data}
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
        insert_query = """INSERT INTO CivilDefenseShelters 
                          (management_number, designation_date, release_date, operational_status, facility_name, 
                           facility_type, road_address, full_address, postal_code, location, facility_area, 
                           max_capacity, last_updated, data_update_type, data_update_date, 
                           lat, lon) 
                          VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        update_query = """UPDATE CivilDefenseShelters SET
                          designation_date = %s,
                          release_date = %s,
                          operational_status = %s,
                          facility_name = %s,
                          facility_type = %s,
                          road_address = %s,
                          full_address = %s,
                          postal_code = %s,
                          location = %s,
                          facility_area = %s,
                          max_capacity = %s,
                          last_updated = %s,
                          data_update_type = %s,
                          data_update_date = %s,
                          lat = %s,
                          lon = %s
                          WHERE management_number = %s"""
        
        for row in new_data:
            key = row['management_number']
            if key in existing_data:
                existing_row = existing_data[key]
                if any(existing_row[col] != row[col] for col in row if col != 'management_number'):
                    update_values = (
                        row['designation_date'], row['release_date'], row['operational_status'], row['facility_name'], 
                        row['facility_type'], row['road_address'], row['full_address'], row['postal_code'], 
                        row['location'], row['facility_area'], row['max_capacity'], row['last_updated'], 
                        row['data_update_type'], row['data_update_date'], row['lat'], 
                        row['lon'], row['management_number']
                    )
                    cursor.execute(update_query, update_values)
            else:
                insert_values = (
                    row['management_number'], row['designation_date'], row['release_date'], row['operational_status'], 
                    row['facility_name'], row['facility_type'], row['road_address'], row['full_address'], 
                    row['postal_code'], row['location'], row['facility_area'], row['max_capacity'], 
                    row['last_updated'], row['data_update_type'], row['data_update_date'], 
                    row['lat'], row['lon']
                )
                cursor.execute(insert_query, insert_values)
                
        connection.commit()
        print(f"{len(new_data)}개의 레코드가 저장 또는 업데이트되었습니다.")
    except Error as e:
        print(f"데이터 저장 중 오류 발생: {e}")
    finally:
        if cursor:
            cursor.close()

# 엑셀 파일 다운로드 함수
def download_excel_file(url, file_path, use_https=True):
    scheme = "https" if use_https else "http"
    full_url = f"{scheme}://{url}"
    print(f"다음 URL에서 데이터를 가져오는 중: {full_url}")
    try:
        response = requests.get(full_url, allow_redirects=True)
        response.raise_for_status()
        with open(file_path, 'wb') as file:
            file.write(response.content)
        print("엑셀 파일이 성공적으로 다운로드 되었습니다.")
    except requests.exceptions.SSLError as e:
        print(f"HTTPS 연결 실패: {e}, HTTP로 재시도합니다.")
        download_excel_file(url, file_path, use_https=False)
    except requests.exceptions.RequestException as e:
        print(f"엑셀 파일 다운로드 중 오류 발생: {e}")

# 엑셀 파일 읽기 및 데이터프레임 생성 함수
def read_excel_file(file_path):
    try:
        df = pd.read_excel(file_path)
        return df
    except FileNotFoundError as e:
        print(f"엑셀 파일을 찾을 수 없습니다: {e}")
        return None

# 데이터프레임을 딕셔너리 리스트로 변환하는 함수
def dataframe_to_dict_list(df):
    df = df.fillna(pd.NA)  # 결측값을 pd.NA로 대체
    df['지정일자'] = pd.to_datetime(df['지정일자'], errors='coerce').dt.date
    df['해제일자'] = pd.to_datetime(df['해제일자'], errors='coerce').dt.date
    df['최종수정시점'] = pd.to_datetime(df['최종수정시점'], errors='coerce')
    df['데이터갱신일자'] = pd.to_datetime(df['데이터갱신일자'], errors='coerce').dt.date
    
    data_list = []
    for _, row in df.iterrows():
        data_list.append({
            'management_number': row['관리번호'] if pd.notna(row['관리번호']) else None,
            'designation_date': row['지정일자'] if pd.notna(row['지정일자']) else None,
            'release_date': row['해제일자'] if pd.notna(row['해제일자']) else None,
            'operational_status': row['운영상태'] if pd.notna(row['운영상태']) else None,
            'facility_name': row['시설명'] if pd.notna(row['시설명']) else None,
            'facility_type': row['시설구분'] if pd.notna(row['시설구분']) else None,
            'road_address': row['도로명전체주소'] if pd.notna(row['도로명전체주소']) else None,
            'full_address': row['소재지전체주소'] if pd.notna(row['소재지전체주소']) else None,
            'postal_code': row['도로명우편번호'] if pd.notna(row['도로명우편번호']) else None,
            'location': row['시설위치(지상/지하)'] if pd.notna(row['시설위치(지상/지하)']) else None,
            'facility_area': row['시설면적(㎡)'] if pd.notna(row['시설면적(㎡)']) else None,
            'max_capacity': row['최대수용인원'] if pd.notna(row['최대수용인원']) else None,
            'last_updated': row['최종수정시점'] if pd.notna(row['최종수정시점']) else None,
            'data_update_type': row['데이터갱신구분'] if pd.notna(row['데이터갱신구분']) else None,
            'data_update_date': row['데이터갱신일자'] if pd.notna(row['데이터갱신일자']) else None,
            'lat': round(float(row['위도(EPSG4326)']), 14) if pd.notna(row['위도(EPSG4326)']) else None,
            'lon': round(float(row['경도(EPSG4326)']), 14) if pd.notna(row['경도(EPSG4326)']) else None
        })
    return data_list

# 메인 스크립트
def main():
    # db_config.py에서 데이터베이스 연결 정보 가져오기
    db_config = get_db_config()
    
    connection = connect_db(**db_config)
    if not connection:
        return

    existing_data = get_existing_data(connection)
    
    # 엑셀 파일 URL 및 경로
    excel_file_url = 'www.localdata.go.kr/datafile/etc/LOCALDATA_ALL_12_04_12_E.xlsx'
    excel_file_path = './LOCALDATA_ALL_12_04_12_E.xlsx'

    # 엑셀 파일 다운로드
    download_excel_file(excel_file_url, excel_file_path)

    # 엑셀 파일 읽기
    df = read_excel_file(excel_file_path)
    if df is not None:
        new_data = dataframe_to_dict_list(df)
    
        # 데이터베이스 저장
        if new_data:
            save_data(connection, new_data, existing_data)
        else:
            print("저장할 새로운 레코드가 없습니다.")
    
        if connection:
            connection.close()
    
        # 엑셀 파일 삭제
        if os.path.exists(excel_file_path):
            os.remove(excel_file_path)
            print("엑셀 파일이 성공적으로 삭제되었습니다.")

if __name__ == "__main__":
    main()
