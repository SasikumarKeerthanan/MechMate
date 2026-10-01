<?php

namespace App\Services\Firebase;

use App\Services\Contracts\ProviderServiceInterface;
use App\Services\Mock\MockProviderService;
use Google\Cloud\Firestore\CollectionReference;
use Google\Cloud\Firestore\FirestoreClient;
use Kreait\Firebase\Contract\Firestore;
use Throwable;
use Illuminate\Support\Facades\Log;

class FirebaseProviderService implements ProviderServiceInterface
{
    private ?FirestoreClient $db = null;
    private ?CollectionReference $collection = null;
    private MockProviderService $mockFallback;

    public function __construct(
        private readonly ?Firestore $firestore = null
    ) {
        $this->mockFallback = new MockProviderService();
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
                $this->collection = $this->db->collection('providers');
            }
        } catch (Throwable $e) {
            Log::error('FirebaseProviderService: Failed to initialize Firestore connection. Using fallback mock.', [
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
     * Map a raw Firestore document snapshot to a structured provider array.
     */
    private function formatDocument($snapshot): array
    {
        $data = $snapshot->data() ?? [];
        $data['id'] = (string) ($data['id'] ?? $snapshot->id());

        // Standardize status and approval_status
        $status = $data['status'] ?? $data['approval_status'] ?? 'pending';
        $data['status'] = $status;
        $data['approval_status'] = $data['approval_status'] ?? $status;

        // Ensure key fields exist with clean defaults
        $data['type'] = $data['type'] ?? 'shop';
        $data['business_name'] = $data['business_name'] ?? 'Unnamed Provider';
        $data['owner_name'] = $data['owner_name'] ?? '';
        $data['email'] = $data['email'] ?? '';
        $data['phone'] = $data['phone'] ?? '';
        $data['city'] = $data['city'] ?? '';
        $data['address'] = $data['address'] ?? '';
        $data['specialty'] = $data['specialty'] ?? '';
        $data['license_number'] = $data['license_number'] ?? '';
        $data['tax_id'] = $data['tax_id'] ?? '';
        $data['email_verified'] = (bool) ($data['email_verified'] ?? false);
        $data['email_verification_status'] = $data['email_verification_status'] ?? ($data['email_verified'] ? 'verified' : 'pending');
        $data['rejection_reason'] = $data['rejection_reason'] ?? null;
        $data['verification_code_dispatched_at'] = $data['verification_code_dispatched_at'] ?? null;
        $data['created_at'] = $data['created_at'] ?? date('Y-m-d');
        $data['documents'] = isset($data['documents']) && is_array($data['documents']) ? $data['documents'] : [];

        return $data;
    }

    /**
     * Query all providers from Firestore with optional filtering.
     *
     * @param array $filters [type, status, approval_status, email_verification_status, search]
     * @return array
     */
    public function getAllProviders(array $filters = []): array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->getAllProviders($filters);
        }

        try {
            $documents = $this->collection->documents();
            $providers = [];

            foreach ($documents as $doc) {
                if ($doc->exists()) {
                    $providers[] = $this->formatDocument($doc);
                }
            }

            // Filter by provider type: shop, service_center, mechanic
            if (!empty($filters['type']) && $filters['type'] !== 'all') {
                $providers = array_filter($providers, fn($p) => ($p['type'] ?? '') === $filters['type']);
            }

            // Filter by status: pending, approved, rejected, suspended, active
            $statusFilter = $filters['status'] ?? $filters['approval_status'] ?? null;
            if (!empty($statusFilter) && $statusFilter !== 'all') {
                $providers = array_filter($providers, function ($p) use ($statusFilter) {
                    if ($statusFilter === 'active') {
                        return in_array($p['status'], ['approved', 'active']);
                    }
                    return ($p['status'] ?? '') === $statusFilter || ($p['approval_status'] ?? '') === $statusFilter;
                });
            }

            // Filter by email verification status: verified, pending
            if (!empty($filters['email_verification_status']) && $filters['email_verification_status'] !== 'all') {
                $providers = array_filter($providers, fn($p) => ($p['email_verification_status'] ?? 'pending') === $filters['email_verification_status']);
            }

            // Filter by search term
            if (!empty($filters['search'])) {
                $term = strtolower(trim($filters['search']));
                $providers = array_filter($providers, function ($p) use ($term) {
                    return str_contains(strtolower($p['business_name'] ?? ''), $term) ||
                           str_contains(strtolower($p['owner_name'] ?? ''), $term) ||
                           str_contains(strtolower($p['email'] ?? ''), $term) ||
                           str_contains(strtolower($p['phone'] ?? ''), $term) ||
                           str_contains(strtolower($p['city'] ?? ''), $term) ||
                           str_contains(strtolower($p['specialty'] ?? ''), $term);
                });
            }

            return array_values($providers);
        } catch (Throwable $e) {
            Log::error('FirebaseProviderService: getAllProviders failed', ['error' => $e->getMessage()]);
            return $this->mockFallback->getAllProviders($filters);
        }
    }

    /**
     * Fetch providers with pending approval status.
     *
     * @return array
     */
    public function getPendingProviders(): array
    {
        return $this->getAllProviders(['status' => 'pending']);
    }

    /**
     * Find single provider document by Firestore ID or internal ID.
     *
     * @param string $id
     * @return array|null
     */
    public function getProviderById(string $id): ?array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->getProviderById($id);
        }

        try {
            // First check direct document ID
            $docRef = $this->collection->document((string) $id);
            $snapshot = $docRef->snapshot();

            if ($snapshot->exists()) {
                return $this->formatDocument($snapshot);
            }

            // Next check numeric id field
            $queryDocs = $this->collection->where('id', '=', is_numeric($id) ? (int)$id : $id)->documents();
            foreach ($queryDocs as $doc) {
                if ($doc->exists()) {
                    return $this->formatDocument($doc);
                }
            }

            // Next check string id field
            $queryDocsStr = $this->collection->where('id', '=', (string)$id)->documents();
            foreach ($queryDocsStr as $doc) {
                if ($doc->exists()) {
                    return $this->formatDocument($doc);
                }
            }

            return null;
        } catch (Throwable $e) {
            Log::error("FirebaseProviderService: getProviderById failed for {$id}", ['error' => $e->getMessage()]);
            return $this->mockFallback->getProviderById($id);
        }
    }

    /**
     * Helper to find a document reference by ID or matching 'id' field.
     */
    private function findDocRef(string $id): ?\Google\Cloud\Firestore\DocumentReference
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

    /**
     * Approve provider registration, dispatch stub verification code, and update Firestore.
     *
     * @param string $id
     * @return array|null
     */
    public function approveProvider(string $id): ?array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->approveProvider($id);
        }

        try {
            $docRef = $this->findDocRef($id);
            if (!$docRef) {
                return null;
            }

            $currentData = $docRef->snapshot()->data() ?? [];
            $dispatchedAt = now()->toIso8601String();
            $verificationCode = rand(100000, 999999);

            $updatePayload = [
                'status' => 'approved',
                'approval_status' => 'approved',
                'verification_code_dispatched_at' => $dispatchedAt,
                'rejection_reason' => null,
            ];

            // If not already verified, ensure email verification remains pending
            if (empty($currentData['email_verification_status']) || $currentData['email_verification_status'] !== 'verified') {
                $updatePayload['email_verified'] = false;
                $updatePayload['email_verification_status'] = 'pending';
            }

            $docRef->set($updatePayload, ['merge' => true]);

            $businessName = $currentData['business_name'] ?? 'Provider ' . $id;
            $email = $currentData['email'] ?? 'unspecified';
            Log::info("[STUB EMAIL DISPATCH] Verification code {$verificationCode} dispatched to approved provider '{$businessName}' ({$email}) at {$dispatchedAt}");

            return $this->formatDocument($docRef->snapshot());
        } catch (Throwable $e) {
            Log::error("FirebaseProviderService: approveProvider failed for {$id}", ['error' => $e->getMessage()]);
            return $this->mockFallback->approveProvider($id);
        }
    }

    /**
     * Reject provider registration with optional reason and update Firestore.
     *
     * @param string $id
     * @param string|null $reason
     * @return array|null
     */
    public function rejectProvider(string $id, ?string $reason = null): ?array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->rejectProvider($id, $reason);
        }

        try {
            $docRef = $this->findDocRef($id);
            if (!$docRef) {
                return null;
            }

            $currentData = $docRef->snapshot()->data() ?? [];
            $rejectionReason = $reason ?? 'Credentials and documentation could not be verified.';

            $updatePayload = [
                'status' => 'rejected',
                'approval_status' => 'rejected',
                'rejection_reason' => $rejectionReason,
            ];

            $docRef->set($updatePayload, ['merge' => true]);

            $businessName = $currentData['business_name'] ?? 'Provider ' . $id;
            Log::warning("[PROVIDER REGISTRATION REJECTED] Provider ID {$id} ('{$businessName}') rejected by administrator. Reason: {$rejectionReason}");

            return $this->formatDocument($docRef->snapshot());
        } catch (Throwable $e) {
            Log::error("FirebaseProviderService: rejectProvider failed for {$id}", ['error' => $e->getMessage()]);
            return $this->mockFallback->rejectProvider($id, $reason);
        }
    }

    /**
     * Update status (e.g., active, suspended, approved, pending, rejected).
     *
     * @param string $id
     * @param string $status
     * @return array|null
     */
    public function updateProviderStatus(string $id, string $status): ?array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->updateProviderStatus($id, $status);
        }

        try {
            $docRef = $this->findDocRef($id);
            if (!$docRef) {
                return null;
            }

            $updatePayload = [
                'status' => $status,
                'approval_status' => $status,
            ];

            $docRef->set($updatePayload, ['merge' => true]);

            return $this->formatDocument($docRef->snapshot());
        } catch (Throwable $e) {
            Log::error("FirebaseProviderService: updateProviderStatus failed for {$id}", ['error' => $e->getMessage()]);
            return $this->mockFallback->updateProviderStatus($id, $status);
        }
    }

    /**
     * Alias for updateProviderStatus.
     *
     * @param string $id
     * @param string $status
     * @return array|null
     */
    public function updateStatus(string $id, string $status): ?array
    {
        return $this->updateProviderStatus($id, $status);
    }

    /**
     * Compute email verification statistics across providers in Firestore.
     *
     * @return array
     */
    public function getEmailVerificationStats(): array
    {
        if (!$this->isConnected()) {
            return $this->mockFallback->getEmailVerificationStats();
        }

        try {
            $providers = $this->getAllProviders();

            // Count only approved, active, or suspended providers
            $approvedProviders = array_filter($providers, fn($p) => in_array($p['status'] ?? '', ['approved', 'active', 'suspended']));
            $totalApproved = count($approvedProviders);

            $verified = 0;
            $pending = 0;
            $byType = [
                'shop' => ['total' => 0, 'verified' => 0, 'pending' => 0],
                'service_center' => ['total' => 0, 'verified' => 0, 'pending' => 0],
                'mechanic' => ['total' => 0, 'verified' => 0, 'pending' => 0],
            ];

            foreach ($approvedProviders as $p) {
                $isVerified = ($p['email_verification_status'] ?? '') === 'verified' || ($p['email_verified'] ?? false);
                $type = $p['type'] ?? 'shop';

                if (!isset($byType[$type])) {
                    $byType[$type] = ['total' => 0, 'verified' => 0, 'pending' => 0];
                }

                $byType[$type]['total']++;

                if ($isVerified) {
                    $verified++;
                    $byType[$type]['verified']++;
                } else {
                    $pending++;
                    $byType[$type]['pending']++;
                }
            }

            $rate = $totalApproved > 0 ? round(($verified / $totalApproved) * 100, 1) : 0.0;

            return [
                'total_approved' => $totalApproved,
                'verified_count' => $verified,
                'pending_verification_count' => $pending,
                'verification_rate' => $rate,
                'by_type' => $byType,
            ];
        } catch (Throwable $e) {
            Log::error('FirebaseProviderService: getEmailVerificationStats failed', ['error' => $e->getMessage()]);
            return $this->mockFallback->getEmailVerificationStats();
        }
    }
}
