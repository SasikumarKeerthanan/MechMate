<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class MonitoringController extends Controller
{
    // ── GET /api/admin/monitoring ─────────────────────────────────────────
    public function live(): JsonResponse
    {
        // TODO: Pull real-time data from Firebase RTDB / presence tracking
        return response()->json([
            'success' => true,
            'activeUsers'        => rand(30, 80),
            'onlineProviders'    => rand(8, 25),
            'bookingsInProgress' => rand(3, 15),
            'serverStatus'       => 'Healthy',
            'lastUpdated'        => now()->toIso8601String(),
        ]);
    }
}
