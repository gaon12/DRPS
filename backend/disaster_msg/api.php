<?php
// db_config.php 불러오기
require '../db/db_config.php';

// 기본 설정
header('Content-Type: application/json');

// 파라미터 처리
$pageNo = isset($_GET['pageNo']) && is_numeric($_GET['pageNo']) && $_GET['pageNo'] > 0 ? (int) $_GET['pageNo'] : 1;
$numOfRows = isset($_GET['numOfRows']) && is_numeric($_GET['numOfRows']) && $_GET['numOfRows'] >= 1 && $_GET['numOfRows'] <= 10 ? (int) $_GET['numOfRows'] : 10;
$created_at = $_GET['created_at'] ?? null;
$emergency_step = $_GET['emergency_step'] ?? null;
$serial_number = $_GET['serial_number'] ?? null;
$disaster_type = $_GET['disaster_type'] ?? null;
$region_name = $_GET['region_name'] ?? null;
$text = $_GET['text'] ?? null; // 재난문자 검색

// 페이지 계산
$offset = ($pageNo - 1) * $numOfRows;

// 기본 쿼리
$query = "
    SELECT *
    FROM (
        SELECT dm.*, ROW_NUMBER() OVER (PARTITION BY message_content, region_name ORDER BY created_at DESC) AS rn
        FROM disaster_messages dm
        WHERE 1=1
";

// 파라미터에 따른 조건 추가 (서브쿼리)
$subParams = [];

if ($created_at) {
    $query .= " AND DATE(created_at) = :created_at_sub";
    $subParams[':created_at_sub'] = date('Y-m-d', strtotime($created_at));
}

if ($emergency_step) {
    $query .= " AND emergency_step = :emergency_step_sub";
    $subParams[':emergency_step_sub'] = $emergency_step;
}

if ($serial_number) {
    $query .= " AND serial_number = :serial_number_sub";
    $subParams[':serial_number_sub'] = $serial_number;
}

if ($disaster_type) {
    $query .= " AND disaster_type = :disaster_type_sub";
    $subParams[':disaster_type_sub'] = $disaster_type;
}

if ($region_name) {
    $query .= " AND region_name LIKE :region_name_sub";
    $subParams[':region_name_sub'] = '%' . $region_name . '%';
}

if ($text) {
    $query .= " AND REPLACE(REPLACE(message_content, CHAR(13), ''), CHAR(10), '') LIKE :text_sub";
    $subParams[':text_sub'] = '%' . $text . '%';
}

$query .= "
    ) sub
    WHERE sub.rn = 1
    ORDER BY sub.created_at DESC
    LIMIT :offset, :numOfRows
";

// 파라미터 준비
$params = $subParams;
$params[':offset'] = $offset;
$params[':numOfRows'] = $numOfRows;

try {
    // 쿼리 준비 및 실행
    $stmt = $pdo->prepare($query);

    // 파라미터 바인딩
    foreach ($params as $key => $value) {
        if ($key === ':offset' || $key === ':numOfRows') {
            $stmt->bindValue($key, $value, PDO::PARAM_INT);
        } else {
            $stmt->bindValue($key, $value);
        }
    }
    $stmt->execute();

    // 결과 가져오기
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 성공 응답
    $response = [
        "StatusCode" => 200,
        "message" => "Success to get disaster_message(s)",
        "data" => $results,
        "license" => "공공누리 4유형(https://www.safekorea.go.kr/idsiSFK/neo/sfk/cs/sfc/dis/disasterMsgList.jsp?emgPage=Y&menuSeq=679)",
        "RequestTime" => gmdate('Y-m-d\TH:i:s.v\Z')
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (PDOException $e) {
    // 에러 응답
    $response = [
        "StatusCode" => 500,
        "message" => "Failed to get disaster_message(s)",
        "error" => $e->getMessage(),
        "RequestTime" => gmdate('Y-m-d\TH:i:s.v\Z')
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
?>
