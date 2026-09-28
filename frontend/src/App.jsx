import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout/AdminLayout';

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

/** Wraps an admin page inside the shared layout */
function AdminPage({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
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

          {/* ── Fallback ── */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/"      element={<Navigate to="/admin/login"     replace />} />
          <Route path="*"      element={<Navigate to="/admin/login"     replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
