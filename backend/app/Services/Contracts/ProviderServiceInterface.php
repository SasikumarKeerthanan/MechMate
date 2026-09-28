<?php

namespace App\Services\Contracts;

interface ProviderServiceInterface
{
    public function getAllProviders(array $filters = []): array;
    public function getPendingProviders(): array;
    public function approveProvider(string $id): bool;
    public function rejectProvider(string $id, ?string $reason = null): bool;
}
