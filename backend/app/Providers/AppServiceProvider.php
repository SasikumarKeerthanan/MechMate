<?php

namespace App\Providers;

use App\Services\Contracts\AdminAuthServiceInterface;
use App\Services\Contracts\CategoryServiceInterface;
use App\Services\Contracts\DiagnosisServiceInterface;
use App\Services\Contracts\MonitoringServiceInterface;
use App\Services\Contracts\ProviderServiceInterface;
use App\Services\Contracts\ReportServiceInterface;
use App\Services\Contracts\ReviewServiceInterface;
use App\Services\Contracts\ServiceCentreServiceInterface;
use App\Services\Contracts\ShopOwnerServiceInterface;
use App\Services\Contracts\UserServiceInterface;
use App\Services\Firebase\FirebaseCategoryService;
use App\Services\Firebase\FirebaseDiagnosisService;
use App\Services\Firebase\FirebaseMonitoringService;
use App\Services\Firebase\FirebaseProviderService;
use App\Services\Firebase\FirebaseReportService;
use App\Services\Firebase\FirebaseReviewService;
use App\Services\Firebase\FirebaseServiceCentreService;
use App\Services\Firebase\FirebaseShopOwnerService;
use App\Services\Firebase\FirebaseUserService;
use App\Services\Mock\MockAdminAuthService;
use App\Services\Mock\MockCategoryService;
use App\Services\Mock\MockDiagnosisService;
use App\Services\Mock\MockMonitoringService;
use App\Services\Mock\MockProviderService;
use App\Services\Mock\MockReportService;
use App\Services\Mock\MockReviewService;
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
        $this->app->bind(AdminAuthServiceInterface::class,       MockAdminAuthService::class);
        $this->app->bind(UserServiceInterface::class,            FirebaseUserService::class);
        $this->app->bind(ProviderServiceInterface::class,        FirebaseProviderService::class);
        $this->app->bind(CategoryServiceInterface::class,        FirebaseCategoryService::class);
        $this->app->bind(DiagnosisServiceInterface::class,       FirebaseDiagnosisService::class);
        $this->app->bind(ReviewServiceInterface::class,          FirebaseReviewService::class);
        $this->app->bind(MonitoringServiceInterface::class,      FirebaseMonitoringService::class);
        $this->app->bind(ReportServiceInterface::class,          FirebaseReportService::class);
        $this->app->bind(ShopOwnerServiceInterface::class,       FirebaseShopOwnerService::class);
        $this->app->bind(ServiceCentreServiceInterface::class,   FirebaseServiceCentreService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
