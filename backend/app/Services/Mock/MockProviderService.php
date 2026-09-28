<?php

namespace App\Services\Mock;

use App\Services\Contracts\ProviderServiceInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class MockProviderService implements ProviderServiceInterface
{
    private string $storageKey = 'mock_providers.json';

    private array $defaultProviders = [
        // ── Pending Approvals ──────────────────────────────────────────
        [
            'id' => 101,
            'type' => 'service_center',
            'business_name' => 'AutoFix Lanka Garages (Pvt) Ltd',
            'owner_name' => 'Sunil Weerakkody',
            'email' => 'autofix@lk.com',
            'phone' => '+94 11 289 4500',
            'city' => 'Colombo',
            'address' => '324 Baseline Road, Dematagoda, Colombo 09',
            'status' => 'pending',
            'email_verified' => false,
            'email_verification_status' => 'pending',
            'specialty' => 'Hybrid & EV Maintenance, Engine Overhaul',
            'license_number' => 'BR-PV-2023-9182',
            'tax_id' => 'TIN-10928374',
            'created_at' => '2026-09-27',
            'rejection_reason' => null,
            'verification_code_dispatched_at' => null,
            'documents' => [
                ['name' => 'Business Registration (BR)', 'file' => 'BR_AutoFix_2023.pdf', 'size' => '1.8 MB', 'verified' => true],
                ['name' => 'Tax Identification Certificate (TIN)', 'file' => 'TIN_AutoFix_Lanka.pdf', 'size' => '820 KB', 'verified' => true],
                ['name' => 'Garage Environmental & Safety Permit', 'file' => 'Safety_Permit_2026.pdf', 'size' => '2.3 MB', 'verified' => true],
            ],
        ],
        [
            'id' => 102,
            'type' => 'shop',
            'business_name' => 'Lanka Spares Direct',
            'owner_name' => 'Janaka Bandara',
            'email' => 'janaka@lankaspares.lk',
            'phone' => '+94 81 223 9081',
            'city' => 'Kandy',
            'address' => '45 Katugastota Road, Kandy',
            'status' => 'pending',
            'email_verified' => false,
            'email_verification_status' => 'pending',
            'specialty' => 'Japanese Genuine Parts (Toyota, Honda, Nissan)',
            'license_number' => 'BR-SP-2024-4410',
            'tax_id' => 'TIN-40918273',
            'created_at' => '2026-09-28',
            'rejection_reason' => null,
            'verification_code_dispatched_at' => null,
            'documents' => [
                ['name' => 'Business Registration (BR)', 'file' => 'BR_Lanka_Spares.pdf', 'size' => '1.2 MB', 'verified' => true],
                ['name' => 'Authorized Distributor Certificate', 'file' => 'Toyota_Distributor_Cert.pdf', 'size' => '950 KB', 'verified' => true],
            ],
        ],
        [
            'id' => 103,
            'type' => 'mechanic',
            'business_name' => 'Ruwan Mobile Diagnostics',
            'owner_name' => 'Ruwan Jayasinghe',
            'email' => 'ruwan.mech@gmail.com',
            'phone' => '+94 77 555 8921',
            'city' => 'Galle',
            'address' => '78/A Matara Road, Galle',
            'status' => 'pending',
            'email_verified' => false,
            'email_verification_status' => 'pending',
            'specialty' => 'Auto Electrical, Computer Scanning, Roadside Help',
            'license_number' => 'NIC-851940123V / NVQ-L4',
            'tax_id' => 'TIN-99201948',
            'created_at' => '2026-09-28',
            'rejection_reason' => null,
            'verification_code_dispatched_at' => null,
            'documents' => [
                ['name' => 'NVQ Level 4 Automobile Technician', 'file' => 'NVQ4_Certificate_Ruwan.pdf', 'size' => '2.1 MB', 'verified' => true],
                ['name' => 'National Identity Card (NIC)', 'file' => 'NIC_Scan_Ruwan.pdf', 'size' => '740 KB', 'verified' => true],
                ['name' => 'Police Clearance Report', 'file' => 'Police_Report_2026.pdf', 'size' => '1.1 MB', 'verified' => true],
            ],
        ],

        // ── Spare Part Shops ───────────────────────────────────────────
        [
            'id' => 201,
            'type' => 'shop',
            'business_name' => 'SpeedServe Auto Parts',
            'owner_name' => 'Mahesh Fonseka',
            'email' => 'sales@speedserve.lk',
            'phone' => '+94 11 432 9988',
            'city' => 'Colombo',
            'address' => '112 Panchikawatta Road, Colombo 10',
            'status' => 'approved',
            'email_verified' => true,
            'email_verification_status' => 'verified',
            'specialty' => 'Brake Systems, Suspension, Engine Filters',
            'license_number' => 'BR-CO-2021-3921',
            'tax_id' => 'TIN-20918239',
            'created_at' => '2024-03-12',
            'rejection_reason' => null,
            'verification_code_dispatched_at' => '2024-03-12 10:14:00',
            'documents' => [
                ['name' => 'Business Registration (BR)', 'file' => 'BR_SpeedServe.pdf', 'size' => '1.5 MB', 'verified' => true],
            ],
        ],
        [
            'id' => 202,
            'type' => 'shop',
            'business_name' => 'Apex Auto Spares & Accessories',
            'owner_name' => 'Kasun Abeyratne',
            'email' => 'kasun@apexauto.lk',
            'phone' => '+94 31 228 1144',
            'city' => 'Negombo',
            'address' => '90 Main Street, Negombo',
            'status' => 'approved',
            'email_verified' => false,
            'email_verification_status' => 'pending',
            'specialty' => 'European Car Parts (BMW, Benz, Audi)',
            'license_number' => 'BR-NG-2022-7712',
            'tax_id' => 'TIN-88291024',
            'created_at' => '2024-07-19',
            'rejection_reason' => null,
            'verification_code_dispatched_at' => '2024-07-19 14:05:00',
            'documents' => [
                ['name' => 'Business Registration (BR)', 'file' => 'BR_Apex_Auto.pdf', 'size' => '1.3 MB', 'verified' => true],
            ],
        ],

        // ── Service Centres / Garages ──────────────────────────────────
        [
            'id' => 301,
            'type' => 'service_center',
            'business_name' => 'Precision Tune Station',
            'owner_name' => 'Chathura Fernando',
            'email' => 'service@precisiontune.lk',
            'phone' => '+94 11 254 7711',
            'city' => 'Colombo',
            'address' => '500 High Level Road, Nugegoda',
            'status' => 'approved',
            'email_verified' => true,
            'email_verification_status' => 'verified',
            'specialty' => 'Periodic Lubrication, Wheel Alignment, AC Service',
            'license_number' => 'BR-PV-2020-1129',
            'tax_id' => 'TIN-33910294',
            'created_at' => '2024-01-20',
            'rejection_reason' => null,
            'verification_code_dispatched_at' => '2024-01-20 09:30:00',
            'documents' => [
                ['name' => 'Business Registration (BR)', 'file' => 'BR_PrecisionTune.pdf', 'size' => '2.0 MB', 'verified' => true],
            ],
        ],
        [
            'id' => 302,
            'type' => 'service_center',
            'business_name' => 'City Motors Garage',
            'owner_name' => 'Nuwan Dissanayake',
            'email' => 'nuwan@citymotors.lk',
            'phone' => '+94 81 493 2200',
            'city' => 'Kandy',
            'address' => '190 William Gopallawa Mawatha, Kandy',
            'status' => 'suspended',
            'email_verified' => true,
            'email_verification_status' => 'verified',
            'specialty' => 'Body Wash, Tinkering, Painting & Collision Repair',
            'license_number' => 'BR-KD-2019-8812',
            'tax_id' => 'TIN-55192837',
            'created_at' => '2024-02-14',
            'rejection_reason' => 'Multiple customer complaints under investigation',
            'verification_code_dispatched_at' => '2024-02-14 11:20:00',
            'documents' => [
                ['name' => 'Business Registration (BR)', 'file' => 'BR_CityMotors.pdf', 'size' => '1.7 MB', 'verified' => true],
            ],
        ],

        // ── Mechanics ──────────────────────────────────────────────────
        [
            'id' => 401,
            'type' => 'mechanic',
            'business_name' => 'Kamal Pro Mechanics',
            'owner_name' => 'Kamal Perera',
            'email' => 'kamal.pro@gmail.com',
            'phone' => '+94 77 444 3322',
            'city' => 'Colombo',
            'address' => '22 Nawala Road, Rajagiriya',
            'status' => 'approved',
            'email_verified' => true,
            'email_verification_status' => 'verified',
            'specialty' => 'Automatic Transmission & Gearbox Specialist',
            'license_number' => 'NIC-792834190V / NVQ-L5',
            'tax_id' => 'TIN-77192834',
            'created_at' => '2024-05-10',
            'rejection_reason' => null,
            'verification_code_dispatched_at' => '2024-05-10 12:00:00',
            'documents' => [
                ['name' => 'NVQ Level 5 Diploma Certificate', 'file' => 'NVQ5_Kamal.pdf', 'size' => '2.5 MB', 'verified' => true],
            ],
        ],
        [
            'id' => 402,
            'type' => 'mechanic',
            'business_name' => 'Bandara Quick Fix',
            'owner_name' => 'Saman Bandara',
            'email' => 'saman.bandara@gmail.com',
            'phone' => '+94 71 888 2211',
            'city' => 'Kurunegala',
            'address' => '11 Puttalam Road, Kurunegala',
            'status' => 'approved',
            'email_verified' => false,
            'email_verification_status' => 'pending',
            'specialty' => 'Diesel Injector & Fuel Pump Tuning',
            'license_number' => 'NIC-831928445V / NVQ-L4',
            'tax_id' => 'TIN-66291039',
            'created_at' => '2024-06-25',
            'rejection_reason' => null,
            'verification_code_dispatched_at' => '2024-06-25 15:45:00',
            'documents' => [
                ['name' => 'NVQ Level 4 Certificate', 'file' => 'NVQ4_Saman.pdf', 'size' => '1.9 MB', 'verified' => true],
            ],
        ],
    ];

    private function loadProviders(): array
    {
        if (Storage::disk('local')->exists($this->storageKey)) {
            try {
                $content = Storage::disk('local')->get($this->storageKey);
                $decoded = json_decode($content, true);
                if (is_array($decoded) && !empty($decoded)) {
                    return $decoded;
                }
            } catch (\Throwable $e) {
                // fallback to default
            }
        }
        $this->saveProviders($this->defaultProviders);
        return $this->defaultProviders;
    }

    private function saveProviders(array $providers): void
    {
        try {
            Storage::disk('local')->put($this->storageKey, json_encode(array_values($providers), JSON_PRETTY_PRINT));
        } catch (\Throwable $e) {
            // Ignore if restricted
        }
    }

    public function getAllProviders(array $filters = []): array
    {
        $providers = $this->loadProviders();

        // Filter by type: shop, service_center, mechanic
        if (!empty($filters['type']) && $filters['type'] !== 'all') {
            $providers = array_filter($providers, fn($p) => ($p['type'] ?? '') === $filters['type']);
        }

        // Filter by status: pending, approved, rejected, suspended, active
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $status = $filters['status'];
            $providers = array_filter($providers, function ($p) use ($status) {
                if ($status === 'active') {
                    return in_array($p['status'], ['approved', 'active']);
                }
                return ($p['status'] ?? '') === $status;
            });
        }

        // Filter by email verification status: verified, pending
        if (!empty($filters['email_verification_status']) && $filters['email_verification_status'] !== 'all') {
            $providers = array_filter($providers, fn($p) => ($p['email_verification_status'] ?? 'pending') === $filters['email_verification_status']);
        }

        // Search term
        if (!empty($filters['search'])) {
            $term = strtolower(trim($filters['search']));
            $providers = array_filter($providers, function ($p) use ($term) {
                return str_contains(strtolower($p['business_name'] ?? ''), $term) ||
                       str_contains(strtolower($p['owner_name'] ?? ''), $term) ||
                       str_contains(strtolower($p['email'] ?? ''), $term) ||
                       str_contains(strtolower($p['phone'] ?? ''), $term) ||
                       str_contains(strtolower($p['city'] ?? ''), $term) ||
                       str_contains(strtolower($p['specialty'] ?? ''), $term);
            });
        }

        return array_values($providers);
    }

    public function getPendingProviders(): array
    {
        $providers = $this->loadProviders();
        $pending = array_filter($providers, fn($p) => ($p['status'] ?? '') === 'pending');
        return array_values($pending);
    }

    public function getProviderById(string $id): ?array
    {
        $providers = $this->loadProviders();
        foreach ($providers as $p) {
            if ((string)$p['id'] === (string)$id) {
                return $p;
            }
        }
        return null;
    }

    public function approveProvider(string $id): ?array
    {
        $providers = $this->loadProviders();
        $updated = null;

        foreach ($providers as &$p) {
            if ((string)$p['id'] === (string)$id) {
                $p['status'] = 'approved';
                $p['verification_code_dispatched_at'] = now()->toIso8601String();
                // Ensure email verification status is set
                if (empty($p['email_verification_status'])) {
                    $p['email_verification_status'] = 'pending';
                    $p['email_verified'] = false;
                }
                $p['rejection_reason'] = null;

                // Log the email verification code dispatch stub
                $verificationCode = rand(100000, 999999);
                Log::info("[STUB EMAIL DISPATCH] Verification code {$verificationCode} dispatched to approved provider '{$p['business_name']}' ({$p['email']}) at {$p['verification_code_dispatched_at']}");

                $updated = $p;
                break;
            }
        }

        if ($updated) {
            $this->saveProviders($providers);
        }

        return $updated;
    }

    public function rejectProvider(string $id, ?string $reason = null): ?array
    {
        $providers = $this->loadProviders();
        $updated = null;

        foreach ($providers as &$p) {
            if ((string)$p['id'] === (string)$id) {
                $p['status'] = 'rejected';
                $p['rejection_reason'] = $reason ?? 'Credentials and documentation could not be verified.';
                Log::warning("[PROVIDER REGISTRATION REJECTED] Provider ID {$id} ('{$p['business_name']}') rejected by administrator. Reason: {$p['rejection_reason']}");
                $updated = $p;
                break;
            }
        }

        if ($updated) {
            $this->saveProviders($providers);
        }

        return $updated;
    }

    public function updateProviderStatus(string $id, string $status): ?array
    {
        $providers = $this->loadProviders();
        $updated = null;

        foreach ($providers as &$p) {
            if ((string)$p['id'] === (string)$id) {
                $p['status'] = $status;
                $updated = $p;
                break;
            }
        }

        if ($updated) {
            $this->saveProviders($providers);
        }

        return $updated;
    }

    public function getEmailVerificationStats(): array
    {
        $providers = $this->loadProviders();
        
        // Count only approved or active providers
        $approvedProviders = array_filter($providers, fn($p) => in_array($p['status'], ['approved', 'active', 'suspended']));
        $totalApproved = count($approvedProviders);

        $verified = 0;
        $pending = 0;
        $byType = [
            'shop' => ['total' => 0, 'verified' => 0, 'pending' => 0],
            'service_center' => ['total' => 0, 'verified' => 0, 'pending' => 0],
            'mechanic' => ['total' => 0, 'verified' => 0, 'pending' => 0],
        ];

        foreach ($approvedProviders as $p) {
            $isVerified = ($p['email_verification_status'] ?? '') === 'verified' || ($p['email_verified'] ?? false);
            $type = $p['type'] ?? 'shop';

            if (!isset($byType[$type])) {
                $byType[$type] = ['total' => 0, 'verified' => 0, 'pending' => 0];
            }

            $byType[$type]['total']++;

            if ($isVerified) {
                $verified++;
                $byType[$type]['verified']++;
            } else {
                $pending++;
                $byType[$type]['pending']++;
            }
        }

        $rate = $totalApproved > 0 ? round(($verified / $totalApproved) * 100, 1) : 0;

        return [
            'total_approved' => $totalApproved,
            'verified_count' => $verified,
            'pending_verification_count' => $pending,
            'verification_rate' => $rate,
            'by_type' => $byType,
        ];
    }
}
