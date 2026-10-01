<?php

use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\DiagnosisDataController;
use App\Http\Controllers\Api\Admin\MonitoringController;
use App\Http\Controllers\Api\Admin\ProviderController;
use App\Http\Controllers\Api\Admin\ReportController;
use App\Http\Controllers\Api\Admin\ReviewController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ServiceCentre\ServiceCentreController;
use App\Http\Controllers\Api\ShopOwner\ShopOwnerController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| MechMate API Routes
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api (configured in bootstrap/app.php).
|
| Authentication strategy:
|   - Currently: mock token validation (no middleware).
|   - Next step : add ->middleware('auth:sanctum') to the admin group once
|                 Firebase token verification middleware is implemented.
|
*/

// ── Auth / Password Reset (public) ────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/admin/login',     [AuthController::class, 'adminLogin']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/verify-code',     [AuthController::class, 'verifyResetCode']);
    Route::post('/reset-password',  [AuthController::class, 'resetPassword']);
});

// ── Admin routes ──────────────────────────────────────────────────────────────
// TODO: Add ->middleware('auth:sanctum') when token auth is implemented
Route::prefix('admin')->group(function () {

    // Dashboard
    Route::get('/dashboard-stats', [DashboardController::class, 'stats']);

    // User management
    Route::get('/users',                  [UserController::class, 'index']);
    Route::get('/users/{id}',             [UserController::class, 'show']);
    Route::put('/users/{id}',             [UserController::class, 'update']);
    Route::put('/users/{id}/status',      [UserController::class, 'updateStatus']);
    Route::delete('/users/{id}',          [UserController::class, 'destroy']);
    Route::patch('/users/{id}/deactivate', [UserController::class, 'deactivate']);
    Route::patch('/users/{id}/activate',   [UserController::class, 'activate']);

    // Provider management
    Route::get('/providers',                           [ProviderController::class, 'index']);
    Route::get('/providers/pending',                   [ProviderController::class, 'pending']);
    Route::get('/providers/email-verification-status', [ProviderController::class, 'emailVerificationStatus']);
    Route::get('/providers/{id}',                      [ProviderController::class, 'show']);
    Route::post('/providers/{id}/approve',             [ProviderController::class, 'approve']);
    Route::post('/providers/{id}/reject',              [ProviderController::class, 'reject']);
    Route::put('/providers/{id}/status',               [ProviderController::class, 'updateStatus']);

    // Categories (Spare Parts & Garage Services)
    Route::get('/categories',                  [CategoryController::class, 'index']);
    Route::get('/categories/parts',            [CategoryController::class, 'getParts']);
    Route::post('/categories/parts',           [CategoryController::class, 'storePart']);
    Route::put('/categories/parts/{id}',       [CategoryController::class, 'updatePart']);
    Route::delete('/categories/parts/{id}',    [CategoryController::class, 'destroyPart']);
    Route::get('/categories/services',         [CategoryController::class, 'getServices']);
    Route::post('/categories/services',        [CategoryController::class, 'storeService']);
    Route::put('/categories/services/{id}',    [CategoryController::class, 'updateService']);
    Route::delete('/categories/services/{id}', [CategoryController::class, 'destroyService']);

    // Diagnosis Reference Data & Search History
    Route::get('/diagnosis-data',         [DiagnosisDataController::class, 'index']);
    Route::post('/diagnosis-data',        [DiagnosisDataController::class, 'store']);
    Route::put('/diagnosis-data/{id}',    [DiagnosisDataController::class, 'update']);
    Route::delete('/diagnosis-data/{id}', [DiagnosisDataController::class, 'destroy']);
    Route::get('/diagnosis-history',      [DiagnosisDataController::class, 'history']);

    // Reports & System Analytics
    Route::get('/reports',         [ReportController::class, 'index']);
    Route::get('/reports/summary', [ReportController::class, 'summary']);
    Route::get('/reports/export',  [ReportController::class, 'export']);

    // Ratings & Reviews Moderation
    Route::get('/reviews',                 [ReviewController::class, 'index']);
    Route::put('/reviews/{id}/status',     [ReviewController::class, 'updateStatus']);
    Route::delete('/reviews/{id}',         [ReviewController::class, 'destroy']);
    Route::get('/reviews/flagged',         [ReviewController::class, 'flagged']);
    Route::patch('/reviews/{id}/approve',  [ReviewController::class, 'approve']);

    // API Usage & System Health Monitoring
    Route::get('/monitoring',          [MonitoringController::class, 'live']);
    Route::get('/monitoring/api-logs', [MonitoringController::class, 'apiLogs']);
    Route::get('/monitoring/alerts',   [MonitoringController::class, 'alerts']);
});

// ── Spare Part Shop Owner routes ──────────────────────────────────────────────
Route::prefix('shop')->group(function () {
    // Profile
    Route::get('/profile',  [ShopOwnerController::class, 'getProfile']);
    Route::put('/profile',  [ShopOwnerController::class, 'updateProfile']);

    // Spare parts catalog & inventory
    Route::get('/parts',              [ShopOwnerController::class, 'parts']);
    Route::post('/parts',             [ShopOwnerController::class, 'storePart']);
    Route::put('/parts/{id}',         [ShopOwnerController::class, 'updatePart']);
    Route::delete('/parts/{id}',      [ShopOwnerController::class, 'destroyPart']);
    Route::get('/parts/{id}/history', [ShopOwnerController::class, 'partHistory']);

    // Inquiries
    Route::get('/inquiries',             [ShopOwnerController::class, 'inquiries']);
    Route::post('/inquiries/{id}/reply', [ShopOwnerController::class, 'replyInquiry']);

    // Reviews & Ratings
    Route::get('/reviews', [ShopOwnerController::class, 'reviews']);

    // Analytics
    Route::get('/analytics', [ShopOwnerController::class, 'analytics']);
});

// ── Service Centre / Garage Owner routes ──────────────────────────────────────
Route::prefix('garage')->group(function () {
    // Profile
    Route::get('/profile', [ServiceCentreController::class, 'getProfile']);
    Route::put('/profile', [ServiceCentreController::class, 'updateProfile']);

    // Supported vehicle types
    Route::get('/vehicles', [ServiceCentreController::class, 'getVehicles']);
    Route::put('/vehicles', [ServiceCentreController::class, 'updateVehicles']);

    // Services catalog
    Route::get('/services',         [ServiceCentreController::class, 'services']);
    Route::post('/services',        [ServiceCentreController::class, 'storeService']);
    Route::put('/services/{id}',    [ServiceCentreController::class, 'updateService']);
    Route::delete('/services/{id}', [ServiceCentreController::class, 'destroyService']);

    // Inquiries
    Route::get('/inquiries',             [ServiceCentreController::class, 'inquiries']);
    Route::post('/inquiries/{id}/reply', [ServiceCentreController::class, 'replyInquiry']);

    // Reviews & Ratings
    Route::get('/reviews', [ServiceCentreController::class, 'reviews']);

    // Analytics
    Route::get('/analytics', [ServiceCentreController::class, 'analytics']);
});
