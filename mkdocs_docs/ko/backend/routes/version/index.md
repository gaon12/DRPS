# 버전 확인
`/version` 경로는 버전을 확인하는 라우트 경로입니다.

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
|`data`|`Object`|버전 정보가 담긴 객체|
|`data > version`|`String`|버전 정보|
|`RequestTime`|`String`|요청 시간|

* `format` 파라미터를 제외한 어떠한 파라미터값을 붙히더라도, 출력에는 영향이 없습니다.
* `GET` 요청 결과와 `POST` 요청 결과 모두 동일합니다.

### 요청 예시
```url
http://{address}:{port}/version
```

### 응답 예시
```JSON
{
  "StatusCode": 200,
  "message": "Success to get Version!",
  "data": {
    "version": "0.0.1-alpha"
  },
  "RequestTime": "2024-06-22T11:04:42.845Z"
}
```

### 오류
클라이언트 측의 문제에 해당하지 않으므로, 본 라우트 경로에서 반환하는 오류는 모두 서버측 문제입니다.

#### 오류 예시 - 버전 정보 파일이 없는 경우
```json
{
  "StatusCode": 5000,
  "message": "Version file does not exist",
  "RequestTime": "2024-06-22T11:08:48.157Z"
}
```

#### 오류 예시 - 버전 정보 파일이 빈 파일인 경우
```json
{
  "StatusCode": 5001,
  "message": "Version file is empty",
  "RequestTime": "2024-06-22T11:09:00.599Z"
}
```
