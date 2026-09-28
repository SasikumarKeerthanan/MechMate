<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Contracts\ProviderServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProviderController extends Controller
{
    public function __construct(
        private readonly ProviderServiceInterface $providerService,
    ) {}

    // ── GET /api/admin/providers ──────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'type'                      => $request->query('type'),
            'status'                    => $request->query('status'),
            'email_verification_status' => $request->query('email_verification_status'),
            'search'                    => $request->query('search'),
        ];

        $providers = $this->providerService->getAllProviders($filters);

        return response()->json([
            'success'   => true,
            'providers' => $providers,
            'total'     => count($providers),
        ]);
    }

    // ── GET /api/admin/providers/pending ──────────────────────────────────
    public function pending(): JsonResponse
    {
        $providers = $this->providerService->getPendingProviders();

        return response()->json([
            'success'   => true,
            'providers' => $providers,
            'total'     => count($providers),
        ]);
    }

    // ── GET /api/admin/providers/email-verification-status ─────────────────
    public function emailVerificationStatus(): JsonResponse
    {
        $stats = $this->providerService->getEmailVerificationStats();

        return response()->json([
            'success' => true,
            'stats'   => $stats,
        ]);
    }

    // ── GET /api/admin/providers/{id} ─────────────────────────────────────
    public function show(string $id): JsonResponse
    {
        $provider = $this->providerService->getProviderById($id);

        if (!$provider) {
            return response()->json([
                'success' => false,
                'message' => "Provider {$id} not found.",
            ], 404);
        }

        return response()->json(['success' => true, 'provider' => $provider]);
    }

    // ── POST /api/admin/providers/{id}/approve ────────────────────────────
    public function approve(string $id): JsonResponse
    {
        $provider = $this->providerService->approveProvider($id);

        if (!$provider) {
            return response()->json([
                'success' => false,
                'message' => "Provider {$id} not found or could not be approved.",
            ], 404);
        }

        return response()->json([
            'success'  => true,
            'message'  => "Provider '{$provider['business_name']}' has been approved. Email verification code dispatched (stub).",
            'provider' => $provider,
        ]);
    }

    // ── POST /api/admin/providers/{id}/reject ─────────────────────────────
    public function reject(Request $request, string $id): JsonResponse
    {
        $reason = $request->input('reason') ?? $request->query('reason');
        $provider = $this->providerService->rejectProvider($id, $reason ? (string) $reason : null);

        if (!$provider) {
            return response()->json([
                'success' => false,
                'message' => "Provider {$id} not found or could not be rejected.",
            ], 404);
        }

        return response()->json([
            'success'  => true,
            'message'  => "Provider registration for '{$provider['business_name']}' has been rejected.",
            'provider' => $provider,
        ]);
    }

    // ── PUT /api/admin/providers/{id}/status ──────────────────────────────
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $status = $request->input('status') ?? $request->query('status');

        if (!in_array($status, ['active', 'suspended', 'approved', 'pending', 'rejected'])) {
            return response()->json([
                'success' => false,
                'message' => "The status must be one of: active, suspended, approved, pending, rejected.",
            ], 422);
        }

        $provider = $this->providerService->updateProviderStatus($id, (string) $status);

        if (!$provider) {
            return response()->json([
                'success' => false,
                'message' => "Provider {$id} not found.",
            ], 404);
        }

        return response()->json([
            'success'  => true,
            'message'  => "Provider status updated to '{$status}'.",
            'provider' => $provider,
        ]);
    }
}
