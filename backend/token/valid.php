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

$DeviceID = isset($data['DeviceID']) ? $data['DeviceID'] : null;
$PushToken = isset($data['PushToken']) ? $data['PushToken'] : null;

if (!$DeviceID && !$PushToken) {
    http_response_code(400);
    echo json_encode(["StatusCode" => 400, "message" => "At least one parameter (DeviceID or PushToken) is required."]);
    exit();
}

// 유효성 검사 플래그
$isValid = true;
$errors = [];

// DeviceID 검증 (UUID V4 형식)
if ($DeviceID) {
    if (!preg_match('/^[a-f0-9]{8}-[a-f0-9]{4}-[4][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i', $DeviceID)) {
        $isValid = false;
        $errors['DeviceID'] = "DeviceID must be a valid UUID V4.";
    }
}

// PushToken 검증 (15글자 이상, 알파벳 대소문자와 숫자만 허용)
if ($PushToken) {
    if (!preg_match('/^[a-zA-Z0-9]{15,}$/', $PushToken)) {
        $isValid = false;
        $errors['PushToken'] = "PushToken must be at least 15 characters and contain only alphanumeric characters.";
    }
}

// 유효성 검사 결과 반환
if ($isValid) {
    http_response_code(200);
    echo json_encode(["StatusCode" => 200, "message" => "Valid input."]);
} else {
    http_response_code(400);
    echo json_encode(["StatusCode" => 400, "message" => "Invalid input.", "errors" => $errors]);
}
?>
