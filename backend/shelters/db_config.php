<?php
// DB 연결 설정을 변수로 분리
$dbHost = 'localhost';
$dbName = 'DRPS';
$dbUser = 'username';
$dbPassword = 'password';

// DSN 생성
$dsn = "mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4";

// PDO 옵션 설정
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

// PDO 객체 생성 및 에러 처리
try {
    $pdo = new PDO($dsn, $dbUser, $dbPassword, $options);
} catch (PDOException $e) {
    error_log('DB 연결 실패: ' . $e->getMessage()); // 민감한 정보 출력 방지
    exit('DB 연결에 문제가 발생했습니다. 관리자에게 문의하세요.');
}
?>

