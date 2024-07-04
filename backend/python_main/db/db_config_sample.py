# db_config.py

# 데이터베이스 연결 정보
DB_CONFIG = {
    'host': 'localhost',
    'user': 'username',
    'password': 'password',
    'database': 'databasename'
}

# 데이터베이스 연결 정보를 반환하는 함수
def get_db_config():
    return DB_CONFIG