<?php
require '../db/db_config.php'; // DB 연결 설정 포함

// API 기본 URL 및 서비스 키 설정
$apiUrl = 'https://apis.data.go.kr/1741000/TsunamiShelter4/getTsunamiShelter4List';
$serviceKey = 'apikey'; // 실제 서비스 키로 교체
$pageNo = 1; // 페이지 번호 초기값
$numOfRows = 1000; // 한 페이지당 불러올 행 수
$type = 'json'; // 응답 형식

// 기존 DB의 모든 managementNumber를 추적 배열에 저장
$existingManagementNumbers = [];
$stmt = $pdo->query("SELECT managementNumber FROM TsunamiShelters");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $existingManagementNumbers[$row['managementNumber']] = true;
}

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
    $requestUrl = "$apiUrl?serviceKey=" . urlencode($serviceKey) . "&pageNo=$pageNo&numOfRows=$numOfRows&type=$type";

    // API 데이터 가져오기
    $data = fetchData($requestUrl);

    if (empty($data) || empty($data['TsunamiShelter'][1]['row'])) {
        break; // 데이터가 없거나 응답이 비정상적이면 종료
    }

    // 데이터베이스에 저장/업데이트
    foreach ($data['TsunamiShelter'][1]['row'] as $row) {
        // 데이터 유효성 검사 및 기본값 설정
        $managementNumber = htmlspecialchars($row['id']);
        $facilityName = htmlspecialchars($row['shel_nm']);
        $facilityType = htmlspecialchars($row['shel_div_type']);
        $address = htmlspecialchars($row['address'] ?: $row['new_address']);
        $latitude = filter_var($row['lat'], FILTER_VALIDATE_FLOAT);
        $longitude = filter_var($row['lon'], FILTER_VALIDATE_FLOAT);
        $managerName = htmlspecialchars($row['manage_gov_nm']);
        $managerPhone = htmlspecialchars($row['tel']);
        $maxCapacity = filter_var($row['shel_av'], FILTER_VALIDATE_INT);
        $facilityArea = filter_var($row['lenth'], FILTER_VALIDATE_FLOAT);

        // 위도 및 경도가 유효하지 않으면 0으로 설정
        if ($latitude === false || $latitude < -90 || $latitude > 90) {
            error_log("오류 발생: 잘못된 위도 값 - managementNumber: $managementNumber, latitude: $latitude");
            $latitude = 0;
        }

        if ($longitude === false || $longitude < -180 || $longitude > 180) {
            error_log("오류 발생: 잘못된 경도 값 - managementNumber: $managementNumber, longitude: $longitude");
            $longitude = 0;
        }

        try {
            // DB에 해당 관리 번호가 있는지 확인
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM TsunamiShelters WHERE managementNumber = :managementNumber");
            $stmt->execute(['managementNumber' => $managementNumber]);
            $exists = $stmt->fetchColumn();

            // 현재 관리 번호는 API에 존재하는 것으로 추적 배열에서 제거
            unset($existingManagementNumbers[$managementNumber]);

            if ($exists) {
                // 업데이트 쿼리
                $updateStmt = $pdo->prepare("
                    UPDATE TsunamiShelters SET
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
                    INSERT INTO TsunamiShelters (
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
            // 오류가 발생한 레코드와 값 로그 출력
            error_log("DB 작업 중 오류 발생: " . $e->getMessage() . 
                      " - managementNumber: $managementNumber, latitude: $latitude, longitude: $longitude");
        }
    }

    // 다음 페이지로 이동
    $pageNo++; // pageNo을 1씩 증가시킴
}

// 기존 DB에 있고, API에서 제공되지 않는 managementNumber 삭제
foreach (array_keys($existingManagementNumbers) as $obsoleteManagementNumber) {
    try {
        $deleteStmt = $pdo->prepare("DELETE FROM TsunamiShelters WHERE managementNumber = :managementNumber");
        $deleteStmt->execute(['managementNumber' => $obsoleteManagementNumber]);
        error_log("삭제됨: 관리 번호가 더 이상 API에서 제공되지 않음 - managementNumber: $obsoleteManagementNumber");
    } catch (PDOException $e) {
        error_log("삭제 중 오류 발생: " . $e->getMessage() . " - managementNumber: $obsoleteManagementNumber");
    }
}

echo "데이터 저장 및 정리 완료!";
?>
