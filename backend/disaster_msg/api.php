<?php
// db_config.php 불러오기
require 'db_config.php';

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

// 페이지 계산
$offset = ($pageNo - 1) * $numOfRows;

// 기본 쿼리
$query = "SELECT * FROM disaster_messages WHERE 1=1";
$params = [];

// 파라미터에 따른 조건 추가
if ($created_at) {
	$query .= " AND DATE(created_at) = :created_at";
	$params[':created_at'] = date('Y-m-d', strtotime($created_at));
}

if ($emergency_step) {
	$query .= " AND emergency_step = :emergency_step";
	$params[':emergency_step'] = $emergency_step;
}

if ($serial_number) {
	$query .= " AND serial_number = :serial_number";
	$params[':serial_number'] = $serial_number;
}

if ($disaster_type) {
	$query .= " AND disaster_type = :disaster_type";
	$params[':disaster_type'] = $disaster_type;
}

if ($region_name) {
	$query .= " AND region_name LIKE :region_name";
	$params[':region_name'] = '%' . $region_name . '%';
}

// 정렬과 페이징
$query .= " ORDER BY created_at DESC LIMIT :offset, :numOfRows";

try {
	$stmt = $pdo->prepare($query);
	foreach ($params as $key => $value) {
		$stmt->bindValue($key, $value);
	}
	$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
	$stmt->bindValue(':numOfRows', $numOfRows, PDO::PARAM_INT);
	$stmt->execute();

	$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

	// 결과를 JSON 형식으로 반환
	$response = [
		"StatusCode" => 200,
		"message" => "Success to get disaster_message(s)",
		"data" => $results,
		"license" => "공공누리 4유형(https://www.safekorea.go.kr/idsiSFK/neo/sfk/cs/sfc/dis/disasterMsgList.jsp?emgPage=Y&menuSeq=679)",
		"RequestTime" => gmdate('Y-m-d\TH:i:s.v\Z')
	];

	echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (PDOException $e) {
	// 에러 처리
	$response = [
		"StatusCode" => 500,
		"message" => "Failed to get disaster_message(s)",
		"error" => $e->getMessage(),
		"RequestTime" => gmdate('Y-m-d\TH:i:s.v\Z')
	];

	echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
?>