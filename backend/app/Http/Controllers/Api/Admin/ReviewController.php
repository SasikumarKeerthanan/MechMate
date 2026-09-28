<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReviewController extends Controller
{
    private string $storageKey = 'mock_reviews.json';

    private array $defaultReviews = [
        [
            'id' => 1,
            'user' => 'Ashan Perera',
            'target_name' => 'AutoFix Lanka Garages',
            'target_type' => 'service_center',
            'rating' => 2,
            'comment' => 'Service took 3 hours longer than estimated. Receptionist was not very communicative regarding delay.',
            'status' => 'hidden',
            'flagged' => true,
            'flag_reason' => 'Provider flagged as inaccurate timeline dispute',
            'created_at' => '2026-09-24',
        ],
        [
            'id' => 2,
            'user' => 'Nimal Silva',
            'target_name' => 'SpeedServe Auto Parts',
            'target_type' => 'shop',
            'rating' => 1,
            'comment' => 'Suspect the oil filter supplied was not genuine OEM Toyota packaging. Be careful when purchasing here.',
            'status' => 'hidden',
            'flagged' => true,
            'flag_reason' => 'Defamation / unverified authenticity accusation',
            'created_at' => '2026-09-25',
        ],
        [
            'id' => 3,
            'user' => 'Kumari Fernando',
            'target_name' => 'Ruwan Mobile Diagnostics',
            'target_type' => 'mechanic',
            'rating' => 5,
            'comment' => 'Saved me on the Southern expressway with prompt roadside battery jump and alternator check. Outstanding!',
            'status' => 'published',
            'flagged' => false,
            'flag_reason' => null,
            'created_at' => '2026-09-26',
        ],
        [
            'id' => 4,
            'user' => 'Rohan Mendis',
            'target_name' => 'Precision Tune Station',
            'target_type' => 'service_center',
            'rating' => 5,
            'comment' => 'Top-notch 3D computerized wheel alignment. Steering vibration on highway completely resolved.',
            'status' => 'published',
            'flagged' => false,
            'flag_reason' => null,
            'created_at' => '2026-09-26',
        ],
        [
            'id' => 5,
            'user' => 'Priya Karunarathna',
            'target_name' => 'Kamal Pro Mechanics',
            'target_type' => 'mechanic',
            'rating' => 4,
            'comment' => 'Gearbox solenoid replacement was smooth and transparent on pricing. Recommended for automatic transmissions.',
            'status' => 'published',
            'flagged' => false,
            'flag_reason' => null,
            'created_at' => '2026-09-27',
        ],
        [
            'id' => 6,
            'user' => 'Kavinda Jayasuriya',
            'target_name' => 'Apex Auto Spares & Accessories',
            'target_type' => 'shop',
            'rating' => 2,
            'comment' => 'Competitor brand advertised was out of stock. Had to wait 4 days for backorder.',
            'status' => 'published',
            'flagged' => true,
            'flag_reason' => 'Vendor requested review re-check',
            'created_at' => '2026-09-27',
        ],
    ];

    private function loadReviews(): array
    {
        if (Storage::disk('local')->exists($this->storageKey)) {
            try {
                $content = Storage::disk('local')->get($this->storageKey);
                $decoded = json_decode($content, true);
                if (is_array($decoded) && !empty($decoded)) {
                    return $decoded;
                }
            } catch (\Throwable $e) {
                // fallback
            }
        }
        $this->saveReviews($this->defaultReviews);
        return $this->defaultReviews;
    }

    private function saveReviews(array $reviews): void
    {
        try {
            Storage::disk('local')->put($this->storageKey, json_encode(array_values($reviews), JSON_PRETTY_PRINT));
        } catch (\Throwable $e) {
            // Ignore if restricted
        }
    }

    // ── GET /api/admin/reviews ────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $reviews = $this->loadReviews();

        // Filter by rating
        $rating = $request->query('rating');
        if (!empty($rating) && $rating !== 'all') {
            $reviews = array_filter($reviews, fn($r) => (int) $r['rating'] === (int) $rating);
        }

        // Filter by target_type
        $targetType = $request->query('target_type');
        if (!empty($targetType) && $targetType !== 'all') {
            $reviews = array_filter($reviews, fn($r) => ($r['target_type'] ?? '') === $targetType);
        }

        // Filter by status (published, hidden, flagged)
        $status = $request->query('status');
        if (!empty($status) && $status !== 'all') {
            if ($status === 'flagged') {
                $reviews = array_filter($reviews, fn($r) => ($r['flagged'] ?? false) === true);
            } else {
                $reviews = array_filter($reviews, fn($r) => ($r['status'] ?? 'published') === $status);
            }
        }

        // Search term
        $search = $request->query('search');
        if (!empty($search)) {
            $term = strtolower(trim($search));
            $reviews = array_filter($reviews, function ($r) use ($term) {
                return str_contains(strtolower($r['user'] ?? ''), $term) ||
                       str_contains(strtolower($r['target_name'] ?? ''), $term) ||
                       str_contains(strtolower($r['comment'] ?? ''), $term);
            });
        }

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

        $reviews = $this->loadReviews();
        $updated = null;

        foreach ($reviews as &$r) {
            if ((string) $r['id'] === (string) $id) {
                $r['status'] = $status;
                if ($status === 'published') {
                    $r['flagged'] = false;
                }
                $updated = $r;
                break;
            }
        }

        if (!$updated) {
            return response()->json([
                'success' => false,
                'message' => "Review {$id} not found.",
            ], 404);
        }

        $this->saveReviews($reviews);

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
        $reviews = $this->loadReviews();
        $initial = count($reviews);
        $reviews = array_filter($reviews, fn($r) => (string) $r['id'] !== (string) $id);

        if (count($reviews) !== $initial) {
            $this->saveReviews($reviews);
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
        $reviews = $this->loadReviews();
        $flagged = array_filter($reviews, fn($r) => ($r['flagged'] ?? false) === true);

        return response()->json([
            'success' => true,
            'reviews' => array_values($flagged),
            'total'   => count($flagged),
        ]);
    }

    // ── PATCH /api/admin/reviews/{id}/approve ─────────────────────────────
    public function approve(string $id): JsonResponse
    {
        return $this->updateStatus(new Request(['status' => 'published']), $id);
    }
}
