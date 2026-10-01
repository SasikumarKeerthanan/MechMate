<?php

namespace App\Services\Firebase;

use App\Services\Contracts\ReviewServiceInterface;
use App\Services\Mock\MockReviewService;
use Google\Cloud\Firestore\CollectionReference;
use Google\Cloud\Firestore\DocumentReference;
use Google\Cloud\Firestore\FirestoreClient;
use Kreait\Firebase\Contract\Firestore;
use Throwable;
use Illuminate\Support\Facades\Log;

class FirebaseReviewService implements ReviewServiceInterface
{
    private ?FirestoreClient $db = null;
    private ?CollectionReference $collection = null;
    private MockReviewService $mockFallback;

    public function __construct(
        private readonly ?Firestore $firestore = null
    ) {
        $this->mockFallback = new MockReviewService();
        $this->initializeFirestore();
    }

    private function initializeFirestore(): void
    {
        try {
            if ($this->firestore) {
                $this->db = $this->firestore->database();
            } else {
                $this->db = app(Firestore::class)->database();
            }

            if ($this->db) {
                $this->collection = $this->db->collection('reviews');
            }
        } catch (Throwable $e) {
            Log::error('FirebaseReviewService: Failed to initialize Firestore connection. Using fallback mock.', [
                'error' => $e->getMessage(),
            ]);
            $this->db = null;
            $this->collection = null;
        }
    }

    public function isConnected(): bool
    {
        return $this->db !== null && $this->collection !== null;
    }

    private function findDocRef(string $id): ?DocumentReference
    {
        $docRef = $this->collection->document((string) $id);
        if ($docRef->snapshot()->exists()) {
            return $docRef;
        }

        $query = $this->collection->where('id', '=', is_numeric($id) ? (int)$id : $id)->documents();
        foreach ($query as $doc) {
            if ($doc->exists()) {
                return $doc->reference();
            }
        }

        $queryStr = $this->collection->where('id', '=', (string)$id)->documents();
        foreach ($queryStr as $doc) {
            if ($doc->exists()) {
                return $doc->reference();
            }
        }

        return null;
    }

    private function formatReview($snapshot): array
    {
        $data = $snapshot->data() ?? [];
        $data['id'] = (string) ($data['id'] ?? $snapshot->id());
        $data['user'] = $data['user'] ?? 'Anonymous';
        $data['target_name'] = $data['target_name'] ?? 'Provider';
        $data['target_type'] = $data['target_type'] ?? 'service_center';
        $data['rating'] = (int) ($data['rating'] ?? 5);
        $data['comment'] = $data['comment'] ?? '';
        $data['status'] = $data['status'] ?? 'published';
        $data['flagged'] = (bool) ($data['flagged'] ?? false);
        $data['flag_reason'] = $data['flag_reason'] ?? null;
        $data['created_at'] = $data['created_at'] ?? date('Y-m-d');

        return $data;
    }

    public function getAllReviews(array $filters = []): array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->getAllReviews($filters);
        }

        try {
            $documents = $this->collection->documents();
            $reviews = [];

            foreach ($documents as $doc) {
                if ($doc->exists()) {
                    $reviews[] = $this->formatReview($doc);
                }
            }

            // Filter by rating
            $rating = $filters['rating'] ?? null;
            if (!empty($rating) && $rating !== 'all') {
                $reviews = array_filter($reviews, fn($r) => (int) $r['rating'] === (int) $rating);
            }

            // Filter by target_type
            $targetType = $filters['target_type'] ?? null;
            if (!empty($targetType) && $targetType !== 'all') {
                $reviews = array_filter($reviews, fn($r) => ($r['target_type'] ?? '') === $targetType);
            }

            // Filter by status
            $status = $filters['status'] ?? null;
            if (!empty($status) && $status !== 'all') {
                if ($status === 'flagged') {
                    $reviews = array_filter($reviews, fn($r) => ($r['flagged'] ?? false) === true);
                } else {
                    $reviews = array_filter($reviews, fn($r) => ($r['status'] ?? 'published') === $status);
                }
            }

            // Search term
            $search = $filters['search'] ?? null;
            if (!empty($search)) {
                $term = strtolower(trim($search));
                $reviews = array_filter($reviews, function ($r) use ($term) {
                    return str_contains(strtolower($r['user'] ?? ''), $term) ||
                           str_contains(strtolower($r['target_name'] ?? ''), $term) ||
                           str_contains(strtolower($r['comment'] ?? ''), $term);
                });
            }

            return array_values($reviews);
        } catch (Throwable $e) {
            Log::error('FirebaseReviewService: getAllReviews failed', ['error' => $e->getMessage()]);
            return $this->mockFallback->getAllReviews($filters);
        }
    }

    public function getFlaggedReviews(): array
    {
        return $this->getAllReviews(['status' => 'flagged']);
    }

    public function updateStatus(string $id, string $status): ?array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->updateStatus($id, $status);
        }

        try {
            $docRef = $this->findDocRef($id);
            if (!$docRef) {
                return null;
            }

            $updateData = ['status' => $status];
            if ($status === 'published') {
                $updateData['flagged'] = false;
            }

            $docRef->set($updateData, ['merge' => true]);

            return $this->formatReview($docRef->snapshot());
        } catch (Throwable $e) {
            Log::error("FirebaseReviewService: updateStatus failed for {$id}", ['error' => $e->getMessage()]);
            return $this->mockFallback->updateStatus($id, $status);
        }
    }

    public function deleteReview(string $id): bool
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->deleteReview($id);
        }

        try {
            $docRef = $this->findDocRef($id);
            if (!$docRef) {
                return false;
            }

            $docRef->delete();
            return true;
        } catch (Throwable $e) {
            Log::error("FirebaseReviewService: deleteReview failed for {$id}", ['error' => $e->getMessage()]);
            return $this->mockFallback->deleteReview($id);
        }
    }
}
