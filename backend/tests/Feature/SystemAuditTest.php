<?php

namespace Tests\Feature;

use Tests\TestCase;

class SystemAuditTest extends TestCase
{
    /**
     * Test Category Synchronization APIs.
     */
    public function test_category_endpoints(): void
    {
        $responseParts = $this->getJson('/api/admin/categories/parts');
        $responseParts->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'categories',
            ]);

        $responseServices = $this->getJson('/api/admin/categories/services');
        $responseServices->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'categories',
            ]);
    }

    /**
     * Test Provider Management APIs.
     */
    public function test_provider_endpoints(): void
    {
        $response = $this->getJson('/api/admin/providers');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'providers',
            ]);

        $pending = $this->getJson('/api/admin/providers/pending');
        $pending->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'providers',
            ]);

        $emailStatus = $this->getJson('/api/admin/providers/email-verification-status');
        $emailStatus->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'stats',
            ]);
    }

    /**
     * Test User Management APIs.
     */
    public function test_user_endpoints(): void
    {
        $response = $this->getJson('/api/admin/users');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'users',
            ]);
    }

    /**
     * Test Review Moderation APIs.
     */
    public function test_review_endpoints(): void
    {
        $response = $this->getJson('/api/admin/reviews');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'reviews',
            ]);

        $flagged = $this->getJson('/api/admin/reviews/flagged');
        $flagged->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'flagged',
            ]);
    }

    /**
     * Test Monitoring & Alerts APIs.
     */
    public function test_monitoring_endpoints(): void
    {
        $response = $this->getJson('/api/admin/monitoring');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'activeUsers',
                'onlineProviders',
                'apis',
            ]);

        $alerts = $this->getJson('/api/admin/monitoring/alerts');
        $alerts->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'alerts',
            ]);
    }

    /**
     * Test Stock Calculation Logic and History Logging.
     */
    public function test_inventory_stock_calculation_and_history(): void
    {
        // 1. Create a test spare part with initial quantity 12 (in_stock)
        $createRes = $this->postJson('/api/shop/parts?shop_id=201', [
            'name'           => 'QA Brake Pad Set',
            'category'       => 'Braking System',
            'brand'          => 'Brembo',
            'model'          => 'Universal',
            'price'          => 12500,
            'stock_quantity' => 12,
        ]);

        $createRes->assertStatus(201);
        $part = $createRes->json('part');
        $partId = $part['id'];
        $this->assertEquals('in_stock', $part['availability']);

        // 2. Update stock quantity to 3 -> should trigger low_stock
        $lowStockRes = $this->putJson("/api/shop/parts/{$partId}?shop_id=201", [
            'stock_quantity' => 3,
            'stock_notes'    => 'Auditing low stock transition',
        ]);
        $lowStockRes->assertStatus(200);
        $this->assertEquals('low_stock', $lowStockRes->json('part.availability'));

        // 3. Update stock quantity to 0 -> should trigger out_of_stock
        $outOfStockRes = $this->putJson("/api/shop/parts/{$partId}?shop_id=201", [
            'stock_quantity' => 0,
            'stock_notes'    => 'Auditing out of stock transition',
        ]);
        $outOfStockRes->assertStatus(200);
        $this->assertEquals('out_of_stock', $outOfStockRes->json('part.availability'));

        // 4. Update price to test price history logging
        $priceUpdateRes = $this->putJson("/api/shop/parts/{$partId}?shop_id=201", [
            'price'               => 14000,
            'price_change_reason' => 'QA price revision test',
        ]);
        $priceUpdateRes->assertStatus(200);

        // 5. Verify history endpoints return logged entries
        $historyRes = $this->getJson("/api/shop/parts/{$partId}/history");
        $historyRes->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'part_id',
                'stock_history',
                'price_history',
            ]);

        $this->assertNotEmpty($historyRes->json('stock_history'));
        $this->assertNotEmpty($historyRes->json('price_history'));

        // Cleanup test part
        $this->deleteJson("/api/shop/parts/{$partId}");
    }

    /**
     * Test Spare Part Shop Owner APIs.
     */
    public function test_shop_owner_endpoints(): void
    {
        $profile = $this->getJson('/api/shop/profile?shop_id=201');
        $profile->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'profile',
            ]);

        $parts = $this->getJson('/api/shop/parts?shop_id=201');
        $parts->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'parts',
            ]);

        $inquiries = $this->getJson('/api/shop/inquiries?shop_id=201');
        $inquiries->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'inquiries',
            ]);

        $reviews = $this->getJson('/api/shop/reviews?shop_id=201');
        $reviews->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'reviews',
            ]);

        $analytics = $this->getJson('/api/shop/analytics?shop_id=201');
        $analytics->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'stats',
            ]);
    }

    /**
     * Test Service Centre / Garage Owner APIs.
     */
    public function test_service_centre_endpoints(): void
    {
        $profile = $this->getJson('/api/garage/profile?garage_id=301');
        $profile->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'profile',
            ]);

        $vehicles = $this->getJson('/api/garage/vehicles?garage_id=301');
        $vehicles->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'vehicles',
            ]);

        $services = $this->getJson('/api/garage/services?garage_id=301');
        $services->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'services',
            ]);

        $inquiries = $this->getJson('/api/garage/inquiries?garage_id=301');
        $inquiries->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'inquiries',
            ]);

        $reviews = $this->getJson('/api/garage/reviews?garage_id=301');
        $reviews->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'reviews',
            ]);

        $analytics = $this->getJson('/api/garage/analytics?garage_id=301');
        $analytics->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'stats',
            ]);
    }

    /**
     * Test Forgot Password & Reset Flow APIs.
     */
    public function test_auth_forgot_password_flow(): void
    {
        // 1. Request reset code for admin
        $fp = $this->postJson('/api/auth/forgot-password', [
            'email' => 'admin@mechmate.lk',
        ]);
        $fp->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'success',
                'message',
                'debug_code',
            ]);

        $debugCode = $fp->json('debug_code');

        // 2. Verify code
        $verify = $this->postJson('/api/auth/verify-code', [
            'email' => 'admin@mechmate.lk',
            'code'  => $debugCode,
        ]);
        $verify->assertStatus(200)
            ->assertJson([
                'status'  => 'success',
                'success' => true,
            ]);

        // 3. Invalid code rejection
        $invalidVerify = $this->postJson('/api/auth/verify-code', [
            'email' => 'admin@mechmate.lk',
            'code'  => '000000',
        ]);
        $invalidVerify->assertStatus(422);

        // 4. Password mismatch validation
        $mismatch = $this->postJson('/api/auth/reset-password', [
            'email'                 => 'admin@mechmate.lk',
            'code'                  => $debugCode,
            'password'              => 'NewPassword123!',
            'password_confirmation' => 'Mismatch123!',
        ]);
        $mismatch->assertStatus(422);
    }
}
