<?php

namespace App\Services\Mock;

use App\Services\Contracts\UserServiceInterface;

class MockUserService implements UserServiceInterface
{
    private array $users = [
        ['id' => 1, 'name' => 'Ashan Perera',    'email' => 'ashan@email.com',   'status' => 'active',   'phone' => '+94771234567', 'created_at' => '2024-01-10'],
        ['id' => 2, 'name' => 'Nimal Silva',      'email' => 'nimal@email.com',   'status' => 'active',   'phone' => '+94779876543', 'created_at' => '2024-02-15'],
        ['id' => 3, 'name' => 'Kumari Fernando',  'email' => 'kumari@email.com',  'status' => 'inactive', 'phone' => '+94761112233', 'created_at' => '2024-03-08'],
        ['id' => 4, 'name' => 'Rohan Mendis',     'email' => 'rohan@email.com',   'status' => 'active',   'phone' => '+94754445566', 'created_at' => '2024-04-22'],
        ['id' => 5, 'name' => 'Priya Karunarathna','email' => 'priya@email.com',  'status' => 'active',   'phone' => '+94777778899', 'created_at' => '2024-05-30'],
    ];

    public function getAllUsers(array $filters = []): array
    {
        return $this->users;
    }

    public function getUserById(string $id): array
    {
        return collect($this->users)->firstWhere('id', (int) $id) ?? [];
    }

    public function updateUser(string $id, array $data): array
    {
        return array_merge($this->getUserById($id), $data);
    }

    public function deactivateUser(string $id): bool
    {
        return true;
    }

    public function activateUser(string $id): bool
    {
        return true;
    }
}
