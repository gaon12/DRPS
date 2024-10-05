<?php
// db_config.php 불러오기
require 'db_config.php';

// API 관련 설정
$baseUrl = "https://www.safekorea.go.kr/idsiSFK/sfk/cs/sua/web/DisasterSmsList.do";
$pageUnit = 999999999; // 최대한 많은 데이터를 한 번에 가져오기

// DB에서 가장 최근의 등록 날짜 가져오기
function getLastRegisteredDate($pdo) {
    $stmt = $pdo->query("SELECT MAX(registered_at) AS last_date FROM disaster_messages");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row['last_date'] ? $row['last_date'] : null;
}

// 재난문자 데이터를 DB에 저장하는 함수 (MD101_SN 기준 중복 방지)
function storeMessages($pdo, $messages) {
    $stmt = $pdo->prepare("INSERT INTO disaster_messages (message_content, region_name, created_at, registered_at, emergency_step, serial_number, disaster_type, modified_at) 
                           VALUES (:message_content, :region_name, :created_at, :registered_at, :emergency_step, :serial_number, :disaster_type, :modified_at)
                           ON DUPLICATE KEY UPDATE message_content = VALUES(message_content), modified_at = VALUES(modified_at)");

    foreach ($messages as $message) {
        $modified_at = $message['MODF_DT'] ?? date('Y-m-d H:i:s');
        $disaster_type = $message['DSSTR_SE_NM'] ?? 'na';  // disaster_type 값이 없으면 'na'로 저장

        $stmt->execute([
            ':message_content' => $message['MSG_CN'],
            ':region_name' => $message['RCV_AREA_NM'],
            ':created_at' => $message['CREAT_DT'],
            ':registered_at' => $message['REGIST_DT'],
            ':emergency_step' => $message['EMRGNCY_STEP_NM'],
            ':serial_number' => $message['MD101_SN'],  // MD101_SN을 고유 식별자로 사용
            ':disaster_type' => $disaster_type,
            ':modified_at' => $modified_at
        ]);
    }
}

// 한 번에 데이터를 요청하는 함수 (cURL 사용)
function fetchMessages($searchBgnDe, $searchEndDe) {
    global $baseUrl, $pageUnit;

    $postData = [
        "searchInfo" => [
            "pageIndex" => 1, // 한 번에 다 가져오기 때문에 첫 번째 페이지
            "pageUnit" => $pageUnit,
            "recordCountPerPage" => $pageUnit,
            "searchBgnDe" => $searchBgnDe,
            "searchEndDe" => $searchEndDe,
            "searchGb" => "1"
        ]
    ];

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $baseUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);

    $response = curl_exec($ch);

    if(curl_errno($ch)) {
        echo "cURL 오류: " . curl_error($ch);
        curl_close($ch);
        return [];
    }

    curl_close($ch);
    
    $data = json_decode($response, true);

    // API 요청이 성공했는지 확인
    if (!isset($data['disasterSmsList'])) {
        echo "API 요청 오류\n";
        return [];
    }

    return $data['disasterSmsList'];
}

// 전체 데이터를 한 번에 가져오는 함수
function fetchAndStoreAllMessages($pdo, $startDate, $currentDate) {
    // 메시지를 한 번에 요청하여 가져옴
    $messages = fetchMessages($startDate, $currentDate);
    if (!empty($messages)) {
        // 메시지 저장
        storeMessages($pdo, $messages);
        echo "Saved messages from $startDate to $currentDate\n";
    } else {
        echo "No messages found from $startDate to $currentDate\n";
    }
}

// 실행 메인 로직
$currentDate = date('Y-m-d');  // 현재 날짜
$lastRegisteredDate = getLastRegisteredDate($pdo);  // DB에서 최근 등록 날짜 가져오기

if ($lastRegisteredDate) {
    $startDate = $lastRegisteredDate;
    echo "Starting from the last registered date: $startDate\n";
} else {
    $startDate = '2012-01-01';
    echo "No data in DB. Starting from default start date: $startDate\n";
}

fetchAndStoreAllMessages($pdo, $startDate, $currentDate);
?>

