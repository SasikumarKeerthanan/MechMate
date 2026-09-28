<?php

namespace App\Services\Mock;

use App\Services\Contracts\CategoryServiceInterface;
use Illuminate\Support\Facades\Storage;

class MockCategoryService implements CategoryServiceInterface
{
    private string $storageKey = 'mock_categories.json';

    private array $defaultData = [
        'parts' => [
            [
                'id' => 1,
                'name' => 'Engine Components',
                'icon' => '🔩',
                'item_count' => 342,
                'description' => 'Pistons, camshafts, crankshafts, cylinder heads, valves, and engine gaskets.',
                'active' => true,
                'created_at' => '2024-01-15',
            ],
            [
                'id' => 2,
                'name' => 'Brakes & Hydraulics',
                'icon' => '🛑',
                'item_count' => 185,
                'description' => 'Brake pads, ventilated rotors, master cylinders, ABS sensors, and calipers.',
                'active' => true,
                'created_at' => '2024-01-18',
            ],
            [
                'id' => 3,
                'name' => 'Suspension & Steering',
                'icon' => '🛞',
                'item_count' => 210,
                'description' => 'Gas shock absorbers, coil springs, lower control arms, sway bars, and tie rods.',
                'active' => true,
                'created_at' => '2024-02-02',
            ],
            [
                'id' => 4,
                'name' => 'Electrical & Sensors',
                'icon' => '⚡',
                'item_count' => 156,
                'description' => 'High-output alternators, starter motors, O2 sensors, ignition coils, and ECU modules.',
                'active' => true,
                'created_at' => '2024-02-10',
            ],
            [
                'id' => 5,
                'name' => 'Transmission & Clutch',
                'icon' => '⚙️',
                'item_count' => 98,
                'description' => 'Clutch kits, torque converters, gearbox gearsets, CV axles, and differential rings.',
                'active' => true,
                'created_at' => '2024-03-01',
            ],
            [
                'id' => 6,
                'name' => 'Cooling & Air Conditioning',
                'icon' => '❄️',
                'item_count' => 112,
                'description' => 'Aluminum radiators, water pumps, cooling fans, thermostats, and AC compressors.',
                'active' => true,
                'created_at' => '2024-03-12',
            ],
            [
                'id' => 7,
                'name' => 'Exhaust & Emission',
                'icon' => '💨',
                'item_count' => 64,
                'description' => 'Catalytic converters, oxygen sensors, mufflers, exhaust headers, and EGR valves.',
                'active' => true,
                'created_at' => '2024-04-05',
            ],
        ],
        'services' => [
            [
                'id' => 1,
                'name' => 'Periodic Lubrication & Oil Change',
                'icon' => '🛢️',
                'estimated_time' => '45 mins',
                'popular' => true,
                'description' => 'Full synthetic engine oil replacement, oil filter change, and 25-point safety inspection.',
                'active' => true,
                'created_at' => '2024-01-10',
            ],
            [
                'id' => 2,
                'name' => 'Engine Overhaul & Diagnostics',
                'icon' => '🩺',
                'estimated_time' => '2-3 days',
                'popular' => true,
                'description' => 'Full diagnostic computer scan, cylinder compression test, head gasket repair, and timing belt replacement.',
                'active' => true,
                'created_at' => '2024-01-15',
            ],
            [
                'id' => 3,
                'name' => 'Brake Service & Pad Replacement',
                'icon' => '🛑',
                'estimated_time' => '1.5 hrs',
                'popular' => true,
                'description' => 'Front and rear brake pad replacement, rotor surface skimming, and hydraulic line bleeding.',
                'active' => true,
                'created_at' => '2024-02-01',
            ],
            [
                'id' => 4,
                'name' => 'Wheel Alignment & Balancing',
                'icon' => '⚖️',
                'estimated_time' => '1 hr',
                'popular' => false,
                'description' => 'Precision 3D computerized camera alignment, wheel balancing, and tire rotation check.',
                'active' => true,
                'created_at' => '2024-02-14',
            ],
            [
                'id' => 5,
                'name' => 'AC Gas Recharge & Leak Repair',
                'icon' => '❄️',
                'estimated_time' => '2 hrs',
                'popular' => false,
                'description' => 'Refrigerant recovery, vacuum pressure decay test, evaporator cleaning, and fresh gas recharge.',
                'active' => true,
                'created_at' => '2024-03-05',
            ],
            [
                'id' => 6,
                'name' => 'Transmission Fluid Flush & Repair',
                'icon' => '⚙️',
                'estimated_time' => '3 hrs',
                'popular' => false,
                'description' => 'Automatic transmission fluid exchange, filter replacement, and electronic solenoids inspection.',
                'active' => true,
                'created_at' => '2024-03-20',
            ],
        ],
    ];

    private function loadData(): array
    {
        if (Storage::disk('local')->exists($this->storageKey)) {
            try {
                $content = Storage::disk('local')->get($this->storageKey);
                $decoded = json_decode($content, true);
                if (is_array($decoded) && isset($decoded['parts']) && isset($decoded['services'])) {
                    return $decoded;
                }
            } catch (\Throwable $e) {
                // fallback
            }
        }
        $this->saveData($this->defaultData);
        return $this->defaultData;
    }

    private function saveData(array $data): void
    {
        try {
            Storage::disk('local')->put($this->storageKey, json_encode($data, JSON_PRETTY_PRINT));
        } catch (\Throwable $e) {
            // Ignore if restricted
        }
    }

    public function getAll(): array
    {
        return $this->getServiceCategories();
    }

    // ── Spare-Part Categories ───────────────────────────────────────────────
    public function getPartCategories(): array
    {
        $data = $this->loadData();
        return array_values($data['parts'] ?? []);
    }

    public function createPartCategory(array $data): array
    {
        $all = $this->loadData();
        $newId = count($all['parts']) > 0 ? max(array_column($all['parts'], 'id')) + 1 : 1;

        $newCategory = [
            'id' => $newId,
            'name' => $data['name'] ?? 'New Category',
            'icon' => $data['icon'] ?? '📦',
            'item_count' => (int) ($data['item_count'] ?? 0),
            'description' => $data['description'] ?? '',
            'active' => isset($data['active']) ? (bool) $data['active'] : true,
            'created_at' => now()->toDateString(),
        ];

        $all['parts'][] = $newCategory;
        $this->saveData($all);

        return $newCategory;
    }

    public function updatePartCategory(string $id, array $data): ?array
    {
        $all = $this->loadData();
        $updated = null;

        foreach ($all['parts'] as &$cat) {
            if ((string) $cat['id'] === (string) $id) {
                $cat = array_merge($cat, $data);
                $updated = $cat;
                break;
            }
        }

        if ($updated) {
            $this->saveData($all);
        }

        return $updated;
    }

    public function deletePartCategory(string $id): bool
    {
        $all = $this->loadData();
        $initial = count($all['parts']);
        $all['parts'] = array_values(array_filter($all['parts'], fn($c) => (string) $c['id'] !== (string) $id));

        if (count($all['parts']) !== $initial) {
            $this->saveData($all);
            return true;
        }

        return false;
    }

    // ── Garage Service Categories ───────────────────────────────────────────
    public function getServiceCategories(): array
    {
        $data = $this->loadData();
        return array_values($data['services'] ?? []);
    }

    public function createServiceCategory(array $data): array
    {
        $all = $this->loadData();
        $newId = count($all['services']) > 0 ? max(array_column($all['services'], 'id')) + 1 : 1;

        $newCategory = [
            'id' => $newId,
            'name' => $data['name'] ?? 'New Service',
            'icon' => $data['icon'] ?? '🔧',
            'estimated_time' => $data['estimated_time'] ?? '1 hr',
            'popular' => isset($data['popular']) ? (bool) $data['popular'] : false,
            'description' => $data['description'] ?? '',
            'active' => isset($data['active']) ? (bool) $data['active'] : true,
            'created_at' => now()->toDateString(),
        ];

        $all['services'][] = $newCategory;
        $this->saveData($all);

        return $newCategory;
    }

    public function updateServiceCategory(string $id, array $data): ?array
    {
        $all = $this->loadData();
        $updated = null;

        foreach ($all['services'] as &$cat) {
            if ((string) $cat['id'] === (string) $id) {
                $cat = array_merge($cat, $data);
                $updated = $cat;
                break;
            }
        }

        if ($updated) {
            $this->saveData($all);
        }

        return $updated;
    }

    public function deleteServiceCategory(string $id): bool
    {
        $all = $this->loadData();
        $initial = count($all['services']);
        $all['services'] = array_values(array_filter($all['services'], fn($c) => (string) $c['id'] !== (string) $id));

        if (count($all['services']) !== $initial) {
            $this->saveData($all);
            return true;
        }

        return false;
    }
}
