<?php

namespace App\Services\Contracts;

interface ReportServiceInterface
{
    public function getSummary(): array;
    public function getExportData(string $format = 'csv'): array;
}
