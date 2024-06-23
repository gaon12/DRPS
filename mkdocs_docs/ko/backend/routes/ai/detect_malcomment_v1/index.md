# 서버 연결 확인
`/ai/detect_malcomment_v1` 경로는 악성(혐오) 표현이 담겨있는지 여부를 확인하는 라우트 경로입니다. `v1`이므로 성능은 떨어지지만, 판정이 빠릅니다.

## 요청
| HTTP                                                           |
| -------------------------------------------------------------- |
| `GET` / `POST` http://{address}:{port}/ai/detect_malcomment_v1 |

### 요청 바디
| 필드명 | 필수 여부 | 타입     | 설명                      |
| ------ | --------- | -------- | ------------------------- |
| `text` | `N`       | `String` | 악성 여부를 판단할 텍스트 |

### 응답
#### 응답 바디
| 필드 이름              | 데이터 타입 | 설명                       |
| ---------------------- | ----------- | -------------------------- |
| `StatusCode`           | `Int`       | 상태 코드                  |
| `message`              | `String`    | 응답 메시지                |
| `data`                 | `Object`    | 악성 여부 결과가 담긴 객체 |
| `data > is_malcomment` | `String`    | 악성 여부 결과             |
| `RequestTime`          | `String`    | 요청 시간                  |

* `format` 파라미터를 제외한 어떠한 파라미터값을 붙히더라도, 출력에는 영향이 없습니다.
* `GET` 요청 결과와 `POST` 요청 결과 모두 동일합니다.

### 요청 예시
#### GET 요청
```url
http://{address}:{port}/ai/detect_malcomment_v1?text=안녕
```

#### POST 요청
```json
{
  "text": "안녕"
}
```

### 응답 예시
```JSON
{
  "StatusCode": 200,
  "message": "Success to detect is malcomment",
  "data": {
    "is_malcomment": "False"
  },
  "RequestTime": "2024-06-23T10:57:03.379381"
}
```

### 오류
#### 오류 예시 - 판정 실패
```json
{
  "StatusCode": 5007,
  "message": "Cannot detect malcomment"
}
```

#### 오류 예시 - 필수 파라미터(text) 없음
```json
{
  "StatusCode": 4001,
  "message": "Cannot found required parameter(s): text"
}
```