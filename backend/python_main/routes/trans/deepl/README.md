# DeepL 번역
`/trans/deepl` 경로는 DeepL에 번역을 요청하고, 결과를 반환하는 라우트 경로입니다.

# 사전 설정
1. [deeplx 설치](https://deeplx.owo.network/install/) 후, 리버스 프록시로 도메인 연결. 도커 사용을 권장합니다.
2. `.env`에 deeplx_url 주소가 있어야 함. 단 도메인이 아닌 Endpoint가 `/translate`나 `/v1/translate`, `/v2/translate`로 끝나야 합니다. 리버스 프록시에서 `/translate`나 `/v1/translate`, `/v2/translate`를 루트 경로로 설정한 경우에는 예외. `/v1/translate`, `/v2/translate` 사용 시에는 별도의 설정이 필요함. `.env` 파일에 `deeplx_url` 키값을 채우세요.

## 요청
| HTTP                                                           |
| -------------------------------------------------------------- |
| `GET` / `POST` http://{address}:{port}/trans/deepl |

### 요청 바디
| 필드명 | 필수 여부 | 타입     | 설명                      |
| ------ | --------- | -------- | ------------------------- |
| `text` | `Y`       | `String` | 번역할 텍스트 |
| `source_lang` | `Y`       | `String` | `text` 파라미터의 언어 코드. `ISO 639-1` 값으로 입력. |
| `target_lang` | `Y`       | `String` | 번역될 언어 코드. `ISO 639-1` 값으로 입력. |

### 응답
#### 응답 바디
| 필드 이름              | 데이터 타입 | 설명                       |
| ---------------------- | ----------- | -------------------------- |
| `StatusCode`           | `Int`       | 상태 코드                  |
| `message`              | `String`    | 응답 메시지                |
| `data`                 | `Object`    | 번역된 결과가 담긴 객체 |
| `data > result` | `String`    | 번역 결과             |
| `data > alternative` | `Array`    | `data > result` 번역 결과 외에 다른 번역 결과가 존재하는 경우, 배열 형식으로 결과를 출력. 필수적으로 나오는 것은 아님. |
| `RequestTime`          | `String`    | 요청 시간                  |

* `format` 파라미터를 제외한 어떠한 파라미터값을 붙히더라도, 출력에는 영향이 없습니다.
* `/trans/gtran` 라우트 경로와 달리, `source_lang` 파라미터를 반드시 입력해야 합니다.
* `data > alternative` 값은 반드시 출력되는 것은 아닙니다.
* `GET` 요청 결과와 `POST` 요청 결과 모두 동일합니다.

### 요청 예시
#### GET 요청
```url
http://{address}:{port}/trans/deepl?text=안녕 세상아&source_lang=ko&target_lang=en
```

#### POST 요청
```json
{
  "text": "안녕 세상아",
  "source_lang": "ko",
  "target_lang": "en"
}
```

### 응답 예시
```JSON
{
  "StatusCode": 200,
  "message": "Success to translated",
  "data": {
    "result": "Hello, world",
    "alternative": [
      "Hello world",
      "Goodbye, world",
      "Hello World"
    ]
  },
  "RequestTime": "2024-07-01T19:42:08.528488"
}
```

### 오류
#### 오류 예시 - API 번역 서버로 요청 실패
```json
{
  "StatusCode": 502,
  "message": "Error: The value was not received from the API server"
}
```

```json
{
  "StatusCode": 500,
  "message": "Translation API failed"
}
```


#### 오류 예시 - aiohttp.ClientError 발생 시
```json
{
  "StatusCode": 503,
  "message": "Service Unavailable"
}
```

#### 오류 예시 - 기타 예외 발생 시
```json
{
  "StatusCode": 500,
  "message": "Internal Server Error"
}
```

#### 오류 예시 - 필수 파라미터(text 또는 target_lang) 없음
```json
{
  "StatusCode": 4001,
  "message": "Missing parameter(s): text, target_lang"
}
```