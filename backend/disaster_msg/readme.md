# Disaster Messages API

## 개요
이 API는 공공 데이터 API를 이용해 재난 경고 메시지를 수집하고, 이를 사용자가 요청하는 형식에 맞게 제공합니다. 사용자는 날짜, 재난 유형, 지역 등의 조건을 설정하여 데이터를 요청할 수 있습니다.

## 엔드포인트
- **URL:** `/api.php`
- **Method:** `GET`

## 요청 파라미터

| 파라미터         | 필수 여부 | 설명                                         | 예시 값               |
|------------------|-----------|---------------------------------------------|----------------------|
| `pageNo`         | 선택      | 페이지 번호를 지정합니다. 기본값은 `1`입니다. | `1`                  |
| `numOfRows`      | 선택      | 한 페이지당 표시할 행 수를 지정합니다. 기본값은 `10`입니다. | `10`              |
| `created_at`     | 선택      | 특정 날짜에 생성된 재난 메시지를 조회합니다.  | `2024-10-01`         |
| `emergency_step` | 선택      | 긴급 단계에 따른 필터링 조건                 | `warning`            |
| `serial_number`  | 선택      | 재난 메시지의 고유 시리얼 번호                | `12345`              |
| `disaster_type`  | 선택      | 재난 유형을 지정합니다.                      | `earthquake`         |
| `region_name`    | 선택      | 지역 이름을 포함하는 재난 메시지를 검색합니다. | `Seoul`             |

### 요청 예시
```
GET /api.php?pageNo=1&numOfRows=10&created_at=2024-10-01
```


## 응답 형식
성공적인 요청 시 응답은 다음과 같은 JSON 형식으로 반환됩니다:

```json
{
  "StatusCode": 200,
  "message": "Success to get disaster_message(s)",
  "data": [
    {
      "serial_number": "12345",
      "created_at": "2024-10-01",
      "disaster_type": "earthquake",
      "region_name": "Seoul",
      "message_content": "This is a disaster alert message."
    }
  ],
  "license": "공공누리 4유형 (https://www.safekorea.go.kr/)",
  "RequestTime": "2024-10-08T00:00:00Z"
}
```

## 응답 필드 설명
| 필드      | 설명     |
|------|------------|
| `StatusCode`  |	요청 처리 상태 코드 (200, 404, 500 등) |
| `message`     | 요청 처리 결과 메시지   |
| `data`        | 필터링된 재난 메시지 데이터 리스트 |
| `license`        | 데이터 출처 및 라이선스 정보 |

## 에러 코드
| 필드      | 설명     |
|------|------------|
| `400`     | 필수 파라미터가 없거나 유효하지 않을 때 반환됩니다.   |
| `500`        | 	데이터베이스 오류 또는 요청 실패 시 반환됩니다. |

## 데이터 수집 방법
`craw2.php` 파일을 실행하여 공공 데이터 API에서 최신 재난 메시지를 크롤링하고 데이터베이스에 저장합니다.

## 종속성 및 설치
* Composer: 종속성 관리를 위해 사용되며, composer install 명령어로 필요한 라이브러리를 설치합니다.

## 참고 사항
* 공공 데이터 사용 시 라이선스 조건을 준수해야 합니다.
* db_config_sample.php 파일을 db_config.php로 복사한 후, 데이터베이스 설정을 입력하여 사용하세요.
