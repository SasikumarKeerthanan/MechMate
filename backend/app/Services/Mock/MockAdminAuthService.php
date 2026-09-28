<?php

namespace App\Services\Mock;

use App\Services\Contracts\AdminAuthServiceInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Mock implementation of AdminAuthServiceInterface.
 * Supports password reset workflow across all system roles:
 * - Administrator
 * - Vehicle Owner
 * - Shop Owner
 * - Service Centre Owner
 * - Mechanic
 */
class MockAdminAuthService implements AdminAuthServiceInterface
{
    /**
     * Registered mock users representing each role in the MechMate platform.
     */
    private array $mockUsers = [
        'admin@mechmate.lk'    => ['id' => 1, 'name' => 'MechMate Administrator', 'role' => 'Administrator',        'default_password' => 'password'],
        'owner@mechmate.lk'    => ['id' => 2, 'name' => 'Johnathan (Car Owner)',   'role' => 'Vehicle Owner',        'default_password' => 'password123'],
        'ashan@email.com'      => ['id' => 3, 'name' => 'Ashan Perera',           'role' => 'Vehicle Owner',        'default_password' => 'password123'],
        'nimal@email.com'      => ['id' => 4, 'name' => 'Nimal Silva',             'role' => 'Vehicle Owner',        'default_password' => 'password123'],
        'shop@mechmate.lk'     => ['id' => 5, 'name' => 'Kandy Auto Spares',      'role' => 'Shop Owner',           'default_password' => 'password123'],
        'autofix@lk.com'       => ['id' => 6, 'name' => 'AutoFix Lanka Store',    'role' => 'Shop Owner',           'default_password' => 'password123'],
        'service@mechmate.lk'  => ['id' => 7, 'name' => 'SpeedServe Auto Care',    'role' => 'Service Centre Owner', 'default_password' => 'password123'],
        'speed@srv.com'        => ['id' => 8, 'name' => 'SpeedServe Co.',         'role' => 'Service Centre Owner', 'default_password' => 'password123'],
        'mechanic@mechmate.lk' => ['id' => 9, 'name' => 'Kamal (Senior Mechanic)','role' => 'Mechanic',             'default_password' => 'password123'],
        'qm@hub.com'           => ['id' => 10, 'name' => 'QuickMech Hub Specialist','role' => 'Mechanic',           'default_password' => 'password123'],
    ];

    /**
     * Authenticate an admin user and return a token + admin info.
     */
    public function login(string $email, string $password): array
    {
        $normalizedEmail = strtolower(trim($email));
        $user = $this->mockUsers[$normalizedEmail] ?? null;

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        // Check if password has been reset/cached, else check default
        $currentPassword = Cache::get('mock_user_pw_' . $normalizedEmail, $user['default_password']);

        if ($password !== $currentPassword) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        return [
            'token' => 'mock_token_' . Str::random(40),
            'admin' => [
                'id'    => $user['id'],
                'name'  => $user['name'],
                'email' => $normalizedEmail,
                'role'  => $user['role'],
            ],
        ];
    }

    /**
     * Initiate the forgot-password flow:
     * - Validates user existence (throws NotFoundHttpException if not found)
     * - Generates secure 6-digit confirmation code
     * - Stores in Cache with 15-minute expiration
     * - Logs token via mailer stub
     * - Returns status, message, and debug_code
     */
    public function forgotPassword(string $email): array
    {
        $normalizedEmail = strtolower(trim($email));
        $user = $this->mockUsers[$normalizedEmail] ?? null;

        if (!$user) {
            throw new NotFoundHttpException("No account found with this email address: {$email}");
        }

        // Generate secure 6-digit OTP code
        $code = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = now()->addMinutes(15);

        // Store reset code in cache for 15 minutes
        Cache::put("password_reset_{$normalizedEmail}", [
            'code'       => $code,
            'email'      => $normalizedEmail,
            'role'       => $user['role'],
            'name'       => $user['name'],
            'created_at' => now()->timestamp,
            'expires_at' => $expiresAt->timestamp,
        ], $expiresAt);

        // Mailer stub: Log the reset token for local development and future mailer integration
        Log::info(sprintf(
            '[Mailer Stub] Password reset code generated for %s (%s): %s. Valid for 15 minutes (until %s).',
            $normalizedEmail,
            $user['role'],
            $code,
            $expiresAt->toDateTimeString()
        ));

        return [
            'status'     => 'success',
            'message'    => 'Password reset code sent to your email.',
            'debug_code' => $code,
            'role'       => $user['role'],
        ];
    }

    /**
     * Verify the 6-digit confirmation code.
     */
    public function verifyResetCode(string $email, string $code): bool
    {
        $normalizedEmail = strtolower(trim($email));
        $cached = Cache::get("password_reset_{$normalizedEmail}");

        if (!$cached) {
            return false;
        }

        // Check 15-minute expiration window
        if (isset($cached['expires_at']) && $cached['expires_at'] < now()->timestamp) {
            Cache::forget("password_reset_{$normalizedEmail}");
            return false;
        }

        return (string) $cached['code'] === trim($code);
    }

    /**
     * Reset the user's password using the verified code.
     */
    public function resetPassword(array $data): string
    {
        $normalizedEmail = strtolower(trim($data['email'] ?? ''));
        $code = trim((string) ($data['code'] ?? ($data['token'] ?? '')));
        $newPassword = $data['password'] ?? '';

        $cached = Cache::get("password_reset_{$normalizedEmail}");

        if (!$cached) {
            throw ValidationException::withMessages([
                'code' => ['The reset code has expired or does not exist. Please request a new code.'],
            ]);
        }

        if (isset($cached['expires_at']) && $cached['expires_at'] < now()->timestamp) {
            Cache::forget("password_reset_{$normalizedEmail}");
            throw ValidationException::withMessages([
                'code' => ['The reset code has expired. Please request a new code.'],
            ]);
        }

        if ((string) $cached['code'] !== $code) {
            throw ValidationException::withMessages([
                'code' => ['Invalid verification code. Please check and try again.'],
            ]);
        }

        // Update password in mock store (persisted in cache)
        Cache::put('mock_user_pw_' . $normalizedEmail, $newPassword, now()->addDays(7));

        // Revoke/clear reset token
        Cache::forget("password_reset_{$normalizedEmail}");

        Log::info(sprintf(
            '[Password Reset] Password reset successfully for %s (%s).',
            $normalizedEmail,
            $cached['role'] ?? 'User'
        ));

        return 'Password has been reset successfully. You can now log in with your new password.';
    }
}
