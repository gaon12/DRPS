<?php
// db_config.php 불러오기
require '../db/db_config.php';

// 기본 설정
header('Content-Type: application/json');

// 입력받은 region_name 파라미터 처리
$region_name = isset($_GET['region_name']) ? $_GET['region_name'] : null;

if ($region_name === null) {
    http_response_code(400);
    echo json_encode([
        'StatusCode' => 400,
        'message' => 'region_name 파라미터가 필요합니다.',
        'data' => []
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// SQL 쿼리 작성
$sql = "
    SELECT disaster_type, COUNT(*) as count
    FROM disaster_messages
    WHERE region_name LIKE :region_name
    GROUP BY disaster_type
    ORDER BY count DESC
";

try {
    // 쿼리 실행
    $stmt = $pdo->prepare($sql);
    $region_name_param = '%' . $region_name . '%';  // 와일드카드 추가
    $stmt->bindParam(':region_name', $region_name_param, PDO::PARAM_STR);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($results) {
        // 성공 시 200 상태 코드
        http_response_code(200);
        echo json_encode([
            'StatusCode' => 200,
            'message' => '성공',
            'data' => $results
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    } else {
        // 빈 결과일 때 처리
        http_response_code(404); // 데이터를 찾지 못했을 때 404 상태 코드
        echo json_encode([
            'StatusCode' => 404,
            'message' => '해당 지역에 대한 데이터가 없습니다.',
            'data' => []
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
} catch (PDOException $e) {
    // 에러 처리
    http_response_code(500);
    echo json_encode([
        'StatusCode' => 500,
        'message' => '데이터베이스 오류: ' . $e->getMessage(),
        'data' => []
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
?>
