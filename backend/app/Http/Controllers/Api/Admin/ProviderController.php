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
        $providers = $this->providerService->getAllProviders($request->all());

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
        ]);
    }

    // ── POST /api/admin/providers/{id}/approve ────────────────────────────
    public function approve(string $id): JsonResponse
    {
        $this->providerService->approveProvider($id);

        return response()->json([
            'success' => true,
            'message' => "Provider {$id} has been approved.",
        ]);
    }

    // ── POST /api/admin/providers/{id}/reject ─────────────────────────────
    public function reject(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $this->providerService->rejectProvider($id, $request->string('reason'));

        return response()->json([
            'success' => true,
            'message' => "Provider {$id} has been rejected.",
        ]);
    }
}
