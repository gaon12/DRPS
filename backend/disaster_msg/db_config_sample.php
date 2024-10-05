<?php
// db_config.php
$host = 'localhost';  // DB 호스트
$db   = 'DRPS';  // DB 이름
$user = 'username';  // DB 사용자명
$pass = 'password';  // DB 비밀번호

// PDO 사용하여 DB 연결
try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("DB 연결 실패: " . $e->getMessage());
}
?>

