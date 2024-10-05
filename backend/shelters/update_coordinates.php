<?php
// DB 설정 임포트
require 'db_config.php';

// Composer autoload 불러오기
require 'vendor/autoload.php';

// Dotenv 설정 불러오기
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// 네이버 지도 API 키 설정
$clientId = $_ENV['NAVER_CLIENT_ID']; // X-NCP-APIGW-API-KEY-ID 값
$clientSecret = $_ENV['NAVER_CLIENT_SECRET']; // X-NCP-APIGW-API-KEY 값

// 테이블 목록 설정
$tables = ['CivilDefenseShelters', 'EarthquakeShelters', 'TsunamiShelters'];

foreach ($tables as $table) {
    // latitude 또는 longitude 값이 0인 레코드 가져오기
    $query = "SELECT id, address FROM $table WHERE latitude = 0 OR longitude = 0";
    $stmt = $pdo->query($query);

    $records = $stmt->fetchAll();

    foreach ($records as $record) {
        $id = $record['id'];
        // 주소가 여러 개일 경우 첫 번째 주소만 사용
        $address = explode(' ', $record['address'])[0];

        // 네이버 지도 API 요청 URL 설정
        $url = "https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=" . urlencode($address);

        // cURL 초기화
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "X-NCP-APIGW-API-KEY-ID: $clientId",
            "X-NCP-APIGW-API-KEY: $clientSecret"
        ]);

        // API 요청 및 응답 수신
        $response = curl_exec($ch);
        curl_close($ch);

        // 응답을 JSON으로 디코딩
        $data = json_decode($response, true);

        // API 요청이 성공했는지 확인
        if ($data['status'] === 'OK' && !empty($data['addresses'])) {
            // x, y 값 추출 (경도, 위도)
            $longitude = $data['addresses'][0]['x'];
            $latitude = $data['addresses'][0]['y'];

            // DB에 위도와 경도 값 업데이트
            $updateQuery = "UPDATE $table SET latitude = :latitude, longitude = :longitude WHERE id = :id";
            $updateStmt = $pdo->prepare($updateQuery);
            $updateStmt->execute([
                ':latitude' => $latitude,
                ':longitude' => $longitude,
                ':id' => $id
            ]);

            echo "Record with ID $id in table $table updated: Latitude = $latitude, Longitude = $longitude\n";
        } else {
            echo "Failed to get coordinates for address: $address in table $table\n";
        }
    }
}
?>
