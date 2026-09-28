<?php

namespace App\Console\Commands;

use Google\Cloud\Firestore\FirestoreClient;
use Illuminate\Console\Command;
use Kreait\Firebase\Contract\Firestore;
use Throwable;

class SeedFirebaseUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:seed-firebase-users {--force : Overwrite or append even if users collection is not empty}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed initial vehicle-owner records into Firebase Firestore if empty';

    /**
     * Initial seed vehicle owners data.
     */
    private array $seedUsers = [
        [
            'id' => '1',
            'name' => 'Ashan Perera',
            'email' => 'ashan.perera@example.com',
            'phone' => '+94 77 123 4567',
            'role' => 'vehicle_owner',
            'status' => 'active',
            'city' => 'Colombo',
            'address' => 'No 45/2, Galle Road, Colombo 03',
            'vehicles_count' => 2,
            'total_bookings' => 14,
            'last_active' => '2026-09-28 16:45',
            'created_at' => '2024-01-10',
            'vehicles' => [
                ['make' => 'Toyota', 'model' => 'Corolla Axio', 'year' => 2018, 'plate' => 'WP-CAB-4819'],
                ['make' => 'Honda', 'model' => 'Vezel', 'year' => 2016, 'plate' => 'WP-CAD-8120'],
            ],
        ],
        [
            'id' => '2',
            'name' => 'Nimal Silva',
            'email' => 'nimal.silva@example.com',
            'phone' => '+94 77 987 6543',
            'role' => 'vehicle_owner',
            'status' => 'active',
            'city' => 'Kandy',
            'address' => '12 Peradeniya Road, Kandy',
            'vehicles_count' => 1,
            'total_bookings' => 8,
            'last_active' => '2026-09-27 11:20',
            'created_at' => '2024-02-15',
            'vehicles' => [
                ['make' => 'Nissan', 'model' => 'X-Trail Hybrid', 'year' => 2017, 'plate' => 'CP-KX-5022'],
            ],
        ],
        [
            'id' => '3',
            'name' => 'Kumari Fernando',
            'email' => 'kumari.fernando@example.com',
            'phone' => '+94 76 111 2233',
            'role' => 'vehicle_owner',
            'status' => 'inactive',
            'city' => 'Galle',
            'address' => '88 Main Street, Galle Fort',
            'vehicles_count' => 1,
            'total_bookings' => 3,
            'last_active' => '2026-08-14 09:10',
            'created_at' => '2024-03-08',
            'vehicles' => [
                ['make' => 'Suzuki', 'model' => 'Wagon R Stingray', 'year' => 2019, 'plate' => 'SP-CAE-3199'],
            ],
        ],
        [
            'id' => '4',
            'name' => 'Rohan Mendis',
            'email' => 'rohan.mendis@example.com',
            'phone' => '+94 75 444 5566',
            'role' => 'vehicle_owner',
            'status' => 'blocked',
            'city' => 'Negombo',
            'address' => '210 Sea Street, Negombo',
            'vehicles_count' => 2,
            'total_bookings' => 22,
            'last_active' => '2026-09-20 18:30',
            'created_at' => '2024-04-22',
            'vehicles' => [
                ['make' => 'Mitsubishi', 'model' => 'Montero Sport', 'year' => 2020, 'plate' => 'WP-CBD-1002'],
                ['make' => 'Toyota', 'model' => 'Prius', 'year' => 2015, 'plate' => 'WP-CAC-6204'],
            ],
        ],
        [
            'id' => '5',
            'name' => 'Priya Karunarathna',
            'email' => 'priya.k@example.com',
            'phone' => '+94 77 777 8899',
            'role' => 'vehicle_owner',
            'status' => 'active',
            'city' => 'Gampaha',
            'address' => '15 Yakkala Road, Gampaha',
            'vehicles_count' => 1,
            'total_bookings' => 6,
            'last_active' => '2026-09-28 20:15',
            'created_at' => '2024-05-30',
            'vehicles' => [
                ['make' => 'Hyundai', 'model' => 'Tucson', 'year' => 2021, 'plate' => 'WP-CBE-7890'],
            ],
        ],
        [
            'id' => '6',
            'name' => 'Kavinda Jayasuriya',
            'email' => 'kavinda.j@example.com',
            'phone' => '+94 71 333 4455',
            'role' => 'vehicle_owner',
            'status' => 'pending',
            'city' => 'Kurunegala',
            'address' => '54 Dambulla Road, Kurunegala',
            'vehicles_count' => 1,
            'total_bookings' => 0,
            'last_active' => '2026-09-28 14:00',
            'created_at' => '2026-09-28',
            'vehicles' => [
                ['make' => 'Kia', 'model' => 'Sportage', 'year' => 2022, 'plate' => 'NW-CBF-2301'],
            ],
        ],
        [
            'id' => '7',
            'name' => 'Dilani Wickramasinghe',
            'email' => 'dilani.w@example.com',
            'phone' => '+94 70 888 9911',
            'role' => 'vehicle_owner',
            'status' => 'active',
            'city' => 'Matara',
            'address' => '32 Beach Road, Matara',
            'vehicles_count' => 1,
            'total_bookings' => 11,
            'last_active' => '2026-09-26 15:40',
            'created_at' => '2024-06-18',
            'vehicles' => [
                ['make' => 'Honda', 'model' => 'Grace Hybrid', 'year' => 2017, 'plate' => 'SP-CAD-4411'],
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
            $collection = $db->collection('users');

            $existingDocs = iterator_to_array($collection->limit(1)->documents());

            if (!empty($existingDocs) && !$this->option('force')) {
                $this->warn('Firestore `users` collection is not empty. Use --force to seed anyway.');
                return Command::SUCCESS;
            }

            $this->info('Seeding test vehicle-owner records into Firestore `users` collection...');
            $bar = $this->output->createProgressBar(count($this->seedUsers));
            $bar->start();

            foreach ($this->seedUsers as $user) {
                $docId = (string) $user['id'];
                $collection->document($docId)->set($user);
                $bar->advance();
            }

            $bar->finish();
            $this->newLine(2);
            $this->info('Successfully seeded ' . count($this->seedUsers) . ' vehicle-owner records into Firebase Firestore!');

            return Command::SUCCESS;
        } catch (Throwable $e) {
            $this->error('Failed to seed Firebase users: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
