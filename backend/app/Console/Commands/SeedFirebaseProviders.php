<?php

namespace App\Console\Commands;

use Google\Cloud\Firestore\FirestoreClient;
use Illuminate\Console\Command;
use Kreait\Firebase\Contract\Firestore;
use Throwable;

class SeedFirebaseProviders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:seed-firebase-providers {--force : Overwrite or append even if providers collection is not empty}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed initial provider records (Shops, Service Centres, Mechanics) into Firebase Firestore';

    /**
     * Initial seed providers data.
     */
    private array $seedProviders = [
        // ── Pending Approvals ──────────────────────────────────────────
        [
            'id' => '101',
            'type' => 'service_center',
            'business_name' => 'AutoFix Lanka Garages (Pvt) Ltd',
            'owner_name' => 'Sunil Weerakkody',
            'email' => 'autofix@lk.com',
            'phone' => '+94 11 289 4500',
            'city' => 'Colombo',
            'address' => '324 Baseline Road, Dematagoda, Colombo 09',
            'status' => 'pending',
            'approval_status' => 'pending',
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
            'id' => '102',
            'type' => 'shop',
            'business_name' => 'Lanka Spares Direct',
            'owner_name' => 'Janaka Bandara',
            'email' => 'janaka@lankaspares.lk',
            'phone' => '+94 81 223 9081',
            'city' => 'Kandy',
            'address' => '45 Katugastota Road, Kandy',
            'status' => 'pending',
            'approval_status' => 'pending',
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
            'id' => '103',
            'type' => 'mechanic',
            'business_name' => 'Ruwan Mobile Diagnostics',
            'owner_name' => 'Ruwan Jayasinghe',
            'email' => 'ruwan.mech@gmail.com',
            'phone' => '+94 77 555 8921',
            'city' => 'Galle',
            'address' => '78/A Matara Road, Galle',
            'status' => 'pending',
            'approval_status' => 'pending',
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
            'id' => '201',
            'type' => 'shop',
            'business_name' => 'SpeedServe Auto Parts',
            'owner_name' => 'Mahesh Fonseka',
            'email' => 'sales@speedserve.lk',
            'phone' => '+94 11 432 9988',
            'city' => 'Colombo',
            'address' => '112 Panchikawatta Road, Colombo 10',
            'status' => 'approved',
            'approval_status' => 'approved',
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
            'id' => '202',
            'type' => 'shop',
            'business_name' => 'Apex Auto Spares & Accessories',
            'owner_name' => 'Kasun Abeyratne',
            'email' => 'kasun@apexauto.lk',
            'phone' => '+94 31 228 1144',
            'city' => 'Negombo',
            'address' => '90 Main Street, Negombo',
            'status' => 'approved',
            'approval_status' => 'approved',
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
            'id' => '301',
            'type' => 'service_center',
            'business_name' => 'Precision Tune Station',
            'owner_name' => 'Chathura Fernando',
            'email' => 'service@precisiontune.lk',
            'phone' => '+94 11 254 7711',
            'city' => 'Colombo',
            'address' => '500 High Level Road, Nugegoda',
            'status' => 'approved',
            'approval_status' => 'approved',
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
            'id' => '302',
            'type' => 'service_center',
            'business_name' => 'City Motors Garage',
            'owner_name' => 'Nuwan Dissanayake',
            'email' => 'nuwan@citymotors.lk',
            'phone' => '+94 81 493 2200',
            'city' => 'Kandy',
            'address' => '190 William Gopallawa Mawatha, Kandy',
            'status' => 'suspended',
            'approval_status' => 'suspended',
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
            'id' => '401',
            'type' => 'mechanic',
            'business_name' => 'Kamal Pro Mechanics',
            'owner_name' => 'Kamal Perera',
            'email' => 'kamal.pro@gmail.com',
            'phone' => '+94 77 444 3322',
            'city' => 'Colombo',
            'address' => '22 Nawala Road, Rajagiriya',
            'status' => 'approved',
            'approval_status' => 'approved',
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
            'id' => '402',
            'type' => 'mechanic',
            'business_name' => 'Bandara Quick Fix',
            'owner_name' => 'Saman Bandara',
            'email' => 'saman.bandara@gmail.com',
            'phone' => '+94 71 888 2211',
            'city' => 'Kurunegala',
            'address' => '11 Puttalam Road, Kurunegala',
            'status' => 'approved',
            'approval_status' => 'approved',
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
            $collection = $db->collection('providers');

            $existingDocs = iterator_to_array($collection->limit(1)->documents());

            if (!empty($existingDocs) && !$this->option('force')) {
                $this->warn('Firestore `providers` collection is not empty. Use --force to seed anyway.');
                return Command::SUCCESS;
            }

            $this->info('Seeding test provider records into Firestore `providers` collection...');
            $bar = $this->output->createProgressBar(count($this->seedProviders));
            $bar->start();

            foreach ($this->seedProviders as $provider) {
                $docId = (string) $provider['id'];
                $collection->document($docId)->set($provider);
                $bar->advance();
            }

            $bar->finish();
            $this->newLine(2);
            $this->info('Successfully seeded ' . count($this->seedProviders) . ' provider records into Firebase Firestore!');

            return Command::SUCCESS;
        } catch (Throwable $e) {
            $this->error('Failed to seed Firebase providers: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
