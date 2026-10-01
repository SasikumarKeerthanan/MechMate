<?php

namespace App\Services\Contracts;

interface ServiceCentreServiceInterface
{
    public function getProfile(string $garageId): ?array;
    public function updateProfile(string $garageId, array $data): ?array;
    public function getSupportedVehicles(string $garageId): array;
    public function updateSupportedVehicles(string $garageId, array $vehicleTypes): array;
    public function getServices(string $garageId): array;
    public function addService(string $garageId, array $data): array;
    public function updateService(string $serviceId, array $data): ?array;
    public function deleteService(string $serviceId): bool;
    public function getInquiries(string $garageId): array;
    public function respondToInquiry(string $inquiryId, string $reply): ?array;
    public function getReviews(string $garageId): array;
    public function getStatistics(string $garageId): array;
}
