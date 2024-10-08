# News Data API

## 개요
이 API는 재난 관련 뉴스를 수집하고, 사용자 요청에 따라 필터링된 뉴스 데이터를 제공하기 위한 기능을 제공합니다. API 통신을 통해 데이터를 수집하고, MySQL 데이터베이스에 저장된 뉴스 정보를 요청할 수 있습니다.

## 엔드포인트
- **URL:** `/api.php`
- **Method:** `GET`

## 요청 파라미터

| 파라미터         | 필수 여부 | 설명                                     | 예시 값               |
|------------------|-----------|-----------------------------------------|----------------------|
| `yna_no`         | 선택      | 뉴스 데이터의 고유 ID를 지정합니다.       | `1001`               |
| `pageNo`         | 선택      | 페이지 번호를 지정합니다. 기본값은 `1`입니다. | `1`              |
| `numOfRows`      | 선택      | 한 페이지당 뉴스 항목의 개수를 지정합니다. 기본값은 `5`입니다. | `10`          |

### 요청 예시
```
GET /api.php?pageNo=1&numOfRows=5&yna_no=1001
```


## 응답 형식
성공적인 요청 시 응답은 다음과 같은 JSON 형식으로 반환됩니다:

```json
{
  "StatusCode": 200,
  "message": "Success to get News Data",
  "data": [
    {
      "yna_no": "1001",
      "yna_ttl": "재난 뉴스 제목",
      "yna_cn": "재난 뉴스 내용",
      "crt_dt": "2024-10-01"
    }
  ],
  "RequestTime": "2024-10-08T00:00:00Z"
}
```

## 응답 필드 설명
| 필드      | 설명     |
|------|------------|
| `StatusCode`  |	요청 처리 상태 코드 (200, 404, 500 등) |
| `message`     | 요청 처리 결과 메시지   |
| `data`        | 필터링된 뉴스 데이터 리스트 |
| `RequestTime`        | 요청이 처리된 시간 |

## 에러 코드
| 필드      | 설명     |
|------|------------|
| `400`  |		잘못된 파라미터 값이 전달된 경우 발생합니다. |
| `404`     | 요청한 뉴스 데이터를 찾을 수 없는 경우 발생합니다.  |
| `500`        | 서버 내부 오류가 발생한 경우 발생합니다. |

## 데이터 수집 방법
* `craw.php` 파일을 실행하여 외부 API로부터 최신 뉴스를 수집하고 데이터베이스에 저장합니다.

## 종속성 및 설치
* Composer: 종속성 관리를 위해 사용되며, `composer install` 명령어로 필요한 라이브러리를 설치합니다.
* `.env` 파일에서 `YNA_Disaster_News_API_KEY` 값을 설정해야 합니다.

## 참고 사항
* 데이터베이스 설정 및 API 호출 시 에러가 발생하면 로그를 확인하세요.
