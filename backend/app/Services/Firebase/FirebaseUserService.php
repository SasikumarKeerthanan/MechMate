<?php

namespace App\Services\Firebase;

use App\Services\Contracts\UserServiceInterface;
use App\Services\Mock\MockUserService;
use Google\Cloud\Firestore\CollectionReference;
use Google\Cloud\Firestore\FirestoreClient;
use Kreait\Firebase\Contract\Firestore;
use Throwable;
use Illuminate\Support\Facades\Log;

class FirebaseUserService implements UserServiceInterface
{
    private ?FirestoreClient $db = null;
    private ?CollectionReference $collection = null;
    private MockUserService $mockFallback;

    public function __construct(
        private readonly ?Firestore $firestore = null
    ) {
        $this->mockFallback = new MockUserService();
        $this->initializeFirestore();
    }

    /**
     * Safely initialize Firestore client and collection.
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
                $this->collection = $this->db->collection('users');
            }
        } catch (Throwable $e) {
            Log::error('FirebaseUserService: Failed to initialize Firestore connection. Using fallback mock.', [
                'error' => $e->getMessage()
            ]);
            $this->db = null;
            $this->collection = null;
        }
    }

    /**
     * Check if live Firestore is connected and usable.
     */
    public function isConnected(): bool
    {
        return $this->db !== null && $this->collection !== null;
    }

    /**
     * Map a raw Firestore document to a consistent array structure.
     */
    private function formatDocument($snapshot): array
    {
        $data = $snapshot->data() ?? [];
        $data['id'] = (string) ($data['id'] ?? $snapshot->id());

        // Ensure key fields exist with defaults
        $data['role'] = $data['role'] ?? 'vehicle_owner';
        $data['status'] = $data['status'] ?? 'active';
        $data['vehicles_count'] = isset($data['vehicles']) && is_array($data['vehicles'])
            ? count($data['vehicles'])
            : (int) ($data['vehicles_count'] ?? 0);
        $data['total_bookings'] = (int) ($data['total_bookings'] ?? 0);
        $data['created_at'] = $data['created_at'] ?? date('Y-m-d');
        $data['last_active'] = $data['last_active'] ?? date('Y-m-d H:i');

        return $data;
    }

    /**
     * Fetch all users from Firestore with optional filtering.
     */
    public function getAllUsers(array $filters = []): array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->getAllUsers($filters);
        }

        try {
            $query = $this->collection;

            // Apply role filter at Firestore level if provided
            if (!empty($filters['role']) && $filters['role'] !== 'all') {
                $query = $query->where('role', '=', $filters['role']);
            }

            // Apply status filter at Firestore level if provided
            if (!empty($filters['status']) && $filters['status'] !== 'all') {
                $query = $query->where('status', '=', $filters['status']);
            }

            $documents = $query->documents();
            $users = [];

            foreach ($documents as $doc) {
                if ($doc->exists()) {
                    $users[] = $this->formatDocument($doc);
                }
            }

            // Filter by search string in-memory if requested
            if (!empty($filters['search'])) {
                $term = strtolower(trim($filters['search']));
                $users = array_filter($users, function ($u) use ($term) {
                    return str_contains(strtolower($u['name'] ?? ''), $term) ||
                           str_contains(strtolower($u['email'] ?? ''), $term) ||
                           str_contains(strtolower($u['phone'] ?? ''), $term) ||
                           str_contains(strtolower($u['city'] ?? ''), $term);
                });
                $users = array_values($users);
            }

            // If live collection is completely empty and no filters were applied, we return empty array
            return $users;
        } catch (Throwable $e) {
            Log::error('FirebaseUserService: getAllUsers failed', ['error' => $e->getMessage()]);
            return $this->mockFallback->getAllUsers($filters);
        }
    }

    /**
     * Fetch a single user document by ID.
     */
    public function getUserById(string $id): ?array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->getUserById($id);
        }

        try {
            // First check direct document ID
            $docRef = $this->collection->document((string) $id);
            $snapshot = $docRef->snapshot();

            if ($snapshot->exists()) {
                return $this->formatDocument($snapshot);
            }

            // Alternatively check if query by 'id' field matches
            $queryDocs = $this->collection->where('id', '=', is_numeric($id) ? (int)$id : $id)->documents();
            foreach ($queryDocs as $doc) {
                if ($doc->exists()) {
                    return $this->formatDocument($doc);
                }
            }

            // If not found by numeric ID, check string id field
            $queryDocsStr = $this->collection->where('id', '=', (string)$id)->documents();
            foreach ($queryDocsStr as $doc) {
                if ($doc->exists()) {
                    return $this->formatDocument($doc);
                }
            }

            return null;
        } catch (Throwable $e) {
            Log::error("FirebaseUserService: getUserById failed for {$id}", ['error' => $e->getMessage()]);
            return $this->mockFallback->getUserById($id);
        }
    }

    /**
     * Update an existing user document.
     */
    public function updateUser(string $id, array $data): ?array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->updateUser($id, $data);
        }

        try {
            $docRef = $this->collection->document((string) $id);
            $snapshot = $docRef->snapshot();

            if (!$snapshot->exists()) {
                // Check if doc exists with field id match
                $query = $this->collection->where('id', '=', is_numeric($id) ? (int)$id : $id)->documents();
                foreach ($query as $doc) {
                    $docRef = $doc->reference();
                    $snapshot = $doc;
                    break;
                }
            }

            if (!$snapshot->exists()) {
                return null;
            }

            // Prepare update payload
            $updateData = [];
            foreach ($data as $key => $value) {
                $updateData[] = [
                    'path' => $key,
                    'value' => $value,
                ];
            }

            if (!empty($updateData)) {
                $docRef->update($updateData);
            }

            $updatedSnapshot = $docRef->snapshot();
            return $this->formatDocument($updatedSnapshot);
        } catch (Throwable $e) {
            Log::error("FirebaseUserService: updateUser failed for {$id}", ['error' => $e->getMessage()]);
            return $this->mockFallback->updateUser($id, $data);
        }
    }

    /**
     * Update the status of a user document in Firestore.
     */
    public function updateStatus(string $id, string $status): ?array
    {
        return $this->updateUser($id, ['status' => $status]);
    }

    /**
     * Delete a user document from Firestore.
     */
    public function deleteUser(string $id): bool
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->deleteUser($id);
        }

        try {
            $docRef = $this->collection->document((string) $id);
            $snapshot = $docRef->snapshot();

            if ($snapshot->exists()) {
                $docRef->delete();
                return true;
            }

            // Check if document exists with matching 'id' field
            $query = $this->collection->where('id', '=', is_numeric($id) ? (int)$id : $id)->documents();
            $found = false;
            foreach ($query as $doc) {
                if ($doc->exists()) {
                    $doc->reference()->delete();
                    $found = true;
                }
            }

            return $found;
        } catch (Throwable $e) {
            Log::error("FirebaseUserService: deleteUser failed for {$id}", ['error' => $e->getMessage()]);
            return $this->mockFallback->deleteUser($id);
        }
    }

    /**
     * Deactivate user (set status to inactive).
     */
    public function deactivateUser(string $id): bool
    {
        return (bool) $this->updateStatus($id, 'inactive');
    }

    /**
     * Activate user (set status to active).
     */
    public function activateUser(string $id): bool
    {
        return (bool) $this->updateStatus($id, 'active');
    }
}
