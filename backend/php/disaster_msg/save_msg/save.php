<?php

// DB 정보 포함
include '../../db/db_config.php';

// 서비스키 및 기본 설정
require '../../vendor/autoload.php';  // Composer autoload

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

$serviceKey = getenv('disaster_msg_api_key');
$pageNo = 1;
$numOfRows = 999;
$apiUrl = "http://apis.data.go.kr/1741000/DisasterMsg3/getDisasterMsg1List";
$category = 'na';

// 데이터베이스 연결 함수
function connectDB($servername, $username, $password, $dbname) {
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    return $conn;
}

// 가장 최근에 저장된 md101_sn을 가져오는 함수
function getLastMd101Sn($conn) {
    $sql = "SELECT md101_sn FROM disaster_msg ORDER BY create_date DESC LIMIT 1";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['md101_sn'];
    }
    return null;
}

// 데이터 저장 함수
function saveData($conn, $data, $category) {
    $stmt = $conn->prepare("INSERT INTO disaster_msg (create_date, location_id, location_name, md101_sn, msg, send_platform, category) VALUES (?, ?, ?, ?, ?, ?, ?)");
    foreach ($data as $row) {
        $stmt->bind_param("sssssss", $row['create_date'], $row['location_id'], $row['location_name'], $row['md101_sn'], $row['msg'], $row['send_platform'], $category);
        if (!$stmt->execute()) {
            echo "Error: " . $stmt->error . "\n";
        }
    }
    $stmt->close();
}

// API 요청 함수
function fetchAPIData($serviceKey, $pageNo, $numOfRows, $apiUrl) {
    $url = "$apiUrl?serviceKey=$serviceKey&pageNo=$pageNo&numOfRows=$numOfRows&type=xml";
    echo "Fetching data from URL: $url\n";
    $response = file_get_contents($url);
    if ($response === FALSE) {
        die("Error fetching data from API\n");
    }
    return simplexml_load_string($response);
}

// Main script
$conn = connectDB($servername, $username, $password, $dbname);
$lastMd101Sn = getLastMd101Sn($conn);

if ($lastMd101Sn === null) {
    echo "There is no data stored in the database. I will fetch and save the data from the beginning.\n";
} else {
    echo "I found the data in the database. I will fetch the latest data information.\n";
}

$newRecords = 0;
$continue = true;

while ($continue) {
    $xml = fetchAPIData($serviceKey, $pageNo, $numOfRows, $apiUrl);
    if ($xml === FALSE) {
        die("Error parsing XML\n");
    }

    $rows = $xml->xpath("//row");
    if (empty($rows)) {
        echo "No more data found in API response.\n";
        $continue = false;
        break;
    }

    $data = [];
    foreach ($rows as $row) {
        $md101_sn = (string)$row->md101_sn;
        if ($md101_sn == $lastMd101Sn) {
            echo "Reached data already stored in the database.\n";
            $continue = false;
            break;
        }

        $data[] = [
            'create_date' => (string)$row->create_date,
            'location_id' => (string)$row->location_id,
            'location_name' => (string)$row->location_name,
            'md101_sn' => $md101_sn,
            'msg' => (string)$row->msg,
            'send_platform' => (string)$row->send_platform
        ];
    }

    if (!empty($data)) {
        echo "Saving " . count($data) . " new records to the database.\n";
        saveData($conn, $data, $category);
        $newRecords += count($data);
    } else {
        echo "No new records to save.\n";
    }

    $pageNo++;
}

$conn->close();

if ($newRecords > 0) {
    echo "I fetched and saved the latest data in the database. A total of $newRecords new records have been saved.\n";
} else {
    if ($lastMd101Sn !== null) {
        echo "The latest data is already stored in the database.\n";
    }
}
?>
