<?php
// data.json 파일 읽기
$dataFile = './data.json';
$data = json_decode(file_get_contents($dataFile), true);

// 파라미터 가져오기
$id = $_GET['id'] ?? null;
$imagetype = $_GET['imagetype'] ?? null;

// 유효한 이미지 타입
$validImageTypes = ['avif', 'png', 'webp'];

// 기본 응답 설정
header('Content-Type: application/json');

if (!$id) {
    // ID가 없을 때 오류 반환
    http_response_code(400);
    echo json_encode([
        "StatusCode" => 400,
        "message" => "Missing 'id' parameter."
    ]);
    exit;
}

if ($imagetype && !in_array($imagetype, $validImageTypes)) {
    // 유효하지 않은 이미지 타입일 때 오류 반환
    http_response_code(400);
    echo json_encode([
        "StatusCode" => 400,
        "message" => "Invalid 'imagetype' parameter. Allowed values are 'avif', 'png', 'webp'."
    ]);
    exit;
}

// 해당 ID의 데이터 검색
$found = false;
foreach ($data as $entry) {
    if ($entry['id'] === $id) {
        $found = true;
        if ($imagetype) {
            // 특정 imagetype 요청 시
            if (isset($entry[$imagetype])) {
                echo json_encode([
                    "StatusCode" => 200,
                    "message" => "Success",
                    "data" => [
                        "thumbhash" => $entry[$imagetype],  // 전체 배열 반환
                        "md_exists" => $entry["md_exists"]
                    ]
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    "StatusCode" => 404,
                    "message" => "Image type '$imagetype' not found for id '$id'."
                ]);
            }
        } else {
            // 전체 데이터 반환 시
            echo json_encode([
                "StatusCode" => 200,
                "message" => "Success",
                "data" => $entry
            ]);
        }
        exit;
    }
}

// ID가 존재하지 않을 때 오류 반환
if (!$found) {
    http_response_code(404);
    echo json_encode([
        "StatusCode" => 404,
        "message" => "ID '$id' not found."
    ]);
}
?>
