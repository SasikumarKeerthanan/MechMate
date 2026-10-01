<?php

namespace App\Http\Controllers\Api\ServiceCentre;

use App\Http\Controllers\Controller;
use App\Services\Contracts\ServiceCentreServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceCentreController extends Controller
{
    public function __construct(
        private readonly ServiceCentreServiceInterface $serviceCentreService,
    ) {}

    private function resolveGarageId(Request $request): string
    {
        return (string) ($request->input('garage_id')
            ?? $request->query('garage_id')
            ?? $request->header('X-Garage-Id')
            ?? '301');
    }

    // ── GET /api/garage/profile ───────────────────────────────────────────
    public function getProfile(Request $request): JsonResponse
    {
        $garageId = $this->resolveGarageId($request);
        $profile = $this->serviceCentreService->getProfile($garageId);

        return response()->json([
            'success' => true,
            'profile' => $profile,
        ]);
    }

    // ── PUT /api/garage/profile ───────────────────────────────────────────
    public function updateProfile(Request $request): JsonResponse
    {
        $request->validate([
            'business_name' => 'sometimes|string|max:255',
            'phone'         => 'sometimes|string|max:50',
            'city'          => 'sometimes|string|max:100',
            'address'       => 'sometimes|string|max:500',
            'working_hours' => 'sometimes|string|max:100',
            'business_type' => 'sometimes|string|max:150',
            'description'   => 'sometimes|string|max:1000',
        ]);

        $garageId = $this->resolveGarageId($request);
        $profile = $this->serviceCentreService->updateProfile($garageId, $request->all());

        return response()->json([
            'success' => true,
            'message' => 'Service Centre profile updated successfully.',
            'profile' => $profile,
        ]);
    }

    // ── GET /api/garage/vehicles ──────────────────────────────────────────
    public function getVehicles(Request $request): JsonResponse
    {
        $garageId = $this->resolveGarageId($request);
        $vehicles = $this->serviceCentreService->getSupportedVehicles($garageId);

        return response()->json([
            'success'  => true,
            'vehicles' => $vehicles,
        ]);
    }

    // ── PUT /api/garage/vehicles ──────────────────────────────────────────
    public function updateVehicles(Request $request): JsonResponse
    {
        $request->validate([
            'vehicles'   => 'required_without:types|array',
            'vehicles.*' => 'string',
            'types'      => 'sometimes|array',
            'types.*'    => 'string',
        ]);

        $garageId = $this->resolveGarageId($request);
        $types = $request->input('vehicles') ?? $request->input('types', []);

        $updated = $this->serviceCentreService->updateSupportedVehicles($garageId, $types);

        return response()->json([
            'success'  => true,
            'message'  => 'Supported vehicle types updated successfully.',
            'vehicles' => $updated,
        ]);
    }

    // ── GET /api/garage/services ──────────────────────────────────────────
    public function services(Request $request): JsonResponse
    {
        $garageId = $this->resolveGarageId($request);
        $services = $this->serviceCentreService->getServices($garageId);

        return response()->json([
            'success'  => true,
            'services' => $services,
            'total'    => count($services),
        ]);
    }

    // ── POST /api/garage/services ─────────────────────────────────────────
    public function storeService(Request $request): JsonResponse
    {
        $request->validate([
            'name'                    => 'required|string|max:255',
            'category'                => 'required|string|max:100',
            'estimated_price'         => 'required|numeric|min:0',
            'estimated_duration'      => 'required|string|max:50',
            'supported_vehicle_types' => 'nullable|array',
            'availability'            => 'nullable|string|in:available,booking_only,temporarily_unavailable',
            'description'             => 'nullable|string|max:1000',
        ]);

        $garageId = $this->resolveGarageId($request);
        $service = $this->serviceCentreService->addService($garageId, $request->all());

        return response()->json([
            'success' => true,
            'message' => 'Service package added to catalog successfully.',
            'service' => $service,
        ], 201);
    }

    // ── PUT /api/garage/services/{id} ─────────────────────────────────────
    public function updateService(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'name'                    => 'sometimes|string|max:255',
            'category'                => 'sometimes|string|max:100',
            'estimated_price'         => 'sometimes|numeric|min:0',
            'estimated_duration'      => 'sometimes|string|max:50',
            'supported_vehicle_types' => 'sometimes|array',
            'availability'            => 'sometimes|string',
            'description'             => 'sometimes|string|max:1000',
        ]);

        $service = $this->serviceCentreService->updateService($id, $request->all());

        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => "Service #{$id} not found.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Service package updated successfully.',
            'service' => $service,
        ]);
    }

    // ── DELETE /api/garage/services/{id} ──────────────────────────────────
    public function destroyService(string $id): JsonResponse
    {
        $deleted = $this->serviceCentreService->deleteService($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => "Service #{$id} not found or could not be removed.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => "Service #{$id} removed from catalog.",
        ]);
    }

    // ── GET /api/garage/inquiries ─────────────────────────────────────────
    public function inquiries(Request $request): JsonResponse
    {
        $garageId = $this->resolveGarageId($request);
        $inquiries = $this->serviceCentreService->getInquiries($garageId);

        return response()->json([
            'success'   => true,
            'inquiries' => $inquiries,
            'total'     => count($inquiries),
        ]);
    }

    // ── POST /api/garage/inquiries/{id}/reply ─────────────────────────────
    public function replyInquiry(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'reply' => 'required_without:response|string|max:2000',
            'response' => 'sometimes|string|max:2000',
        ]);

        $text = $request->input('reply') ?? $request->input('response');
        $inquiry = $this->serviceCentreService->respondToInquiry($id, $text);

        if (!$inquiry) {
            return response()->json([
                'success' => false,
                'message' => "Inquiry #{$id} not found.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Reply sent to customer.',
            'inquiry' => $inquiry,
        ]);
    }

    // ── GET /api/garage/reviews ───────────────────────────────────────────
    public function reviews(Request $request): JsonResponse
    {
        $garageId = $this->resolveGarageId($request);
        $reviews = $this->serviceCentreService->getReviews($garageId);

        return response()->json([
            'success' => true,
            'reviews' => $reviews,
            'total'   => count($reviews),
        ]);
    }

    // ── GET /api/garage/analytics ─────────────────────────────────────────
    public function analytics(Request $request): JsonResponse
    {
        $garageId = $this->resolveGarageId($request);
        $stats = $this->serviceCentreService->getStatistics($garageId);

        return response()->json([
            'success' => true,
            'stats'   => $stats,
        ]);
    }
}
