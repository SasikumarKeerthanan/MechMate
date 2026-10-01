<?php

namespace App\Services\Mock;

use App\Services\Contracts\ReportServiceInterface;

class MockReportService implements ReportServiceInterface
{
    public function getSummary(): array
    {
        return [
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
    }

    public function getExportData(string $format = 'csv'): array
    {
        $summary = $this->getSummary();
        $overview = $summary['overview'];

        return [
            ['Metric', 'Category / Detail', 'Recorded Value', 'Reporting Period'],
            ['Total Registered Users', 'Platform Total', (string) ($overview['total_users'] ?? '1420'), now()->format('F Y')],
            ['Vehicle Owners', 'Account Category', (string) ($overview['vehicle_owners'] ?? '920'), now()->format('F Y')],
            ['Spare Part Vendors', 'Verified Vendors', (string) ($overview['spare_part_shops'] ?? '140'), now()->format('F Y')],
            ['Garages & Service Centres', 'Approved Providers', (string) ($overview['service_centres'] ?? '95'), now()->format('F Y')],
            ['On-Demand Mechanics', 'Field Technicians', (string) ($overview['mechanics'] ?? '265'), now()->format('F Y')],
            ['Emergency Roadside Requests', 'SOS Operations', (string) ($overview['mechanic_emergency_reqs'] ?? '482'), now()->format('F Y')],
            ['AI Diagnosis Sessions', 'Gemini / Knowledge Base', (string) ($overview['diagnosis_scans_total'] ?? '2190'), now()->format('F Y')],
            ['Platform Gross Booking Volume', 'Financials', (string) ($overview['total_gross_volume'] ?? 'LKR 4,680,000'), now()->format('F Y')],
            ['Customer Satisfaction Rating', 'Quality Index', '4.7 / 5.0', now()->format('F Y')],
        ];
    }
}
