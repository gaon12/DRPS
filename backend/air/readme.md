# Air Quality API

## 개요
이 API는 OpenAQ API를 사용하여 특정 위치의 공기 질 정보를 제공합니다. 사용자는 위도와 경도를 입력하여 해당 위치의 공기 질 데이터를 요청할 수 있습니다.

## 엔드포인트
- **URL:** `/api.php`
- **Method:** `POST`

## 요청 파라미터

| 파라미터    | 필수 여부 | 설명                              | 예시 값                     |
|-------------|-----------|----------------------------------|----------------------------|
| `latitude`  | 필수      | 요청할 위치의 위도 값             | `37.5665` (서울의 위도)    |
| `longitude` | 필수      | 요청할 위치의 경도 값             | `126.9780` (서울의 경도)   |

### 요청 예시
```
POST /api.php Content-Type: application/json
```
```json
{
  "latitude": 37.5665,
  "longitude": 126.978
}
```


## 응답 형식
성공적인 요청 시 응답은 다음과 같은 JSON 형식으로 반환됩니다:

```json
{
  "StatusCode": 200,
  "message": "Success",
  "data": [
    {
      "parameter": "pm25",
      "value": 12.5,
      "unit": "µg/m³",
      "lastUpdated": "2024-10-08T00:00:00Z"
    }
  ],
  "license": {
    "text": "This data is provided by OpenAQ and may include data from various sources.",
    "url": "https://openaq.org/#/about/data-access",
    "attribution": "OpenAQ contributors and respective data providers."
  }
}
```

## 응답 필드 설명
| 필드      | 설명     |
|------|------------|
| `StatusCode`  |	요청 처리 상태 코드 (200, 404, 500 등) |
| `message`     | 요청 처리 결과 메시지   |
| `data`        | 요청한 위치의 공기 질 측정값 리스트 |
| `license`        | 데이터 출처 및 라이선스 정보 |

## 에러 코드
| 코드      | 설명     |
|------|------------|
| `200`  | 성공시 반환됩니다. |
| `400`     | 필수 파라미터가 없거나 유효하지 않을 때 반환됩니다.   |
| `500`        | API 키 누락 또는 요청 실패 시 반환됩니다. |

## 종속성 및 설치
* vlucas/phpdotenv: 환경 변수 관리를 위한 라이브러리
* Composer: 종속성 관리를 위해 사용됩니다.

## 설치 방법
```
composer install
```

## 참고 사항
* OpenAQ API 사용 시 라이선스 조건을 준수해야 합니다.
* API 키는 `.env` 파일에 설정해야 합니다
  ```
  OpenAQ=YOUR_API_KEY
  ```
