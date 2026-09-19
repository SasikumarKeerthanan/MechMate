<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\FirebaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MechanicRequestController extends Controller
{
    protected FirebaseService $firebaseService;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    }

    /**
     * List live and historical mechanic dispatch requests.
     */
    public function index(Request $request): JsonResponse
    {
        $requests = [
            [
                'id' => 'req_9921',
                'customer_name' => 'David Kim',
                'customer_phone' => '+1 (555) 349-8812',
                'vehicle' => '2021 Toyota RAV4 Hybrid',
                'issue_category' => 'Battery Jumpstart / Electrical',
                'location' => 'Interstate 80, Mile Marker 42',
                'assigned_mechanic' => 'Marcus Holloway',
                'status' => 'in_progress',
                'urgency' => 'high',
                'requested_at' => now()->subMinutes(18)->toIso8601String(),
                'eta_minutes' => 12,
            ],
            [
                'id' => 'req_9922',
                'customer_name' => 'Sophia Martinez',
                'customer_phone' => '+1 (555) 776-9021',
                'vehicle' => '2019 Honda Civic',
                'issue_category' => 'Overheating Engine / Coolant Leak',
                'location' => 'Downtown Main St & 4th Ave',
                'assigned_mechanic' => null,
                'status' => 'searching_provider',
                'urgency' => 'critical',
                'requested_at' => now()->subMinutes(7)->toIso8601String(),
                'eta_minutes' => null,
            ],
            [
                'id' => 'req_9920',
                'customer_name' => 'Robert Green',
                'customer_phone' => '+1 (555) 431-2290',
                'vehicle' => '2018 Ford F-150',
                'issue_category' => 'Blown Tire on Shoulder',
                'location' => 'North Expressway Exit 14',
                'assigned_mechanic' => 'Apex Auto Care (Tech: Jack)',
                'status' => 'completed',
                'urgency' => 'medium',
                'requested_at' => now()->subHours(2)->toIso8601String(),
                'eta_minutes' => 0,
            ],
        ];

        return $this->successResponse($requests, 'Mechanic dispatch requests retrieved.');
    }

    /**
     * Admin override or cancel a mechanic request.
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $status = $request->input('status');
        $this->firebaseService->setDocument('mechanic_requests', $id, [
            'status' => $status,
            'admin_note' => $request->input('note', 'Updated by system administrator'),
            'updated_at' => now()->toIso8601String(),
        ]);

        return $this->successResponse(['id' => $id, 'status' => $status], "Request $id status updated.");
    }
}
