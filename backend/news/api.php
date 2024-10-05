<?php
header('Content-Type: application/json');

// 데이터베이스 연결 설정 로드
$dbConfig = require __DIR__ . '/db_config.php';

// MySQL 데이터베이스 연결 설정
$dsn = "mysql:host={$dbConfig['host']};dbname={$dbConfig['dbname']};charset={$dbConfig['charset']}";
try {
    $pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "StatusCode" => 500,
        "message" => "Failed to connect to the database",
        "RequestTime" => gmdate("Y-m-d\TH:i:s.v\Z")
    ]);
    exit;
}

// 함수: JSON으로 응답 반환
function send_response($statusCode, $message, $data = null) {
    $response = [
        "StatusCode" => $statusCode,
        "message" => $message,
        "RequestTime" => gmdate("Y-m-d\TH:i:s.v\Z")
    ];
    if ($data !== null) {
        $response["data"] = $data;
    }
    echo json_encode($response);
    exit;
}

// 파라미터 검증 함수
function validate_numeric($value, $default = null, $min = null, $max = null) {
    if (isset($value) && ctype_digit($value)) {
        $value = (int)$value;
        if ($min !== null && $value < $min) return $default;
        if ($max !== null && $value > $max) return $default;
        return $value;
    }
    return $default;
}

// 파라미터 처리
$yna_no = isset($_GET['yna_no']) ? $_GET['yna_no'] : null;
$pageNo = validate_numeric($_GET['pageNo'] ?? null, 1, 1);
$numOfRows = validate_numeric($_GET['numOfRows'] ?? null, 5, 1, 10);

// yna_no가 주어졌다면, 해당 뉴스만 반환
if ($yna_no !== null) {
    if (!ctype_digit($yna_no)) {
        send_response(400, "Invalid parameter: yna_no should be a numeric value.");
    }

    $stmt = $pdo->prepare("SELECT * FROM disaster_news WHERE yna_no = :yna_no");
    $stmt->execute([':yna_no' => $yna_no]);
    $news = $stmt->fetch();

    if ($news) {
        send_response(200, "Success to get News Data", [$news]);
    } else {
        send_response(404, "News not found for yna_no: $yna_no");
    }
}

// yna_no가 없는 경우, 페이지 기반 데이터 반환 (최신순으로 정렬)
$offset = ($pageNo - 1) * $numOfRows;
$stmt = $pdo->prepare("SELECT * FROM disaster_news ORDER BY crt_dt DESC LIMIT :limit OFFSET :offset");
$stmt->bindValue(':limit', $numOfRows, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$newsList = $stmt->fetchAll();

if ($newsList) {
    send_response(200, "Success to get News Data", $newsList);
} else {
    send_response(404, "No news found for pageNo: $pageNo");
}

