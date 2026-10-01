import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout/AdminLayout';
import ShopLayout   from './layouts/ShopLayout/ShopLayout';
import GarageLayout from './layouts/GarageLayout/GarageLayout';

// ── Auth / Public pages ───────────────────────────────────────────────────
import AdminLoginPage    from './pages/auth/AdminLoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage  from './pages/auth/ResetPasswordPage';

// ── Admin pages ───────────────────────────────────────────────────────────
import DashboardPage     from './pages/admin/DashboardPage';
import UsersPage         from './pages/admin/UsersPage';
import ProvidersPage     from './pages/admin/ProvidersPage';
import CategoriesPage    from './pages/admin/CategoriesPage';
import DiagnosisDataPage from './pages/admin/DiagnosisDataPage';
import MonitoringPage    from './pages/admin/MonitoringPage';
import ReviewsPage       from './pages/admin/ReviewsPage';
import ReportsPage       from './pages/admin/ReportsPage';

// ── Shop Owner pages ──────────────────────────────────────────────────────
import ShopDashboard from './pages/shop/ShopDashboard';
import ShopProfile   from './pages/shop/ShopProfile';
import ShopInventory from './pages/shop/ShopInventory';
import ShopInquiries from './pages/shop/ShopInquiries';
import ShopReviews   from './pages/shop/ShopReviews';

// ── Service Centre / Garage Owner pages ───────────────────────────────────
import GarageDashboard   from './pages/garage/GarageDashboard';
import GarageProfile     from './pages/garage/GarageProfile';
import SupportedVehicles from './pages/garage/SupportedVehicles';
import ServicesCatalog   from './pages/garage/ServicesCatalog';
import GarageInquiries   from './pages/garage/GarageInquiries';
import GarageReviews     from './pages/garage/GarageReviews';

/** Wraps an admin page inside the shared layout */
function AdminPage({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}

/** Wraps a shop owner page inside the shared shop layout */
function ShopPage({ children }) {
  return <ShopLayout>{children}</ShopLayout>;
}

/** Wraps a garage owner page inside the shared garage layout */
function GaragePage({ children }) {
  return <GarageLayout>{children}</GarageLayout>;
}


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public auth routes ── */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage  />} />
          <Route path="/admin/login"     element={<AdminLoginPage      />} />

          {/* ── Protected admin routes ── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard"      element={<AdminPage><DashboardPage     /></AdminPage>} />
            <Route path="/admin/users"          element={<AdminPage><UsersPage         /></AdminPage>} />
            <Route path="/admin/providers"      element={<AdminPage><ProvidersPage     /></AdminPage>} />
            <Route path="/admin/categories"     element={<AdminPage><CategoriesPage    /></AdminPage>} />
            <Route path="/admin/diagnosis-data" element={<AdminPage><DiagnosisDataPage /></AdminPage>} />
            <Route path="/admin/monitoring"     element={<AdminPage><MonitoringPage    /></AdminPage>} />
            <Route path="/admin/reviews"        element={<AdminPage><ReviewsPage       /></AdminPage>} />
            <Route path="/admin/reports"        element={<AdminPage><ReportsPage       /></AdminPage>} />
          </Route>

          {/* ── Spare Part Shop Owner routes ── */}
          <Route path="/shop/dashboard" element={<ShopPage><ShopDashboard /></ShopPage>} />
          <Route path="/shop/profile"   element={<ShopPage><ShopProfile   /></ShopPage>} />
          <Route path="/shop/inventory" element={<ShopPage><ShopInventory /></ShopPage>} />
          <Route path="/shop/inquiries" element={<ShopPage><ShopInquiries /></ShopPage>} />
          <Route path="/shop/reviews"   element={<ShopPage><ShopReviews   /></ShopPage>} />
          <Route path="/shop"           element={<Navigate to="/shop/dashboard" replace />} />

          {/* ── Service Centre / Garage Owner routes ── */}
          <Route path="/garage/dashboard" element={<GaragePage><GarageDashboard   /></GaragePage>} />
          <Route path="/garage/profile"   element={<GaragePage><GarageProfile     /></GaragePage>} />
          <Route path="/garage/vehicles"  element={<GaragePage><SupportedVehicles /></GaragePage>} />
          <Route path="/garage/services"  element={<GaragePage><ServicesCatalog   /></GaragePage>} />
          <Route path="/garage/inquiries" element={<GaragePage><GarageInquiries   /></GaragePage>} />
          <Route path="/garage/reviews"   element={<GaragePage><GarageReviews     /></GaragePage>} />
          <Route path="/garage"           element={<Navigate to="/garage/dashboard" replace />} />


          {/* ── Fallback ── */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/"      element={<Navigate to="/admin/login"     replace />} />
          <Route path="*"      element={<Navigate to="/admin/login"     replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

