<?php

use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\MonitoringController;
use App\Http\Controllers\Api\Admin\ProviderController;
use App\Http\Controllers\Api\Admin\ReportController;
use App\Http\Controllers\Api\Admin\ReviewController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\AuthController;
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

    // Categories
    Route::get('/categories',        [CategoryController::class, 'index']);
    Route::post('/categories',       [CategoryController::class, 'store']);
    Route::put('/categories/{id}',   [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Reports
    Route::get('/reports', [ReportController::class, 'index']);

    // Reviews / Moderation
    Route::get('/reviews/flagged',         [ReviewController::class, 'flagged']);
    Route::patch('/reviews/{id}/approve',  [ReviewController::class, 'approve']);
    Route::delete('/reviews/{id}',         [ReviewController::class, 'destroy']);

    // Monitoring
    Route::get('/monitoring', [MonitoringController::class, 'live']);
});
