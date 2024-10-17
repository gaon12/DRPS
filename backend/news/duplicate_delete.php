<?php
// db_config.php에서 데이터베이스 설정을 가져오기
require '../db/db_config.php';

try {
    // PDO 객체 생성 및 연결
    $pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

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
    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    echo "Duplicate rows deleted successfully.";

} catch (PDOException $e) {
    echo "Error deleting rows: " . $e->getMessage();
}
?>
