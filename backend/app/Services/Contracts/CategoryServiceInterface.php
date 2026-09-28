<?php

namespace App\Services\Contracts;

interface CategoryServiceInterface
{
    public function getAll(): array;

    // ── Spare-Part Categories ───────────────────────────────────────────────
    public function getPartCategories(): array;
    public function createPartCategory(array $data): array;
    public function updatePartCategory(string $id, array $data): ?array;
    public function deletePartCategory(string $id): bool;

    // ── Garage Service Categories ───────────────────────────────────────────
    public function getServiceCategories(): array;
    public function createServiceCategory(array $data): array;
    public function updateServiceCategory(string $id, array $data): ?array;
    public function deleteServiceCategory(string $id): bool;
}
