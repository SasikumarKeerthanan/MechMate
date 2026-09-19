<?php

namespace App\Services;

use Google\Cloud\Firestore\FirestoreClient;
use Kreait\Firebase\Contract\Auth as FirebaseAuth;
use Kreait\Firebase\Contract\Firestore as KreaitFirestore;
use Kreait\Firebase\Factory;
use Exception;
use Illuminate\Support\Facades\Log;

class FirebaseService
{
    protected ?FirestoreClient $firestore = null;
    protected ?FirebaseAuth $auth = null;
    protected bool $isConfigured = false;

    public function __construct()
    {
        $this->initializeFirebase();
    }

    /**
     * Initialize Firebase Admin SDK connection.
     */
    protected function initializeFirebase(): void
    {
        try {
            $credentialsPath = config('firebase.projects.app.credentials.file');
            $projectId = config('firebase.projects.app.firestore.database') !== '(default)'
                ? config('firebase.projects.app.firestore.database')
                : env('FIREBASE_PROJECT_ID', 'mechmate-prod');

            if (file_exists($credentialsPath)) {
                $factory = (new Factory)
                    ->withServiceAccount($credentialsPath);

                $this->auth = $factory->createAuth();
                
                // Initialize Firestore client directly or via factory
                $this->firestore = new FirestoreClient([
                    'keyFilePath' => $credentialsPath,
                    'projectId'   => $projectId,
                ]);
                $this->isConfigured = true;
            } else {
                Log::warning('Firebase service account credentials file not found at: ' . $credentialsPath . '. Running in fallback mode.');
            }
        } catch (Exception $e) {
            Log::error('Failed to initialize Firebase Service: ' . $e->getMessage());
            $this->isConfigured = false;
        }
    }

    /**
     * Check if live Firebase credentials are active.
     */
    public function isLive(): bool
    {
        return $this->isConfigured && $this->firestore !== null;
    }

    /**
     * Get Firestore client instance.
     */
    public function getFirestore(): ?FirestoreClient
    {
        return $this->firestore;
    }

    /**
     * Get Firebase Auth contract instance.
     */
    public function getAuth(): ?FirebaseAuth
    {
        return $this->auth;
    }

    /**
     * Access a specific Firestore collection.
     */
    public function collection(string $name)
    {
        if ($this->isLive()) {
            return $this->firestore->collection($name);
        }
        return null;
    }

    /**
     * Fetch document by ID from collection.
     */
    public function getDocument(string $collection, string $documentId): ?array
    {
        if ($this->isLive()) {
            $docRef = $this->firestore->collection($collection)->document($documentId);
            $snapshot = $docRef->snapshot();
            if ($snapshot->exists()) {
                return array_merge(['id' => $snapshot->id()], $snapshot->data() ?? []);
            }
            return null;
        }

        // Mock fallback for development if credentials are demo
        return ['id' => $documentId, 'status' => 'mock_data', 'collection' => $collection];
    }

    /**
     * Create or update document in collection.
     */
    public function setDocument(string $collection, string $documentId, array $data, bool $merge = true): bool
    {
        if ($this->isLive()) {
            $docRef = $this->firestore->collection($collection)->document($documentId);
            $docRef->set($data, ['merge' => $merge]);
            return true;
        }

        Log::info("Mock Firestore setDocument: [$collection / $documentId]", $data);
        return true;
    }

    /**
     * Add new document with auto-generated ID.
     */
    public function addDocument(string $collection, array $data): string
    {
        if ($this->isLive()) {
            $addedDoc = $this->firestore->collection($collection)->add($data);
            return $addedDoc->id();
        }

        $mockId = 'doc_' . bin2hex(random_bytes(6));
        Log::info("Mock Firestore addDocument in $collection generated ID: $mockId", $data);
        return $mockId;
    }

    /**
     * Delete document from collection.
     */
    public function deleteDocument(string $collection, string $documentId): bool
    {
        if ($this->isLive()) {
            $this->firestore->collection($collection)->document($documentId)->delete();
            return true;
        }

        Log::info("Mock Firestore deleteDocument: [$collection / $documentId]");
        return true;
    }

    /**
     * Query documents with simple limit.
     */
    public function getCollectionDocuments(string $collection, int $limit = 50): array
    {
        if ($this->isLive()) {
            $query = $this->firestore->collection($collection)->limit($limit);
            $documents = $query->documents();
            $results = [];
            foreach ($documents as $document) {
                if ($document->exists()) {
                    $results[] = array_merge(['id' => $document->id()], $document->data() ?? []);
                }
            }
            return $results;
        }

        return [];
    }
}
