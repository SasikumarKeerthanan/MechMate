<?php

namespace App\Services\Contracts;

/**
 * Contract for Admin User Management operations.
 */
interface UserServiceInterface
{
    public function getAllUsers(array $filters = []): array;
    public function getUserById(string $id): ?array;
    public function updateUser(string $id, array $data): ?array;
    public function updateStatus(string $id, string $status): ?array;
    public function deleteUser(string $id): bool;
    public function deactivateUser(string $id): bool;
    public function activateUser(string $id): bool;
}
