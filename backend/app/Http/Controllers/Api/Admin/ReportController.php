<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    // ── GET /api/admin/reports ────────────────────────────────────────────
    public function index(): JsonResponse
    {
        return $this->summary();
    }

    // ── GET /api/admin/reports/summary ────────────────────────────────────
    public function summary(): JsonResponse
    {
        $metrics = [
            'overview' => [
                'total_users'             => 1420,
                'vehicle_owners'          => 920,
                'spare_part_shops'        => 140,
                'service_centres'         => 95,
                'mechanics'               => 265,
                'mechanic_emergency_reqs' => 482,
                'diagnosis_scans_total'   => 2190,
                'successful_ai_rate'      => 98.4,
                'total_gross_volume'      => 'LKR 4,680,000',
                'active_disputes'         => 3,
            ],
            'monthly_growth' => [
                ['month' => 'May 2026', 'users' => 110, 'providers' => 12, 'bookings' => 280, 'revenue' => 840000],
                ['month' => 'Jun 2026', 'users' => 160, 'providers' => 18, 'bookings' => 360, 'revenue' => 1120000],
                ['month' => 'Jul 2026', 'users' => 210, 'providers' => 24, 'bookings' => 450, 'revenue' => 1390000],
                ['month' => 'Aug 2026', 'users' => 290, 'providers' => 31, 'bookings' => 540, 'revenue' => 1710000],
                ['month' => 'Sep 2026', 'users' => 340, 'providers' => 39, 'bookings' => 680, 'revenue' => 2140000],
            ],
            'category_distribution' => [
                ['category' => 'Periodic Lubrication & Oil', 'share' => 34],
                ['category' => 'Brakes & Hydraulics',       'share' => 22],
                ['category' => 'Engine & Transmission',     'share' => 18],
                ['category' => 'Suspension & Steering',     'share' => 14],
                ['category' => 'Electrical & Diagnostics',   'share' => 12],
            ],
            'diagnosis_by_severity' => [
                ['severity' => 'Critical', 'count' => 340, 'percentage' => 15.5],
                ['severity' => 'High',     'count' => 690, 'percentage' => 31.5],
                ['severity' => 'Medium',   'count' => 820, 'percentage' => 37.4],
                ['severity' => 'Low',      'count' => 340, 'percentage' => 15.6],
            ],
            'generated_at' => now()->toIso8601String(),
        ];

        return response()->json([
            'success' => true,
            'report'  => $metrics,
        ]);
    }

    // ── GET /api/admin/reports/export ─────────────────────────────────────
    public function export(Request $request): JsonResponse
    {
        $format = $request->query('format', 'csv'); // csv | pdf

        $exportData = [
            ['Metric', 'Category / Detail', 'Recorded Value', 'Reporting Period'],
            ['Total Registered Users', 'Platform Total', '1420', 'September 2026'],
            ['Vehicle Owners', 'Account Category', '920', 'September 2026'],
            ['Spare Part Vendors', 'Verified Vendors', '140', 'September 2026'],
            ['Garages & Service Centres', 'Approved Providers', '95', 'September 2026'],
            ['On-Demand Mechanics', 'Field Technicians', '265', 'September 2026'],
            ['Emergency Roadside Requests', 'SOS Operations', '482', 'September 2026'],
            ['AI Diagnosis Sessions', 'Gemini / Knowledge Base', '2190', 'September 2026'],
            ['Platform Gross Booking Volume', 'Financials', 'LKR 4,680,000', 'September 2026'],
            ['Customer Satisfaction Rating', 'Quality Index', '4.7 / 5.0', 'September 2026'],
        ];

        return response()->json([
            'success'   => true,
            'format'    => $format,
            'filename'  => "MechMate_Analytics_Report_" . now()->format('Y_m_d') . ".{$format}",
            'rows'      => $exportData,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
