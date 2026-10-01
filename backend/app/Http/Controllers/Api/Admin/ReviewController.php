<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Contracts\ReviewServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct(
        private readonly ReviewServiceInterface $reviewService,
    ) {}

    // ── GET /api/admin/reviews ────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'rating'      => $request->query('rating'),
            'target_type' => $request->query('target_type'),
            'status'      => $request->query('status'),
            'search'      => $request->query('search'),
        ];

        $reviews = $this->reviewService->getAllReviews($filters);

        return response()->json([
            'success' => true,
            'reviews' => array_values($reviews),
            'total'   => count($reviews),
        ]);
    }

    // ── PUT /api/admin/reviews/{id}/status ────────────────────────────────
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $status = $request->input('status') ?? $request->query('status');

        if (!in_array($status, ['published', 'hidden'])) {
            return response()->json([
                'success' => false,
                'message' => 'The status must be either published or hidden.',
            ], 422);
        }

        $updated = $this->reviewService->updateStatus($id, (string) $status);

        if (!$updated) {
            return response()->json([
                'success' => false,
                'message' => "Review {$id} not found.",
            ], 404);
        }

        $actionText = $status === 'hidden' ? 'hidden from public listings' : 'restored to published status';

        return response()->json([
            'success' => true,
            'message' => "Review #{$id} has been {$actionText}.",
            'review'  => $updated,
        ]);
    }

    // ── DELETE /api/admin/reviews/{id} ────────────────────────────────────
    public function destroy(string $id): JsonResponse
    {
        $deleted = $this->reviewService->deleteReview($id);

        if ($deleted) {
            return response()->json([
                'success' => true,
                'message' => "Review #{$id} permanently deleted.",
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => "Review {$id} not found or already deleted.",
        ], 404);
    }

    // ── GET /api/admin/reviews/flagged ────────────────────────────────────
    public function flagged(): JsonResponse
    {
        $flagged = $this->reviewService->getFlaggedReviews();

        return response()->json([
            'success' => true,
            'reviews' => array_values($flagged),
            'flagged' => array_values($flagged),
            'total'   => count($flagged),
        ]);
    }

    // ── PATCH /api/admin/reviews/{id}/approve ─────────────────────────────
    public function approve(string $id): JsonResponse
    {
        return $this->updateStatus(new Request(['status' => 'published']), $id);
    }
}
