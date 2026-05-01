<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(array $payload): void {
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function httpGetJson(string $url): ?array {
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 15,
            'header' => "User-Agent: TimeMasterPro/1.0\r\nAccept: application/json\r\n",
        ],
    ]);
    $raw = @file_get_contents($url, false, $context);
    if ($raw === false) {
        return null;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : null;
}

$action = $_GET['action'] ?? '';

if ($action === 'suwar') {
    $data = httpGetJson('https://mp3quran.net/api/v3/suwar?language=ar');
    if (!$data || !isset($data['suwar']) || !is_array($data['suwar'])) {
        respond(['ok' => false, 'message' => 'تعذر تحميل السور']);
    }
    $suwar = array_map(static function ($s) {
        return [
            'id' => (int)($s['id'] ?? 0),
            'name' => (string)($s['name'] ?? ''),
        ];
    }, $data['suwar']);
    respond(['ok' => true, 'suwar' => $suwar]);
}

if ($action === 'readers') {
    $data = httpGetJson('https://mp3quran.net/api/v3/reciters?language=ar');
    if (!$data || !isset($data['reciters']) || !is_array($data['reciters'])) {
        respond(['ok' => false, 'message' => 'تعذر تحميل القراء']);
    }

    $items = [];
    foreach ($data['reciters'] as $reciter) {
        $reciterId = (int)($reciter['id'] ?? 0);
        $reciterName = (string)($reciter['name'] ?? 'قارئ');
        $moshafList = $reciter['moshaf'] ?? [];
        if (!is_array($moshafList)) {
            continue;
        }
        foreach ($moshafList as $moshaf) {
            $server = trim((string)($moshaf['server'] ?? ''));
            if ($server === '') {
                continue;
            }
            $server = rtrim($server, '/') . '/';
            $surahListRaw = (string)($moshaf['surah_list'] ?? '');
            $surahList = array_values(array_filter(array_map('intval', explode(',', $surahListRaw))));
            if (empty($surahList)) {
                $surahList = range(1, 114);
            }
            $items[] = [
                'id' => $reciterId . ':' . (int)($moshaf['id'] ?? 0),
                'reciterId' => $reciterId,
                'reciterName' => $reciterName,
                'moshafName' => (string)($moshaf['name'] ?? 'مصحف'),
                'server' => $server,
                'surahList' => $surahList,
            ];
        }
    }

    respond(['ok' => true, 'readers' => $items]);
}

if ($action === 'surah_text') {
    $surah = (int)($_GET['surah'] ?? 0);
    if ($surah < 1 || $surah > 114) {
        respond(['ok' => false, 'message' => 'رقم سورة غير صالح']);
    }
    $url = 'https://api.alquran.cloud/v1/surah/' . $surah . '/quran-uthmani';
    $data = httpGetJson($url);
    if (!$data || !isset($data['data']) || !is_array($data['data'])) {
        respond(['ok' => false, 'message' => 'تعذر تحميل نص السورة']);
    }
    $surahData = $data['data'];
    $ayahs = $surahData['ayahs'] ?? [];
    if (!is_array($ayahs)) {
        $ayahs = [];
    }
    $normalized = array_map(static function ($ayah) {
        return [
            'numberInSurah' => (int)($ayah['numberInSurah'] ?? 0),
            'text' => (string)($ayah['text'] ?? ''),
        ];
    }, $ayahs);
    respond([
        'ok' => true,
        'surah' => [
            'number' => (int)($surahData['number'] ?? $surah),
            'name' => (string)($surahData['name'] ?? ''),
            'englishName' => (string)($surahData['englishName'] ?? ''),
            'ayahs' => $normalized,
        ],
    ]);
}

respond(['ok' => false, 'message' => 'Unknown action']);
