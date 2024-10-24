<?php
header('Content-Type: application/json');

// db_config.php 불러오기
require '../db/db_config.php';

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
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
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

try {
    // 파라미터 처리
    $yna_no = isset($_GET['yna_no']) ? $_GET['yna_no'] : null;
    $title = isset($_GET['title']) && trim($_GET['title']) !== '' ? trim($_GET['title']) : null;
    $text = isset($_GET['text']) && trim($_GET['text']) !== '' ? trim($_GET['text']) : null;
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

    // SQL 동적 조건 추가를 위한 기본 쿼리
    $query = "SELECT * FROM disaster_news WHERE 1=1";
    $params = [];

    // title 파라미터가 있으면 조건 추가
    if ($title !== null) {
        $query .= " AND yna_ttl LIKE :title";
        $params[':title'] = "%$title%";
    }

    // text 파라미터가 있으면 조건 추가
    if ($text !== null) {
        $query .= " AND yna_cn LIKE :text";
        $params[':text'] = "%$text%";
    }

    // 페이지와 갯수 조건 추가
    $query .= " ORDER BY crt_dt DESC LIMIT :limit OFFSET :offset";
    
    // 준비된 쿼리 실행
    $stmt = $pdo->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value, PDO::PARAM_STR);
    }
    $stmt->bindValue(':limit', $numOfRows, PDO::PARAM_INT);
    $stmt->bindValue(':offset', ($pageNo - 1) * $numOfRows, PDO::PARAM_INT);
    $stmt->execute();
    $newsList = $stmt->fetchAll();

    if ($newsList) {
        send_response(200, "Success to get News Data", $newsList);
    } else {
        send_response(404, "No news found for pageNo: $pageNo");
    }

} catch (PDOException $e) {
    send_response(500, "Failed to connect to the database: " . $e->getMessage());
}
