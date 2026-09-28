<?php

namespace App\Services\Contracts;

/**
 * Contract for Admin & User Authentication and Password Reset operations.
 * Supports all system roles: Vehicle Owner, Shop Owner, Service Centre Owner, Mechanic, Administrator.
 */
interface AdminAuthServiceInterface
{
    /**
     * Authenticate an admin user and return a token + admin info.
     *
     * @param  string $email
     * @param  string $password
     * @return array{token: string, admin: array}
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function login(string $email, string $password): array;

    /**
     * Initiate the forgot-password flow (generates 6-digit OTP code, stores in cache, logs code).
     *
     * @param  string $email
     * @return array{status: string, message: string, debug_code: string, role?: string}
     */
    public function forgotPassword(string $email): array;

    /**
     * Verify the 6-digit confirmation code for an email.
     *
     * @param  string $email
     * @param  string $code
     * @return bool
     */
    public function verifyResetCode(string $email, string $code): bool;

    /**
     * Reset the user's password using the verified code.
     *
     * @param  array{email: string, code: string, password: string, password_confirmation?: string} $data
     * @return string Status message
     */
    public function resetPassword(array $data): string;
}
