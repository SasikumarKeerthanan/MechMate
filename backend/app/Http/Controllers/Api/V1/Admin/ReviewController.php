<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\FirebaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    protected FirebaseService $firebaseService;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    }

    /**
     * List user reviews with moderation status.
     */
    public function index(Request $request): JsonResponse
    {
        $reviews = [
            [
                'id' => 'rev_501',
                'customer_name' => 'Lucas Scott',
                'provider_name' => 'Apex Performance Motors',
                'service_type' => 'Emergency Brake Bleed & Rotor Replacement',
                'rating' => 5,
                'comment' => 'Arrived within 25 minutes on the highway. Exceptional work and fair pricing.',
                'status' => 'published',
                'created_at' => now()->subDays(2)->toIso8601String(),
            ],
            [
                'id' => 'rev_502',
                'customer_name' => 'Natalie Portman',
                'provider_name' => 'Citywide Tire Pros',
                'service_type' => 'Flat Tire Mobile Repair',
                'rating' => 2,
                'comment' => 'Mechanic took twice as long as the ETA in the app without notifying me.',
                'status' => 'flagged',
                'created_at' => now()->subDays(4)->toIso8601String(),
            ],
            [
                'id' => 'rev_503',
                'customer_name' => 'Brian O\'Connor',
                'provider_name' => 'Precision Mobile Diagnostics',
                'service_type' => 'ECU Remap & OBD Scan',
                'rating' => 5,
                'comment' => 'Identified intermittent electrical short in 15 minutes. High skill level!',
                'status' => 'published',
                'created_at' => now()->subDays(6)->toIso8601String(),
            ],
        ];

        return $this->successResponse($reviews, 'Reviews fetched successfully.');
    }

    /**
     * Update review moderation state (published, hidden, flagged).
     */
    public function updateModeration(Request $request, string $id): JsonResponse
    {
        $status = $request->input('status');
        if (!in_array($status, ['published', 'hidden', 'flagged'])) {
            return $this->errorResponse('Invalid moderation status.', 422);
        }

        $this->firebaseService->setDocument('reviews', $id, [
            'status' => $status,
            'moderated_by' => $request->auth_user['email'] ?? 'admin',
            'moderated_at' => now()->toIso8601String(),
        ]);

        return $this->successResponse(['id' => $id, 'status' => $status], "Review status updated to $status.");
    }
}
