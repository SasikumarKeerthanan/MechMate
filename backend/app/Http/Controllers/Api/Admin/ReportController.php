<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    // ── GET /api/admin/reports ────────────────────────────────────────────
    public function index(): JsonResponse
    {
        // TODO: Aggregate real data from Firebase Firestore
        $report = [
            'period'             => now()->format('F Y'),
            'newUsers'           => 128,
            'newProviders'       => 11,
            'completedBookings'  => 340,
            'cancelledBookings'  => 22,
            'totalRevenue'       => 'LKR 1,870,000',
            'avgRating'          => '4.3 / 5.0',
        ];

        return response()->json([
            'success' => true,
            'report'  => $report,
        ]);
    }
}
