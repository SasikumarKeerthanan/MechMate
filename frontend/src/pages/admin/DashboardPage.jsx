import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/services';
import './AdminPages.css';

const MOCK_STATS = {
  totalUsers: 1240,
  totalProviders: 87,
  pendingApprovals: 5,
  totalCategories: 12,
  activeBookings: 34,
  totalRevenue: 'LKR 2,450,000',
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getStats()
      .then(({ data }) => setStats(data.stats ?? MOCK_STATS))
      .catch(() => setStats(MOCK_STATS))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: 'Total Users',        value: stats.totalUsers,       icon: '👥', color: '#3b82f6' },
        { label: 'Total Providers',     value: stats.totalProviders,   icon: '🔧', color: '#10b981' },
        { label: 'Pending Approvals',   value: stats.pendingApprovals, icon: '⏳', color: '#f59e0b' },
        { label: 'Categories',          value: stats.totalCategories,  icon: '🗂️',  color: '#6366f1' },
        { label: 'Active Bookings',     value: stats.activeBookings,   icon: '📅', color: '#ef4444' },
        { label: 'Total Revenue',       value: stats.totalRevenue,     icon: '💰', color: '#14b8a6' },
      ]
    : [];

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2 className="page-heading">Dashboard Overview</h2>
        <p className="page-desc">Welcome back! Here's what's happening in MechMate.</p>
      </div>

      {loading ? (
        <div className="loading-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="stat-card skeleton" />
          ))}
        </div>
      ) : (
        <div className="stats-grid" id="dashboard-stats-grid">
          {cards.map(({ label, value, icon, color }) => (
            <div
              key={label}
              className="stat-card"
              id={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}
              style={{ '--accent': color }}
            >
              <div className="stat-icon">{icon}</div>
              <div className="stat-body">
                <span className="stat-value">{value}</span>
                <span className="stat-label">{label}</span>
              </div>
              <div className="stat-bar" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
