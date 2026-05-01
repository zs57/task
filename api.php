<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$storageDir = __DIR__ . DIRECTORY_SEPARATOR . 'storage';
$file = $storageDir . DIRECTORY_SEPARATOR . 'data.json';

if (!is_dir($storageDir)) {
    mkdir($storageDir, 0775, true);
}

$default = [
    'tasks' => [],
    'habits' => [],
    'goals' => [],
    'notes' => '',
    'focusMinutes' => 0,
    'completedPomodoros' => 0,
    'weeklyFocusTarget' => 300,
    'streak' => 0,
    'lastActiveDate' => null,
];

if (!file_exists($file)) {
    file_put_contents($file, json_encode($default, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$raw = file_get_contents('php://input');
$body = json_decode($raw ?: '{}', true);

$action = $body['action'] ?? '';
$payload = $body['payload'] ?? null;

function loadData(string $file, array $fallback): array {
    $content = file_get_contents($file);
    $decoded = json_decode((string)$content, true);
    return is_array($decoded) ? array_merge($fallback, $decoded) : $fallback;
}

function saveData(string $file, array $data): bool {
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    return file_put_contents($file, $json !== false ? $json : '{}', LOCK_EX) !== false;
}

if ($action === 'getData') {
    echo json_encode(['ok' => true, 'data' => loadData($file, $default)], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'saveData') {
    if (!is_array($payload)) {
        echo json_encode(['ok' => false, 'message' => 'Invalid payload'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $sanitized = array_merge($default, $payload);
    $ok = saveData($file, $sanitized);
    echo json_encode(['ok' => $ok], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['ok' => false, 'message' => 'Unknown action'], JSON_UNESCAPED_UNICODE);
