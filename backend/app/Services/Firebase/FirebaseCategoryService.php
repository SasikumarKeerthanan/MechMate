<?php

namespace App\Services\Firebase;

use App\Services\Contracts\CategoryServiceInterface;
use App\Services\Mock\MockCategoryService;
use Google\Cloud\Firestore\CollectionReference;
use Google\Cloud\Firestore\DocumentReference;
use Google\Cloud\Firestore\FirestoreClient;
use Kreait\Firebase\Contract\Firestore;
use Throwable;
use Illuminate\Support\Facades\Log;

class FirebaseCategoryService implements CategoryServiceInterface
{
    private ?FirestoreClient $db = null;
    private ?CollectionReference $partsCollection = null;
    private ?CollectionReference $servicesCollection = null;
    private MockCategoryService $mockFallback;

    public function __construct(
        private readonly ?Firestore $firestore = null
    ) {
        $this->mockFallback = new MockCategoryService();
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
                $this->partsCollection = $this->db->collection('categories_parts');
                $this->servicesCollection = $this->db->collection('categories_services');
            }
        } catch (Throwable $e) {
            Log::error('FirebaseCategoryService: Failed to initialize Firestore connection. Using fallback mock.', [
                'error' => $e->getMessage()
            ]);
            $this->db = null;
            $this->partsCollection = null;
            $this->servicesCollection = null;
        }
    }

    /**
     * Check if live Firestore is connected and usable.
     */
    public function isConnected(): bool
    {
        return $this->db !== null && $this->partsCollection !== null && $this->servicesCollection !== null;
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
     * Format a raw Firestore document snapshot to structured part category array.
     */
    private function formatPartCategory($snapshot): array
    {
        $data = $snapshot->data() ?? [];
        $data['id'] = (string) ($data['id'] ?? $snapshot->id());
        $data['name'] = $data['name'] ?? 'Unnamed Category';
        $data['icon'] = $data['icon'] ?? '🔩';
        $data['item_count'] = (int) ($data['item_count'] ?? 0);
        $data['description'] = $data['description'] ?? '';
        $data['active'] = isset($data['active']) ? (bool) $data['active'] : true;
        $data['created_at'] = $data['created_at'] ?? date('Y-m-d');

        return $data;
    }

    /**
     * Format a raw Firestore document snapshot to structured service category array.
     */
    private function formatServiceCategory($snapshot): array
    {
        $data = $snapshot->data() ?? [];
        $data['id'] = (string) ($data['id'] ?? $snapshot->id());
        $data['name'] = $data['name'] ?? 'Unnamed Service';
        $data['icon'] = $data['icon'] ?? '🔧';
        $data['estimated_time'] = $data['estimated_time'] ?? '1 hr';
        $data['popular'] = isset($data['popular']) ? (bool) $data['popular'] : false;
        $data['description'] = $data['description'] ?? '';
        $data['active'] = isset($data['active']) ? (bool) $data['active'] : true;
        $data['created_at'] = $data['created_at'] ?? date('Y-m-d');

        return $data;
    }

    /**
     * Legacy helper to get all categories (returns service categories).
     */
    public function getAll(): array
    {
        return $this->getServiceCategories();
    }

    // ── Spare-Part Categories ───────────────────────────────────────────────

    /**
     * Fetch spare-part categories from Firestore.
     */
    public function getPartCategories(): array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->getPartCategories();
        }

        try {
            $documents = $this->partsCollection->documents();
            $categories = [];

            foreach ($documents as $doc) {
                if ($doc->exists()) {
                    $categories[] = $this->formatPartCategory($doc);
                }
            }

            return $categories;
        } catch (Throwable $e) {
            Log::error('FirebaseCategoryService: getPartCategories failed', ['error' => $e->getMessage()]);
            return $this->mockFallback->getPartCategories();
        }
    }

    /**
     * Create a new spare-part category document in Firestore.
     */
    public function createPartCategory(array $data): array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->createPartCategory($data);
        }

        try {
            $docRef = $this->partsCollection->newDocument();
            $docId = $docRef->id();

            $newCategory = [
                'id' => (string) $docId,
                'name' => $data['name'] ?? 'New Category',
                'icon' => $data['icon'] ?? '🔩',
                'item_count' => (int) ($data['item_count'] ?? 0),
                'description' => $data['description'] ?? '',
                'active' => isset($data['active']) ? (bool) $data['active'] : true,
                'created_at' => now()->toDateString(),
            ];

            $docRef->set($newCategory);

            return $this->formatPartCategory($docRef->snapshot());
        } catch (Throwable $e) {
            Log::error('FirebaseCategoryService: createPartCategory failed', ['error' => $e->getMessage()]);
            return $this->mockFallback->createPartCategory($data);
        }
    }

    /**
     * Update an existing spare-part category document.
     */
    public function updatePartCategory(string $id, array $data): ?array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->updatePartCategory($id, $data);
        }

        try {
            $docRef = $this->findDocRef($this->partsCollection, $id);
            if (!$docRef) {
                return null;
            }

            $docRef->set($data, ['merge' => true]);

            return $this->formatPartCategory($docRef->snapshot());
        } catch (Throwable $e) {
            Log::error("FirebaseCategoryService: updatePartCategory failed for {$id}", ['error' => $e->getMessage()]);
            return $this->mockFallback->updatePartCategory($id, $data);
        }
    }

    /**
     * Remove spare-part category document from Firestore.
     */
    public function deletePartCategory(string $id): bool
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->deletePartCategory($id);
        }

        try {
            $docRef = $this->findDocRef($this->partsCollection, $id);
            if (!$docRef) {
                return false;
            }

            $docRef->delete();
            return true;
        } catch (Throwable $e) {
            Log::error("FirebaseCategoryService: deletePartCategory failed for {$id}", ['error' => $e->getMessage()]);
            return $this->mockFallback->deletePartCategory($id);
        }
    }

    // ── Garage Service Categories ───────────────────────────────────────────

    /**
     * Fetch garage/service categories from Firestore.
     */
    public function getServiceCategories(): array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->getServiceCategories();
        }

        try {
            $documents = $this->servicesCollection->documents();
            $categories = [];

            foreach ($documents as $doc) {
                if ($doc->exists()) {
                    $categories[] = $this->formatServiceCategory($doc);
                }
            }

            return $categories;
        } catch (Throwable $e) {
            Log::error('FirebaseCategoryService: getServiceCategories failed', ['error' => $e->getMessage()]);
            return $this->mockFallback->getServiceCategories();
        }
    }

    /**
     * Create a new garage service category document in Firestore.
     */
    public function createServiceCategory(array $data): array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->createServiceCategory($data);
        }

        try {
            $docRef = $this->servicesCollection->newDocument();
            $docId = $docRef->id();

            $newCategory = [
                'id' => (string) $docId,
                'name' => $data['name'] ?? 'New Service',
                'icon' => $data['icon'] ?? '🔧',
                'estimated_time' => $data['estimated_time'] ?? '1 hr',
                'popular' => isset($data['popular']) ? (bool) $data['popular'] : false,
                'description' => $data['description'] ?? '',
                'active' => isset($data['active']) ? (bool) $data['active'] : true,
                'created_at' => now()->toDateString(),
            ];

            $docRef->set($newCategory);

            return $this->formatServiceCategory($docRef->snapshot());
        } catch (Throwable $e) {
            Log::error('FirebaseCategoryService: createServiceCategory failed', ['error' => $e->getMessage()]);
            return $this->mockFallback->createServiceCategory($data);
        }
    }

    /**
     * Update a service category document.
     */
    public function updateServiceCategory(string $id, array $data): ?array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->updateServiceCategory($id, $data);
        }

        try {
            $docRef = $this->findDocRef($this->servicesCollection, $id);
            if (!$docRef) {
                return null;
            }

            $docRef->set($data, ['merge' => true]);

            return $this->formatServiceCategory($docRef->snapshot());
        } catch (Throwable $e) {
            Log::error("FirebaseCategoryService: updateServiceCategory failed for {$id}", ['error' => $e->getMessage()]);
            return $this->mockFallback->updateServiceCategory($id, $data);
        }
    }

    /**
     * Remove service category document from Firestore.
     */
    public function deleteServiceCategory(string $id): bool
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->deleteServiceCategory($id);
        }

        try {
            $docRef = $this->findDocRef($this->servicesCollection, $id);
            if (!$docRef) {
                return false;
            }

            $docRef->delete();
            return true;
        } catch (Throwable $e) {
            Log::error("FirebaseCategoryService: deleteServiceCategory failed for {$id}", ['error' => $e->getMessage()]);
            return $this->mockFallback->deleteServiceCategory($id);
        }
    }
}
