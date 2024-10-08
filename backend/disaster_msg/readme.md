# Disaster Messages API

## 개요
이 폴더는 재난 경고 메시지를 가져오고 저장하는 기능을 제공하며, 공공 API와의 통신을 통해 재난 데이터를 수집합니다. 데이터는 MySQL 데이터베이스에 저장되며, 사용자 요청에 따라 필터링된 데이터를 반환합니다.

## 주요 파일 설명

- **api.php**: 사용자가 요청한 조건에 맞는 재난 메시지를 데이터베이스에서 조회하고 JSON 형식으로 반환합니다.
- **craw2.php**: 공공 API에서 재난 메시지 데이터를 크롤링하고 데이터베이스에 저장합니다.
- **db_config_sample.php**: 데이터베이스 연결 설정을 위한 예제 파일입니다. 실제 사용 시에는 `db_config.php`로 파일명을 변경하고, DB 접속 정보를 입력해야 합니다.

## 사용 방법

1. **DB 설정**:
   - `db_config_sample.php` 파일을 `db_config.php`로 복사하고 데이터베이스 정보를 입력합니다.
   - 예시:
     ```php
     $host = 'localhost';
     $db = 'DRPS';
     $user = 'your_username';
     $pass = 'your_password';
     ```

2. **재난 메시지 데이터 수집**:
   - `craw2.php` 파일을 실행하여 공공 API로부터 재난 메시지 데이터를 가져옵니다.

3. **API 사용**:
   - `api.php` 파일을 호출하여 재난 메시지 데이터를 조회합니다.
   - 예시 요청:
     ```
     GET /api.php?pageNo=1&numOfRows=10&created_at=2024-10-01
     ```

## 참고 사항
- 공공 데이터 사용 시 라이선스 조건을 준수해야 합니다.
- 데이터베이스 설정 및 API 호출 시 에러가 발생하면 로그를 확인하세요.