<?php

namespace App\Console\Commands;

use Google\Cloud\Firestore\FirestoreClient;
use Illuminate\Console\Command;
use Kreait\Firebase\Contract\Firestore;
use Throwable;

class SeedFirebaseProvidersData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:seed-firebase-providers-data {--force : Overwrite or append even if collections are not empty}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed spare parts, price/stock logs, garage services, and provider inquiries into Firebase Firestore';

    private array $spareParts = [
        [
            'id' => 'part_101',
            'shop_id' => '201',
            'name' => 'Denso Iridium TT Spark Plugs (Set of 4)',
            'part_number' => 'IK20TT-4',
            'category' => 'Electrical & Sensors',
            'vehicle_compatibility' => ['Toyota Corolla Axio', 'Toyota Premio', 'Toyota Allion', 'Honda Civic'],
            'brand' => 'Denso',
            'model' => 'Iridium TT',
            'price' => 9800.0,
            'description' => 'Genuine Japanese twin-tip iridium spark plugs delivering improved fuel efficiency and ignition acceleration.',
            'image_url' => 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80',
            'condition' => 'Brand New',
            'stock_quantity' => 24,
            'availability' => 'in_stock',
            'views_count' => 145,
            'created_at' => '2026-09-01',
        ],
        [
            'id' => 'part_102',
            'shop_id' => '201',
            'name' => 'Akebono Ultra-Premium Front Ceramic Brake Pads',
            'part_number' => 'ACT-905',
            'category' => 'Brakes & Hydraulics',
            'vehicle_compatibility' => ['Honda Vezel', 'Honda Fit GP5', 'Honda Grace Hybrid'],
            'brand' => 'Akebono',
            'model' => 'ProACT',
            'price' => 14500.0,
            'description' => 'OEM ceramic formulation engineered for minimal dust, quiet braking, and rotor preservation.',
            'image_url' => 'https://images.unsplash.com/photo-1600790142055-619df03207e6?auto=format&fit=crop&w=400&q=80',
            'condition' => 'Brand New',
            'stock_quantity' => 12,
            'availability' => 'in_stock',
            'views_count' => 210,
            'created_at' => '2026-09-05',
        ],
        [
            'id' => 'part_103',
            'shop_id' => '201',
            'name' => 'KYB Excel-G Gas Front Shock Absorber Strut',
            'part_number' => '333338-L',
            'category' => 'Suspension & Steering',
            'vehicle_compatibility' => ['Nissan X-Trail T32', 'Nissan Qashqai'],
            'brand' => 'KYB',
            'model' => 'Excel-G',
            'price' => 28000.0,
            'description' => 'Nitrogen gas-charged twin-tube strut restoring original vehicle ride dynamics and handling control.',
            'image_url' => 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80',
            'condition' => 'Brand New',
            'stock_quantity' => 3,
            'availability' => 'low_stock',
            'views_count' => 98,
            'created_at' => '2026-09-10',
        ],
        [
            'id' => 'part_104',
            'shop_id' => '201',
            'name' => 'Toyota Genuine Micro-Pore Oil Filter',
            'part_number' => '90915-10003',
            'category' => 'Engine Components',
            'vehicle_compatibility' => ['Toyota Prius', 'Toyota Axio', 'Toyota Vitz', 'Toyota Aqua'],
            'brand' => 'Toyota OEM',
            'model' => 'Micro-Pore OEM',
            'price' => 2400.0,
            'description' => 'Original factory element designed to trap particles down to 10 microns without restricting oil pressure.',
            'image_url' => 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=400&q=80',
            'condition' => 'Brand New',
            'stock_quantity' => 48,
            'availability' => 'in_stock',
            'views_count' => 320,
            'created_at' => '2026-09-12',
        ],
        [
            'id' => 'part_105',
            'shop_id' => '201',
            'name' => 'Aisin Heavy-Duty Clutch Pressure Plate & Disc',
            'part_number' => 'CTX-107',
            'category' => 'Transmission & Clutch',
            'vehicle_compatibility' => ['Toyota Hilux Vigo', 'Toyota HiAce KDH200'],
            'brand' => 'Aisin',
            'model' => 'CTX-HD',
            'price' => 42000.0,
            'description' => 'Reinforced heat-treated diaphragm spring clutch assembly for high torque diesel commercial vehicles.',
            'image_url' => 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80',
            'condition' => 'Brand New',
            'stock_quantity' => 0,
            'availability' => 'out_of_stock',
            'views_count' => 84,
            'created_at' => '2026-09-15',
        ],
    ];

    private array $priceHistory = [
        [
            'id' => 'pr_1',
            'part_id' => 'part_101',
            'shop_id' => '201',
            'old_price' => 8900.0,
            'new_price' => 9800.0,
            'changed_at' => '2026-09-18T10:00:00+00:00',
            'reason' => 'Import duty adjustment & supplier price revision',
        ],
        [
            'id' => 'pr_2',
            'part_id' => 'part_102',
            'shop_id' => '201',
            'old_price' => 15500.0,
            'new_price' => 14500.0,
            'changed_at' => '2026-09-22T14:30:00+00:00',
            'reason' => 'Mid-season promotional discount for Honda Vezel owners',
        ],
    ];

    private array $stockHistory = [
        [
            'id' => 'st_1',
            'part_id' => 'part_101',
            'shop_id' => '201',
            'old_quantity' => 10,
            'new_quantity' => 30,
            'change_type' => 'restock',
            'adjusted_at' => '2026-09-15T09:00:00+00:00',
            'notes' => 'Air freight shipment delivery from Yokohama warehouse',
        ],
        [
            'id' => 'st_2',
            'part_id' => 'part_101',
            'shop_id' => '201',
            'old_quantity' => 30,
            'new_quantity' => 24,
            'change_type' => 'sale',
            'adjusted_at' => '2026-09-20T16:15:00+00:00',
            'notes' => 'Customer orders dispatch via prompt courier',
        ],
        [
            'id' => 'st_3',
            'part_id' => 'part_103',
            'shop_id' => '201',
            'old_quantity' => 8,
            'new_quantity' => 3,
            'change_type' => 'sale',
            'adjusted_at' => '2026-09-24T11:45:00+00:00',
            'notes' => 'Sold to fleet service garage in Nugegoda',
        ],
    ];

    private array $shopInquiries = [
        [
            'id' => 'inq_101',
            'shop_id' => '201',
            'customer_name' => 'Danushka Maduranga',
            'customer_phone' => '+94 77 123 9080',
            'customer_email' => 'danushka.m@gmail.com',
            'part_name' => 'Akebono Ceramic Front Brake Pads',
            'vehicle_model' => '2017 Honda Vezel RU3',
            'message' => 'Do you have these in stock and do you deliver to Kandy via courier?',
            'status' => 'pending',
            'response' => null,
            'responded_at' => null,
            'created_at' => '2026-09-28 14:20',
        ],
        [
            'id' => 'inq_102',
            'shop_id' => '201',
            'customer_name' => 'Sithum Nimnaka',
            'customer_phone' => '+94 71 889 0012',
            'customer_email' => 'sithum@gmail.com',
            'part_name' => 'Denso Iridium TT Spark Plugs',
            'vehicle_model' => '2018 Toyota Corolla Axio Hybrid',
            'message' => 'Are these genuine Japanese domestic market plugs with holographic seals?',
            'status' => 'responded',
            'response' => 'Yes, these are 100% authentic Denso Japan imports featuring the genuine anti-counterfeit holographic verification badge.',
            'responded_at' => '2026-09-27 16:40',
            'created_at' => '2026-09-27 11:10',
        ],
    ];

    private array $servicesCatalog = [
        [
            'id' => 'srv_201',
            'garage_id' => '301',
            'name' => '25-Point Comprehensive Hybrid Health Check & Service',
            'category' => 'Periodic Lubrication & Oil Change',
            'estimated_price' => 16500.0,
            'estimated_duration' => '1.5 hrs',
            'supported_vehicle_types' => ['Car', 'SUV'],
            'availability' => 'available',
            'description' => 'Synthetic engine oil change, cooling fan decontamination, inverter coolant check, and high-voltage battery diagnostic report.',
            'views_count' => 240,
            'created_at' => '2026-09-01',
        ],
        [
            'id' => 'srv_202',
            'garage_id' => '301',
            'name' => 'Precision 3D Computerized 4-Wheel Laser Alignment',
            'category' => 'Wheel Alignment & Balancing',
            'estimated_price' => 6500.0,
            'estimated_duration' => '45 mins',
            'supported_vehicle_types' => ['Car', 'SUV', 'Van'],
            'availability' => 'available',
            'description' => 'Multi-camera high-definition sensor wheel alignment with camber, caster, toe calibration and tire wear inspection.',
            'views_count' => 180,
            'created_at' => '2026-09-05',
        ],
        [
            'id' => 'srv_203',
            'garage_id' => '301',
            'name' => 'Dual-Clutch Transmission (DCT) Fluid Exchange & Calibration',
            'category' => 'Transmission Fluid Flush & Repair',
            'estimated_price' => 32000.0,
            'estimated_duration' => '2.5 hrs',
            'supported_vehicle_types' => ['Car', 'SUV'],
            'availability' => 'available',
            'description' => 'Specialized Honda i-DCD dual-clutch transmission actuator bleeding, high-grade synthetic fluid change, and clutch learn reset.',
            'views_count' => 135,
            'created_at' => '2026-09-10',
        ],
        [
            'id' => 'srv_204',
            'garage_id' => '301',
            'name' => 'Automotive Air Conditioning Overhaul & R134a Gas Recharge',
            'category' => 'AC Gas Recharge & Leak Repair',
            'estimated_price' => 12000.0,
            'estimated_duration' => '2 hrs',
            'supported_vehicle_types' => ['Car', 'SUV', 'Van', 'Motorbike'],
            'availability' => 'available',
            'description' => 'Automated recovery, vacuum dehydration test, synthetic PAG compressor oil replenishment, and fresh refrigerant recharge.',
            'views_count' => 95,
            'created_at' => '2026-09-12',
        ],
    ];

    private array $garageInquiries = [
        [
            'id' => 'ginq_301',
            'garage_id' => '301',
            'customer_name' => 'Pradeep Chaminda',
            'customer_phone' => '+94 76 991 2233',
            'customer_email' => 'pradeep.c@yahoo.com',
            'service_requested' => 'Dual-Clutch Transmission (DCT) Fluid Exchange',
            'vehicle_model' => '2016 Honda Vezel Hybrid',
            'preferred_date' => '2026-10-05',
            'message' => 'Can I reserve a morning slot at 9:00 AM on Monday? Car has slight judder when starting in 1st gear.',
            'status' => 'pending',
            'response' => null,
            'responded_at' => null,
            'created_at' => '2026-09-28 15:30',
        ],
        [
            'id' => 'ginq_302',
            'garage_id' => '301',
            'customer_name' => 'Kasun Tharaka',
            'customer_phone' => '+94 77 445 1109',
            'customer_email' => 'kasun.t@gmail.com',
            'service_requested' => '25-Point Comprehensive Hybrid Health Check',
            'vehicle_model' => '2018 Toyota Prius ZVW50',
            'preferred_date' => '2026-10-02',
            'message' => 'Does this check include cooling fan cleaning for the high-voltage hybrid battery?',
            'status' => 'responded',
            'response' => 'Yes, our 25-point hybrid health check includes battery blower disassembly and cleaning, plus OBD-II pack resistance testing.',
            'responded_at' => '2026-09-27 12:10',
            'created_at' => '2026-09-27 09:45',
        ],
    ];

    public function handle(): int
    {
        $this->info('Connecting to Firebase Firestore...');

        try {
            /** @var Firestore $firestore */
            $firestore = app(Firestore::class);
            /** @var FirestoreClient $db */
            $db = $firestore->database();

            // 1. Seed spare_parts
            $this->seedCollection($db->collection('spare_parts'), $this->spareParts, 'Spare Parts Catalog', $this->option('force'));

            // 2. Seed price_history
            $this->seedCollection($db->collection('price_history'), $this->priceHistory, 'Price History Logs', $this->option('force'));

            // 3. Seed stock_history
            $this->seedCollection($db->collection('stock_history'), $this->stockHistory, 'Stock Adjustment Logs', $this->option('force'));

            // 4. Seed shop_inquiries
            $this->seedCollection($db->collection('shop_inquiries'), $this->shopInquiries, 'Shop Customer Inquiries', $this->option('force'));

            // 5. Seed services_catalog
            $this->seedCollection($db->collection('services_catalog'), $this->servicesCatalog, 'Garage Services Catalog', $this->option('force'));

            // 6. Seed supported_vehicles
            $db->collection('supported_vehicles')->document('301')->set([
                'garage_id' => '301',
                'types' => ['Car', 'SUV', 'Van', 'Motorbike'],
                'updated_at' => now()->toIso8601String(),
            ]);
            $this->info('Configured supported vehicles for garage #301.');

            // 7. Seed garage_inquiries
            $this->seedCollection($db->collection('garage_inquiries'), $this->garageInquiries, 'Garage Service Inquiries', $this->option('force'));

            $this->newLine();
            $this->info('All Spare Part Shop and Garage Provider data seeded into Firebase Firestore successfully!');
            return Command::SUCCESS;
        } catch (Throwable $e) {
            $this->error('Failed to seed providers data: ' . $e->getMessage());
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
