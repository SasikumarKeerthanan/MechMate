<?php

namespace App\Console\Commands;

use Google\Cloud\Firestore\FirestoreClient;
use Illuminate\Console\Command;
use Kreait\Firebase\Contract\Firestore;
use Throwable;

class SeedFirebaseMonitoring extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:seed-firebase-monitoring {--force : Overwrite or append even if collections are not empty}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed initial moderation reviews, API logs, and API alerts into Firebase Firestore';

    private array $reviews = [
        [
            'id' => '1',
            'user' => 'Ashan Perera',
            'target_name' => 'AutoFix Lanka Garages',
            'target_type' => 'service_center',
            'rating' => 2,
            'comment' => 'Service took 3 hours longer than estimated. Receptionist was not very communicative regarding delay.',
            'status' => 'hidden',
            'flagged' => true,
            'flag_reason' => 'Provider flagged as inaccurate timeline dispute',
            'created_at' => '2026-09-24',
        ],
        [
            'id' => '2',
            'user' => 'Nimal Silva',
            'target_name' => 'SpeedServe Auto Parts',
            'target_type' => 'shop',
            'rating' => 1,
            'comment' => 'Suspect the oil filter supplied was not genuine OEM Toyota packaging. Be careful when purchasing here.',
            'status' => 'hidden',
            'flagged' => true,
            'flag_reason' => 'Defamation / unverified authenticity accusation',
            'created_at' => '2026-09-25',
        ],
        [
            'id' => '3',
            'user' => 'Kumari Fernando',
            'target_name' => 'Ruwan Mobile Diagnostics',
            'target_type' => 'mechanic',
            'rating' => 5,
            'comment' => 'Saved me on the Southern expressway with prompt roadside battery jump and alternator check. Outstanding!',
            'status' => 'published',
            'flagged' => false,
            'flag_reason' => null,
            'created_at' => '2026-09-26',
        ],
        [
            'id' => '4',
            'user' => 'Rohan Mendis',
            'target_name' => 'Precision Tune Station',
            'target_type' => 'service_center',
            'rating' => 5,
            'comment' => 'Top-notch 3D computerized wheel alignment. Steering vibration on highway completely resolved.',
            'status' => 'published',
            'flagged' => false,
            'flag_reason' => null,
            'created_at' => '2026-09-26',
        ],
        [
            'id' => '5',
            'user' => 'Priya Karunarathna',
            'target_name' => 'Kamal Pro Mechanics',
            'target_type' => 'mechanic',
            'rating' => 4,
            'comment' => 'Gearbox solenoid replacement was smooth and transparent on pricing. Recommended for automatic transmissions.',
            'status' => 'published',
            'flagged' => false,
            'flag_reason' => null,
            'created_at' => '2026-09-27',
        ],
        [
            'id' => '6',
            'user' => 'Kavinda Jayasuriya',
            'target_name' => 'Apex Auto Spares & Accessories',
            'target_type' => 'shop',
            'rating' => 2,
            'comment' => 'Competitor brand advertised was out of stock. Had to wait 4 days for backorder.',
            'status' => 'published',
            'flagged' => true,
            'flag_reason' => 'Vendor requested review re-check',
            'created_at' => '2026-09-27',
        ],
    ];

    private array $alerts = [
        [
            'id' => '1',
            'api_name' => 'Gemini AI API',
            'severity' => 'Critical',
            'message' => 'Rate limit exceeded (HTTP 429). Vehicle diagnosis request queue delayed by 4.2 seconds.',
            'failure_count' => 24,
            'last_occurred' => '10 mins ago',
            'status' => 'active',
        ],
        [
            'id' => '2',
            'api_name' => 'Vision API',
            'severity' => 'Warning',
            'message' => 'Gateway timeout (HTTP 504) during spare-part image recognition for clutch assembly.',
            'failure_count' => 8,
            'last_occurred' => '35 mins ago',
            'status' => 'active',
        ],
        [
            'id' => '3',
            'api_name' => 'Speech-to-Text API',
            'severity' => 'Warning',
            'message' => 'Audio chunk decoding failure due to high background ambient noise in mechanic voice note.',
            'failure_count' => 5,
            'last_occurred' => '1 hour ago',
            'status' => 'active',
        ],
        [
            'id' => '4',
            'api_name' => 'Google Maps Platform',
            'severity' => 'Warning',
            'message' => 'Geocoding quota warning: Daily route calculation reached 85% of allocated free tier.',
            'failure_count' => 12,
            'last_occurred' => '2 hours ago',
            'status' => 'active',
        ],
    ];

    private array $logs = [
        ['id' => '1001', 'api_name' => 'Gemini AI', 'endpoint' => 'v1beta/models/gemini-1.5-flash:generateContent', 'status' => 'success', 'http_code' => 200, 'latency_ms' => 420, 'error_message' => null, 'timestamp' => '1 min ago'],
        ['id' => '1002', 'api_name' => 'Vision API', 'endpoint' => 'v1/images:annotate', 'status' => 'success', 'http_code' => 200, 'latency_ms' => 310, 'error_message' => null, 'timestamp' => '3 mins ago'],
        ['id' => '1003', 'api_name' => 'Speech-to-Text', 'endpoint' => 'v1/speech:recognize', 'status' => 'failed', 'http_code' => 500, 'latency_ms' => 1240, 'error_message' => 'Audio payload corrupted or sample rate mismatch', 'timestamp' => '6 mins ago'],
        ['id' => '1004', 'api_name' => 'Maps Platform', 'endpoint' => 'maps/api/directions/json', 'status' => 'success', 'http_code' => 200, 'latency_ms' => 85, 'error_message' => null, 'timestamp' => '8 mins ago'],
        ['id' => '1005', 'api_name' => 'Gemini AI', 'endpoint' => 'v1beta/models/gemini-1.5-flash:generateContent', 'status' => 'failed', 'http_code' => 429, 'latency_ms' => 190, 'error_message' => 'Resource exhausted: quota exceeded', 'timestamp' => '10 mins ago'],
        ['id' => '1006', 'api_name' => 'Maps Platform', 'endpoint' => 'maps/api/geocode/json', 'status' => 'success', 'http_code' => 200, 'latency_ms' => 64, 'error_message' => null, 'timestamp' => '14 mins ago'],
        ['id' => '1007', 'api_name' => 'Vision API', 'endpoint' => 'v1/images:annotate', 'status' => 'failed', 'http_code' => 504, 'latency_ms' => 5020, 'error_message' => 'Upstream gateway timeout during part edge analysis', 'timestamp' => '35 mins ago'],
        ['id' => '1008', 'api_name' => 'Gemini AI', 'endpoint' => 'v1beta/models/gemini-1.5-pro:generateContent', 'status' => 'success', 'http_code' => 200, 'latency_ms' => 890, 'error_message' => null, 'timestamp' => '40 mins ago'],
        ['id' => '1009', 'api_name' => 'Speech-to-Text', 'endpoint' => 'v1/speech:recognize', 'status' => 'success', 'http_code' => 200, 'latency_ms' => 280, 'error_message' => null, 'timestamp' => '52 mins ago'],
        ['id' => '1010', 'api_name' => 'Maps Platform', 'endpoint' => 'maps/api/place/nearbysearch/json', 'status' => 'success', 'http_code' => 200, 'latency_ms' => 110, 'error_message' => null, 'timestamp' => '1 hour ago'],
    ];

    public function handle(): int
    {
        $this->info('Connecting to Firebase Firestore...');

        try {
            /** @var Firestore $firestore */
            $firestore = app(Firestore::class);
            /** @var FirestoreClient $db */
            $db = $firestore->database();

            // 1. Seed reviews
            $this->seedCollection($db->collection('reviews'), $this->reviews, 'Customer Reviews', $this->option('force'));

            // 2. Seed api_alerts
            $this->seedCollection($db->collection('api_alerts'), $this->alerts, 'API Failure Alerts', $this->option('force'));

            // 3. Seed api_logs
            $this->seedCollection($db->collection('api_logs'), $this->logs, 'API Request Logs', $this->option('force'));

            $this->newLine();
            $this->info('All monitoring and review moderation data seeded into Firebase Firestore successfully!');
            return Command::SUCCESS;
        } catch (Throwable $e) {
            $this->error('Failed to seed monitoring and review data: ' . $e->getMessage());
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
