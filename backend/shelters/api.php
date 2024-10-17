<?php
// DB 설정 파일 포함
require '../db/db_config.php';

// 요청 본문 읽기
$requestBody = file_get_contents('php://input');
$data = $_GET; // GET 요청으로 데이터 수신

// 기본 응답 초기화
$response = [
    'StatusCode' => 400,
    'message' => 'Invalid request',
];

// 필수 파라미터 확인 및 기본값 설정
$shelterType = $data['ShelterType'] ?? null;
$shelterDetail = $data['ShelterDetail'] ?? null;

// 유효한 ShelterType인지 확인
$validShelterTypes = ['CivilDefenseShelters', 'EarthquakeShelters', 'TsunamiShelters'];
if (!in_array($shelterType, $validShelterTypes, true)) {
    $response['message'] = 'Invalid ShelterType. Valid options are CivilDefenseShelters, EarthquakeShelters, TsunamiShelters.';
    http_response_code(400);
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// 대피소 상세 정보 조회 (ShelterDetail이 있을 경우)
if ($shelterDetail) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM $shelterType WHERE id = :id");
        $stmt->bindParam(':id', $shelterDetail, PDO::PARAM_INT);
        $stmt->execute();
        $shelter = $stmt->fetch();

        if ($shelter) {
            $response = [
                'StatusCode' => 200,
                'message' => 'Success to get shelter detail',
                'data' => $shelter,
            ];
        } else {
            $response['message'] = 'Shelter not found.';
            http_response_code(404);
        }
    } catch (PDOException $e) {
        error_log('DB Query Error: ' . $e->getMessage());
        $response['message'] = 'Error occurred while retrieving data.';
        http_response_code(500);
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// 위경도 및 기타 파라미터 처리
$latitude = $data['latitude'] ?? null;
$longitude = $data['longitude'] ?? null;
$pageNo = isset($data['pageNo']) && is_numeric($data['pageNo']) && $data['pageNo'] > 0 ? (int) $data['pageNo'] : 1;
$numOfRows = isset($data['numOfRows']) && is_numeric($data['numOfRows']) && $data['numOfRows'] >= 1 && $data['numOfRows'] <= 10 ? (int) $data['numOfRows'] : 10;
$distance = isset($data['distance']) && is_numeric($data['distance']) && $data['distance'] >= 1 && $data['distance'] <= 10000 ? (int) $data['distance'] : 5000;

// 위경도 유효성 검사
if (!is_numeric($latitude) || !is_numeric($longitude)) {
    $response['message'] = 'Invalid latitude or longitude.';
    http_response_code(400);
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

try {
    // 거리 기반 대피소 조회 쿼리
    $offset = ($pageNo - 1) * $numOfRows;
    $stmt = $pdo->prepare("
        SELECT 
            id, address, latitude, longitude,
            (6371000 * acos(cos(radians(:lat)) * cos(radians(latitude)) * cos(radians(longitude) - radians(:lon)) + sin(radians(:lat)) * sin(radians(latitude)))) AS distance
        FROM $shelterType
        HAVING distance <= :distance
        ORDER BY distance
        LIMIT :offset, :numOfRows
    ");

    $stmt->bindValue(':lat', $latitude);
    $stmt->bindValue(':lon', $longitude);
    $stmt->bindValue(':distance', $distance, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->bindValue(':numOfRows', $numOfRows, PDO::PARAM_INT);
    $stmt->execute();

    $shelters = $stmt->fetchAll();

    if ($shelters) {
        $response = [
            'StatusCode' => 200,
            'message' => 'Success to get shelters info',
            'data' => $shelters,
        ];
    } else {
        $response['message'] = 'No shelters found within the specified range.';
        http_response_code(404);
    }
} catch (PDOException $e) {
    error_log('DB Query Error: ' . $e->getMessage());
    $response['message'] = 'Error occurred while retrieving data.';
    http_response_code(500);
}

echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>
