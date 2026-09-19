import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import TopNavbar from '../components/admin/TopNavbar';
import LogoutModal from '../components/common/LogoutModal';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoutConfirm = () => {
    logout();
    setLogoutModalOpen(false);
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        {/* Top Navbar with Profile Badge, Notifications, Theme Toggle & Logout */}
        <TopNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenLogoutModal={() => setLogoutModalOpen(true)}
        />

        {/* Dynamic Nested Screen Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
}
