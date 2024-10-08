# Air Quality API

## 개요
이 폴더는 공기 질 정보를 가져오는 API와 필요한 종속성 패키지를 관리하는 Composer 구성 파일들을 포함하고 있습니다. `api.php` 파일은 OpenAQ API를 사용하여 특정 위치의 공기 질 데이터를 제공합니다.

## 주요 파일 설명

- **api.php**: OpenAQ API를 통해 공기 질 정보를 가져오는 PHP 스크립트입니다. 환경 변수 설정과 데이터 필터링을 지원합니다.
- **composer.json**: 프로젝트의 종속성 정보가 정의된 파일입니다.
- **composer.lock**: 종속성의 고정된 버전을 관리하여 설치 환경의 일관성을 유지합니다.
- **vendor 폴더**: Composer를 통해 설치된 외부 라이브러리들이 포함된 폴더입니다.

## 주요 종속성
- **vlucas/phpdotenv**: `.env` 파일을 사용하여 환경 변수를 로드하고 관리합니다.
- **symfony/polyfill**: PHP 기능 호환성을 제공하는 다중 라이브러리.
- **graham-campbell/result-type**, **phpoption/phpoption**: 함수형 프로그래밍 및 옵션 처리를 위한 라이브러리.

## API 사용 방법

1. **환경 변수 설정**:
   - `.env` 파일에 `OpenAQ` API 키를 설정해야 합니다.
   - 예시:
     ```
     OpenAQ=YOUR_API_KEY
     ```

2. **API 호출**:
   - API는 위경도 좌표를 받아 공기 질 데이터를 반환합니다.
   - 기본 요청:
     ```bash
     curl -X POST -H "Content-Type: application/json" -d '{"latitude":37.5665,"longitude":126.9780}' http://example/api.php
     ```

3. **응답 형식**:
   - API는 JSON 형식으로 응답하며, 성공 시 공기 질 데이터를 포함합니다.

## 참고 사항
- OpenAQ API를 사용하므로 라이선스 조건을 준수해야 합니다.
- Composer를 사용하여 종속성을 관리하며, 필요한 경우 `composer install`로 설치할 수 있습니다.
