<?php
// API 키 설정
$apiKey = 'your_google_api_key';

// 요청에 사용할 URL
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-002:generateContent?key={$apiKey}";

// php://input을 사용하여 POST로 전달된 JSON 데이터 수신
$inputData = file_get_contents('php://input');

// JSON 데이터를 디코딩
$dataReceived = json_decode($inputData, true);

// 'text' 키가 있는지 확인
if (isset($dataReceived['text'])) {
    $inputText = $dataReceived['text'];

    // 요청에 보낼 데이터 JSON 형식으로 준비
    $data = [
        'contents' => [
            [
                'role' => 'user',
                'parts' => [
                    [
                        'text' => $inputText
                    ]
                ]
            ]
        ],
        'systemInstruction' => [
            'role' => 'user',
            'parts' => [
                [
                    'text' => '원문의 뜻을 해치지 말고, 결과값을 5문장으로 요약, JSON 형식으로 summary 키에 요약 작성'
                ]
            ]
        ],
        'generationConfig' => [
            'temperature' => 0.5,
            'topK' => 40,
            'topP' => 0.9,
            'maxOutputTokens' => 8192,
            'responseMimeType' => 'application/json',
            'responseSchema' => [
                'type' => 'object',
                'properties' => [
                    'summary' => [
                        'type' => 'string'
                    ]
                ]
            ]
        ]
    ];

    // cURL 초기화
    $ch = curl_init($url);

    // cURL 옵션 설정
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    // 요청 실행
    $response = curl_exec($ch);

    // cURL 에러 확인
    if (curl_errno($ch)) {
        $errorMsg = curl_error($ch);
        // 에러 발생 시 응답 처리
        $result = [
            'StatusCode' => 500,
            'message' => 'Failed to send request',
            'error' => $errorMsg
        ];
    } else {
        // 응답을 JSON으로 변환
        $responseDecoded = json_decode($response, true);

        // 응답 데이터 처리
        if (isset($responseDecoded['candidates'][0]['content']['parts'][0]['text'])) {
            $rawSummary = $responseDecoded['candidates'][0]['content']['parts'][0]['text'];

            // JSON 형식으로 되어 있는 summary 부분 파싱
            $parsedSummary = json_decode($rawSummary, true);

            if (isset($parsedSummary['summary'])) {
                // 성공적인 응답
                $result = [
                    'StatusCode' => 200,
                    'message' => 'Success to response',
                    'data' => [
                        'summary' => $parsedSummary['summary']
                    ]
                ];
            } else {
                // 응답에 요약 데이터가 없을 때
                $result = [
                    'StatusCode' => 500,
                    'message' => 'Failed to parse summary',
                    'data' => $parsedSummary
                ];
            }
        } else {
            // 응답에 요약 데이터가 없을 때
            $result = [
                'StatusCode' => 500,
                'message' => 'Failed to receive summary',
                'data' => $responseDecoded
            ];
        }
    }

    // cURL 종료
    curl_close($ch);

    // JSON으로 응답 반환
    header('Content-Type: application/json');
    echo json_encode($result);
} else {
    // POST 요청에 'text'가 없을 때
    echo json_encode([
        'StatusCode' => 400,
        'message' => 'Bad Request: Please send a POST request with text'
    ]);
}
?>
