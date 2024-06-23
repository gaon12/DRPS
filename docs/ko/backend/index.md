# 사용 언어 및 프레임워크
백엔드에서는 각 기능별로 사용 언어 및 프레임워크가 다릅니다.

* 메인 기능: Node.js Express
* AI 기능: Python FastAPI
* OpenAPI 데이터 DB 저장: PHP

# 값 반환
## 기본 반환 틀
API에서 반환할 때, 기본적으로 다음과 같은 형식으로 반환합니다.

```json
{
  "StatusCode": 200,
  "message": "Pong!",
  "RequestTime": "2024-06-21T04:52:35.487Z"
}
```

* `StatusCode`: 성공, 실패, 오류 코드를 나타냅니다. 프로젝트 내부에서만 사용하는 것이며, `HTTP 상태 코드` 기반으로 만들었습니다. 다만 항상 `StatusCode`와 `HTTP 상태 코드`가 일치하는 것은 아닙니다. 오류 발생 시, `message`는 변할 수 있으므로, `StatusCode`를 기준으로 코드를 작성하는 것이 좋습니다.
* `message`: 요청 결과 메시지를 담고 있습니다. 결과가 `message`에 무조건 담기는 것은 아니므로, 각 라우트(기능)별로 문서를 확인하시기 바랍니다. 또한 `message` 내용을 기준으로 오류 처리하는 것은 권장하지 않습니다.
* `RequestTime`: 요청 시간을 출력합니다. 일반적인 경우에는 불필요하지만, 최근 요청시간이 필요한 경우, 이 값을 가지고 비교하는 등에 사용하면 됩니다. `세계 표준시(UTC)`를 기준으로 합니다.

## 반환 형식 설정
`XML`, `JSON`, `TOML`, `YAML` 형식 중 원하는 형식으로 요청값을 요구할 수 있습니다.

```
http://{도메인}/{경로}?format={형식}
```

다음과 같이 `{형식}` 부분에 `XML`, `JSON`, `TOML`, `YAML` 중 하나를 입력하면, 해당 형식으로 반환됩니다.

* `format` 파라미터가 없거나 올바르지 않은 값으로 입력한 경우, `JSON`으로 반환합니다.

# SQL 파일
MySQL로 데이터베이스를 사용하며, 데이터베이스와 테이블이 존재해야 합니다. 자세한 내용은 [sql 파일](sql/index.md) - 문서를 참고하세요!

--------

# API 라우트 경로별 문서
## 메인 서버 API
### 서버 연결 확인
* [/ping](routes/ping/index.md) - 서버 연결 확인( `GET` / `POST` )

### 서비스 버전 확인
* [/version](routes/version/index.md) - 서버 연결 확인( `GET` / `POST` )

### 재난문자 검색
* [/disaster_msg](routes/disaster_msg/index.md) - 재난문자 검색( `GET` / `POST` )

## AI 서버 API
### 서버 연결 확인
* [/ping](routes/ping/index.md) - 서버 연결 확인( `GET` / `POST` )

### 악성 댓글 탐지 v1
* [/ai/detect_malcomment_v1](routes/ai/detect_malcomment_v1/index.md) - 악성 댓글 탐지 v1( `GET` / `POST` )