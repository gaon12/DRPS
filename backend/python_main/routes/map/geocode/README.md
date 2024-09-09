작성중(응답 부분부터 작성해야 함)

# 서버 연결 확인
`/map/geocode` 경로는 지오코딩/리버스 지오코딩/플러스 코드 변환을 위한 라우트 경로입니다.

## 요청
|HTTP|
|--|
| `GET` / `POST` http://{address}:{port}/map/geocode|

### 요청 바디
|필드명|필수 여부|타입|설명|
|--|--|--|--|
| `geo_type` | `Y` | `String` | 변환 방식. `geocode`, `reverse`, `pluscode` 중 하나 입력 |
| `lat` | `N` | `Float` | 위도값. `geo_type` 값이 `geocode`일 경우에만 필수 입력 |
| `lon` | `N` | `Float` | 경도값. `geo_type` 값이 `geocode`일 경우에만 필수 입력 |
| `address` | `N` | `String` | 주소 정보. `geo_type` 값이 `reverse`일 경우에만 필수 입력 |
| `pluscode_value` | `N` | `String` | 플러스 코드값. `geo_type` 값이 `pluscode`일 경우에만 필수 입력 |

### 응답
#### 응답 바디
|필드 이름|데이터 타입|설명|
|--|--|--|
|`StatusCode`|`Int`|상태 코드|
|`message`|`String`|응답 메시지|
| `data`                 | `Object`    | 악성 여부 결과가 담긴 객체 |
| `data > is_malcomment` | `String`    | 악성 여부 결과             |
|`RequestTime`|`String`|요청 시간|

* `format` 파라미터를 제외한 어떠한 파라미터값을 붙히더라도, 출력에는 영향이 없습니다.
* `GET` 요청 결과와 `POST` 요청 결과 모두 동일합니다.

### 요청 예시
```url
http://{address}:{port}/map/geocode
```

### 응답 예시
```JSON
{
  "StatusCode": 200,
  "message": "Pong!",
  "RequestTime": "2024-06-22T02:54:31.373Z"
}
```

### 오류
오류 메시지는 따로 없습니다.