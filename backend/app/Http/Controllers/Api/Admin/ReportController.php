<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Contracts\ReportServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportServiceInterface $reportService,
    ) {}

    // ── GET /api/admin/reports ────────────────────────────────────────────
    public function index(): JsonResponse
    {
        return $this->summary();
    }

    // ── GET /api/admin/reports/summary ────────────────────────────────────
    public function summary(): JsonResponse
    {
        $metrics = $this->reportService->getSummary();

        return response()->json([
            'success' => true,
            'report'  => $metrics,
        ]);
    }

    // ── GET /api/admin/reports/export ─────────────────────────────────────
    public function export(Request $request): JsonResponse
    {
        $format = $request->query('format', 'csv'); // csv | pdf
        $exportData = $this->reportService->getExportData($format);

        return response()->json([
            'success'   => true,
            'format'    => $format,
            'filename'  => "MechMate_Analytics_Report_" . now()->format('Y_m_d') . ".{$format}",
            'rows'      => $exportData,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
