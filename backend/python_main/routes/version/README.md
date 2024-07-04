# 버전 확인
`/version` 경로는 버전 정보를 제공하는 라우트 경로입니다.

## 요청
|HTTP|
|--|
| `GET` / `POST` http://{address}:{port}/version|

### 요청 바디
|필드명|필수 여부|타입|설명|
|--|--|--|--|
| `없음` | `없음` | `없음` | `없음` |

### 응답
#### 응답 바디
|필드 이름|데이터 타입|설명|
|--|--|--|
|`StatusCode`|`Int`|상태 코드|
|`message`|`String`|응답 메시지|
|`RequestTime`|`String`|요청 시간|

* `format` 파라미터를 제외한 어떠한 파라미터값을 붙히더라도, 출력에는 영향이 없습니다.
* `GET` 요청 결과와 `POST` 요청 결과 모두 동일합니다.

### 요청 예시
```url
http://{address}:{port}/ping
```

### 응답 예시
```JSON
{
  "StatusCode": 200,
  "message": "Success to get Version info",
  "data": {
    "version": "0.0.1-beta"
  },
  "RequestTime": "2024-07-03T16:27:42.737718"
}
```

### 오류
#### version.txt 미존재
```json
{
  "StatusCode": 404,
  "message": "version.txt file does not exist.",
  "RequestTime": "2024-07-03T16:18:51.750646"
}
```

#### version.txt 파일 내용이 없음
```json
{
  "StatusCode": 400,
  "message": "version.txt file is empty.",
  "RequestTime": "2024-07-03T16:27:23.267492"
}
```