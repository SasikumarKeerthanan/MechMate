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

    // ── GET /api/admin/categories ─────────────────────────────────────────
    public function index(): JsonResponse
    {
        return response()->json([
            'success'    => true,
            'categories' => $this->categoryService->getAll(),
        ]);
    }

    // ── POST /api/admin/categories ────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'icon' => 'nullable|string|max:10',
        ]);

        $category = $this->categoryService->create($request->only(['name', 'icon']));

        return response()->json([
            'success'  => true,
            'category' => $category,
        ], 201);
    }

    // ── PUT /api/admin/categories/{id} ────────────────────────────────────
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'name'   => 'sometimes|string|max:100',
            'icon'   => 'nullable|string|max:10',
            'active' => 'sometimes|boolean',
        ]);

        $category = $this->categoryService->update($id, $request->all());

        return response()->json([
            'success'  => true,
            'category' => $category,
        ]);
    }

    // ── DELETE /api/admin/categories/{id} ─────────────────────────────────
    public function destroy(string $id): JsonResponse
    {
        $this->categoryService->delete($id);

        return response()->json([
            'success' => true,
            'message' => "Category {$id} deleted.",
        ]);
    }
}
