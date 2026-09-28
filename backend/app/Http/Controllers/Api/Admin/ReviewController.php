<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // ── GET /api/admin/reviews/flagged ────────────────────────────────────
    public function flagged(): JsonResponse
    {
        $reviews = [
            ['id' => 1, 'user' => 'Ashan P.',  'provider' => 'AutoFix Lanka',  'rating' => 2, 'comment' => 'Very slow service.',   'flagged' => true],
            ['id' => 2, 'user' => 'Nimal S.',  'provider' => 'SpeedServe Co.', 'rating' => 1, 'comment' => 'Rude staff behavior.', 'flagged' => true],
        ];

        return response()->json([
            'success' => true,
            'reviews' => $reviews,
        ]);
    }

    // ── PATCH /api/admin/reviews/{id}/approve ─────────────────────────────
    public function approve(string $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => "Review {$id} approved.",
        ]);
    }

    // ── DELETE /api/admin/reviews/{id} ────────────────────────────────────
    public function destroy(string $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => "Review {$id} removed.",
        ]);
    }
}
