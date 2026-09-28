<?php

namespace App\Services\Mock;

use App\Services\Contracts\CategoryServiceInterface;

class MockCategoryService implements CategoryServiceInterface
{
    private array $categories = [
        ['id' => 1, 'name' => 'Engine Repair',  'icon' => '🔩', 'active' => true],
        ['id' => 2, 'name' => 'Tire & Wheel',   'icon' => '🛞', 'active' => true],
        ['id' => 3, 'name' => 'Brake Service',  'icon' => '🛑', 'active' => true],
        ['id' => 4, 'name' => 'Oil Change',     'icon' => '🛢️', 'active' => true],
        ['id' => 5, 'name' => 'AC Service',     'icon' => '❄️', 'active' => false],
        ['id' => 6, 'name' => 'Body & Paint',   'icon' => '🎨', 'active' => true],
    ];

    public function getAll(): array
    {
        return $this->categories;
    }

    public function create(array $data): array
    {
        return array_merge(['id' => rand(100, 999), 'active' => true], $data);
    }

    public function update(string $id, array $data): array
    {
        $cat = collect($this->categories)->firstWhere('id', (int) $id) ?? [];
        return array_merge($cat, $data);
    }

    public function delete(string $id): bool
    {
        return true;
    }
}
