# NationalActionTips API

## 개요
이 API는 재난 상황에서 사용자의 행동 지침을 제공하기 위한 정보를 제공합니다. 사용자는 다양한 카테고리의 정보를 요청할 수 있으며, PDF, PNG, 또는 WEBP 파일 형식으로 데이터를 받아볼 수 있습니다.

## 엔드포인트
- **URL:** `/api.php`
- **Method:** `GET`

## 요청 파라미터
- **category** (필수): 재난 유형을 지정합니다. 유효한 값은 다음과 같습니다:
  - `civildefence`
  - `lifesafety`
  - `naturaldisaster`
  - `socialdisaster`
- **id** (필수): 데이터 항목의 ID를 지정합니다. 숫자로만 이루어져야 합니다.
- **returnfile** (선택): 반환할 파일 형식. 기본값은 `pdf`입니다. 유효한 값은 다음과 같습니다:
  - `pdf`
  - `png`
  - `webp`
- **returntype** (선택): 파일 반환 방식. 기본값은 `base64`입니다. 유효한 값은 다음과 같습니다:
  - `base64`
  - `url`

## 응답 예시
성공적인 요청 시 응답은 다음과 같은 JSON 형식으로 반환됩니다:
```json
{
  "StatusCode": 200,
  "message": "Success to get info.",
  "data": {
    "text": "base64 encoded markdown content",
    "pdf1": "base64 encoded pdf content",
    "png1": "base64 encoded png content"
  }
}
```

## 에러 코드
* 400 Bad Request: 필수 파라미터가 없거나 유효하지 않을 때 반환됩니다.
* 404 Not Found: 요청한 파일 또는 마크다운 파일이 없을 때 반환됩니다.
* 500 Internal Server Error: 서버에서 예기치 않은 오류가 발생했을 때 반환됩니다.
