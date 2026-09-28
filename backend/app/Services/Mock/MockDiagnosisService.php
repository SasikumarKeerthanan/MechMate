<?php

namespace App\Services\Mock;

use App\Services\Contracts\DiagnosisServiceInterface;
use Illuminate\Support\Facades\Storage;

class MockDiagnosisService implements DiagnosisServiceInterface
{
    private string $storageKey = 'mock_diagnosis.json';

    private array $defaultRules = [
        [
            'id' => 1,
            'symptom' => 'High-pitched squealing or grinding noise when applying brakes',
            'possible_fault' => 'Worn brake friction pads or grooved rotor discs',
            'cause' => 'Brake pads worn down past wear indicator metal shim contact threshold.',
            'solution' => 'Inspect brake rotor thickness. Replace front/rear brake pad sets and machine or replace rotors.',
            'severity' => 'High',
            'category' => 'Brakes & Hydraulics',
            'created_at' => '2024-02-10',
        ],
        [
            'id' => 2,
            'symptom' => 'Check engine light blinking with severe engine vibration & lack of power',
            'possible_fault' => 'Severe engine misfire in one or more cylinders',
            'cause' => 'Failing ignition coil, fouled spark plug, or clogged fuel injector allowing unburnt fuel into catalytic converter.',
            'solution' => 'Run OBD-II scan to locate misfiring cylinder. Replace affected ignition coil pack and inspect spark plugs.',
            'severity' => 'Critical',
            'category' => 'Engine Components',
            'created_at' => '2024-02-15',
        ],
        [
            'id' => 3,
            'symptom' => 'Temperature gauge in red zone and steam rising from under the hood',
            'possible_fault' => 'Engine overheating due to cooling system failure',
            'cause' => 'Burst radiator hose, failed electric radiator fan, or seized water pump causing total coolant loss.',
            'solution' => 'Do not open radiator cap while hot! Tow vehicle, pressure test cooling system, and replace leaking components.',
            'severity' => 'Critical',
            'category' => 'Cooling & Air Conditioning',
            'created_at' => '2024-03-01',
        ],
        [
            'id' => 4,
            'symptom' => 'Vehicle steering pulls hard to one side on flat straight road',
            'possible_fault' => 'Uneven wheel alignment or worn steering tie rod end',
            'cause' => 'Camber/toe angle deviation from hitting potholes or bent tie rod ends.',
            'solution' => 'Perform 4-wheel computerized laser alignment and inspect steering rack bushings.',
            'severity' => 'Medium',
            'category' => 'Suspension & Steering',
            'created_at' => '2024-03-14',
        ],
        [
            'id' => 5,
            'symptom' => 'Battery warning light illuminated on dashboard while driving',
            'possible_fault' => 'Alternator charging system failure',
            'cause' => 'Worn alternator carbon brushes, slipping serpentine belt, or internal voltage regulator malfunction.',
            'solution' => 'Test alternator charging voltage (should be 13.8V - 14.4V). Replace alternator or tension serpentine belt.',
            'severity' => 'High',
            'category' => 'Electrical & Sensors',
            'created_at' => '2024-04-02',
        ],
        [
            'id' => 6,
            'symptom' => 'Clunking or rattling noise underneath vehicle over bumps',
            'possible_fault' => 'Worn stabilizer sway bar links or lower ball joints',
            'cause' => 'Degraded rubber bushings and ball joint grease boot tear leading to excessive play.',
            'solution' => 'Replace sway bar end links and lower suspension control arm ball joints.',
            'severity' => 'Medium',
            'category' => 'Suspension & Steering',
            'created_at' => '2024-04-20',
        ],
        [
            'id' => 7,
            'symptom' => 'Delayed engagement or slipping gears when accelerating from stop',
            'possible_fault' => 'Low transmission fluid or worn clutch friction plates',
            'cause' => 'Degraded transmission fluid pressure, clogged valve body filter, or internal clutch slippage.',
            'solution' => 'Check ATF fluid level and condition. Perform transmission fluid service or inspect clutch pack.',
            'severity' => 'High',
            'category' => 'Transmission & Clutch',
            'created_at' => '2024-05-11',
        ],
        [
            'id' => 8,
            'symptom' => 'AC blowing warm air when idling or in heavy traffic',
            'possible_fault' => 'Low refrigerant gas or failing AC condenser fan',
            'cause' => 'Slow refrigerant pinhole leak in condenser core or weak electric condenser fan motor.',
            'solution' => 'Perform UV dye leak test, repair condenser leak, and recharge R134a refrigerant to spec.',
            'severity' => 'Low',
            'category' => 'Cooling & Air Conditioning',
            'created_at' => '2024-05-28',
        ],
    ];

    private array $defaultHistory = [
        [
            'id' => 501,
            'query' => 'Car jerks violently when accelerating past 40 km/h and engine light flashes',
            'user' => 'Ashan Perera',
            'vehicle' => '2018 Toyota Corolla Axio',
            'detected_fault' => 'Cylinder 2 Ignition Coil Failure (OBD Code P0302)',
            'severity' => 'Critical',
            'status' => 'Completed (Gemini Pro)',
            'created_at' => '12 mins ago',
        ],
        [
            'id' => 502,
            'query' => 'Loud squeaking noise every time I press the brake pedal at slow speed',
            'user' => 'Nimal Silva',
            'vehicle' => '2017 Nissan X-Trail Hybrid',
            'detected_fault' => 'Front Brake Pad Wear Threshold Exceeded',
            'severity' => 'High',
            'status' => 'Rule Matched',
            'created_at' => '45 mins ago',
        ],
        [
            'id' => 503,
            'query' => 'Car drifts to the left side when letting go of steering wheel on highway',
            'user' => 'Kumari Fernando',
            'vehicle' => '2019 Suzuki Wagon R',
            'detected_fault' => 'Front Left Toe Alignment Deviation',
            'severity' => 'Medium',
            'status' => 'Completed (Gemini Pro)',
            'created_at' => '2 hours ago',
        ],
        [
            'id' => 504,
            'query' => 'Air conditioning is not cooling well when stopped at traffic lights',
            'user' => 'Priya Karunarathna',
            'vehicle' => '2021 Hyundai Tucson',
            'detected_fault' => 'Auxiliary Condenser Fan Speed Defect',
            'severity' => 'Low',
            'status' => 'Rule Matched',
            'created_at' => '5 hours ago',
        ],
        [
            'id' => 505,
            'query' => 'Rattling metal sound from underneath when driving over rough road surfaces',
            'user' => 'Rohan Mendis',
            'vehicle' => '2020 Mitsubishi Montero Sport',
            'detected_fault' => 'Stabilizer Sway Bar Bushing Deterioration',
            'severity' => 'Medium',
            'status' => 'Completed (Gemini Pro)',
            'created_at' => 'Yesterday',
        ],
    ];

    private function loadData(): array
    {
        if (Storage::disk('local')->exists($this->storageKey)) {
            try {
                $content = Storage::disk('local')->get($this->storageKey);
                $decoded = json_decode($content, true);
                if (is_array($decoded) && isset($decoded['rules'])) {
                    return $decoded;
                }
            } catch (\Throwable $e) {
                // fallback
            }
        }

        $initial = ['rules' => $this->defaultRules, 'history' => $this->defaultHistory];
        $this->saveData($initial);
        return $initial;
    }

    private function saveData(array $data): void
    {
        try {
            Storage::disk('local')->put($this->storageKey, json_encode($data, JSON_PRETTY_PRINT));
        } catch (\Throwable $e) {
            // Ignore if restricted
        }
    }

    public function getAllEntries(array $filters = []): array
    {
        $data = $this->loadData();
        $rules = $data['rules'] ?? [];

        // Filter by severity
        if (!empty($filters['severity']) && $filters['severity'] !== 'all') {
            $rules = array_filter($rules, fn($r) => strcasecmp($r['severity'] ?? '', $filters['severity']) === 0);
        }

        // Filter by category
        if (!empty($filters['category']) && $filters['category'] !== 'all') {
            $rules = array_filter($rules, fn($r) => strcasecmp($r['category'] ?? '', $filters['category']) === 0);
        }

        // Search
        if (!empty($filters['search'])) {
            $term = strtolower(trim($filters['search']));
            $rules = array_filter($rules, function ($r) use ($term) {
                return str_contains(strtolower($r['symptom'] ?? ''), $term) ||
                       str_contains(strtolower($r['possible_fault'] ?? ''), $term) ||
                       str_contains(strtolower($r['cause'] ?? ''), $term) ||
                       str_contains(strtolower($r['solution'] ?? ''), $term) ||
                       str_contains(strtolower($r['category'] ?? ''), $term);
            });
        }

        return array_values($rules);
    }

    public function getEntryById(string $id): ?array
    {
        $data = $this->loadData();
        foreach ($data['rules'] as $r) {
            if ((string) $r['id'] === (string) $id) {
                return $r;
            }
        }
        return null;
    }

    public function createEntry(array $data): array
    {
        $all = $this->loadData();
        $newId = count($all['rules']) > 0 ? max(array_column($all['rules'], 'id')) + 1 : 1;

        $newEntry = [
            'id' => $newId,
            'symptom' => $data['symptom'] ?? '',
            'possible_fault' => $data['possible_fault'] ?? '',
            'cause' => $data['cause'] ?? '',
            'solution' => $data['solution'] ?? '',
            'severity' => in_array($data['severity'] ?? '', ['Low', 'Medium', 'High', 'Critical']) ? $data['severity'] : 'Medium',
            'category' => $data['category'] ?? 'Engine Components',
            'created_at' => now()->toDateString(),
        ];

        $all['rules'][] = $newEntry;
        $this->saveData($all);

        return $newEntry;
    }

    public function updateEntry(string $id, array $data): ?array
    {
        $all = $this->loadData();
        $updated = null;

        foreach ($all['rules'] as &$r) {
            if ((string) $r['id'] === (string) $id) {
                $r = array_merge($r, $data);
                $updated = $r;
                break;
            }
        }

        if ($updated) {
            $this->saveData($all);
        }

        return $updated;
    }

    public function deleteEntry(string $id): bool
    {
        $all = $this->loadData();
        $initial = count($all['rules']);
        $all['rules'] = array_values(array_filter($all['rules'], fn($r) => (string) $r['id'] !== (string) $id));

        if (count($all['rules']) !== $initial) {
            $this->saveData($all);
            return true;
        }

        return false;
    }

    public function getDiagnosisHistory(): array
    {
        $data = $this->loadData();
        return array_values($data['history'] ?? []);
    }
}
