<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Contracts\MonitoringServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MonitoringController extends Controller
{
    public function __construct(
        private readonly MonitoringServiceInterface $monitoringService,
    ) {}

    // ── GET /api/admin/monitoring ─────────────────────────────────────────
    public function live(): JsonResponse
    {
        $stats = $this->monitoringService->getLiveStats();

        return response()->json(array_merge(['success' => true], $stats));
    }

    // ── GET /api/admin/monitoring/api-logs ─────────────────────────────────
    public function apiLogs(Request $request): JsonResponse
    {
        $filters = [
            'api_name' => $request->query('api_name'),
            'status'   => $request->query('status'),
        ];

        $logs = $this->monitoringService->getApiLogs($filters);

        return response()->json([
            'success' => true,
            'logs'    => array_values($logs),
            'total'   => count($logs),
        ]);
    }

    // ── GET /api/admin/monitoring/alerts ──────────────────────────────────
    public function alerts(): JsonResponse
    {
        $alerts = $this->monitoringService->getAlerts();

        return response()->json([
            'success' => true,
            'alerts'  => array_values($alerts),
            'total'   => count($alerts),
        ]);
    }
}
