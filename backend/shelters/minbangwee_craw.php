<?php
// 필요한 라이브러리 및 DB 설정 파일 불러오기
require 'vendor/autoload.php'; // PhpSpreadsheet 설치 필요
require '../db/db_config.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

// 엑셀 파일 다운로드 URL과 저장 경로 설정
$fileUrl = 'http://www.localdata.go.kr/datafile/etc/LOCALDATA_ALL_12_04_12_E.xlsx';
$filePath = __DIR__ . '/LOCALDATA_ALL_12_04_12_E.xlsx';

// cURL로 엑셀 파일 다운로드
$ch = curl_init($fileUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
$file = fopen($filePath, 'w');
curl_setopt($ch, CURLOPT_FILE, $file);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Cache-Control: no-cache']);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
fclose($file);

if ($response === false || $httpCode !== 200) {
    curl_close($ch);
    unlink($filePath);
    error_log('파일 다운로드 실패: ' . curl_error($ch));
    exit('파일 다운로드에 실패했습니다. 나중에 다시 시도해주세요.');
}
curl_close($ch);

// 엑셀 파일 읽기
try {
    $spreadsheet = IOFactory::load($filePath);
    $sheet = $spreadsheet->getSheetByName('민방위대피시설정보_1');
    $rows = $sheet->toArray(null, true, true, true);
} catch (Exception $e) {
    unlink($filePath);
    error_log('엑셀 파일 읽기 오류: ' . $e->getMessage());
    exit('엑셀 파일을 처리하는 데 문제가 발생했습니다.');
}

// 첫 번째 행에서 컬럼명을 추출하여 인덱스를 설정
$columns = array_shift($rows);
$columnIndex = array_flip($columns);

// 테이블에 데이터가 있는지 확인
$stmt = $pdo->query('SELECT COUNT(*) FROM CivilDefenseShelters');
$rowCount = $stmt->fetchColumn();

// 데이터 삽입 및 업데이트
$newRecords = 0;
$updateRecords = 0;
$missingLatLon = 0;

// 날짜를 확인하고 올바른 형식으로 변환하는 함수
function validateAndFormatDate($date, $default = '1900-01-01') {
    if (empty($date) || !strtotime($date)) {
        return $default;
    }
    return date('Y-m-d', strtotime($date));
}

// 위도와 경도 값을 검증하는 함수
function validateAndFormatCoordinate($value) {
    if (empty($value) || !is_numeric($value)) {
        return 0;
    }
    return (float) $value;
}

foreach ($rows as $row) {
    $managementNumber = htmlspecialchars($row[$columnIndex['관리번호']], ENT_QUOTES, 'UTF-8');
    $designationDate = validateAndFormatDate($row[$columnIndex['지정일자']]);
    $releaseDate = validateAndFormatDate($row[$columnIndex['해제일자']], null);
    $operationalStatus = htmlspecialchars($row[$columnIndex['운영상태']], ENT_QUOTES, 'UTF-8');
    $facilityName = htmlspecialchars($row[$columnIndex['시설명']], ENT_QUOTES, 'UTF-8');
    $facilityType = htmlspecialchars($row[$columnIndex['시설구분']], ENT_QUOTES, 'UTF-8');
    $address = htmlspecialchars($row[$columnIndex['도로명전체주소']] ?: $row[$columnIndex['소재지전체주소']], ENT_QUOTES, 'UTF-8');
    $latitude = validateAndFormatCoordinate($row[$columnIndex['위도(EPSG4326)']]);
    $longitude = validateAndFormatCoordinate($row[$columnIndex['경도(EPSG4326)']]);
    $maxCapacity = (int) $row[$columnIndex['최대수용인원']];
    $facilityArea = (float) $row[$columnIndex['시설면적(㎡)']];

    // 위경도 값이 없으면 Nominatim API 사용
    if ($latitude == 0 || $longitude == 0) {
        $missingLatLon++;
        $encodedAddress = urlencode($address);
        $apiUrl = "https://nominatim.openstreetmap.org/search?q={$encodedAddress}&format=json&limit=1";

        sleep(1); // 1초에 한 번씩 요청하여 API 제한 우회

        // cURL로 Nominatim API 요청
        $ch = curl_init($apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        if ($response === false) {
            error_log('API 요청 실패: ' . curl_error($ch));
            curl_close($ch);
            $latitude = 0;
            $longitude = 0;
        } else {
            $locationData = json_decode($response, true);
            curl_close($ch);

            if (!empty($locationData)) {
                $latitude = validateAndFormatCoordinate($locationData[0]['lat']);
                $longitude = validateAndFormatCoordinate($locationData[0]['lon']);
            } else {
                error_log("위경도 값을 가져오지 못했습니다: $address");
                $latitude = 0;
                $longitude = 0;
            }
        }
    }

    // 기존 데이터 확인
    $stmt = $pdo->prepare('SELECT id FROM CivilDefenseShelters WHERE managementNumber = ?');
    $stmt->execute([$managementNumber]);
    $existingId = $stmt->fetchColumn();

    if ($existingId) {
        // 데이터 업데이트
        $stmt = $pdo->prepare('
            UPDATE CivilDefenseShelters
            SET designationDate = ?, releaseDate = ?, operationalStatus = ?, facilityName = ?, facilityType = ?, address = ?, latitude = ?, longitude = ?, maxCapacity = ?, facilityArea = ?
            WHERE id = ?
        ');
        $stmt->execute([$designationDate, $releaseDate, $operationalStatus, $facilityName, $facilityType, $address, $latitude, $longitude, $maxCapacity, $facilityArea, $existingId]);
        $updateRecords++;
    } else {
        // 새 데이터 삽입
        $stmt = $pdo->prepare('
            INSERT INTO CivilDefenseShelters (managementNumber, designationDate, releaseDate, operationalStatus, facilityName, facilityType, address, latitude, longitude, maxCapacity, facilityArea)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([$managementNumber, $designationDate, $releaseDate, $operationalStatus, $facilityName, $facilityType, $address, $latitude, $longitude, $maxCapacity, $facilityArea]);
        $newRecords++;
    }
}

// 파일 삭제
unlink($filePath);

// 진행 과정 출력
if ($rowCount == 0) {
    echo "$newRecords 개의 데이터를 저장했습니다.\n";
    if ($missingLatLon > 0) {
        echo "$missingLatLon 개의 데이터에 위경도 정보가 없어 Nominatim API로 가져오는 중입니다.\n";
    }
    echo "$newRecords 개의 데이터를 저장 완료했습니다.\n";
} else {
    if ($newRecords > 0) {
        echo "새로운 $newRecords 개의 데이터를 저장했습니다.\n";
    } else {
        echo "새로운 데이터가 없습니다.\n";
    }
    echo "$updateRecords 개의 기존 데이터를 업데이트했습니다.\n";
}
?>
