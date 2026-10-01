<?php

namespace App\Services\Contracts;

interface MonitoringServiceInterface
{
    public function getLiveStats(): array;
    public function getApiLogs(array $filters = []): array;
    public function getAlerts(): array;
}
