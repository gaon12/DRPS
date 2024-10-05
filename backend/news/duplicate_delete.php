<?php
// db_config.php에서 데이터베이스 설정을 가져오기
$config = include('db_config.php');

// MySQLi 객체 생성 및 연결
$conn = new mysqli(
    $config['host'],
    $config['username'],
    $config['password'],
    $config['dbname']
);

// 연결 체크
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 중복된 yna_ttl과 yna_cn을 가진 행들을 찾고 삭제하기 위한 쿼리
$sql = "
    DELETE t1 
    FROM disaster_news t1
    JOIN (
        SELECT MIN(id) as keep_id, yna_ttl, yna_cn
        FROM disaster_news
        GROUP BY yna_ttl, yna_cn
        HAVING COUNT(*) > 1
    ) t2 ON t1.yna_ttl = t2.yna_ttl 
        AND t1.yna_cn = t2.yna_cn 
        AND t1.id != t2.keep_id
";

// 쿼리 실행
if ($conn->query($sql) === TRUE) {
    echo "Duplicate rows deleted successfully.";
} else {
    echo "Error deleting rows: " . $conn->error;
}

// 연결 종료
$conn->close();
?>

