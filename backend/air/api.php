<?php

require __DIR__ . '/vendor/autoload.php'; // Composer autoload 파일 로드

use Dotenv\Dotenv;

// .env 파일 로드 및 환경 변수 설정
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// 공기 질 정보를 가져오는 함수
function getAirQuality($latitude, $longitude) {
    $url = "https://api.openweathermap.org/data/2.5/air_pollution";

    // .env에서 API 키 가져오기
    $apiKey = $_ENV['OpenWeatherMapAPI'] ?? '';

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
        'lat' => $latitude,
        'lon' => $longitude,
        'appid' => $apiKey
    ];

    // URL에 매개변수 추가
    $queryString = http_build_query($params);
    $requestUrl = $url . '?' . $queryString;

    // cURL 세션 초기화
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $requestUrl);
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
        if ($httpCode == 200 && isset($data['list'][0])) {
            $aqi = $data['list'][0]['main']['aqi'];
            $components = $data['list'][0]['components'];

            // 필요한 측정값 필터링
            $filteredData = [
                'aqi' => $aqi,
                'components' => [
                    'co' => $components['co'] ?? null,
                    'no' => $components['no'] ?? null,
                    'no2' => $components['no2'] ?? null,
                    'o3' => $components['o3'] ?? null,
                    'so2' => $components['so2'] ?? null,
                    'pm2_5' => $components['pm2_5'] ?? null,
                    'pm10' => $components['pm10'] ?? null,
                    'nh3' => $components['nh3'] ?? null
                ]
            ];

            $result['StatusCode'] = 200;
            $result['message'] = 'Success';
            $result['data'] = $filteredData;

            // 라이선스 정보 추가
            $result['license'] = [
                'text' => 'This data is provided by OpenWeatherMap. Please review individual data source terms.',
                'url' => 'https://openweathermap.org/',
                'attribution' => 'OpenWeatherMap contributors and respective data providers.'
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
