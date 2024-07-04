# 재난문자 카테고리 분류
`/ai/disaster_msg_category_classification` 경로는 입력받은 재난문자의 카테고리를 분류하는 기능을 제공합니다.

## 요청
| HTTP                                                           |
| -------------------------------------------------------------- |
| `GET` / `POST` http://{address}:{port}/ai/disaster_msg_category_classification |

### 요청 바디
| 필드명 | 필수 여부 | 타입     | 설명                      |
| ------ | --------- | -------- | ------------------------- |
| `text` | `N`       | `String` | 재난문자 내용 |

### 응답
#### 응답 바디
| 필드 이름              | 데이터 타입 | 설명                       |
| ---------------------- | ----------- | -------------------------- |
| `StatusCode`           | `Int`       | 상태 코드                  |
| `message`              | `String`    | 응답 메시지                |
| `data`                 | `Object`    | 재난문자 분류 결과가 담긴 객체 |
| `data > category`      | `String`    | 재난문자 분류 결과         |
| `RequestTime`          | `String`    | 요청 시간                  |

* `format` 파라미터를 제외한 어떠한 파라미터값을 붙히더라도, 출력에는 영향이 없습니다.
* `GET` 요청 결과와 `POST` 요청 결과 모두 동일합니다.

### 요청 예시
#### GET 요청
```url
http://{address}:{port}/ai/disaster_msg_category_classification?text=내일 새벽부터 많은 비가 예상됩니다. 하천변, 세월교, 급경사지, 저지대 침수, 산사태 등 위험지역 접근 자제와 안전사고에 유의 바랍니다.[상주시]
```

#### POST 요청
```json
{
  "text": "내일 새벽부터 많은 비가 예상됩니다. 하천변, 세월교, 급경사지, 저지대 침수, 산사태 등 위험지역 접근 자제와 안전사고에 유의 바랍니다.[상주시]"
}
```

### 응답 예시
```JSON
{
  "StatusCode": 200,
  "message": "Disaster message classification successful!",
  "data": {
    "category": "호우"
  },
  "RequestTime": "2024-07-03T16:25:32.599215"
}
```

### 오류
#### 오류 예시 - 필수 파라미터(text) 없음
```json
{
  "StatusCode": 400,
  "message": "No text provided",
  "RequestTime": "2024-07-03T16:25:38.052582"
}
```