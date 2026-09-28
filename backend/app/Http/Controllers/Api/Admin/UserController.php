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
        $users = $this->userService->getAllUsers($request->all());

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

        return response()->json(['success' => true, 'user' => $user]);
    }

    // ── PUT /api/admin/users/{id} ─────────────────────────────────────────
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'name'  => 'sometimes|string|max:255',
            'email' => 'sometimes|email',
            'phone' => 'sometimes|string',
        ]);

        $user = $this->userService->updateUser($id, $request->all());

        return response()->json(['success' => true, 'user' => $user]);
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
