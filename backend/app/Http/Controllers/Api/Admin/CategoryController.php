<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Contracts\CategoryServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryServiceInterface $categoryService,
    ) {}

    // ── Legacy / All Categories ───────────────────────────────────────────
    public function index(): JsonResponse
    {
        return response()->json([
            'success'    => true,
            'categories' => $this->categoryService->getAll(),
        ]);
    }

    // ── Spare-Part Categories ─────────────────────────────────────────────
    // GET /api/admin/categories/parts
    public function getParts(): JsonResponse
    {
        $categories = $this->categoryService->getPartCategories();

        return response()->json([
            'success'    => true,
            'categories' => $categories,
            'total'      => count($categories),
        ]);
    }

    // POST /api/admin/categories/parts
    public function storePart(Request $request): JsonResponse
    {
        $request->validate([
            'name'        => 'required|string|max:100',
            'icon'        => 'nullable|string|max:20',
            'description' => 'nullable|string|max:500',
            'item_count'  => 'nullable|integer|min:0',
        ]);

        $category = $this->categoryService->createPartCategory($request->all());

        return response()->json([
            'success'  => true,
            'message'  => "Spare-part category '{$category['name']}' created successfully.",
            'category' => $category,
        ], 201);
    }

    // PUT /api/admin/categories/parts/{id}
    public function updatePart(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'name'        => 'sometimes|string|max:100',
            'icon'        => 'nullable|string|max:20',
            'description' => 'nullable|string|max:500',
            'item_count'  => 'nullable|integer|min:0',
            'active'      => 'sometimes|boolean',
        ]);

        $category = $this->categoryService->updatePartCategory($id, $request->all());

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => "Spare-part category {$id} not found.",
            ], 404);
        }

        return response()->json([
            'success'  => true,
            'message'  => "Spare-part category updated successfully.",
            'category' => $category,
        ]);
    }

    // DELETE /api/admin/categories/parts/{id}
    public function destroyPart(string $id): JsonResponse
    {
        $deleted = $this->categoryService->deletePartCategory($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => "Spare-part category {$id} not found or could not be deleted.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => "Spare-part category {$id} permanently removed.",
        ]);
    }

    // ── Garage Service Categories ─────────────────────────────────────────
    // GET /api/admin/categories/services
    public function getServices(): JsonResponse
    {
        $categories = $this->categoryService->getServiceCategories();

        return response()->json([
            'success'    => true,
            'categories' => $categories,
            'total'      => count($categories),
        ]);
    }

    // POST /api/admin/categories/services
    public function storeService(Request $request): JsonResponse
    {
        $request->validate([
            'name'           => 'required|string|max:100',
            'icon'           => 'nullable|string|max:20',
            'description'    => 'nullable|string|max:500',
            'estimated_time' => 'nullable|string|max:50',
            'popular'        => 'nullable|boolean',
        ]);

        $category = $this->categoryService->createServiceCategory($request->all());

        return response()->json([
            'success'  => true,
            'message'  => "Service category '{$category['name']}' created successfully.",
            'category' => $category,
        ], 201);
    }

    // PUT /api/admin/categories/services/{id}
    public function updateService(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'name'           => 'sometimes|string|max:100',
            'icon'           => 'nullable|string|max:20',
            'description'    => 'nullable|string|max:500',
            'estimated_time' => 'nullable|string|max:50',
            'popular'        => 'nullable|boolean',
            'active'         => 'sometimes|boolean',
        ]);

        $category = $this->categoryService->updateServiceCategory($id, $request->all());

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => "Service category {$id} not found.",
            ], 404);
        }

        return response()->json([
            'success'  => true,
            'message'  => "Service category updated successfully.",
            'category' => $category,
        ]);
    }

    // DELETE /api/admin/categories/services/{id}
    public function destroyService(string $id): JsonResponse
    {
        $deleted = $this->categoryService->deleteServiceCategory($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => "Service category {$id} not found or could not be deleted.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => "Service category {$id} permanently removed.",
        ]);
    }
}
