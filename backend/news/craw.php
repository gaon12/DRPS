<?php

// .env 파일에서 API 키를 직접 읽어오기
$envPath = __DIR__ . '/.env'; // 현재 디렉토리의 .env 파일 경로
if (!file_exists($envPath)) {
    die(".env file not found.");
}

$envContent = file_get_contents($envPath);
$lines = explode("\n", $envContent);

$apiKey = null;
foreach ($lines as $line) {
    if (strpos(trim($line), '#') === 0 || empty(trim($line))) {
        continue;
    }

    list($key, $value) = explode('=', $line, 2);
    if (trim($key) === 'YNA_Disaster_News_API_KEY') {
        $apiKey = trim($value);
        break;
    }
}

if (!$apiKey) {
    die("API Key not found in .env file");
}

// db_config.php 불러오기
require '../db/db_config.php'; // 이 파일에서 이미 $pdo 객체를 생성

// pageNo를 1부터 시작
$pageNo = 1;
$hasMoreData = true;

while ($hasMoreData) {
    // API URL 설정 (동적으로 pageNo 추가)
    $url = "https://www.safetydata.go.kr/V2/api/DSSP-IF-10747?pageNo=" . $pageNo . "&numOfRows=1000&serviceKey=" . urlencode($apiKey);

    // cURL을 이용하여 API 요청
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        die("cURL error: " . curl_error($ch));
    }
    curl_close($ch);

    // API 응답을 JSON으로 디코딩
    $data = json_decode($response, true);

    // API 응답 확인
    if ($data['header']['resultCode'] !== "00") {
        die("API error: " . $data['header']['resultMsg']);
    }

    // 응답 데이터가 없으면 루프 종료
    if (empty($data['body'])) {
        $hasMoreData = false;
        break;
    }

    // API 응답의 각 뉴스 항목을 데이터베이스에 삽입
    foreach ($data['body'] as $news) {
        // HTML 이스케이프 처리 없이 원본 그대로 저장
        $yna_cn = $news['YNA_CN'];

        // SQL 쿼리: 중복된 yna_ttl과 yna_cn을 가진 기존 데이터의 crt_dt와 비교하여 최신 데이터만 삽입
        $stmt = $pdo->prepare("
            INSERT INTO disaster_news (
                yna_no, team_nm, yna_ttl, yna_cn, yna_wrtr_nm, yna_reg_ymd, crt_dt, alrm_yn, del_yn, expsr_yn
            ) VALUES (
                :yna_no, :team_nm, :yna_ttl, :yna_cn, :yna_wrtr_nm, :yna_reg_ymd, :crt_dt, :alrm_yn, :del_yn, :expsr_yn
            )
            ON DUPLICATE KEY UPDATE
                team_nm = VALUES(team_nm),
                yna_wrtr_nm = VALUES(yna_wrtr_nm),
                yna_reg_ymd = VALUES(yna_reg_ymd),
                crt_dt = IF(VALUES(crt_dt) > crt_dt, VALUES(crt_dt), crt_dt),
                alrm_yn = VALUES(alrm_yn),
                del_yn = VALUES(del_yn),
                expsr_yn = VALUES(expsr_yn)
        ");

        // 쿼리 실행
        $stmt->execute([
            ':yna_no' => $news['YNA_NO'],
            ':team_nm' => $news['TEAM_NM'],
            ':yna_ttl' => $news['YNA_TTL'],
            ':yna_cn' => $yna_cn,
            ':yna_wrtr_nm' => $news['YNA_WRTR_NM'],
            ':yna_reg_ymd' => $news['YNA_REG_YMD'],
            ':crt_dt' => $news['CRT_DT'],
            ':alrm_yn' => $news['ALRM_YN'],
            ':del_yn' => $news['DEL_YN'],
            ':expsr_yn' => $news['EXPSR_YN']
        ]);
    }

    // 다음 페이지로 이동
    $pageNo++;
}

echo "All news data saved successfully.";

?>
