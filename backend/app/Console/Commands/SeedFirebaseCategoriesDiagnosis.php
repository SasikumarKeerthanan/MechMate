<?php

namespace App\Console\Commands;

use Google\Cloud\Firestore\FirestoreClient;
use Illuminate\Console\Command;
use Kreait\Firebase\Contract\Firestore;
use Throwable;

class SeedFirebaseCategoriesDiagnosis extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:seed-firebase-categories-diagnosis {--force : Overwrite or append even if collections are not empty}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed initial spare-part categories, service categories, and diagnosis reference rules into Firebase Firestore';

    private array $partCategories = [
        [
            'id' => '1',
            'name' => 'Engine Components',
            'icon' => '🔩',
            'item_count' => 342,
            'description' => 'Pistons, camshafts, crankshafts, cylinder heads, valves, and engine gaskets.',
            'active' => true,
            'created_at' => '2024-01-15',
        ],
        [
            'id' => '2',
            'name' => 'Brakes & Hydraulics',
            'icon' => '🛑',
            'item_count' => 185,
            'description' => 'Brake pads, ventilated rotors, master cylinders, ABS sensors, and calipers.',
            'active' => true,
            'created_at' => '2024-01-18',
        ],
        [
            'id' => '3',
            'name' => 'Suspension & Steering',
            'icon' => '🛞',
            'item_count' => 210,
            'description' => 'Gas shock absorbers, coil springs, lower control arms, sway bars, and tie rods.',
            'active' => true,
            'created_at' => '2024-02-02',
        ],
        [
            'id' => '4',
            'name' => 'Electrical & Sensors',
            'icon' => '⚡',
            'item_count' => 156,
            'description' => 'High-output alternators, starter motors, O2 sensors, ignition coils, and ECU modules.',
            'active' => true,
            'created_at' => '2024-02-10',
        ],
        [
            'id' => '5',
            'name' => 'Transmission & Clutch',
            'icon' => '⚙️',
            'item_count' => 98,
            'description' => 'Clutch kits, torque converters, gearbox gearsets, CV axles, and differential rings.',
            'active' => true,
            'created_at' => '2024-03-01',
        ],
        [
            'id' => '6',
            'name' => 'Cooling & AC',
            'icon' => '❄️',
            'item_count' => 112,
            'description' => 'Aluminum radiators, water pumps, cooling fans, thermostats, and AC compressors.',
            'active' => true,
            'created_at' => '2024-03-12',
        ],
        [
            'id' => '7',
            'name' => 'Exhaust & Emission',
            'icon' => '💨',
            'item_count' => 64,
            'description' => 'Catalytic converters, oxygen sensors, mufflers, exhaust headers, and EGR valves.',
            'active' => true,
            'created_at' => '2024-04-05',
        ],
        [
            'id' => '8',
            'name' => 'Filters & Maintenance',
            'icon' => '🛢️',
            'item_count' => 145,
            'description' => 'Oil filters, air filters, cabin pollen filters, fuel filters, and spark plugs.',
            'active' => true,
            'created_at' => '2024-04-12',
        ],
        [
            'id' => '9',
            'name' => 'Body & Lighting',
            'icon' => '💡',
            'item_count' => 120,
            'description' => 'Headlamp assemblies, LED bulbs, side mirrors, bumpers, wiper blades, and body panels.',
            'active' => true,
            'created_at' => '2024-04-18',
        ],
    ];

    private array $serviceCategories = [
        [
            'id' => '1',
            'name' => 'Periodic Lubrication & Oil Change',
            'icon' => '🛢️',
            'estimated_time' => '45 mins',
            'popular' => true,
            'description' => 'Full synthetic engine oil replacement, oil filter change, and 25-point safety inspection.',
            'active' => true,
            'created_at' => '2024-01-10',
        ],
        [
            'id' => '2',
            'name' => 'Engine Overhaul & Diagnostics',
            'icon' => '🩺',
            'estimated_time' => '2-3 days',
            'popular' => true,
            'description' => 'Full diagnostic computer scan, cylinder compression test, head gasket repair, and timing belt replacement.',
            'active' => true,
            'created_at' => '2024-01-15',
        ],
        [
            'id' => '3',
            'name' => 'Brake Service & Pad Replacement',
            'icon' => '🛑',
            'estimated_time' => '1.5 hrs',
            'popular' => true,
            'description' => 'Front and rear brake pad replacement, rotor surface skimming, and hydraulic line bleeding.',
            'active' => true,
            'created_at' => '2024-02-01',
        ],
        [
            'id' => '4',
            'name' => 'Wheel Alignment & Balancing',
            'icon' => '⚖️',
            'estimated_time' => '1 hr',
            'popular' => false,
            'description' => 'Precision 3D computerized camera alignment, wheel balancing, and tire rotation check.',
            'active' => true,
            'created_at' => '2024-02-14',
        ],
        [
            'id' => '5',
            'name' => 'AC Gas Recharge & Leak Repair',
            'icon' => '❄️',
            'estimated_time' => '2 hrs',
            'popular' => false,
            'description' => 'Refrigerant recovery, vacuum pressure decay test, evaporator cleaning, and fresh gas recharge.',
            'active' => true,
            'created_at' => '2024-03-05',
        ],
        [
            'id' => '6',
            'name' => 'Transmission Fluid Flush & Repair',
            'icon' => '⚙️',
            'estimated_time' => '3 hrs',
            'popular' => false,
            'description' => 'Automatic transmission fluid exchange, filter replacement, and electronic solenoids inspection.',
            'active' => true,
            'created_at' => '2024-03-20',
        ],
    ];

    private array $diagnosisRules = [
        [
            'id' => '1',
            'symptom' => 'High-pitched squealing or grinding noise when applying brakes',
            'possible_fault' => 'Worn brake friction pads or grooved rotor discs',
            'cause' => 'Brake pads worn down past wear indicator metal shim contact threshold.',
            'solution' => 'Inspect brake rotor thickness. Replace front/rear brake pad sets and machine or replace rotors.',
            'severity' => 'High',
            'category' => 'Brakes & Hydraulics',
            'created_at' => '2024-02-10',
        ],
        [
            'id' => '2',
            'symptom' => 'Check engine light blinking with severe engine vibration & lack of power',
            'possible_fault' => 'Severe engine misfire in one or more cylinders',
            'cause' => 'Failing ignition coil, fouled spark plug, or clogged fuel injector allowing unburnt fuel into catalytic converter.',
            'solution' => 'Run OBD-II scan to locate misfiring cylinder. Replace affected ignition coil pack and inspect spark plugs.',
            'severity' => 'Critical',
            'category' => 'Engine Components',
            'created_at' => '2024-02-15',
        ],
        [
            'id' => '3',
            'symptom' => 'Temperature gauge in red zone and steam rising from under the hood',
            'possible_fault' => 'Engine overheating due to cooling system failure',
            'cause' => 'Burst radiator hose, failed electric radiator fan, or seized water pump causing total coolant loss.',
            'solution' => 'Do not open radiator cap while hot! Tow vehicle, pressure test cooling system, and replace leaking components.',
            'severity' => 'Critical',
            'category' => 'Cooling & Air Conditioning',
            'created_at' => '2024-03-01',
        ],
        [
            'id' => '4',
            'symptom' => 'Vehicle steering pulls hard to one side on flat straight road',
            'possible_fault' => 'Uneven wheel alignment or worn steering tie rod end',
            'cause' => 'Camber/toe angle deviation from hitting potholes or bent tie rod ends.',
            'solution' => 'Perform 4-wheel computerized laser alignment and inspect steering rack bushings.',
            'severity' => 'Medium',
            'category' => 'Suspension & Steering',
            'created_at' => '2024-03-14',
        ],
        [
            'id' => '5',
            'symptom' => 'Battery warning light illuminated on dashboard while driving',
            'possible_fault' => 'Alternator charging system failure',
            'cause' => 'Worn alternator carbon brushes, slipping serpentine belt, or internal voltage regulator malfunction.',
            'solution' => 'Test alternator charging voltage (should be 13.8V - 14.4V). Replace alternator or tension serpentine belt.',
            'severity' => 'High',
            'category' => 'Electrical & Sensors',
            'created_at' => '2024-04-02',
        ],
        [
            'id' => '6',
            'symptom' => 'Clunking or rattling noise underneath vehicle over bumps',
            'possible_fault' => 'Worn stabilizer sway bar links or lower ball joints',
            'cause' => 'Degraded rubber bushings and ball joint grease boot tear leading to excessive play.',
            'solution' => 'Replace sway bar end links and lower suspension control arm ball joints.',
            'severity' => 'Medium',
            'category' => 'Suspension & Steering',
            'created_at' => '2024-04-20',
        ],
        [
            'id' => '7',
            'symptom' => 'Delayed engagement or slipping gears when accelerating from stop',
            'possible_fault' => 'Low transmission fluid or worn clutch friction plates',
            'cause' => 'Degraded transmission fluid pressure, clogged valve body filter, or internal clutch slippage.',
            'solution' => 'Check ATF fluid level and condition. Perform transmission fluid service or inspect clutch pack.',
            'severity' => 'High',
            'category' => 'Transmission & Clutch',
            'created_at' => '2024-05-11',
        ],
        [
            'id' => '8',
            'symptom' => 'AC blowing warm air when idling or in heavy traffic',
            'possible_fault' => 'Low refrigerant gas or failing AC condenser fan',
            'cause' => 'Slow refrigerant pinhole leak in condenser core or weak electric condenser fan motor.',
            'solution' => 'Perform UV dye leak test, repair condenser leak, and recharge R134a refrigerant to spec.',
            'severity' => 'Low',
            'category' => 'Cooling & Air Conditioning',
            'created_at' => '2024-05-28',
        ],
    ];

    private array $diagnosisLogs = [
        [
            'id' => '501',
            'query' => 'Car jerks violently when accelerating past 40 km/h and engine light flashes',
            'user' => 'Ashan Perera',
            'vehicle' => '2018 Toyota Corolla Axio',
            'detected_fault' => 'Cylinder 2 Ignition Coil Failure (OBD Code P0302)',
            'severity' => 'Critical',
            'status' => 'Completed (Gemini Pro)',
            'created_at' => '12 mins ago',
        ],
        [
            'id' => '502',
            'query' => 'Loud squeaking noise every time I press the brake pedal at slow speed',
            'user' => 'Nimal Silva',
            'vehicle' => '2017 Nissan X-Trail Hybrid',
            'detected_fault' => 'Front Brake Pad Wear Threshold Exceeded',
            'severity' => 'High',
            'status' => 'Rule Matched',
            'created_at' => '45 mins ago',
        ],
        [
            'id' => '503',
            'query' => 'Car drifts to the left side when letting go of steering wheel on highway',
            'user' => 'Kumari Fernando',
            'vehicle' => '2019 Suzuki Wagon R',
            'detected_fault' => 'Front Left Toe Alignment Deviation',
            'severity' => 'Medium',
            'status' => 'Completed (Gemini Pro)',
            'created_at' => '2 hours ago',
        ],
        [
            'id' => '504',
            'query' => 'Air conditioning is not cooling well when stopped at traffic lights',
            'user' => 'Priya Karunarathna',
            'vehicle' => '2021 Hyundai Tucson',
            'detected_fault' => 'Auxiliary Condenser Fan Speed Defect',
            'severity' => 'Low',
            'status' => 'Rule Matched',
            'created_at' => '5 hours ago',
        ],
        [
            'id' => '505',
            'query' => 'Rattling metal sound from underneath when driving over rough road surfaces',
            'user' => 'Rohan Mendis',
            'vehicle' => '2020 Mitsubishi Montero Sport',
            'detected_fault' => 'Stabilizer Sway Bar Bushing Deterioration',
            'severity' => 'Medium',
            'status' => 'Completed (Gemini Pro)',
            'created_at' => 'Yesterday',
        ],
    ];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Connecting to Firebase Firestore...');

        try {
            /** @var Firestore $firestore */
            $firestore = app(Firestore::class);
            /** @var FirestoreClient $db */
            $db = $firestore->database();

            // 1. Seed categories_parts
            $this->seedCollection(
                $db->collection('categories_parts'),
                $this->partCategories,
                'Spare-Part Categories',
                $this->option('force')
            );

            // 2. Seed categories_services
            $this->seedCollection(
                $db->collection('categories_services'),
                $this->serviceCategories,
                'Garage Service Categories',
                $this->option('force')
            );

            // 3. Seed diagnosis_reference
            $this->seedCollection(
                $db->collection('diagnosis_reference'),
                $this->diagnosisRules,
                'Diagnosis Reference Rules',
                $this->option('force')
            );

            // 4. Seed diagnosis_logs
            $this->seedCollection(
                $db->collection('diagnosis_logs'),
                $this->diagnosisLogs,
                'Diagnosis Logs / History',
                $this->option('force')
            );

            $this->newLine();
            $this->info('All categories and diagnosis data successfully processed in Firebase Firestore!');
            return Command::SUCCESS;
        } catch (Throwable $e) {
            $this->error('Failed to seed Firebase categories & diagnosis: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }

    private function seedCollection($collection, array $records, string $label, bool $force): void
    {
        $existing = iterator_to_array($collection->limit(1)->documents());

        if (!empty($existing) && !$force) {
            $this->warn("Collection `{$collection->name()}` already contains data. Skipped (use --force).");
            return;
        }

        // If force flag is provided, purge existing docs to prevent orphaned or stale categories
        if ($force) {
            $allExisting = $collection->documents();
            foreach ($allExisting as $oldDoc) {
                if ($oldDoc->exists()) {
                    $oldDoc->reference()->delete();
                }
            }
        }

        $this->info("Seeding {$label} ({$collection->name()})...");
        $bar = $this->output->createProgressBar(count($records));
        $bar->start();

        foreach ($records as $record) {
            $docId = (string) $record['id'];
            $collection->document($docId)->set($record);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Seeded " . count($records) . " records into `{$collection->name()}`.");
    }
}
