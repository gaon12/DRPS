# 구글 번역
`/trans/gtran` 경로는 구글 번역에 번역을 요청하고, 결과를 반환하는 라우트 경로입니다.

## 요청
| HTTP                                                           |
| -------------------------------------------------------------- |
| `GET` / `POST` http://{address}:{port}/trans/gtran |

### 요청 바디
| 필드명 | 필수 여부 | 타입     | 설명                      |
| ------ | --------- | -------- | ------------------------- |
| `text` | `Y`       | `String` | 번역할 텍스트 |
| `source_lang` | `N`       | `String` | `text` 파라미터의 언어 코드. 생략 시 자동 인식. `ISO 639-1` 값으로 입력. |
| `text` | `Y`       | `String` | 번역될 언어 코드. `ISO 639-1` 값으로 입력. |

### 응답
#### 응답 바디
| 필드 이름              | 데이터 타입 | 설명                       |
| ---------------------- | ----------- | -------------------------- |
| `StatusCode`           | `Int`       | 상태 코드                  |
| `message`              | `String`    | 응답 메시지                |
| `data`                 | `Object`    | 번역된 결과가 담긴 객체 |
| `data > result` | `String`    | 번역 결과             |
| `data > did_you_mean` | `String`    | 요청 받은 `text`에 오타 등이 발생한 경우, `text`의 교정된 값(완벽하게 교정되어 있지 않을 수 있음). 필수적으로 반환되는 값은 아님. |
| `data > did_you_mean_translated` | `String`    | `did_you_mean` 키를 번역한 결과. `did_you_mean` 키가 존재한다면 같이 반환됨. |
| `RequestTime`          | `String`    | 요청 시간                  |

* `format` 파라미터를 제외한 어떠한 파라미터값을 붙히더라도, 출력에는 영향이 없습니다.
* `data > did_you_mean` 값은 완벽하게 교정되는 것은 아닙니다. 하지만 교정한 값을 사용하는 것을 권장합니다.
* `GET` 요청 결과와 `POST` 요청 결과 모두 동일합니다.

### 요청 예시
#### GET 요청 - 모든 파라미터 입력
```url
http://{address}:{port}/trans/gtran?text=안녕 세상아&source_lang=ko&target_lang=en
```

#### POST 요청 - 모든 파라미터 입력
```json
{
  "text": "안녕 세상아",
  "source_lang": "ko",
  "target_lang": "en"
}
```

#### GET 요청 - source_lang 파라미터 생략
```url
http://{address}:{port}/trans/gtran?text=안녕 세상아&target_lang=en
```

#### POST 요청 - source_lang 파라미터 생략
```json
{
  "text": "안녕 세상아",
  "target_lang": "en"
}
```

### 응답 예시
```JSON
{
  "StatusCode": 200,
  "message": "Success to translated",
  "data": {
    "result": "Hello world"
  },
  "RequestTime": "2024-07-01T16:15:46.110065"
}
```

#### did_you_mean 존재
* `http://{address}:{port}/trans/gtran?text=안뇨하셍용&target_lang=en` 이렇게 요청을 보냈다고 가정

```json
{
  "StatusCode": 200,
  "message": "Success to translated",
  "data": {
    "result": "I'm not urinating",
    "did_you_mean_original": "안녕하세요",
    "did_you_mean_translated": "hello"
  },
  "RequestTime": "2024-07-01T16:20:25.051654"
}
```

### 오류
#### 오류 예시 - JSON 디코딩 실패
```json
{
  "StatusCode": 5001,
  "message": "JSON decode error"
}
```

#### 오류 예시 - 알 수 없는 오류 발생
```json
{
  "StatusCode": 5002,
  "message": "Unexpected error occurred"
}
```

#### 오류 예시 - 필수 파라미터(text 또는 target_lang) 없음
```json
{
  "StatusCode": 4001,
  "message": "Missing parameter(s): text, target_lang"
}
```