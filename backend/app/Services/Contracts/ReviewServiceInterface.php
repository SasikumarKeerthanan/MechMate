<?php

namespace App\Services\Contracts;

interface ReviewServiceInterface
{
    public function getAllReviews(array $filters = []): array;
    public function getFlaggedReviews(): array;
    public function updateStatus(string $id, string $status): ?array;
    public function deleteReview(string $id): bool;
}
