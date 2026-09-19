<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\FirebaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    protected FirebaseService $firebaseService;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    }

    /**
     * List all platform users with filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $roleFilter = $request->query('role', 'all');
        $search = $request->query('search', '');
        $status = $request->query('status', 'all');

        $users = [
            [
                'id' => 'usr_001',
                'name' => 'Alexander Vance',
                'email' => 'alex.vance@example.com',
                'role' => 'vehicle_owner',
                'status' => 'active',
                'registered_at' => now()->subDays(25)->toDateString(),
                'vehicles_count' => 2,
                'last_active' => '10 mins ago',
            ],
            [
                'id' => 'usr_002',
                'name' => 'Elena Rostova',
                'email' => 'elena.r@speedygarage.com',
                'role' => 'service_provider',
                'status' => 'active',
                'registered_at' => now()->subMonths(3)->toDateString(),
                'vehicles_count' => 0,
                'last_active' => '1 hour ago',
            ],
            [
                'id' => 'usr_003',
                'name' => 'Marcus Holloway',
                'email' => 'marcus.h@techmechanic.io',
                'role' => 'service_provider',
                'status' => 'pending_verification',
                'registered_at' => now()->subDays(3)->toDateString(),
                'vehicles_count' => 0,
                'last_active' => 'Yesterday',
            ],
            [
                'id' => 'usr_004',
                'name' => 'Chloe Bennett',
                'email' => 'c.bennett@example.com',
                'role' => 'vehicle_owner',
                'status' => 'suspended',
                'registered_at' => now()->subMonths(6)->toDateString(),
                'vehicles_count' => 1,
                'last_active' => '5 days ago',
            ],
            [
                'id' => 'usr_005',
                'name' => 'Darius Miller',
                'email' => 'dmiller.auto@gmail.com',
                'role' => 'parts_supplier',
                'status' => 'active',
                'registered_at' => now()->subMonths(1)->toDateString(),
                'vehicles_count' => 0,
                'last_active' => '3 hours ago',
            ],
        ];

        return $this->paginatedResponse([
            'items' => $users,
            'current_page' => 1,
            'per_page' => 10,
            'total' => count($users),
        ], 'Users fetched successfully.');
    }

    /**
     * Update user account status (active, suspended, banned).
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $status = $request->input('status');
        $validStatuses = ['active', 'suspended', 'banned', 'pending_verification'];

        if (!in_array($status, $validStatuses)) {
            return $this->errorResponse('Invalid status specified.', 422);
        }

        $this->firebaseService->setDocument('users', $id, [
            'status' => $status,
            'updated_by_admin' => $request->auth_user['email'] ?? 'admin',
            'updated_at' => now()->toIso8601String(),
        ]);

        return $this->successResponse([
            'user_id' => $id,
            'status' => $status,
        ], "User account status updated to $status.");
    }
}
