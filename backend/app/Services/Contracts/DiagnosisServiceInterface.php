<?php

namespace App\Services\Contracts;

interface DiagnosisServiceInterface
{
    public function getAllEntries(array $filters = []): array;
    public function getEntryById(string $id): ?array;
    public function createEntry(array $data): array;
    public function updateEntry(string $id, array $data): ?array;
    public function deleteEntry(string $id): bool;
    public function getDiagnosisHistory(): array;
}
