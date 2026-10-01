<?php

namespace App\Services\Firebase;

use App\Services\Contracts\ShopOwnerServiceInterface;
use Google\Cloud\Firestore\CollectionReference;
use Google\Cloud\Firestore\DocumentReference;
use Google\Cloud\Firestore\FirestoreClient;
use Kreait\Firebase\Contract\Firestore;
use Throwable;
use Illuminate\Support\Facades\Log;

class FirebaseShopOwnerService implements ShopOwnerServiceInterface
{
    private ?FirestoreClient $db = null;
    private ?CollectionReference $shopsCollection = null;
    private ?CollectionReference $partsCollection = null;
    private ?CollectionReference $stockHistoryCollection = null;
    private ?CollectionReference $priceHistoryCollection = null;
    private ?CollectionReference $inquiriesCollection = null;
    private ?CollectionReference $analyticsCollection = null;
    private ?CollectionReference $reviewsCollection = null;
    private ?CollectionReference $providersCollection = null;

    public function __construct(
        private readonly ?Firestore $firestore = null
    ) {
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
                $this->shopsCollection        = $this->db->collection('shops');
                $this->partsCollection        = $this->db->collection('spare_parts');
                $this->stockHistoryCollection = $this->db->collection('stock_history');
                $this->priceHistoryCollection = $this->db->collection('price_history');
                $this->inquiriesCollection    = $this->db->collection('shop_inquiries');
                $this->analyticsCollection    = $this->db->collection('shop_analytics');
                $this->reviewsCollection      = $this->db->collection('reviews');
                $this->providersCollection    = $this->db->collection('providers');
            }
        } catch (Throwable $e) {
            Log::error('FirebaseShopOwnerService: Firestore initialization error: ' . $e->getMessage());
            $this->db = null;
        }
    }

    public function isConnected(): bool
    {
        return $this->db !== null && $this->partsCollection !== null;
    }

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

    public function getProfile(string $shopId): ?array
    {
        if (!$this->isConnected()) {
            return $this->defaultShopProfile($shopId);
        }

        try {
            // Check shops collection
            $docRef = $this->findDocRef($this->shopsCollection, $shopId);
            if ($docRef && $docRef->snapshot()->exists()) {
                $data = $docRef->snapshot()->data();
                $data['id'] = (string) ($data['id'] ?? $docRef->id());
                return $data;
            }

            // Fallback to providers collection
            if ($this->providersCollection) {
                $pRef = $this->findDocRef($this->providersCollection, $shopId);
                if ($pRef && $pRef->snapshot()->exists()) {
                    $pData = $pRef->snapshot()->data();
                    $profile = [
                        'id' => (string) ($pData['id'] ?? $shopId),
                        'name' => $pData['business_name'] ?? 'SpeedServe Auto Parts',
                        'owner_name' => $pData['owner_name'] ?? 'Mahesh Fonseka',
                        'email' => $pData['email'] ?? 'sales@speedserve.lk',
                        'phone' => $pData['phone'] ?? '+94 11 432 9988',
                        'city' => $pData['city'] ?? 'Colombo',
                        'address' => $pData['address'] ?? '112 Panchikawatta Road, Colombo 10',
                        'opening_hours' => 'Mon - Sat: 8:30 AM - 6:00 PM',
                        'coordinates' => ['lat' => 6.9319, 'lng' => 79.8654],
                        'description' => 'Authorised direct distributor of Japanese genuine and high-grade OEM aftermarket spare parts.',
                        'specialty' => $pData['specialty'] ?? 'Brake Systems, Suspension, Engine Filters',
                        'license_number' => $pData['license_number'] ?? 'BR-CO-2021-3921',
                        'tax_id' => $pData['tax_id'] ?? 'TIN-20918239',
                        'created_at' => $pData['created_at'] ?? '2024-03-12',
                    ];
                    // Save to shops collection for future direct access
                    $this->shopsCollection->document((string) $profile['id'])->set($profile);
                    return $profile;
                }
            }

            return $this->defaultShopProfile($shopId);
        } catch (Throwable $e) {
            Log::error("FirebaseShopOwnerService: getProfile failed for {$shopId}: " . $e->getMessage());
            return $this->defaultShopProfile($shopId);
        }
    }

    public function updateProfile(string $shopId, array $data): ?array
    {
        if (!$this->isConnected()) {
            return array_merge($this->defaultShopProfile($shopId), $data);
        }

        try {
            $docRef = $this->findDocRef($this->shopsCollection, $shopId);
            if (!$docRef) {
                $docRef = $this->shopsCollection->document((string) $shopId);
            }

            $current = $this->getProfile($shopId) ?? [];
            $updated = array_merge($current, $data, ['id' => (string) $shopId]);

            $docRef->set($updated, ['merge' => true]);

            // Sync basic fields back to providers collection if present
            if ($this->providersCollection) {
                $pRef = $this->findDocRef($this->providersCollection, $shopId);
                if ($pRef) {
                    $pUpdate = [];
                    if (isset($data['name'])) $pUpdate['business_name'] = $data['name'];
                    if (isset($data['phone'])) $pUpdate['phone'] = $data['phone'];
                    if (isset($data['address'])) $pUpdate['address'] = $data['address'];
                    if (isset($data['city'])) $pUpdate['city'] = $data['city'];
                    if (isset($data['specialty'])) $pUpdate['specialty'] = $data['specialty'];
                    if (!empty($pUpdate)) {
                        $pRef->set($pUpdate, ['merge' => true]);
                    }
                }
            }

            return $updated;
        } catch (Throwable $e) {
            Log::error("FirebaseShopOwnerService: updateProfile failed for {$shopId}: " . $e->getMessage());
            return null;
        }
    }

    public function getSpareParts(string $shopId, array $filters = []): array
    {
        if (!$this->isConnected()) {
            return [];
        }

        try {
            $documents = $this->partsCollection->where('shop_id', '=', (string) $shopId)->documents();
            $parts = [];

            foreach ($documents as $doc) {
                if ($doc->exists()) {
                    $data = $doc->data();
                    $data['id'] = (string) ($data['id'] ?? $doc->id());
                    $parts[] = $data;
                }
            }

            // Filter by category
            if (!empty($filters['category']) && $filters['category'] !== 'all') {
                $cat = $filters['category'];
                $parts = array_filter($parts, fn($p) => strcasecmp($p['category'] ?? '', $cat) === 0);
            }

            // Filter by brand
            if (!empty($filters['brand']) && $filters['brand'] !== 'all') {
                $brand = $filters['brand'];
                $parts = array_filter($parts, fn($p) => strcasecmp($p['brand'] ?? '', $brand) === 0);
            }

            // Filter by vehicle type
            if (!empty($filters['vehicle_type']) && $filters['vehicle_type'] !== 'all') {
                $vType = strtolower($filters['vehicle_type']);
                $parts = array_filter($parts, function ($p) use ($vType) {
                    $compat = is_array($p['vehicle_compatibility'] ?? null)
                        ? implode(' ', $p['vehicle_compatibility'])
                        : ($p['vehicle_compatibility'] ?? '');
                    return str_contains(strtolower($compat), $vType) ||
                           str_contains(strtolower($p['vehicle_type'] ?? ''), $vType);
                });
            }

            // Filter by stock status / availability
            if (!empty($filters['availability']) && $filters['availability'] !== 'all') {
                $avail = $filters['availability'];
                $parts = array_filter($parts, fn($p) => ($p['availability'] ?? 'in_stock') === $avail);
            }

            // Search query
            if (!empty($filters['search'])) {
                $term = strtolower(trim($filters['search']));
                $parts = array_filter($parts, function ($p) use ($term) {
                    return str_contains(strtolower($p['name'] ?? ''), $term) ||
                           str_contains(strtolower($p['brand'] ?? ''), $term) ||
                           str_contains(strtolower($p['model'] ?? ''), $term) ||
                           str_contains(strtolower($p['part_number'] ?? ''), $term) ||
                           str_contains(strtolower($p['category'] ?? ''), $term);
                });
            }

            return array_values($parts);
        } catch (Throwable $e) {
            Log::error("FirebaseShopOwnerService: getSpareParts failed: " . $e->getMessage());
            return [];
        }
    }

    public function addSparePart(string $shopId, array $data): array
    {
        if (!$this->isConnected()) {
            return [];
        }

        try {
            $docRef = $this->partsCollection->newDocument();
            $partId = $docRef->id();

            $qty = (int) ($data['stock_quantity'] ?? 0);
            $availability = $data['availability'] ?? ($qty > 5 ? 'in_stock' : ($qty > 0 ? 'low_stock' : 'out_of_stock'));

            $newPart = [
                'id' => (string) $partId,
                'shop_id' => (string) $shopId,
                'name' => $data['name'] ?? 'Spare Part',
                'part_number' => $data['part_number'] ?? strtoupper(substr(md5(uniqid()), 0, 8)),
                'category' => $data['category'] ?? 'General',
                'vehicle_compatibility' => isset($data['vehicle_compatibility']) && is_array($data['vehicle_compatibility'])
                    ? $data['vehicle_compatibility']
                    : (isset($data['vehicle_compatibility']) ? [$data['vehicle_compatibility']] : ['All Models']),
                'brand' => $data['brand'] ?? 'OEM Genuine',
                'model' => $data['model'] ?? 'Universal',
                'price' => (float) ($data['price'] ?? 0),
                'description' => $data['description'] ?? '',
                'image_url' => $data['image_url'] ?? null,
                'condition' => $data['condition'] ?? 'Brand New',
                'stock_quantity' => $qty,
                'availability' => $availability,
                'views_count' => 0,
                'created_at' => now()->toDateString(),
            ];

            $docRef->set($newPart);

            // Log initial price history
            if ($this->priceHistoryCollection && $newPart['price'] > 0) {
                $this->priceHistoryCollection->newDocument()->set([
                    'part_id' => (string) $partId,
                    'shop_id' => (string) $shopId,
                    'old_price' => 0,
                    'new_price' => $newPart['price'],
                    'changed_at' => now()->toIso8601String(),
                    'reason' => 'Initial catalog listing price',
                ]);
            }

            // Log initial stock history
            if ($this->stockHistoryCollection && $qty > 0) {
                $this->stockHistoryCollection->newDocument()->set([
                    'part_id' => (string) $partId,
                    'shop_id' => (string) $shopId,
                    'old_quantity' => 0,
                    'new_quantity' => $qty,
                    'change_type' => 'initial_inventory',
                    'adjusted_at' => now()->toIso8601String(),
                    'notes' => 'Initial stock intake upon part creation',
                ]);
            }

            return $newPart;
        } catch (Throwable $e) {
            Log::error("FirebaseShopOwnerService: addSparePart failed: " . $e->getMessage());
            return [];
        }
    }

    public function updateSparePart(string $partId, array $data): ?array
    {
        if (!$this->isConnected()) {
            return null;
        }

        try {
            $docRef = $this->findDocRef($this->partsCollection, $partId);
            if (!$docRef) {
                return null;
            }

            $currentData = $docRef->snapshot()->data() ?? [];
            $shopId = (string) ($currentData['shop_id'] ?? '201');

            // 1. Price Change Logging
            if (isset($data['price']) && (float) $data['price'] !== (float) ($currentData['price'] ?? 0)) {
                $oldPrice = (float) ($currentData['price'] ?? 0);
                $newPrice = (float) $data['price'];
                $this->priceHistoryCollection->newDocument()->set([
                    'part_id' => (string) $partId,
                    'shop_id' => $shopId,
                    'old_price' => $oldPrice,
                    'new_price' => $newPrice,
                    'changed_at' => now()->toIso8601String(),
                    'reason' => $data['price_change_reason'] ?? 'Inventory price revision',
                ]);
                Log::info("[PRICE LOGGED] Part {$partId} price changed from {$oldPrice} to {$newPrice}");
            }

            // 2. Stock Adjustment Logging
            if (isset($data['stock_quantity']) && (int) $data['stock_quantity'] !== (int) ($currentData['stock_quantity'] ?? 0)) {
                $oldQty = (int) ($currentData['stock_quantity'] ?? 0);
                $newQty = (int) $data['stock_quantity'];
                $this->stockHistoryCollection->newDocument()->set([
                    'part_id' => (string) $partId,
                    'shop_id' => $shopId,
                    'old_quantity' => $oldQty,
                    'new_quantity' => $newQty,
                    'change_type' => $data['stock_change_type'] ?? ($newQty > $oldQty ? 'restock' : 'sale/adjustment'),
                    'adjusted_at' => now()->toIso8601String(),
                    'notes' => $data['stock_notes'] ?? 'Manual inventory count adjustment',
                ]);
                Log::info("[STOCK LOGGED] Part {$partId} stock adjusted from {$oldQty} to {$newQty}");

                // Auto update availability if not explicitly set
                if (!isset($data['availability'])) {
                    $data['availability'] = $newQty > 5 ? 'in_stock' : ($newQty > 0 ? 'low_stock' : 'out_of_stock');
                }
            }

            $docRef->set($data, ['merge' => true]);

            $updatedSnap = $docRef->snapshot();
            $result = $updatedSnap->data();
            $result['id'] = (string) ($result['id'] ?? $docRef->id());

            return $result;
        } catch (Throwable $e) {
            Log::error("FirebaseShopOwnerService: updateSparePart failed for {$partId}: " . $e->getMessage());
            return null;
        }
    }

    public function deleteSparePart(string $partId): bool
    {
        if (!$this->isConnected()) {
            return false;
        }

        try {
            $docRef = $this->findDocRef($this->partsCollection, $partId);
            if (!$docRef) {
                return false;
            }

            $docRef->delete();
            return true;
        } catch (Throwable $e) {
            Log::error("FirebaseShopOwnerService: deleteSparePart failed for {$partId}: " . $e->getMessage());
            return false;
        }
    }

    public function getStockHistory(string $partId): array
    {
        if (!$this->isConnected() || !$this->stockHistoryCollection) {
            return [];
        }

        try {
            $documents = $this->stockHistoryCollection->where('part_id', '=', (string) $partId)->documents();
            $history = [];
            foreach ($documents as $doc) {
                if ($doc->exists()) {
                    $d = $doc->data();
                    $d['id'] = (string) ($d['id'] ?? $doc->id());
                    $d['date'] = $d['date'] ?? $d['adjusted_at'] ?? now()->toIso8601String();
                    $d['final_quantity'] = (int) ($d['final_quantity'] ?? $d['new_quantity'] ?? 0);
                    $old = (int) ($d['old_quantity'] ?? 0);
                    $new = (int) ($d['new_quantity'] ?? 0);
                    $d['quantity_change'] = (int) ($d['quantity_change'] ?? ($new - $old));
                    $history[] = $d;
                }
            }
            usort($history, fn($a, $b) => strcmp($b['adjusted_at'] ?? $b['date'] ?? '', $a['adjusted_at'] ?? $a['date'] ?? ''));
            return array_values($history);
        } catch (Throwable $e) {
            Log::error("FirebaseShopOwnerService: getStockHistory failed: " . $e->getMessage());
            return [];
        }
    }

    public function getPriceHistory(string $partId): array
    {
        if (!$this->isConnected() || !$this->priceHistoryCollection) {
            return [];
        }

        try {
            $documents = $this->priceHistoryCollection->where('part_id', '=', (string) $partId)->documents();
            $history = [];
            foreach ($documents as $doc) {
                if ($doc->exists()) {
                    $d = $doc->data();
                    $d['id'] = (string) ($d['id'] ?? $doc->id());
                    $d['date'] = $d['date'] ?? $d['changed_at'] ?? now()->toIso8601String();
                    $history[] = $d;
                }
            }
            usort($history, fn($a, $b) => strcmp($b['changed_at'] ?? $b['date'] ?? '', $a['changed_at'] ?? $a['date'] ?? ''));
            return array_values($history);

        } catch (Throwable $e) {
            Log::error("FirebaseShopOwnerService: getPriceHistory failed: " . $e->getMessage());
            return [];
        }
    }

    public function getInquiries(string $shopId): array
    {
        if (!$this->isConnected() || !$this->inquiriesCollection) {
            return [];
        }

        try {
            $documents = $this->inquiriesCollection->where('shop_id', '=', (string) $shopId)->documents();
            $inquiries = [];
            foreach ($documents as $doc) {
                if ($doc->exists()) {
                    $d = $doc->data();
                    $d['id'] = (string) ($d['id'] ?? $doc->id());
                    $inquiries[] = $d;
                }
            }
            usort($inquiries, fn($a, $b) => strcmp($b['created_at'] ?? '', $a['created_at'] ?? ''));
            return array_values($inquiries);
        } catch (Throwable $e) {
            Log::error("FirebaseShopOwnerService: getInquiries failed: " . $e->getMessage());
            return [];
        }
    }

    public function respondToInquiry(string $inquiryId, string $response): ?array
    {
        if (!$this->isConnected() || !$this->inquiriesCollection) {
            return null;
        }

        try {
            $docRef = $this->findDocRef($this->inquiriesCollection, $inquiryId);
            if (!$docRef) {
                return null;
            }

            $updateData = [
                'status' => 'responded',
                'response' => $response,
                'responded_at' => now()->toIso8601String(),
            ];

            $docRef->set($updateData, ['merge' => true]);

            $d = $docRef->snapshot()->data();
            $d['id'] = (string) ($d['id'] ?? $docRef->id());
            return $d;
        } catch (Throwable $e) {
            Log::error("FirebaseShopOwnerService: respondToInquiry failed: " . $e->getMessage());
            return null;
        }
    }

    public function getReviews(string $shopId): array
    {
        if (!$this->isConnected() || !$this->reviewsCollection) {
            return [];
        }

        try {
            $profile = $this->getProfile($shopId);
            $shopName = $profile['name'] ?? 'SpeedServe Auto Parts';

            $documents = $this->reviewsCollection->documents();
            $reviews = [];
            foreach ($documents as $doc) {
                if ($doc->exists()) {
                    $d = $doc->data();
                    $isPublished = ($d['status'] ?? 'published') !== 'hidden';
                    $match = $isPublished && (
                             (($d['shop_id'] ?? null) == $shopId) ||
                             (stripos($d['target_name'] ?? '', $shopName) !== false) ||
                             (($d['target_type'] ?? '') === 'shop')
                    );
                    if ($match) {
                        $d['id'] = (string) ($d['id'] ?? $doc->id());
                        $reviews[] = $d;
                    }
                }
            }
            return array_values($reviews);
        } catch (Throwable $e) {
            Log::error("FirebaseShopOwnerService: getReviews failed: " . $e->getMessage());
            return [];
        }
    }

    public function getStatistics(string $shopId): array
    {
        try {
            $parts = $this->getSpareParts($shopId);
            $inquiries = $this->getInquiries($shopId);
            $reviews = $this->getReviews($shopId);

            $lowStockParts = array_filter($parts, fn($p) => (int) ($p['stock_quantity'] ?? 0) <= 5);
            $pendingInquiries = array_filter($inquiries, fn($i) => ($i['status'] ?? 'pending') === 'pending');

            // Top viewed parts (or sorted by views_count)
            usort($parts, fn($a, $b) => ((int)($b['views_count'] ?? 0)) <=> ((int)($a['views_count'] ?? 0)));
            $topViewed = array_slice($parts, 0, 5);

            $ratings = array_map(fn($r) => (int) ($r['rating'] ?? 5), $reviews);
            $avgRating = count($ratings) > 0 ? round(array_sum($ratings) / count($ratings), 1) : 4.8;

            return [
                'profile_views' => 1240,
                'total_parts' => count($parts),
                'low_stock_count' => count($lowStockParts),
                'low_stock_parts' => array_values($lowStockParts),
                'top_viewed_parts' => array_values($topViewed),
                'total_inquiries' => count($inquiries),
                'pending_inquiries' => count($pendingInquiries),
                'total_reviews' => count($reviews),
                'average_rating' => $avgRating,
                'last_updated' => now()->toIso8601String(),
            ];
        } catch (Throwable $e) {
            Log::error("FirebaseShopOwnerService: getStatistics failed: " . $e->getMessage());
            return [
                'profile_views' => 1240,
                'total_parts' => 0,
                'low_stock_count' => 0,
                'low_stock_parts' => [],
                'top_viewed_parts' => [],
                'total_inquiries' => 0,
                'pending_inquiries' => 0,
                'total_reviews' => 0,
                'average_rating' => 4.8,
                'last_updated' => now()->toIso8601String(),
            ];
        }
    }

    private function defaultShopProfile(string $shopId): array
    {
        return [
            'id' => (string) $shopId,
            'name' => 'SpeedServe Auto Parts',
            'owner_name' => 'Mahesh Fonseka',
            'email' => 'sales@speedserve.lk',
            'phone' => '+94 11 432 9988',
            'city' => 'Colombo',
            'address' => '112 Panchikawatta Road, Colombo 10',
            'opening_hours' => 'Mon - Sat: 8:30 AM - 6:00 PM',
            'coordinates' => ['lat' => 6.9319, 'lng' => 79.8654],
            'description' => 'Authorised direct distributor of Japanese genuine and high-grade OEM aftermarket spare parts.',
            'specialty' => 'Brake Systems, Suspension, Engine Filters',
            'license_number' => 'BR-CO-2021-3921',
            'tax_id' => 'TIN-20918239',
            'created_at' => '2024-03-12',
        ];
    }
}
