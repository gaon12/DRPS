# db_config.py

# 데이터베이스 연결 정보
DB_CONFIG = {
    'host': 'localhost',
    'user': 'dbadmin',
    'password': 'gaon10133',
    'database': 'drps'
}

# 데이터베이스 연결 정보를 반환하는 함수
def get_db_config():
    return DB_CONFIG