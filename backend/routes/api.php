<?php

use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\ApiLogController;
use App\Http\Controllers\Api\V1\Admin\DiagnosisDataController;
use App\Http\Controllers\Api\V1\Admin\InquiryController;
use App\Http\Controllers\Api\V1\Admin\MechanicRequestController;
use App\Http\Controllers\Api\V1\Admin\PartCategoryController;
use App\Http\Controllers\Api\V1\Admin\ProviderApprovalController;
use App\Http\Controllers\Api\V1\Admin\ReviewController;
use App\Http\Controllers\Api\V1\Admin\ServiceCategoryController;
use App\Http\Controllers\Api\V1\Admin\UserManagementController;
use App\Http\Controllers\Api\V1\Auth\ForgotPasswordController;
use App\Http\Middleware\AdminAuthenticate;
use App\Http\Middleware\ForceJsonResponse;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - MechMate
|--------------------------------------------------------------------------
|
| All routes are registered under the '/api' prefix and forced to return
| application/json responses with standard envelope formatting.
|
*/

Route::middleware([ForceJsonResponse::class])->prefix('v1')->group(function () {

    /*
    |----------------------------------------------------------------------
    | Public Authentication & Password Recovery Endpoints
    |----------------------------------------------------------------------
    */
    Route::prefix('auth')->group(function () {
        Route::post('forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
        Route::post('verify-reset-token', [ForgotPasswordController::class, 'verifyToken']);
        Route::post('reset-password', [ForgotPasswordController::class, 'resetPassword']);
    });

    /*
    |----------------------------------------------------------------------
    | Protected Administrator Endpoints (/api/v1/admin)
    |----------------------------------------------------------------------
    */
    Route::prefix('admin')->middleware([AdminAuthenticate::class])->group(function () {

        // 1. Dashboard Overview
        Route::get('overview', [AdminDashboardController::class, 'index']);

        // 2. User Management
        Route::get('users', [UserManagementController::class, 'index']);
        Route::patch('users/{id}/status', [UserManagementController::class, 'updateStatus']);

        // 3. Provider Approvals
        Route::get('provider-approvals', [ProviderApprovalController::class, 'index']);
        Route::post('provider-approvals/{id}/approve', [ProviderApprovalController::class, 'approve']);
        Route::post('provider-approvals/{id}/reject', [ProviderApprovalController::class, 'reject']);

        // 4. Part Categories
        Route::get('part-categories', [PartCategoryController::class, 'index']);
        Route::post('part-categories', [PartCategoryController::class, 'store']);
        Route::delete('part-categories/{id}', [PartCategoryController::class, 'destroy']);

        // 5. Service Categories
        Route::get('service-categories', [ServiceCategoryController::class, 'index']);
        Route::post('service-categories', [ServiceCategoryController::class, 'store']);

        // 6. Diagnosis Data
        Route::get('diagnosis-data', [DiagnosisDataController::class, 'index']);
        Route::post('diagnosis-data', [DiagnosisDataController::class, 'store']);

        // 7. API Logs
        Route::get('api-logs', [ApiLogController::class, 'index']);

        // 8. Reviews
        Route::get('reviews', [ReviewController::class, 'index']);
        Route::patch('reviews/{id}/moderation', [ReviewController::class, 'updateModeration']);

        // 9. Mechanic Requests
        Route::get('mechanic-requests', [MechanicRequestController::class, 'index']);
        Route::patch('mechanic-requests/{id}/status', [MechanicRequestController::class, 'updateStatus']);

        // 10. Inquiries
        Route::get('inquiries', [InquiryController::class, 'index']);
        Route::post('inquiries/{id}/reply', [InquiryController::class, 'reply']);
    });
});
