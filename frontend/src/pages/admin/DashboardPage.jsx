import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/services';
import './AdminPages.css';

// Formats a date string (ISO) into a human readable relative or absolute time
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / 60000);

  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  return date.toLocaleDateString();
};

// Activity Icon helper
const getActivityIcon = (severity) => {
  switch (severity) {
    case 'success': return '✓';
    case 'danger': return '⚠️';
    case 'info': default: return 'ℹ️';
  }
};

export default function DashboardPage() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboardApi
      .getStats()
      .then(({ data }) => {
        if (data.success && data.stats) {
          setStatsData(data.stats);
        } else {
          setError('Invalid data format received from server.');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch dashboard data.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="page-header">
          <h2 className="page-heading">Dashboard Overview</h2>
          <p className="page-desc">Loading system metrics...</p>
        </div>
        <div className="loading-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="stat-card skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !statsData) {
    return (
      <div className="admin-page">
        <div className="page-header">
          <h2 className="page-heading">Dashboard Overview</h2>
        </div>
        <div className="auth-error" style={{ maxWidth: '600px' }}>
          <span>⚠️</span>
          <span>{error || 'Failed to load dashboard statistics.'}</span>
        </div>
      </div>
    );
  }

  const { kpis, api_usage, recent_activity } = statsData;

  const kpiCards = [
    { label: 'Total Users',      value: kpis.totalUsers,     icon: '👥', color: '#3b82f6' },
    { label: 'Vehicle Owners',   value: kpis.vehicleOwners,  icon: '🚗', color: '#8b5cf6' },
    { label: 'Mechanics',        value: kpis.mechanics,      icon: '🔧', color: '#10b981' },
    { label: 'Spare Part Shops', value: kpis.sparePartShops, icon: '🏪', color: '#f59e0b' },
    { label: 'Service Centres',  value: kpis.serviceCentres, icon: '🏢', color: '#6366f1' },
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2 className="page-heading">Dashboard Overview</h2>
        <p className="page-desc">Welcome back! Here's what's happening in the MechMate ecosystem.</p>
      </div>

      {/* Pending Approvals Callout */}
      {kpis.pendingApprovals > 0 && (
        <div className="pending-approvals-card">
          <div className="pending-approvals-info">
            <div className="pending-icon">🔔</div>
            <div className="pending-text">
              <h3>{kpis.pendingApprovals} Pending Approvals</h3>
              <p>Service providers are waiting for your review and approval to join the platform.</p>
            </div>
          </div>
          <Link to="/admin/providers" className="pending-action-btn">
            Review Now
          </Link>
        </div>
      )}

      {/* KPI Grid */}
      <div className="stats-grid stats-grid--4" id="dashboard-stats-grid">
        {kpiCards.map(({ label, value, icon, color }) => (
          <div
            key={label}
            className="stat-card"
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

      <div className="dashboard-grid">
        {/* Left Column: Recent Activity */}
        <div className="dashboard-section">
          <div className="card">
            <h3 className="card-title">Recent Activity</h3>
            {recent_activity && recent_activity.length > 0 ? (
              <div className="activity-list">
                {recent_activity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${activity.severity}`}>
                      {getActivityIcon(activity.severity)}
                    </div>
                    <div className="activity-content">
                      <span className="activity-message">{activity.message}</span>
                      <span className="activity-time">{formatTime(activity.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No recent activity to display.</p>
            )}
          </div>
        </div>

        {/* Right Column: API Usage */}
        <div className="dashboard-section">
          <div className="card">
            <h3 className="card-title">API Usage (24h)</h3>
            <div className="api-usage-list">
              {Object.entries(api_usage).map(([apiKey, stats]) => {
                const total = stats.success + stats.failed;
                const successRate = total > 0 ? Math.round((stats.success / total) * 100) : 0;
                const failedRate = 100 - successRate;
                
                // Formatted display names
                const apiNames = {
                  gemini: 'Gemini AI API',
                  vision: 'Google Vision API',
                  maps: 'Google Maps Platform'
                };
                
                return (
                  <div key={apiKey} className="api-stat">
                    <div className="api-stat-header">
                      <span>{apiNames[apiKey] || apiKey}</span>
                      <span className="api-stat-rate">{successRate}% Success</span>
                    </div>
                    <div className="api-progress-bar">
                      <div 
                        className="api-progress-success" 
                        style={{ width: `${successRate}%` }} 
                        title={`${stats.success} successful`}
                      />
                      <div 
                        className="api-progress-failed" 
                        style={{ width: `${failedRate}%` }} 
                        title={`${stats.failed} failed`}
                      />
                    </div>
                    <div className="api-stat-details">
                      <span>Total: {total.toLocaleString()}</span>
                      <span style={{ color: stats.failed > 0 ? '#ef4444' : '#64748b' }}>
                        Failed: {stats.failed.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
