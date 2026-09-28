<?php

namespace App\Providers;

use App\Services\Contracts\AdminAuthServiceInterface;
use App\Services\Contracts\CategoryServiceInterface;
use App\Services\Contracts\ProviderServiceInterface;
use App\Services\Contracts\UserServiceInterface;
use App\Services\Mock\MockAdminAuthService;
use App\Services\Mock\MockCategoryService;
use App\Services\Mock\MockProviderService;
use App\Services\Mock\MockUserService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * ─────────────────────────────────────────────────────────────────────
     * FIREBASE MIGRATION GUIDE
     * ─────────────────────────────────────────────────────────────────────
     * When Firebase integration is ready, replace each Mock* class below
     * with the corresponding Firebase* implementation. No other files need
     * to change — controllers depend only on the interfaces.
     *
     * Example:
     *   $this->app->bind(AdminAuthServiceInterface::class, FirebaseAdminAuthService::class);
     * ─────────────────────────────────────────────────────────────────────
     */
    public function register(): void
    {
        $this->app->bind(AdminAuthServiceInterface::class, MockAdminAuthService::class);
        $this->app->bind(UserServiceInterface::class,      MockUserService::class);
        $this->app->bind(ProviderServiceInterface::class,  MockProviderService::class);
        $this->app->bind(CategoryServiceInterface::class,  MockCategoryService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
