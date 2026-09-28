<?php

namespace App\Services\Contracts;

interface CategoryServiceInterface
{
    public function getAll(): array;
    public function create(array $data): array;
    public function update(string $id, array $data): array;
    public function delete(string $id): bool;
}
