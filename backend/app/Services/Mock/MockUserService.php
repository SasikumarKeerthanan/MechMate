<?php

namespace App\Services\Mock;

use App\Services\Contracts\UserServiceInterface;
use Illuminate\Support\Facades\Storage;

class MockUserService implements UserServiceInterface
{
    private string $storageKey = 'mock_users.json';

    private array $defaultUsers = [
        [
            'id' => 1,
            'name' => 'Ashan Perera',
            'email' => 'ashan.perera@example.com',
            'phone' => '+94 77 123 4567',
            'role' => 'vehicle_owner',
            'status' => 'active',
            'city' => 'Colombo',
            'address' => 'No 45/2, Galle Road, Colombo 03',
            'vehicles_count' => 2,
            'total_bookings' => 14,
            'last_active' => '2026-09-28 16:45',
            'created_at' => '2024-01-10',
            'vehicles' => [
                ['make' => 'Toyota', 'model' => 'Corolla Axio', 'year' => 2018, 'plate' => 'WP-CAB-4819'],
                ['make' => 'Honda', 'model' => 'Vezel', 'year' => 2016, 'plate' => 'WP-CAD-8120'],
            ],
        ],
        [
            'id' => 2,
            'name' => 'Nimal Silva',
            'email' => 'nimal.silva@example.com',
            'phone' => '+94 77 987 6543',
            'role' => 'vehicle_owner',
            'status' => 'active',
            'city' => 'Kandy',
            'address' => '12 Peradeniya Road, Kandy',
            'vehicles_count' => 1,
            'total_bookings' => 8,
            'last_active' => '2026-09-27 11:20',
            'created_at' => '2024-02-15',
            'vehicles' => [
                ['make' => 'Nissan', 'model' => 'X-Trail Hybrid', 'year' => 2017, 'plate' => 'CP-KX-5022'],
            ],
        ],
        [
            'id' => 3,
            'name' => 'Kumari Fernando',
            'email' => 'kumari.fernando@example.com',
            'phone' => '+94 76 111 2233',
            'role' => 'vehicle_owner',
            'status' => 'inactive',
            'city' => 'Galle',
            'address' => '88 Main Street, Galle Fort',
            'vehicles_count' => 1,
            'total_bookings' => 3,
            'last_active' => '2026-08-14 09:10',
            'created_at' => '2024-03-08',
            'vehicles' => [
                ['make' => 'Suzuki', 'model' => 'Wagon R Stingray', 'year' => 2019, 'plate' => 'SP-CAE-3199'],
            ],
        ],
        [
            'id' => 4,
            'name' => 'Rohan Mendis',
            'email' => 'rohan.mendis@example.com',
            'phone' => '+94 75 444 5566',
            'role' => 'vehicle_owner',
            'status' => 'blocked',
            'city' => 'Negombo',
            'address' => '210 Sea Street, Negombo',
            'vehicles_count' => 3,
            'total_bookings' => 22,
            'last_active' => '2026-09-20 18:30',
            'created_at' => '2024-04-22',
            'vehicles' => [
                ['make' => 'Mitsubishi', 'model' => 'Montero Sport', 'year' => 2020, 'plate' => 'WP-CBD-1002'],
                ['make' => 'Toyota', 'model' => 'Prius', 'year' => 2015, 'plate' => 'WP-CAC-6204'],
            ],
        ],
        [
            'id' => 5,
            'name' => 'Priya Karunarathna',
            'email' => 'priya.k@example.com',
            'phone' => '+94 77 777 8899',
            'role' => 'vehicle_owner',
            'status' => 'active',
            'city' => 'Gampaha',
            'address' => '15 Yakkala Road, Gampaha',
            'vehicles_count' => 1,
            'total_bookings' => 6,
            'last_active' => '2026-09-28 20:15',
            'created_at' => '2024-05-30',
            'vehicles' => [
                ['make' => 'Hyundai', 'model' => 'Tucson', 'year' => 2021, 'plate' => 'WP-CBE-7890'],
            ],
        ],
        [
            'id' => 6,
            'name' => 'Kavinda Jayasuriya',
            'email' => 'kavinda.j@example.com',
            'phone' => '+94 71 333 4455',
            'role' => 'vehicle_owner',
            'status' => 'pending',
            'city' => 'Kurunegala',
            'address' => '54 Dambulla Road, Kurunegala',
            'vehicles_count' => 1,
            'total_bookings' => 0,
            'last_active' => '2026-09-28 14:00',
            'created_at' => '2026-09-28',
            'vehicles' => [
                ['make' => 'Kia', 'model' => 'Sportage', 'year' => 2022, 'plate' => 'NW-CBF-2301'],
            ],
        ],
        [
            'id' => 7,
            'name' => 'Dilani Wickramasinghe',
            'email' => 'dilani.w@example.com',
            'phone' => '+94 70 888 9911',
            'role' => 'vehicle_owner',
            'status' => 'active',
            'city' => 'Matara',
            'address' => '32 Beach Road, Matara',
            'vehicles_count' => 2,
            'total_bookings' => 11,
            'last_active' => '2026-09-26 15:40',
            'created_at' => '2024-06-18',
            'vehicles' => [
                ['make' => 'Honda', 'model' => 'Grace Hybrid', 'year' => 2017, 'plate' => 'SP-CAD-4411'],
            ],
        ],
    ];

    private function loadUsers(): array
    {
        if (Storage::disk('local')->exists($this->storageKey)) {
            try {
                $content = Storage::disk('local')->get($this->storageKey);
                $decoded = json_decode($content, true);
                if (is_array($decoded) && !empty($decoded)) {
                    return $decoded;
                }
            } catch (\Throwable $e) {
                // fallback to default
            }
        }
        $this->saveUsers($this->defaultUsers);
        return $this->defaultUsers;
    }

    private function saveUsers(array $users): void
    {
        try {
            Storage::disk('local')->put($this->storageKey, json_encode(array_values($users), JSON_PRETTY_PRINT));
        } catch (\Throwable $e) {
            // Ignore error in environment with restricted storage
        }
    }

    public function getAllUsers(array $filters = []): array
    {
        $users = $this->loadUsers();

        // Filter by role
        if (!empty($filters['role']) && $filters['role'] !== 'all') {
            $users = array_filter($users, fn($u) => ($u['role'] ?? 'vehicle_owner') === $filters['role']);
        }

        // Filter by status
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $users = array_filter($users, fn($u) => ($u['status'] ?? 'active') === $filters['status']);
        }

        // Filter by search string
        if (!empty($filters['search'])) {
            $term = strtolower(trim($filters['search']));
            $users = array_filter($users, function ($u) use ($term) {
                return str_contains(strtolower($u['name'] ?? ''), $term) ||
                       str_contains(strtolower($u['email'] ?? ''), $term) ||
                       str_contains(strtolower($u['phone'] ?? ''), $term) ||
                       str_contains(strtolower($u['city'] ?? ''), $term);
            });
        }

        return array_values($users);
    }

    public function getUserById(string $id): ?array
    {
        $users = $this->loadUsers();
        foreach ($users as $u) {
            if ((string)$u['id'] === (string)$id) {
                return $u;
            }
        }
        return null;
    }

    public function updateUser(string $id, array $data): ?array
    {
        $users = $this->loadUsers();
        $updatedUser = null;
        foreach ($users as &$u) {
            if ((string)$u['id'] === (string)$id) {
                $u = array_merge($u, $data);
                $updatedUser = $u;
                break;
            }
        }
        if ($updatedUser) {
            $this->saveUsers($users);
        }
        return $updatedUser;
    }

    public function updateStatus(string $id, string $status): ?array
    {
        return $this->updateUser($id, ['status' => $status]);
    }

    public function deleteUser(string $id): bool
    {
        $users = $this->loadUsers();
        $initialCount = count($users);
        $users = array_filter($users, fn($u) => (string)$u['id'] !== (string)$id);

        if (count($users) !== $initialCount) {
            $this->saveUsers($users);
            return true;
        }
        return false;
    }

    public function deactivateUser(string $id): bool
    {
        return (bool)$this->updateStatus($id, 'inactive');
    }

    public function activateUser(string $id): bool
    {
        return (bool)$this->updateStatus($id, 'active');
    }
}
