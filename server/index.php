<?php
// PHP Reverse Proxy for Node.js Backend (Port 5000) on Hostinger Shared Hosting
$backendHost = '127.0.0.1';
$backendPort = 5000;

// Handle CORS allowlist and Preflight OPTIONS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'https://awesomehandwork.com',
    'https://www.awesomehandwork.com',
    'https://admin.awesomehandwork.com',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
];

if (!empty($origin) && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
}

// Immediately satisfy preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$requestUri = $_SERVER['REQUEST_URI'];
$targetUrl = "http://{$backendHost}:{$backendPort}{$requestUri}";

$ch = curl_init($targetUrl);

// Forward HTTP Method
$method = $_SERVER['REQUEST_METHOD'];
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

// Forward Request Body for POST / PUT / PATCH / DELETE
if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
    $inputData = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $inputData);
}

// Forward Request Headers
$headers = [];
$incomingHeaders = function_exists('getallheaders') ? getallheaders() : [];
$hasAuth = false;

foreach ($incomingHeaders as $key => $value) {
    $lowerKey = strtolower($key);
    if ($lowerKey === 'authorization') {
        $hasAuth = true;
    }
    if ($lowerKey !== 'host' && $lowerKey !== 'content-length') {
        $headers[] = "{$key}: {$value}";
    }
}

// Ensure Authorization header is forwarded even if LiteSpeed/Apache stripped it from getallheaders()
if (!$hasAuth) {
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers[] = "Authorization: " . $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $headers[] = "Authorization: " . $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $arh = apache_request_headers();
        if (!empty($arh['Authorization'])) {
            $headers[] = "Authorization: " . $arh['Authorization'];
        } elseif (!empty($arh['authorization'])) {
            $headers[] = "Authorization: " . $arh['authorization'];
        }
    }
}

$headers[] = "Host: {$backendHost}:{$backendPort}";
$headers[] = "X-Forwarded-For: " . ($_SERVER['REMOTE_ADDR'] ?? '');
$headers[] = "X-Forwarded-Proto: " . (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Node.js backend service unreachable on port ' . $backendPort . ': ' . curl_error($ch)
    ]);
    curl_close($ch);
    exit;
}

$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$responseHeaders = substr($response, 0, $headerSize);
$responseBody = substr($response, $headerSize);

http_response_code($httpCode);

// Forward response headers
$headerLines = explode("\r\n", $responseHeaders);
foreach ($headerLines as $headerLine) {
    if (stripos($headerLine, 'Transfer-Encoding:') === false &&
        stripos($headerLine, 'HTTP/') !== 0 &&
        !empty($headerLine)) {
        // Overwrite or skip duplicate Access-Control headers
        if (stripos($headerLine, 'Access-Control-') === 0) {
            header($headerLine, true);
        } else {
            header($headerLine, false);
        }
    }
}

echo $responseBody;
