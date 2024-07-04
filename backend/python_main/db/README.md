# 데이터베이스 설정 파일
데이터베이스 정보를 입력해야 데이터베이스에 접근하고, 데이터를 저장할 수 있습니다.

# 파일 수정
1. `db_config_sample.php` 파일을 에디터로 엽니다.

```php
<?php
$servername = "your-database-host";     // 데이터베이스 호스트 (예: 'localhost' 또는 실제 DB 호스트)
$username = "your-database-user";     // 데이터베이스 사용자명
$password = "your-database-password"; // 데이터베이스 비밀번호
$dbname = "your-database-name";  // 데이터베이스 이름
?>
```

2. 주석에 맞게 호스트 주소, 사용자명, 비밀번호, 데이터베이스 이름을 입력합니다.
3. 파일명을 `db_config_sample.php`에서 `db_config.php`로 수정합니다.