<?php
// JSON 형식 응답 설정
header("Content-Type: application/json");

// POST 메서드로만 요청 가능하도록 설정
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["StatusCode" => 405, "message" => "Method Not Allowed"]);
    exit();
}

// php://input을 통해 JSON 데이터 파싱
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['DeviceID']) || !isset($data['PushToken'])) {
    http_response_code(400);
    echo json_encode(["StatusCode" => 400, "message" => "Both DeviceID and PushToken are required."]);
    exit();
}

$DeviceID = $data['DeviceID'];
$PushToken = $data['PushToken'];

// UUID V4 형식 검증
if (!preg_match('/^[a-f0-9]{8}-[a-f0-9]{4}-[4][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i', $DeviceID)) {
    http_response_code(400);
    echo json_encode(["StatusCode" => 400, "message" => "DeviceID must be a valid UUID V4."]);
    exit();
}

// PushToken 검증 (15글자 이상, 알파벳 대소문자와 숫자만 허용)
if (!preg_match('/^[a-zA-Z0-9]{15,}$/', $PushToken)) {
    http_response_code(400);
    echo json_encode(["StatusCode" => 400, "message" => "PushToken must be at least 15 characters and contain only alphanumeric characters."]);
    exit();
}

// DB 설정 파일 포함
require_once '../db/db_config.php';

try {
    // DeviceID와 PushToken 중복 여부 확인
    $stmt = $pdo->prepare("SELECT * FROM device_tokens WHERE DeviceID = :DeviceID OR PushToken = :PushToken");
    $stmt->bindParam(':DeviceID', $DeviceID);
    $stmt->bindParam(':PushToken', $PushToken);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["StatusCode" => 409, "message" => "DeviceID or PushToken already exists."]);
        exit();
    }

    // 중복이 없을 경우 데이터 삽입
    $stmt = $pdo->prepare("INSERT INTO device_tokens (DeviceID, PushToken) VALUES (:DeviceID, :PushToken)");
    $stmt->bindParam(':DeviceID', $DeviceID);
    $stmt->bindParam(':PushToken', $PushToken);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["StatusCode" => 201, "message" => "DeviceID and PushToken successfully registered."]);
    } else {
        http_response_code(500);
        echo json_encode(["StatusCode" => 500, "message" => "Failed to register DeviceID and PushToken."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["StatusCode" => 500, "message" => "Database error: " . $e->getMessage()]);
}
?>
