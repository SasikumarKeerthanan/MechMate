<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\FirebaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    protected FirebaseService $firebaseService;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    }

    /**
     * Get aggregated Dashboard Overview metrics and recent activity.
     */
    public function index(Request $request): JsonResponse
    {
        // In production, aggregations can be queried from Firestore counter shards or cached
        $stats = [
            'total_users' => [
                'count' => 14280,
                'growth_pct' => 12.4,
                'trend' => 'up',
            ],
            'registered_mechanics' => [
                'count' => 3890,
                'growth_pct' => 8.1,
                'trend' => 'up',
            ],
            'pending_approvals' => [
                'count' => 47,
                'urgent_count' => 12,
                'trend' => 'warning',
            ],
            'active_service_requests' => [
                'count' => 892,
                'growth_pct' => 5.3,
                'trend' => 'up',
            ],
            'avg_resolution_time_hrs' => 2.4,
            'customer_satisfaction_rating' => 4.86,
            'api_health_uptime_pct' => 99.94,
        ];

        $recentActivities = [
            [
                'id' => 'act_101',
                'type' => 'provider_registration',
                'message' => 'New mechanic garage "Apex Auto Care" submitted verification docs.',
                'timestamp' => now()->subMinutes(14)->toIso8601String(),
                'severity' => 'info',
            ],
            [
                'id' => 'act_102',
                'type' => 'user_status',
                'message' => 'User account #MM-8891 flagged for suspicious request rate.',
                'timestamp' => now()->subMinutes(42)->toIso8601String(),
                'severity' => 'warning',
            ],
            [
                'id' => 'act_103',
                'type' => 'category_update',
                'message' => 'Admin updated "Brake Systems" part category taxonomy.',
                'timestamp' => now()->subHours(2)->toIso8601String(),
                'severity' => 'success',
            ],
            [
                'id' => 'act_104',
                'type' => 'inquiry_resolved',
                'message' => 'Support ticket #INQ-4421 marked as resolved.',
                'timestamp' => now()->subHours(3)->toIso8601String(),
                'severity' => 'info',
            ],
        ];

        return $this->successResponse([
            'metrics' => $stats,
            'recent_activities' => $recentActivities,
            'system_status' => [
                'firestore_connected' => $this->firebaseService->isLive(),
                'server_time' => now()->toIso8601String(),
                'environment' => config('app.env'),
            ]
        ], 'Dashboard metrics retrieved successfully.');
    }
}
