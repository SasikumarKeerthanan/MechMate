<?php

namespace App\Services\Mock;

use App\Services\Contracts\ProviderServiceInterface;

class MockProviderService implements ProviderServiceInterface
{
    private array $providers = [
        ['id' => 1, 'name' => 'AutoFix Lanka',   'email' => 'autofix@lk.com',  'status' => 'pending',  'specialty' => 'Engine Repair',  'city' => 'Colombo',   'created_at' => '2024-06-01'],
        ['id' => 2, 'name' => 'SpeedServe Co.',  'email' => 'speed@srv.com',   'status' => 'approved', 'specialty' => 'Tire & Wheel',   'city' => 'Kandy',     'created_at' => '2024-05-14'],
        ['id' => 3, 'name' => 'FastWrench Ltd.', 'email' => 'fw@ltd.com',      'status' => 'rejected', 'specialty' => 'Brake Service',  'city' => 'Galle',     'created_at' => '2024-04-20'],
        ['id' => 4, 'name' => 'QuickMech Hub',   'email' => 'qm@hub.com',      'status' => 'pending',  'specialty' => 'Oil Change',     'city' => 'Negombo',   'created_at' => '2024-07-05'],
    ];

    public function getAllProviders(array $filters = []): array
    {
        if (!empty($filters['status'])) {
            return array_values(array_filter(
                $this->providers,
                fn($p) => $p['status'] === $filters['status'],
            ));
        }
        return $this->providers;
    }

    public function getPendingProviders(): array
    {
        return $this->getAllProviders(['status' => 'pending']);
    }

    public function approveProvider(string $id): bool
    {
        return true;
    }

    public function rejectProvider(string $id, ?string $reason = null): bool
    {
        return true;
    }
}
