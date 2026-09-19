<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\FirebaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ServiceCategoryController extends Controller
{
    protected FirebaseService $firebaseService;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    }

    /**
     * List vehicle service categories.
     */
    public function index(Request $request): JsonResponse
    {
        $services = [
            [
                'id' => 'cat_srv_01',
                'name' => 'Emergency Roadside Assistance',
                'slug' => 'emergency-roadside-assistance',
                'base_rate_usd' => 45.00,
                'is_emergency' => true,
                'active_mechanics' => 312,
                'status' => 'active',
            ],
            [
                'id' => 'cat_srv_02',
                'name' => 'Periodic Maintenance & Oil Service',
                'slug' => 'periodic-maintenance',
                'base_rate_usd' => 60.00,
                'is_emergency' => false,
                'active_mechanics' => 540,
                'status' => 'active',
            ],
            [
                'id' => 'cat_srv_03',
                'name' => 'OBD-II & Computerized Diagnostics',
                'slug' => 'computerized-diagnostics',
                'base_rate_usd' => 50.00,
                'is_emergency' => false,
                'active_mechanics' => 280,
                'status' => 'active',
            ],
            [
                'id' => 'cat_srv_04',
                'name' => 'Tire Replacement & Wheel Alignment',
                'slug' => 'tire-wheel-alignment',
                'base_rate_usd' => 35.00,
                'is_emergency' => true,
                'active_mechanics' => 190,
                'status' => 'active',
            ],
            [
                'id' => 'cat_srv_05',
                'name' => 'Air Conditioning & Climate Service',
                'slug' => 'ac-climate-service',
                'base_rate_usd' => 75.00,
                'is_emergency' => false,
                'active_mechanics' => 165,
                'status' => 'active',
            ],
        ];

        return $this->successResponse($services, 'Service categories retrieved.');
    }

    /**
     * Store new service category.
     */
    public function store(Request $request): JsonResponse
    {
        $name = $request->input('name');
        if (!$name) {
            return $this->errorResponse('Service name is required.', 422);
        }

        $data = [
            'name' => $name,
            'slug' => Str::slug($name),
            'base_rate_usd' => (float)$request->input('base_rate_usd', 0),
            'is_emergency' => (bool)$request->input('is_emergency', false),
            'status' => $request->input('status', 'active'),
            'created_at' => now()->toIso8601String(),
        ];

        $id = $this->firebaseService->addDocument('service_categories', $data);
        return $this->successResponse(array_merge(['id' => $id], $data), 'Service category created successfully.', 201);
    }
}
