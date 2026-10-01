<?php

namespace App\Services\Firebase;

use App\Services\Contracts\DiagnosisServiceInterface;
use App\Services\Mock\MockDiagnosisService;
use Google\Cloud\Firestore\CollectionReference;
use Google\Cloud\Firestore\DocumentReference;
use Google\Cloud\Firestore\FirestoreClient;
use Kreait\Firebase\Contract\Firestore;
use Throwable;
use Illuminate\Support\Facades\Log;

class FirebaseDiagnosisService implements DiagnosisServiceInterface
{
    private ?FirestoreClient $db = null;
    private ?CollectionReference $referenceCollection = null;
    private ?CollectionReference $logsCollection = null;
    private MockDiagnosisService $mockFallback;

    public function __construct(
        private readonly ?Firestore $firestore = null
    ) {
        $this->mockFallback = new MockDiagnosisService();
        $this->initializeFirestore();
    }

    /**
     * Safely initialize Firestore client and collections.
     */
    private function initializeFirestore(): void
    {
        try {
            if ($this->firestore) {
                $this->db = $this->firestore->database();
            } else {
                $this->db = app(Firestore::class)->database();
            }

            if ($this->db) {
                $this->referenceCollection = $this->db->collection('diagnosis_reference');
                $this->logsCollection = $this->db->collection('diagnosis_logs');
            }
        } catch (Throwable $e) {
            Log::error('FirebaseDiagnosisService: Failed to initialize Firestore connection. Using fallback mock.', [
                'error' => $e->getMessage()
            ]);
            $this->db = null;
            $this->referenceCollection = null;
            $this->logsCollection = null;
        }
    }

    /**
     * Check if live Firestore is connected and usable.
     */
    public function isConnected(): bool
    {
        return $this->db !== null && $this->referenceCollection !== null && $this->logsCollection !== null;
    }

    /**
     * Helper to find a document reference in a collection by doc ID or matching 'id' field.
     */
    private function findDocRef(CollectionReference $collection, string $id): ?DocumentReference
    {
        $docRef = $collection->document((string) $id);
        if ($docRef->snapshot()->exists()) {
            return $docRef;
        }

        $query = $collection->where('id', '=', is_numeric($id) ? (int)$id : $id)->documents();
        foreach ($query as $doc) {
            if ($doc->exists()) {
                return $doc->reference();
            }
        }

        $queryStr = $collection->where('id', '=', (string)$id)->documents();
        foreach ($queryStr as $doc) {
            if ($doc->exists()) {
                return $doc->reference();
            }
        }

        return null;
    }

    /**
     * Format a raw Firestore document snapshot to structured diagnosis reference rule array.
     */
    private function formatReferenceRule($snapshot): array
    {
        $data = $snapshot->data() ?? [];
        $data['id'] = (string) ($data['id'] ?? $snapshot->id());
        $data['symptom'] = $data['symptom'] ?? '';
        $data['possible_fault'] = $data['possible_fault'] ?? '';
        $data['cause'] = $data['cause'] ?? '';
        $data['solution'] = $data['solution'] ?? '';
        $data['severity'] = in_array($data['severity'] ?? '', ['Low', 'Medium', 'High', 'Critical']) ? $data['severity'] : 'Medium';
        $data['category'] = $data['category'] ?? 'Engine Components';
        $data['created_at'] = $data['created_at'] ?? date('Y-m-d');

        return $data;
    }

    /**
     * Format a raw Firestore document snapshot to structured diagnosis log history array.
     */
    private function formatHistoryLog($snapshot): array
    {
        $data = $snapshot->data() ?? [];
        $data['id'] = (string) ($data['id'] ?? $snapshot->id());
        $data['query'] = $data['query'] ?? '';
        $data['user'] = $data['user'] ?? 'Anonymous';
        $data['vehicle'] = $data['vehicle'] ?? 'Vehicle';
        $data['detected_fault'] = $data['detected_fault'] ?? '';
        $data['severity'] = $data['severity'] ?? 'Medium';
        $data['status'] = $data['status'] ?? 'Completed';
        $data['created_at'] = $data['created_at'] ?? date('Y-m-d H:i');

        return $data;
    }

    /**
     * Fetch all diagnosis reference rules with optional severity, category, and search filters.
     *
     * @param array $filters [severity, category, search]
     * @return array
     */
    public function getAllEntries(array $filters = []): array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->getAllEntries($filters);
        }

        try {
            $documents = $this->referenceCollection->documents();
            $rules = [];

            foreach ($documents as $doc) {
                if ($doc->exists()) {
                    $rules[] = $this->formatReferenceRule($doc);
                }
            }

            // Filter by severity
            if (!empty($filters['severity']) && $filters['severity'] !== 'all') {
                $rules = array_filter($rules, fn($r) => strcasecmp($r['severity'] ?? '', $filters['severity']) === 0);
            }

            // Filter by category
            if (!empty($filters['category']) && $filters['category'] !== 'all') {
                $rules = array_filter($rules, fn($r) => strcasecmp($r['category'] ?? '', $filters['category']) === 0);
            }

            // Filter by search string
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
        } catch (Throwable $e) {
            Log::error('FirebaseDiagnosisService: getAllEntries failed', ['error' => $e->getMessage()]);
            return $this->mockFallback->getAllEntries($filters);
        }
    }

    /**
     * Alias for getAllEntries.
     */
    public function getAllReferenceData(array $filters = []): array
    {
        return $this->getAllEntries($filters);
    }

    /**
     * Fetch single diagnosis rule by ID.
     */
    public function getEntryById(string $id): ?array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->getEntryById($id);
        }

        try {
            $docRef = $this->findDocRef($this->referenceCollection, $id);
            if (!$docRef) {
                return null;
            }

            return $this->formatReferenceRule($docRef->snapshot());
        } catch (Throwable $e) {
            Log::error("FirebaseDiagnosisService: getEntryById failed for {$id}", ['error' => $e->getMessage()]);
            return $this->mockFallback->getEntryById($id);
        }
    }

    /**
     * Create a new diagnosis reference rule document in Firestore.
     */
    public function createEntry(array $data): array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->createEntry($data);
        }

        try {
            $docRef = $this->referenceCollection->newDocument();
            $docId = $docRef->id();

            $newEntry = [
                'id' => (string) $docId,
                'symptom' => $data['symptom'] ?? '',
                'possible_fault' => $data['possible_fault'] ?? '',
                'cause' => $data['cause'] ?? '',
                'solution' => $data['solution'] ?? '',
                'severity' => in_array($data['severity'] ?? '', ['Low', 'Medium', 'High', 'Critical']) ? $data['severity'] : 'Medium',
                'category' => $data['category'] ?? 'Engine Components',
                'created_at' => now()->toDateString(),
            ];

            $docRef->set($newEntry);

            return $this->formatReferenceRule($docRef->snapshot());
        } catch (Throwable $e) {
            Log::error('FirebaseDiagnosisService: createEntry failed', ['error' => $e->getMessage()]);
            return $this->mockFallback->createEntry($data);
        }
    }

    /**
     * Alias for createEntry.
     */
    public function createReferenceData(array $data): array
    {
        return $this->createEntry($data);
    }

    /**
     * Update an existing diagnosis reference rule document.
     */
    public function updateEntry(string $id, array $data): ?array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->updateEntry($id, $data);
        }

        try {
            $docRef = $this->findDocRef($this->referenceCollection, $id);
            if (!$docRef) {
                return null;
            }

            $docRef->set($data, ['merge' => true]);

            return $this->formatReferenceRule($docRef->snapshot());
        } catch (Throwable $e) {
            Log::error("FirebaseDiagnosisService: updateEntry failed for {$id}", ['error' => $e->getMessage()]);
            return $this->mockFallback->updateEntry($id, $data);
        }
    }

    /**
     * Alias for updateEntry.
     */
    public function updateReferenceData(string $id, array $data): ?array
    {
        return $this->updateEntry($id, $data);
    }

    /**
     * Remove diagnosis reference rule document from Firestore.
     */
    public function deleteEntry(string $id): bool
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->deleteEntry($id);
        }

        try {
            $docRef = $this->findDocRef($this->referenceCollection, $id);
            if (!$docRef) {
                return false;
            }

            $docRef->delete();
            return true;
        } catch (Throwable $e) {
            Log::error("FirebaseDiagnosisService: deleteEntry failed for {$id}", ['error' => $e->getMessage()]);
            return $this->mockFallback->deleteEntry($id);
        }
    }

    /**
     * Alias for deleteEntry.
     */
    public function deleteReferenceData(string $id): bool
    {
        return $this->deleteEntry($id);
    }

    /**
     * Fetch recent user diagnosis search logs from diagnosis_logs collection.
     */
    public function getDiagnosisHistory(): array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->getDiagnosisHistory();
        }

        try {
            $documents = $this->logsCollection->documents();
            $history = [];

            foreach ($documents as $doc) {
                if ($doc->exists()) {
                    $history[] = $this->formatHistoryLog($doc);
                }
            }

            return $history;
        } catch (Throwable $e) {
            Log::error('FirebaseDiagnosisService: getDiagnosisHistory failed', ['error' => $e->getMessage()]);
            return $this->mockFallback->getDiagnosisHistory();
        }
    }
}
