# 버전 확인
`/version` 경로는 버전 정보를 제공하는 라우트 경로입니다.

## 요청
|HTTP|
|--|
| `GET` / `POST` http://{address}:{port}/version |

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
| `data`  | `Object`    | 버전 정보가 담긴 객체 |
| `data > latest_version` | `String`    | 최신 버전명 |
| `data > latest_version_codename` | `String`    | 최신 버전의 코드네임 |
| `data > latest_version_sentence` | `String`    | 최신 버전의 코드문장 |
| `data > mandatory_update_version` | `Array`    | 반드시 업데이트 해야 하는 버전 배열 |
| `data > recommended_update_version` | `Array`    | 업데이트를 권장하는 버전 배열 |

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
  "message": "Success to get Version info",
  "data": {
    "latest_version": "0.0.1-alpha",
    "latest_version_codename": "Self-Confidence",
    "latest_version_sentence": "할 수 있다는 믿음!",
    "mandatory_update_version": [],
    "recommended_update_version": []
  }
}
```

### 오류
#### version.json 미존재
```json
{
  "StatusCode": 404,
  "message": "version.json file does not exist."
}
```

#### version.txt 파일 내용이 없음
```json
{
  "StatusCode": 400,
  "message": "version.json file is empty."
}
```