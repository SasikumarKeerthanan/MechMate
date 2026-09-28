<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Contracts\AdminAuthServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class AuthController extends Controller
{
    public function __construct(
        private readonly AdminAuthServiceInterface $authService,
    ) {}

    // ── POST /api/auth/admin/login ────────────────────────────────────────
    public function adminLogin(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        try {
            $result = $this->authService->login(
                $request->string('email'),
                $request->string('password'),
            );

            return response()->json([
                'status'  => 'success',
                'success' => true,
                'token'   => $result['token'],
                'admin'   => $result['admin'],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => 'error',
                'success' => false,
                'message' => 'Invalid credentials.',
                'errors'  => $e->errors(),
            ], 401);
        }
    }

    // ── POST /api/auth/forgot-password ────────────────────────────────────
    public function forgotPassword(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'A valid email address is required.',
                'errors'  => $e->errors(),
            ], 422);
        }

        try {
            $result = $this->authService->forgotPassword($validated['email']);

            return response()->json([
                'status'     => 'success',
                'success'    => true,
                'message'    => $result['message'],
                'debug_code' => $result['debug_code'],
                'role'       => $result['role'] ?? 'User',
            ], 200);
        } catch (NotFoundHttpException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'No account found with this email address.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unable to process your request at this time.',
                'detail'  => $e->getMessage(),
            ], 400);
        }
    }

    // ── POST /api/auth/verify-code ────────────────────────────────────────
    public function verifyResetCode(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'code'  => 'required|string|size:6',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Please provide a valid email and 6-digit verification code.',
                'errors'  => $e->errors(),
            ], 422);
        }

        $isValid = $this->authService->verifyResetCode($validated['email'], $validated['code']);

        if (!$isValid) {
            return response()->json([
                'status'  => 'error',
                'message' => 'The verification code is invalid or has expired. Please check your code or request a new one.',
            ], 422);
        }

        return response()->json([
            'status'  => 'success',
            'success' => true,
            'message' => 'Verification code verified successfully.',
        ], 200);
    }

    // ── POST /api/auth/reset-password ─────────────────────────────────────
    public function resetPassword(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email'                 => 'required|email',
                'code'                  => 'nullable|string',
                'token'                 => 'nullable|string',
                'password'              => 'required|string|min:8|confirmed',
                'password_confirmation' => 'required|string|min:8',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->validator->errors()->first() ?: 'Validation failed.',
                'errors'  => $e->errors(),
            ], 422);
        }

        $code = $validated['code'] ?? ($validated['token'] ?? null);

        if (empty($code)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'The verification code is required to reset your password.',
            ], 400);
        }

        try {
            $message = $this->authService->resetPassword([
                'email'                 => $validated['email'],
                'code'                  => $code,
                'password'              => $validated['password'],
                'password_confirmation' => $validated['password_confirmation'],
            ]);

            return response()->json([
                'status'  => 'success',
                'success' => true,
                'message' => $message,
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->validator->errors()->first() ?: 'The verification code is invalid or expired.',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unable to reset password at this time.',
                'detail'  => $e->getMessage(),
            ], 400);
        }
    }
}
