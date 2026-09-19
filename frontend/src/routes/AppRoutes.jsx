import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';

// Admin Pages
import DashboardOverview from '../pages/admin/DashboardOverview';
import UserManagement from '../pages/admin/UserManagement';
import ProviderApprovals from '../pages/admin/ProviderApprovals';
import PartCategories from '../pages/admin/PartCategories';
import ServiceCategories from '../pages/admin/ServiceCategories';
import DiagnosisData from '../pages/admin/DiagnosisData';
import ApiLogs from '../pages/admin/ApiLogs';
import Reviews from '../pages/admin/Reviews';
import MechanicRequests from '../pages/admin/MechanicRequests';
import Inquiries from '../pages/admin/Inquiries';

// Auth Pages (in scope)
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Fallback Page
import NotFound from '../pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect to Admin Dashboard */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Admin Module Routes with AdminLayout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardOverview />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="provider-approvals" element={<ProviderApprovals />} />
        <Route path="part-categories" element={<PartCategories />} />
        <Route path="service-categories" element={<ServiceCategories />} />
        <Route path="diagnosis-data" element={<DiagnosisData />} />
        <Route path="api-logs" element={<ApiLogs />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="mechanic-requests" element={<MechanicRequests />} />
        <Route path="inquiries" element={<Inquiries />} />
      </Route>

      {/* Password Recovery Routes */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
