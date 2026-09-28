<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    // ── GET /api/admin/dashboard-stats ────────────────────────────────────
    public function stats(): JsonResponse
    {
        // TODO: Replace with real aggregation from Firebase/DB
        $stats = [
            'kpis' => [
                'totalUsers'       => 1240,
                'vehicleOwners'    => 800,
                'sparePartShops'   => 120,
                'serviceCentres'   => 80,
                'mechanics'        => 240,
                'pendingApprovals' => 5,
            ],
            'api_usage' => [
                'gemini' => ['success' => 12450, 'failed' => 23],
                'vision' => ['success' => 4500,  'failed' => 8],
                'maps'   => ['success' => 8900,  'failed' => 12],
            ],
            'recent_activity' => [
                ['id' => 1, 'type' => 'provider_registration', 'message' => 'New Service Centre Registration: SpeedServe Co.', 'severity' => 'info', 'created_at' => now()->subMinutes(12)->toIso8601String()],
                ['id' => 2, 'type' => 'api_error', 'message' => 'Gemini AI API timeout during diagnosis analysis.', 'severity' => 'danger', 'created_at' => now()->subMinutes(45)->toIso8601String()],
                ['id' => 3, 'type' => 'new_review', 'message' => 'New 5-star review for AutoFix Lanka.', 'severity' => 'success', 'created_at' => now()->subHours(2)->toIso8601String()],
                ['id' => 4, 'type' => 'provider_registration', 'message' => 'New Mechanic Registration: Kamal Perera', 'severity' => 'info', 'created_at' => now()->subHours(3)->toIso8601String()],
            ],
        ];

        return response()->json([
            'success' => true,
            'stats'   => $stats,
        ]);
    }
}
