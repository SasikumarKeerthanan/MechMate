<?php

namespace App\Services\Contracts;

interface ProviderServiceInterface
{
    public function getAllProviders(array $filters = []): array;
    public function getPendingProviders(): array;
    public function getProviderById(string $id): ?array;
    public function approveProvider(string $id): ?array;
    public function rejectProvider(string $id, ?string $reason = null): ?array;
    public function updateProviderStatus(string $id, string $status): ?array;
    public function getEmailVerificationStats(): array;
}
