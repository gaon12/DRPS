<?php
// db_config.php 불러오기
require '../db/db_config.php';

try {
    // disaster_type이 '기타'인 레코드의 message_content 가져오기
    $stmt = $pdo->query("SELECT id, message_content FROM disaster_messages WHERE disaster_type = '기타'");
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // API에 POST 요청 보내기
    $url = "https://apis.uiharu.dev/drps/disastermsg";

    foreach ($messages as $message) {
        $postData = [
            'text' => $message['message_content']
        ];

        // cURL 설정
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        // 응답 받기
        $response = curl_exec($ch);
        curl_close($ch);

        if ($response) {
            $data = json_decode($response, true);

            if (isset($data['category'])) {
                // disaster_type 업데이트
                $updateStmt = $pdo->prepare("UPDATE disaster_messages SET disaster_type = :category, modified_at = NOW() WHERE id = :id");
                $updateStmt->execute([
                    ':category' => $data['category'],
                    ':id' => $message['id']
                ]);
            }
        }
    }

    echo "Disaster types with '기타' updated successfully!";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
