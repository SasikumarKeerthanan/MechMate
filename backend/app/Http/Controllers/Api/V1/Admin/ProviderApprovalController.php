<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\FirebaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProviderApprovalController extends Controller
{
    protected FirebaseService $firebaseService;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    }

    /**
     * List pending service provider approval applications.
     */
    public function index(Request $request): JsonResponse
    {
        $providers = [
            [
                'id' => 'prov_app_01',
                'business_name' => 'Apex Performance Motors',
                'owner_name' => 'Dominic Torelli',
                'email' => 'contact@apexperformance.com',
                'phone' => '+1 (555) 234-5678',
                'license_number' => 'GAR-2024-8891',
                'category' => 'Full Service Auto Garage',
                'documents' => [
                    ['name' => 'Business License.pdf', 'url' => '#'],
                    ['name' => 'ASE Certification.pdf', 'url' => '#'],
                    ['name' => 'Liability Insurance.pdf', 'url' => '#'],
                ],
                'submitted_at' => now()->subHours(6)->toIso8601String(),
                'status' => 'pending',
            ],
            [
                'id' => 'prov_app_02',
                'business_name' => 'Precision Mobile Diagnostics',
                'owner_name' => 'Samantha Ray',
                'email' => 'sam@precisiondiagnostics.net',
                'phone' => '+1 (555) 876-5432',
                'license_number' => 'MEC-2024-1102',
                'category' => 'Mobile Field Mechanic',
                'documents' => [
                    ['name' => 'Master Tech Certificate.pdf', 'url' => '#'],
                    ['name' => 'Identity Verification.pdf', 'url' => '#'],
                ],
                'submitted_at' => now()->subDay()->toIso8601String(),
                'status' => 'pending',
            ],
        ];

        return $this->successResponse($providers, 'Pending provider applications retrieved.');
    }

    /**
     * Approve provider application.
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        $this->firebaseService->setDocument('service_providers', $id, [
            'approval_status' => 'approved',
            'verified_at' => now()->toIso8601String(),
            'approved_by' => $request->auth_user['email'] ?? 'admin',
        ]);

        return $this->successResponse(['id' => $id, 'status' => 'approved'], 'Provider approved successfully.');
    }

    /**
     * Reject provider application.
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        $reason = $request->input('reason', 'Application did not meet verification criteria.');

        $this->firebaseService->setDocument('service_providers', $id, [
            'approval_status' => 'rejected',
            'rejection_reason' => $reason,
            'rejected_at' => now()->toIso8601String(),
            'rejected_by' => $request->auth_user['email'] ?? 'admin',
        ]);

        return $this->successResponse(['id' => $id, 'status' => 'rejected', 'reason' => $reason], 'Provider application rejected.');
    }
}
