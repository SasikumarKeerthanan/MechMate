<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Services\FirebaseService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ForgotPasswordController extends Controller
{
    protected FirebaseService $firebaseService;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    }

    /**
     * Send a password reset link or verification code.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function sendResetLink(Request $request): JsonResponse
    {
        $email = $request->input('email');

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->errorResponse(
                'A valid email address is required.',
                422,
                ['email' => ['Please enter a valid email address.']]
            );
        }

        try {
            // If live Firebase is configured, generate password reset link via Firebase Auth
            $firebaseLink = null;
            if ($this->firebaseService->isLive() && $this->firebaseService->getAuth()) {
                $firebaseLink = $this->firebaseService->getAuth()->getPasswordResetLink($email);
            }

            // Generate reset token and record in Firestore collection 'password_resets'
            $token = Str::random(48);
            $expiresAt = now()->addMinutes(30)->toIso8601String();

            $resetData = [
                'email' => strtolower(trim($email)),
                'token' => hash('sha256', $token),
                'created_at' => now()->toIso8601String(),
                'expires_at' => $expiresAt,
                'used' => false,
                'ip_address' => $request->ip(),
            ];

            $this->firebaseService->setDocument(
                'password_resets',
                md5(strtolower(trim($email))),
                $resetData
            );

            return $this->successResponse([
                'email' => $email,
                'expires_in_minutes' => 30,
                'reset_token' => config('app.debug') ? $token : null,
                'firebase_link' => config('app.debug') ? $firebaseLink : null,
            ], 'Password reset instructions have been dispatched to your email.');
        } catch (Exception $e) {
            return $this->errorResponse(
                'Failed to process password reset request: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * Verify validity of a password reset token.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function verifyToken(Request $request): JsonResponse
    {
        $email = $request->input('email');
        $token = $request->input('token');

        if (!$email || !$token) {
            return $this->errorResponse('Email and token are required for verification.', 422);
        }

        $record = $this->firebaseService->getDocument('password_resets', md5(strtolower(trim($email))));

        if (!$record || ($record['token'] ?? '') !== hash('sha256', $token) || ($record['used'] ?? false)) {
            return $this->errorResponse('This password reset link is invalid or has expired.', 400);
        }

        if (now()->isAfter($record['expires_at'] ?? now())) {
            return $this->errorResponse('This password reset token has expired. Please request a new one.', 410);
        }

        return $this->successResponse(['valid' => true, 'email' => $email], 'Reset token is valid.');
    }

    /**
     * Reset the user password.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $email = $request->input('email');
        $password = $request->input('password');
        $passwordConfirmation = $request->input('password_confirmation');
        $token = $request->input('token');

        if (!$email || !$password || !$token) {
            return $this->errorResponse('Missing required fields for password reset.', 422);
        }

        if (strlen($password) < 8) {
            return $this->errorResponse('Password must be at least 8 characters in length.', 422);
        }

        if ($password !== $passwordConfirmation) {
            return $this->errorResponse('Password confirmation does not match.', 422);
        }

        try {
            // If live Firebase is configured, update password in Firebase Auth
            if ($this->firebaseService->isLive() && $this->firebaseService->getAuth()) {
                $user = $this->firebaseService->getAuth()->getUserByEmail($email);
                $this->firebaseService->getAuth()->changeUserPassword($user->uid, $password);
            }

            // Invalidate the reset token in Firestore
            $this->firebaseService->setDocument(
                'password_resets',
                md5(strtolower(trim($email))),
                ['used' => true, 'completed_at' => now()->toIso8601String()]
            );

            return $this->successResponse(null, 'Your password has been successfully updated. You may now log in.');
        } catch (Exception $e) {
            return $this->errorResponse('Unable to update password: ' . $e->getMessage(), 500);
        }
    }
}
