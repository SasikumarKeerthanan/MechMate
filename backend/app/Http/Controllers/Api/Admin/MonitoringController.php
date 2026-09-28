<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MonitoringController extends Controller
{
    private string $storageKey = 'mock_monitoring.json';

    private array $defaultAlerts = [
        [
            'id' => 1,
            'api_name' => 'Gemini AI API',
            'severity' => 'Critical',
            'message' => 'Rate limit exceeded (HTTP 429). Vehicle diagnosis request queue delayed by 4.2 seconds.',
            'failure_count' => 24,
            'last_occurred' => '10 mins ago',
            'status' => 'active',
        ],
        [
            'id' => 2,
            'api_name' => 'Vision API',
            'severity' => 'Warning',
            'message' => 'Gateway timeout (HTTP 504) during spare-part image recognition for clutch assembly.',
            'failure_count' => 8,
            'last_occurred' => '35 mins ago',
            'status' => 'active',
        ],
        [
            'id' => 3,
            'api_name' => 'Speech-to-Text API',
            'severity' => 'Warning',
            'message' => 'Audio chunk decoding failure due to high background ambient noise in mechanic voice note.',
            'failure_count' => 5,
            'last_occurred' => '1 hour ago',
            'status' => 'active',
        ],
        [
            'id' => 4,
            'api_name' => 'Google Maps Platform',
            'severity' => 'Warning',
            'message' => 'Geocoding quota warning: Daily route calculation reached 85% of allocated free tier.',
            'failure_count' => 12,
            'last_occurred' => '2 hours ago',
            'status' => 'active',
        ],
    ];

    private array $defaultLogs = [
        ['id' => 1001, 'api_name' => 'Gemini AI', 'endpoint' => 'v1beta/models/gemini-1.5-flash:generateContent', 'status' => 'success', 'http_code' => 200, 'latency_ms' => 420, 'error_message' => null, 'timestamp' => '1 min ago'],
        ['id' => 1002, 'api_name' => 'Vision API', 'endpoint' => 'v1/images:annotate', 'status' => 'success', 'http_code' => 200, 'latency_ms' => 310, 'error_message' => null, 'timestamp' => '3 mins ago'],
        ['id' => 1003, 'api_name' => 'Speech-to-Text', 'endpoint' => 'v1/speech:recognize', 'status' => 'failed', 'http_code' => 500, 'latency_ms' => 1240, 'error_message' => 'Audio payload corrupted or sample rate mismatch', 'timestamp' => '6 mins ago'],
        ['id' => 1004, 'api_name' => 'Maps Platform', 'endpoint' => 'maps/api/directions/json', 'status' => 'success', 'http_code' => 200, 'latency_ms' => 85, 'error_message' => null, 'timestamp' => '8 mins ago'],
        ['id' => 1005, 'api_name' => 'Gemini AI', 'endpoint' => 'v1beta/models/gemini-1.5-flash:generateContent', 'status' => 'failed', 'http_code' => 429, 'latency_ms' => 190, 'error_message' => 'Resource exhausted: quota exceeded', 'timestamp' => '10 mins ago'],
        ['id' => 1006, 'api_name' => 'Maps Platform', 'endpoint' => 'maps/api/geocode/json', 'status' => 'success', 'http_code' => 200, 'latency_ms' => 64, 'error_message' => null, 'timestamp' => '14 mins ago'],
        ['id' => 1007, 'api_name' => 'Vision API', 'endpoint' => 'v1/images:annotate', 'status' => 'failed', 'http_code' => 504, 'latency_ms' => 5020, 'error_message' => 'Upstream gateway timeout during part edge analysis', 'timestamp' => '35 mins ago'],
        ['id' => 1008, 'api_name' => 'Gemini AI', 'endpoint' => 'v1beta/models/gemini-1.5-pro:generateContent', 'status' => 'success', 'http_code' => 200, 'latency_ms' => 890, 'error_message' => null, 'timestamp' => '40 mins ago'],
        ['id' => 1009, 'api_name' => 'Speech-to-Text', 'endpoint' => 'v1/speech:recognize', 'status' => 'success', 'http_code' => 200, 'latency_ms' => 280, 'error_message' => null, 'timestamp' => '52 mins ago'],
        ['id' => 1010, 'api_name' => 'Maps Platform', 'endpoint' => 'maps/api/place/nearbysearch/json', 'status' => 'success', 'http_code' => 200, 'latency_ms' => 110, 'error_message' => null, 'timestamp' => '1 hour ago'],
    ];

    private function loadData(): array
    {
        if (Storage::disk('local')->exists($this->storageKey)) {
            try {
                $content = Storage::disk('local')->get($this->storageKey);
                $decoded = json_decode($content, true);
                if (is_array($decoded) && isset($decoded['alerts'])) {
                    return $decoded;
                }
            } catch (\Throwable $e) {
                // fallback
            }
        }
        $initial = ['alerts' => $this->defaultAlerts, 'logs' => $this->defaultLogs];
        try {
            Storage::disk('local')->put($this->storageKey, json_encode($initial, JSON_PRETTY_PRINT));
        } catch (\Throwable $e) {
            // Ignore
        }
        return $initial;
    }

    // ── GET /api/admin/monitoring ─────────────────────────────────────────
    public function live(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'activeUsers'        => 58,
            'onlineProviders'    => 24,
            'bookingsInProgress' => 14,
            'serverStatus'       => 'Healthy',
            'lastUpdated'        => now()->toIso8601String(),
            'apis' => [
                'gemini' => [
                    'name' => 'Gemini AI Diagnostic API',
                    'success' => 14820,
                    'failed' => 38,
                    'latency_avg' => '450ms',
                    'rate' => 99.74,
                ],
                'vision' => [
                    'name' => 'Cloud Vision API',
                    'success' => 5410,
                    'failed' => 14,
                    'latency_avg' => '320ms',
                    'rate' => 99.74,
                ],
                'speech' => [
                    'name' => 'Speech-to-Text API',
                    'success' => 2890,
                    'failed' => 12,
                    'latency_avg' => '290ms',
                    'rate' => 99.59,
                ],
                'maps' => [
                    'name' => 'Google Maps Platform',
                    'success' => 18940,
                    'failed' => 19,
                    'latency_avg' => '82ms',
                    'rate' => 99.90,
                ],
            ],
        ]);
    }

    // ── GET /api/admin/monitoring/api-logs ─────────────────────────────────
    public function apiLogs(Request $request): JsonResponse
    {
        $data = $this->loadData();
        $logs = $data['logs'] ?? $this->defaultLogs;

        // Filter by API Name
        $apiName = $request->query('api_name');
        if (!empty($apiName) && $apiName !== 'all') {
            $logs = array_filter($logs, function ($l) use ($apiName) {
                return str_contains(strtolower($l['api_name']), strtolower($apiName));
            });
        }

        // Filter by Status
        $status = $request->query('status');
        if (!empty($status) && $status !== 'all') {
            $logs = array_filter($logs, fn($l) => strcasecmp($l['status'], $status) === 0);
        }

        return response()->json([
            'success' => true,
            'logs'    => array_values($logs),
            'total'   => count($logs),
        ]);
    }

    // ── GET /api/admin/monitoring/alerts ──────────────────────────────────
    public function alerts(): JsonResponse
    {
        $data = $this->loadData();
        $alerts = $data['alerts'] ?? $this->defaultAlerts;

        return response()->json([
            'success' => true,
            'alerts'  => array_values($alerts),
            'total'   => count($alerts),
        ]);
    }
}
