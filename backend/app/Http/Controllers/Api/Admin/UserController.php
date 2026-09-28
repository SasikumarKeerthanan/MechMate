<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Contracts\UserServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        private readonly UserServiceInterface $userService,
    ) {}

    // ── GET /api/admin/users ──────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'role'   => $request->query('role'),
            'status' => $request->query('status'),
            'search' => $request->query('search'),
        ];

        $users = $this->userService->getAllUsers($filters);

        return response()->json([
            'success' => true,
            'users'   => $users,
            'total'   => count($users),
        ]);
    }

    // ── GET /api/admin/users/{id} ─────────────────────────────────────────
    public function show(string $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => "User {$id} not found.",
            ], 404);
        }

        return response()->json(['success' => true, 'user' => $user]);
    }

    // ── PUT /api/admin/users/{id} ─────────────────────────────────────────
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'name'   => 'sometimes|string|max:255',
            'email'  => 'sometimes|email',
            'phone'  => 'sometimes|string',
            'status' => 'sometimes|in:active,blocked,inactive,pending',
        ]);

        $user = $this->userService->updateUser($id, $request->all());

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => "User {$id} not found.",
            ], 404);
        }

        return response()->json(['success' => true, 'user' => $user]);
    }

    // ── PUT /api/admin/users/{id}/status ──────────────────────────────────
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $status = $request->input('status') ?? $request->query('status');

        if (!in_array($status, ['active', 'blocked', 'inactive', 'pending'])) {
            return response()->json([
                'success' => false,
                'message' => "The status must be one of: active, blocked, inactive, pending.",
            ], 422);
        }

        $user = $this->userService->updateStatus($id, (string) $status);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => "User {$id} not found.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => "User status updated to '{$status}'.",
            'user'    => $user,
        ]);
    }

    // ── DELETE /api/admin/users/{id} ──────────────────────────────────────
    public function destroy(string $id): JsonResponse
    {
        $deleted = $this->userService->deleteUser($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => "User {$id} could not be deleted or does not exist.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => "User record {$id} has been permanently deleted.",
        ]);
    }

    // ── PATCH /api/admin/users/{id}/deactivate ────────────────────────────
    public function deactivate(string $id): JsonResponse
    {
        $this->userService->deactivateUser($id);

        return response()->json(['success' => true, 'message' => "User {$id} deactivated."]);
    }

    // ── PATCH /api/admin/users/{id}/activate ──────────────────────────────
    public function activate(string $id): JsonResponse
    {
        $this->userService->activateUser($id);

        return response()->json(['success' => true, 'message' => "User {$id} activated."]);
    }
}
