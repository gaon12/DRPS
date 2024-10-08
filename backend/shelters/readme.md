# Shelters Data API

## 개요
이 폴더는 대피소 관련 데이터를 수집하고 데이터베이스에 저장하며, 사용자 요청에 따라 대피소 데이터를 제공하는 기능을 수행합니다. 공공 API를 사용하여 데이터를 수집하고, MySQL 데이터베이스에 저장합니다.

## 주요 파일 설명

- **.env**: 네이버 지도 API 키를 저장하는 환경 설정 파일입니다.
- **api.php**: 대피소 데이터를 조회하고 JSON 형식으로 반환하는 API 엔드포인트입니다.
- **composer.json** / **composer.lock**: 의존성 관리 파일로, PHPSpreadsheet와 Dotenv 패키지를 관리합니다.
- **db_config.php**: 데이터베이스 연결 설정 파일입니다.
- **earthshake_craw.php**, **minbangwee_craw.php**, **tsunami_craw.php**: 각각 지진 대피소, 민방위 대피소, 쓰나미 대피소 데이터를 API에서 가져와 데이터베이스에 저장하는 크롤러 스크립트입니다.
- **update_coordinates.php**: 네이버 지도 API를 사용하여 위경도 정보를 업데이트하는 스크립트입니다.

## 사용 방법

1. **환경 변수 설정**:
   - `.env` 파일에 네이버 API 키를 설정해야 합니다.
   - 예시:
     ```
     NAVER_CLIENT_ID=YOUR_CLIENT_ID
     NAVER_CLIENT_SECRET=YOUR_CLIENT_SECRET
     ```

2. **데이터베이스 설정**:
   - `db_config.php` 파일에 데이터베이스 정보를 입력합니다.

3. **대피소 데이터 수집**:
   - 각각의 크롤러 파일 (`earthshake_craw.php`, `minbangwee_craw.php`, `tsunami_craw.php`)을 실행하여 데이터를 수집하고 데이터베이스에 저장합니다.

4. **API 사용**:
   - `api.php` 파일을 호출하여 대피소 데이터를 조회할 수 있습니다.
