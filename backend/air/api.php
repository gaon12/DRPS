<?php

require __DIR__ . '/vendor/autoload.php'; // Composer autoload 파일 로드

use Dotenv\Dotenv;

// .env 파일 로드 및 환경 변수 설정
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// 공기 질 정보를 가져오는 함수
function getAirQuality($latitude, $longitude) {
    $url = "https://api.openaq.org/v2/latest";

    // .env에서 API 키 가져오기
    $apiKey = $_ENV['OpenAQ'] ?? '';

    // API 키가 없는 경우 에러 처리
    if (empty($apiKey)) {
        echo json_encode([
            'StatusCode' => 500,
            'message' => 'API 키를 찾을 수 없습니다.',
            'RequestTime' => gmdate('Y-m-d\TH:i:s.v\Z')
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        return;
    }

    // 요청 매개변수 설정
    $params = [
        'coordinates' => "$latitude,$longitude",
        'radius' => 10000, // 10km 반경 내 측정소 검색
        'limit' => 1, // 가장 가까운 측정소 1개 반환
        'parameter' => ['pm25', 'pm4', 'pm10', 'no', 'no2', 'ch4', 'so2', 'o3', 'co', 'bc']
    ];

    // URL에 매개변수 추가
    $queryString = http_build_query($params);
    $requestUrl = $url . '?' . $queryString;

    // cURL 세션 초기화
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $requestUrl);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["x-api-key: $apiKey"]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    // API 요청 실행 및 응답 저장
    $response = curl_exec($ch);

    // 결과 배열 초기화
    $result = [
        'StatusCode' => 500,
        'message' => 'Unknown error',
        'data' => [],
        'RequestTime' => gmdate('Y-m-d\TH:i:s.v\Z')
    ];

    // 오류 확인 및 결과 처리
    if (curl_errno($ch)) {
        $result['message'] = 'API 요청 중 오류 발생: ' . curl_error($ch);
    } else {
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $data = json_decode($response, true);

        // 응답이 유효하고, HTTP 상태 코드가 200일 경우 처리
        if ($httpCode == 200 && isset($data['results']) && !empty($data['results'])) {
            $measurements = $data['results'][0]['measurements'];

            // 요청된 측정값만 필터링
            $filteredData = array_filter($measurements, function ($measurement) {
                return in_array($measurement['parameter'], ['pm25', 'pm4', 'pm10', 'no', 'no2', 'ch4', 'so2', 'o3', 'co', 'bc']);
            });

            $result['StatusCode'] = 200;
            $result['message'] = 'Success';
            $result['data'] = $filteredData;

            // 라이선스 정보 추가
            $result['license'] = [
                'text' => 'This data is provided by OpenAQ and may include data from various sources. Please review individual data source terms.',
                'url' => 'https://openaq.org/#/about/data-access',
                'attribution' => 'OpenAQ contributors and respective data providers.'
            ];
        } else {
            $result['StatusCode'] = $httpCode ?: 404;
            $result['message'] = '해당 위치 근처에서 데이터를 찾을 수 없습니다.';
            $result['debug'] = $data; // 디버깅용 응답 데이터
        }
    }

    // cURL 세션 종료
    curl_close($ch);

    // JSON 결과 출력
    header('Content-Type: application/json');
    echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}

// 요청에서 위경도 받아오기
$input = json_decode(file_get_contents('php://input'), true);
$latitude = $input['latitude'] ?? 37.5665; // 기본값: 서울의 위도
$longitude = $input['longitude'] ?? 126.9780; // 기본값: 서울의 경도

// 함수 호출
getAirQuality($latitude, $longitude);
?>

