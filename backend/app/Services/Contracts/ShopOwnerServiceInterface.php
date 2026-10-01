<?php

namespace App\Services\Contracts;

interface ShopOwnerServiceInterface
{
    public function getProfile(string $shopId): ?array;
    public function updateProfile(string $shopId, array $data): ?array;
    public function getSpareParts(string $shopId, array $filters = []): array;
    public function addSparePart(string $shopId, array $data): array;
    public function updateSparePart(string $partId, array $data): ?array;
    public function deleteSparePart(string $partId): bool;
    public function getStockHistory(string $partId): array;
    public function getPriceHistory(string $partId): array;
    public function getInquiries(string $shopId): array;
    public function respondToInquiry(string $inquiryId, string $response): ?array;
    public function getReviews(string $shopId): array;
    public function getStatistics(string $shopId): array;
}
