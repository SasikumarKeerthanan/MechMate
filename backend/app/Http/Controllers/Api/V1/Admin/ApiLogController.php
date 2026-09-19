<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\FirebaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApiLogController extends Controller
{
    protected FirebaseService $firebaseService;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    }

    /**
     * List recent API traffic logs and error events.
     */
    public function index(Request $request): JsonResponse
    {
        $logs = [
            [
                'id' => 'log_88201',
                'method' => 'POST',
                'endpoint' => '/api/v1/auth/forgot-password',
                'status_code' => 200,
                'ip_address' => '192.168.1.45',
                'duration_ms' => 48,
                'timestamp' => now()->subMinutes(2)->toIso8601String(),
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            ],
            [
                'id' => 'log_88202',
                'method' => 'GET',
                'endpoint' => '/api/v1/admin/overview',
                'status_code' => 200,
                'ip_address' => '127.0.0.1',
                'duration_ms' => 19,
                'timestamp' => now()->subMinutes(5)->toIso8601String(),
                'user_agent' => 'Vite-React-Client/1.0',
            ],
            [
                'id' => 'log_88203',
                'method' => 'POST',
                'endpoint' => '/api/v1/mechanic/dispatch-accept',
                'status_code' => 409,
                'ip_address' => '172.56.21.90',
                'duration_ms' => 85,
                'timestamp' => now()->subMinutes(12)->toIso8601String(),
                'user_agent' => 'MechMate-Provider-Android/2.4',
                'error_detail' => 'Request lock contention: already accepted by provider #312',
            ],
            [
                'id' => 'log_88204',
                'method' => 'GET',
                'endpoint' => '/api/v1/parts/search?query=brake+rotors',
                'status_code' => 200,
                'ip_address' => '64.233.160.1',
                'duration_ms' => 34,
                'timestamp' => now()->subMinutes(18)->toIso8601String(),
                'user_agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
            ],
            [
                'id' => 'log_88205',
                'method' => 'POST',
                'endpoint' => '/api/v1/admin/users/usr_004/status',
                'status_code' => 403,
                'ip_address' => '198.51.100.22',
                'duration_ms' => 12,
                'timestamp' => now()->subMinutes(25)->toIso8601String(),
                'user_agent' => 'PostmanRuntime/7.36.0',
                'error_detail' => 'AUTH_FORBIDDEN: Insufficient administrator permissions.',
            ],
        ];

        return $this->paginatedResponse([
            'items' => $logs,
            'current_page' => 1,
            'per_page' => 10,
            'total' => count($logs),
        ], 'API logs fetched successfully.');
    }
}
