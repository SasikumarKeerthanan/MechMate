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
            'totalUsers'       => 1240,
            'totalProviders'   => 87,
            'pendingApprovals' => 5,
            'totalCategories'  => 12,
            'activeBookings'   => 34,
            'totalRevenue'     => 'LKR 2,450,000',
        ];

        return response()->json([
            'success' => true,
            'stats'   => $stats,
        ]);
    }
}
