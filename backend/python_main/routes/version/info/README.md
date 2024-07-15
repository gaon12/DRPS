# 버전 확인
`/version/info` 경로는 각 버전의 버전 정보를 제공하는 라우트 경로입니다.

## 요청
|HTTP|
|--|
| `GET` / `POST` http://{address}:{port}/version/info |

### 요청 바디
|필드명|필수 여부|타입|설명|
|--|--|--|--|
| `version` | `N` | `String` | 버전명 |
| `start_version` | `N` | `String` | 버전 시작 범위 |
| `end_version` | `N` | `String` | 버전 종료 범위 |
| `lang` | `N` | `String` | 언어값 |

* `start_version`과 `end_version`는 한 세트(쌍)으로 둘 다 있어야 합니다.
* `lang` 파라미터가 없거나 올바르지 않으면, `en`으로 간주합니다.
* `lang`을 제외한 파라미터가 아무것도 없으면 안됩니다.

### 응답
#### 응답 바디
|필드 이름|데이터 타입|설명|
|--|--|--|
|`StatusCode`|`Int`|상태 코드|
|`message`|`String`|응답 메시지|
| `data`  | `Object`    | 버전 정보가 담긴 객체 |
| `data > version` | `String`    | 버전명 |
| `data > data` | `String`    | 버전의 변경정보 |

* `format` 파라미터를 제외한 어떠한 파라미터값을 붙히더라도, 출력에는 영향이 없습니다.
* `GET` 요청 결과와 `POST` 요청 결과 모두 동일합니다.

### 요청 예시
#### GET 요청 - 버전명 지정
```url
http://{address}:{port}/version/info?version=0.0.1-beta
```

#### POST 요청 - 버전명 지정
```json
{
  "version": "0.0.1-beta"
}
```

#### 응답 예시
```JSON
{
  "StatusCode": 200,
  "message": "Success to get Version info",
  "data": [
    {
      "version": "0.0.1-beta",
      "data": "First Version"
    }
  ]
}
```

#### GET 요청 - 버전 범위 지정
```url
http://{address}:{port}/version/info?start_version=0.0.1-beta&end_version=0.0.3-beta
```

#### POST 요청 - 버전 범위 지정
```json
{
  "start_version": "0.0.1-beta",
  "end_version": "0.0.3-beta"
}
```

#### 응답 예시
```JSON
{
  "StatusCode": 200,
  "message": "Success to get Version info",
  "data": [
    {
      "version": "0.0.1-beta",
      "data": "First Version"
    },
    {
      "version": "0.0.2",
      "data": "Second Version"
    },
    {
      "version": "0.0.3-beta",
      "data": "Third Version"
    }
  ]
}
```

### 오류
#### 파라미터 없음
```json
{
  "StatusCode": 400,
  "message": "Invalid request parameters."
}
```
