<?php

header('Content-Type: application/json');

// 분리 가능한 변수들
$baseDomain = "https://apis.uiharu.dev";
$basePath = __DIR__ . "/data";

// 함수: 오류 반환
function returnError($statusCode, $message) {
    http_response_code($statusCode);
    echo json_encode([
        "StatusCode" => $statusCode,
        "message" => $message
    ]);
    exit();
}

// 필수 파라미터 검증
$category = $_GET['category'] ?? null;
$id = $_GET['id'] ?? null;
if (!$category || !$id) {
    returnError(400, "category와 id는 필수 파라미터입니다.");
}

// 파라미터 기본값 설정 및 유효성 검증
$returnfile = $_GET['returnfile'] ?? 'pdf';
$returntype = $_GET['returntype'] ?? 'base64';

// 유효한 카테고리인지 확인
$validCategories = ['civildefence', 'lifesafety', 'naturaldisaster', 'socialdisaster'];
if (!in_array($category, $validCategories)) {
    returnError(400, "유효하지 않은 category 값입니다.");
}

// id 값 검증: 숫자 형식으로만 이루어져야 한다고 가정
if (!preg_match('/^\d+$/', $id)) {
    returnError(400, "유효하지 않은 id 값입니다. id는 숫자로만 이루어져야 합니다.");
}

// returnfile 값 검증
$validReturnFiles = ['pdf', 'png', 'webp'];
if (!in_array($returnfile, $validReturnFiles)) {
    returnError(400, "유효하지 않은 returnfile 값입니다. pdf, png, webp 중 하나여야 합니다.");
}

// returntype 값 검증
$validReturnTypes = ['base64', 'url'];
if (!in_array($returntype, $validReturnTypes)) {
    returnError(400, "유효하지 않은 returntype 값입니다. base64 또는 url이어야 합니다.");
}

// 경로 설정
$categoryPath = "{$basePath}/{$category}/{$id}";
$markdownFile = "{$categoryPath}/{$id}.md";

// 마크다운 파일 확인
if (!file_exists($markdownFile)) {
    returnError(404, "Markdown 파일을 찾을 수 없습니다.");
}

// 마크다운 파일 처리
$markdownContent = ($returntype === 'base64') 
    ? base64_encode(file_get_contents($markdownFile)) 
    : "{$baseDomain}/{$category}/{$id}/{$id}.md";

// 결과 배열 초기화
$result = [
    "StatusCode" => 200,
    "message" => "Success to get info.",
    "data" => [
        "text" => $markdownContent
    ]
];

// 파일 처리 함수
function processFiles($filePattern, $keyPrefix, $category, $id, $returntype, $baseDomain) {
    $files = glob($filePattern);
    if (empty($files)) {
        returnError(404, ucfirst($keyPrefix) . " 파일을 찾을 수 없습니다.");
    }
    $fileData = [];
    foreach ($files as $index => $file) {
        $key = "{$keyPrefix}" . ($index + 1);
        if ($returntype === 'base64') {
            $fileData[$key] = base64_encode(file_get_contents($file));
        } else {
            $filename = basename($file);
            $fileData[$key] = "{$baseDomain}/{$category}/{$id}/{$filename}";
        }
    }
    return $fileData;
}

// 선택된 파일 타입에 따른 처리
$pdfFolder = "{$categoryPath}/{$id}"; // PDF 파일명이 포함된 폴더 경로
switch ($returnfile) {
    case 'pdf':
        $result['data'] += processFiles("{$pdfFolder}/*.pdf", 'pdf', $category, $id, $returntype, $baseDomain);
        break;
    case 'png':
        $result['data'] += processFiles("{$pdfFolder}/png/*.png", 'png', $category, $id, $returntype, $baseDomain);
        break;
    case 'webp': // 'web' => 'webp'로 수정
        $result['data'] += processFiles("{$pdfFolder}/webp/*.webp", 'webp', $category, $id, $returntype, $baseDomain);
        break;
    default:
        returnError(400, "유효하지 않은 returnfile 값입니다.");
}

// 성공적으로 JSON 응답 반환
echo json_encode($result);

?>
