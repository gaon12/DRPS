<?php
// db_config.php 불러오기
require '../db/db_config.php';

// API 관련 설정
$baseUrl = "https://www.safetydata.go.kr/V2/api/DSSP-IF-00247";
$serviceKey = "apikey";  // 실제 API 키로 교체
$numOfRows = 10000000; // 한 번에 가져올 데이터 수
$defaultStartDate = '20230101';  // 데이터가 없을 때 사용할 기본 시작일

// DB에서 가장 최근의 등록 날짜 가져오기
function getLastRegisteredDate($pdo) {
    $stmt = $pdo->query("SELECT MAX(registered_at) AS last_date FROM disaster_messages");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row['last_date'] ? $row['last_date'] : null;
}

// 특정 날짜에 저장된 모든 serial_number 값을 가져오는 함수
function getSerialNumbersByDate($pdo, $date) {
    $stmt = $pdo->prepare("SELECT serial_number FROM disaster_messages WHERE registered_at = :date");
    $stmt->execute([':date' => $date]);
    return $stmt->fetchAll(PDO::FETCH_COLUMN); // serial_number만 배열로 반환
}

// 재난문자 데이터를 DB에 저장하는 함수
function storeMessages($pdo, $messages, $registeredDate) {
    // 해당 날짜에 이미 존재하는 serial_number 목록을 가져옴
    $existingSerialNumbers = getSerialNumbersByDate($pdo, $registeredDate);

    $stmt = $pdo->prepare("
        INSERT INTO disaster_messages (message_content, region_name, created_at, registered_at, emergency_step, serial_number, disaster_type, modified_at) 
        VALUES (:message_content, :region_name, :created_at, :registered_at, :emergency_step, :serial_number, :disaster_type, :modified_at)
        ON DUPLICATE KEY UPDATE message_content = VALUES(message_content), modified_at = VALUES(modified_at)
    ");

    foreach ($messages as $message) {
        // 해당 serial_number가 기존에 존재하지 않으면 저장
        if (!in_array($message['SN'], $existingSerialNumbers)) {
            $modified_at = $message['MDFCN_YMD'] ?? date('Y-m-d');
            $stmt->execute([
                ':message_content' => $message['MSG_CN'],
                ':region_name' => $message['RCPTN_RGN_NM'],
                ':created_at' => $message['CRT_DT'],
                ':registered_at' => $message['REG_YMD'],
                ':emergency_step' => $message['EMRG_STEP_NM'],
                ':serial_number' => $message['SN'],
                ':disaster_type' => $message['DST_SE_NM'],
                ':modified_at' => $modified_at
            ]);
        }
    }
}

// 특정 날짜에 대한 API 데이터를 가져오는 함수 (cURL 사용)
function fetchMessages($url) {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);

    if(curl_errno($ch)) {
        echo "cURL 오류: " . curl_error($ch);
        curl_close($ch);
        return [];
    }

    curl_close($ch);
    
    $data = json_decode($response, true);

    // API 요청이 성공했는지 확인
    if ($data['header']['resultCode'] !== '00') {
        echo "API 요청 오류: " . $data['header']['resultMsg'] . "\n";
        return [];
    }

    return isset($data['body']) ? $data['body'] : [];
}

// 최근 날짜부터 현재 날짜까지 데이터를 가져오는 함수
function fetchAndStoreAllMessages($pdo, $startDate, $currentDate) {
    global $baseUrl, $serviceKey, $numOfRows;

    while (strtotime($startDate) <= strtotime($currentDate)) {
        $pageNo = 1;
        while (true) {
            $url = "{$baseUrl}?serviceKey={$serviceKey}&numOfRows={$numOfRows}&pageNo={$pageNo}&crtDt={$startDate}";

            $messages = fetchMessages($url);
            if (empty($messages)) {
                echo "No more messages for date: $startDate, page: $pageNo\n";
                break;  // 더 이상 데이터가 없으면 반복 중단
            }

            // 해당 날짜의 메시지 저장, 날짜를 storeMessages에 전달
            storeMessages($pdo, $messages, $startDate);
            echo "Saved messages for date: $startDate, page: $pageNo\n";
            $pageNo++;
        }
        $startDate = date('Ymd', strtotime($startDate . ' +1 day'));
    }
}

// 실행 메인 로직
$currentDate = date('Ymd');  // 현재 날짜
$lastRegisteredDate = getLastRegisteredDate($pdo);  // DB에서 최근 등록 날짜 가져오기

if ($lastRegisteredDate) {
    $startDate = $lastRegisteredDate;
    echo "Starting from the last registered date: $startDate\n";
} else {
    $startDate = $defaultStartDate;
    echo "No data in DB. Starting from default start date: $startDate\n";
}

fetchAndStoreAllMessages($pdo, $startDate, $currentDate);
?>
