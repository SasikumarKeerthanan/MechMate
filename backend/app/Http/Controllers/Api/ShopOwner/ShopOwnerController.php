<?php

namespace App\Http\Controllers\Api\ShopOwner;

use App\Http\Controllers\Controller;
use App\Services\Contracts\ShopOwnerServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShopOwnerController extends Controller
{
    public function __construct(
        private readonly ShopOwnerServiceInterface $shopOwnerService,
    ) {}

    private function resolveShopId(Request $request): string
    {
        return (string) ($request->input('shop_id')
            ?? $request->query('shop_id')
            ?? $request->header('X-Shop-Id')
            ?? '201');
    }

    // ── GET /api/shop/profile ─────────────────────────────────────────────
    public function getProfile(Request $request): JsonResponse
    {
        $shopId = $this->resolveShopId($request);
        $profile = $this->shopOwnerService->getProfile($shopId);

        return response()->json([
            'success' => true,
            'profile' => $profile,
        ]);
    }

    // ── PUT /api/shop/profile ─────────────────────────────────────────────
    public function updateProfile(Request $request): JsonResponse
    {
        $request->validate([
            'name'          => 'sometimes|string|max:255',
            'phone'         => 'sometimes|string|max:50',
            'city'          => 'sometimes|string|max:100',
            'address'       => 'sometimes|string|max:500',
            'opening_hours' => 'sometimes|string|max:100',
            'description'   => 'sometimes|string|max:1000',
        ]);

        $shopId = $this->resolveShopId($request);
        $profile = $this->shopOwnerService->updateProfile($shopId, $request->all());

        return response()->json([
            'success' => true,
            'message' => 'Shop profile updated successfully.',
            'profile' => $profile,
        ]);
    }

    // ── GET /api/shop/parts ───────────────────────────────────────────────
    public function parts(Request $request): JsonResponse
    {
        $shopId = $this->resolveShopId($request);
        $filters = [
            'category'     => $request->query('category'),
            'vehicle_type' => $request->query('vehicle_type'),
            'brand'        => $request->query('brand'),
            'model'        => $request->query('model'),
            'availability' => $request->query('availability'),
            'search'       => $request->query('search'),
        ];

        $parts = $this->shopOwnerService->getSpareParts($shopId, $filters);

        return response()->json([
            'success' => true,
            'parts'   => $parts,
            'total'   => count($parts),
        ]);
    }

    // ── POST /api/shop/parts ──────────────────────────────────────────────
    public function storePart(Request $request): JsonResponse
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'category'       => 'required|string|max:100',
            'brand'          => 'nullable|string|max:100',
            'model'          => 'nullable|string|max:100',
            'price'          => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'condition'      => 'nullable|string|max:50',
            'description'    => 'nullable|string|max:1000',
        ]);

        $shopId = $this->resolveShopId($request);
        $part = $this->shopOwnerService->addSparePart($shopId, $request->all());

        return response()->json([
            'success' => true,
            'message' => 'Spare part added to inventory successfully.',
            'part'    => $part,
        ], 201);
    }

    // ── PUT /api/shop/parts/{id} ──────────────────────────────────────────
    public function updatePart(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'name'           => 'sometimes|string|max:255',
            'category'       => 'sometimes|string|max:100',
            'brand'          => 'sometimes|string|max:100',
            'model'          => 'sometimes|string|max:100',
            'price'          => 'sometimes|numeric|min:0',
            'stock_quantity' => 'sometimes|integer|min:0',
            'availability'   => 'sometimes|in:in_stock,low_stock,out_of_stock',
        ]);

        $part = $this->shopOwnerService->updateSparePart($id, $request->all());

        if (!$part) {
            return response()->json([
                'success' => false,
                'message' => "Spare part #{$id} not found.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Spare part updated successfully.',
            'part'    => $part,
        ]);
    }

    // ── DELETE /api/shop/parts/{id} ───────────────────────────────────────
    public function destroyPart(string $id): JsonResponse
    {
        $deleted = $this->shopOwnerService->deleteSparePart($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => "Spare part #{$id} not found or could not be deleted.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => "Spare part #{$id} removed from catalog.",
        ]);
    }

    // ── GET /api/shop/parts/{id}/history ──────────────────────────────────
    public function partHistory(string $id): JsonResponse
    {
        $stockHistory = $this->shopOwnerService->getStockHistory($id);
        $priceHistory = $this->shopOwnerService->getPriceHistory($id);

        return response()->json([
            'success'       => true,
            'part_id'       => $id,
            'stock_history' => $stockHistory,
            'price_history' => $priceHistory,
        ]);
    }

    // ── GET /api/shop/inquiries ───────────────────────────────────────────
    public function inquiries(Request $request): JsonResponse
    {
        $shopId = $this->resolveShopId($request);
        $inquiries = $this->shopOwnerService->getInquiries($shopId);

        return response()->json([
            'success'   => true,
            'inquiries' => $inquiries,
            'total'     => count($inquiries),
        ]);
    }

    // ── POST /api/shop/inquiries/{id}/reply ───────────────────────────────
    public function replyInquiry(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'response' => 'required|string|max:2000',
        ]);

        $inquiry = $this->shopOwnerService->respondToInquiry($id, $request->input('response'));

        if (!$inquiry) {
            return response()->json([
                'success' => false,
                'message' => "Inquiry #{$id} not found.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Response recorded and transmitted to customer.',
            'inquiry' => $inquiry,
        ]);
    }

    // ── GET /api/shop/reviews ─────────────────────────────────────────────
    public function reviews(Request $request): JsonResponse
    {
        $shopId = $this->resolveShopId($request);
        $reviews = $this->shopOwnerService->getReviews($shopId);

        return response()->json([
            'success' => true,
            'reviews' => $reviews,
            'total'   => count($reviews),
        ]);
    }

    // ── GET /api/shop/analytics ───────────────────────────────────────────
    public function analytics(Request $request): JsonResponse
    {
        $shopId = $this->resolveShopId($request);
        $stats = $this->shopOwnerService->getStatistics($shopId);

        return response()->json([
            'success' => true,
            'stats'   => $stats,
        ]);
    }
}
