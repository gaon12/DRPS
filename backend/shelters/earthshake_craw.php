<?php
require 'db_config.php'; // DB 연결 설정 포함

// API 기본 URL 및 서비스 키 설정
$apiUrl = 'https://apis.data.go.kr/1741000/EmergencyAssemblyArea_Earthquake5/getArea4List2';
$serviceKey = ''; // 실제 서비스 키로 교체
$pageNo = 1; // 페이지 번호 초기값
$numOfRows = 1000; // 한 페이지당 불러올 행 수
$type = 'json'; // 응답 형식

// cURL을 사용하여 API 요청
function fetchData($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10); // 타임아웃 설정
    $response = curl_exec($ch);
    
    if (curl_errno($ch)) {
        error_log('cURL 오류: ' . curl_error($ch)); // 에러 로그 기록
        return null;
    }

    curl_close($ch);
    return json_decode($response, true);
}

// 반복문을 통해 API 데이터를 가져와 DB에 저장
while (true) {
    // API 요청 URL 생성
    $requestUrl = "$apiUrl?serviceKey=$serviceKey&pageNo=$pageNo&numOfRows=$numOfRows&type=$type";
    
    // API 데이터 가져오기
    $data = fetchData($requestUrl);

    if (empty($data) || empty($data['EarthquakeOutdoorsShelter2'][1]['row'])) {
        break; // 데이터가 없거나 응답이 비정상적이면 종료
    }

    // 데이터베이스에 저장/업데이트
    foreach ($data['EarthquakeOutdoorsShelter2'][1]['row'] as $row) {
        // 데이터 유효성 검사 및 기본값 설정
        $managementNumber = htmlspecialchars($row['arcd'] . '-' . $row['acmdfclty_sn']);
        $facilityName = htmlspecialchars($row['vt_acmdfclty_nm']);
        $facilityType = htmlspecialchars($row['acmdfclty_se_nm']);
        $address = htmlspecialchars($row['rn_adres'] ?: $row['dtl_adres']);
        $latitude = filter_var($row['ycord'], FILTER_VALIDATE_FLOAT);
        $longitude = filter_var($row['xcord'], FILTER_VALIDATE_FLOAT);
        $managerName = htmlspecialchars($row['mngps_nm']);
        $managerPhone = htmlspecialchars($row['mngps_telno']);
        $maxCapacity = filter_var($row['vt_acmd_psbl_nmpr'], FILTER_VALIDATE_INT);
        $facilityArea = filter_var($row['fclty_ar'], FILTER_VALIDATE_FLOAT);

        // 데이터베이스에 연결되어 있음을 확인하고 예외 처리
        try {
            // DB에 해당 관리 번호가 있는지 확인
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM EarthquakeShelters WHERE managementNumber = :managementNumber");
            $stmt->execute(['managementNumber' => $managementNumber]);
            $exists = $stmt->fetchColumn();

            if ($exists) {
                // 업데이트 쿼리
                $updateStmt = $pdo->prepare("
                    UPDATE EarthquakeShelters SET
                        facilityName = :facilityName,
                        facilityType = :facilityType,
                        address = :address,
                        latitude = :latitude,
                        longitude = :longitude,
                        managerName = :managerName,
                        managerPhone = :managerPhone,
                        maxCapacity = :maxCapacity,
                        facilityArea = :facilityArea
                    WHERE managementNumber = :managementNumber
                ");
                $updateStmt->execute([
                    'facilityName' => $facilityName,
                    'facilityType' => $facilityType,
                    'address' => $address,
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'managerName' => $managerName,
                    'managerPhone' => $managerPhone,
                    'maxCapacity' => $maxCapacity,
                    'facilityArea' => $facilityArea,
                    'managementNumber' => $managementNumber
                ]);
            } else {
                // 삽입 쿼리
                $insertStmt = $pdo->prepare("
                    INSERT INTO EarthquakeShelters (
                        managementNumber, facilityName, facilityType, address, 
                        latitude, longitude, managerName, managerPhone, 
                        maxCapacity, facilityArea
                    ) VALUES (
                        :managementNumber, :facilityName, :facilityType, :address, 
                        :latitude, :longitude, :managerName, :managerPhone, 
                        :maxCapacity, :facilityArea
                    )
                ");
                $insertStmt->execute([
                    'managementNumber' => $managementNumber,
                    'facilityName' => $facilityName,
                    'facilityType' => $facilityType,
                    'address' => $address,
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'managerName' => $managerName,
                    'managerPhone' => $managerPhone,
                    'maxCapacity' => $maxCapacity,
                    'facilityArea' => $facilityArea
                ]);
            }
        } catch (PDOException $e) {
            error_log('DB 작업 중 오류 발생: ' . $e->getMessage()); // DB 오류 기록
        }
    }

    // 다음 페이지로 이동
    $pageNo++;
}

echo "데이터 저장 완료!";
?>

