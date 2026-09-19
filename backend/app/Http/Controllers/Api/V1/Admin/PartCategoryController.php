<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\FirebaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PartCategoryController extends Controller
{
    protected FirebaseService $firebaseService;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    }

    /**
     * List auto part categories.
     */
    public function index(Request $request): JsonResponse
    {
        $categories = [
            [
                'id' => 'cat_part_01',
                'name' => 'Brake Systems',
                'slug' => 'brake-systems',
                'description' => 'Pads, rotors, calipers, hydraulic lines, and ABS components.',
                'item_count' => 1420,
                'status' => 'active',
            ],
            [
                'id' => 'cat_part_02',
                'name' => 'Engine & Drivetrain',
                'slug' => 'engine-drivetrain',
                'description' => 'Pistons, gaskets, timing belts, spark plugs, and filters.',
                'item_count' => 3890,
                'status' => 'active',
            ],
            [
                'id' => 'cat_part_03',
                'name' => 'Suspension & Steering',
                'slug' => 'suspension-steering',
                'description' => 'Shocks, struts, control arms, ball joints, and tie rods.',
                'item_count' => 980,
                'status' => 'active',
            ],
            [
                'id' => 'cat_part_04',
                'name' => 'Electrical & Lighting',
                'slug' => 'electrical-lighting',
                'description' => 'Alternators, starters, batteries, bulbs, sensors, and ECUs.',
                'item_count' => 2100,
                'status' => 'active',
            ],
            [
                'id' => 'cat_part_05',
                'name' => 'Cooling & AC Systems',
                'slug' => 'cooling-ac',
                'description' => 'Radiators, water pumps, thermostats, condensers, and compressors.',
                'item_count' => 640,
                'status' => 'active',
            ],
        ];

        return $this->successResponse($categories, 'Part categories retrieved.');
    }

    /**
     * Store new part category.
     */
    public function store(Request $request): JsonResponse
    {
        $name = $request->input('name');
        if (!$name) {
            return $this->errorResponse('Category name is required.', 422);
        }

        $data = [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => $request->input('description', ''),
            'status' => $request->input('status', 'active'),
            'created_at' => now()->toIso8601String(),
        ];

        $id = $this->firebaseService->addDocument('part_categories', $data);
        return $this->successResponse(array_merge(['id' => $id], $data), 'Category created successfully.', 201);
    }

    /**
     * Delete part category.
     */
    public function destroy(string $id): JsonResponse
    {
        $this->firebaseService->deleteDocument('part_categories', $id);
        return $this->successResponse(['id' => $id], 'Category deleted successfully.');
    }
}
