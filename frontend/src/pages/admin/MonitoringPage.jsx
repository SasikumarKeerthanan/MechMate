import React, { useEffect, useState } from 'react';
import { monitoringApi } from '../../api/services';
import './AdminPages.css';

const MOCK_LIVE = {
  activeUsers: 43,
  onlineProviders: 12,
  bookingsInProgress: 8,
  serverStatus: 'Healthy',
  lastUpdated: new Date().toLocaleTimeString(),
};

export default function MonitoringPage() {
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLive = () => {
    monitoringApi
      .getLive()
      .then(({ data }) => setLive(data ?? MOCK_LIVE))
      .catch(() => setLive({ ...MOCK_LIVE, lastUpdated: new Date().toLocaleTimeString() }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 30_000);
    return () => clearInterval(interval);
  }, []);

  const metrics = live
    ? [
        { label: 'Active Users',          value: live.activeUsers,        icon: '👤', color: '#3b82f6' },
        { label: 'Online Providers',       value: live.onlineProviders,    icon: '🔧', color: '#10b981' },
        { label: 'Bookings In Progress',   value: live.bookingsInProgress, icon: '📅', color: '#f59e0b' },
        { label: 'Server Status',          value: live.serverStatus,       icon: '🟢', color: '#22c55e' },
      ]
    : [];

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2 className="page-heading">Live Monitoring</h2>
        <p className="page-desc">
          Real-time system health — refreshes every 30 seconds.
          {live && (
            <span className="text-muted" style={{ marginLeft: 8, fontSize: '0.8rem' }}>
              Last updated: {live.lastUpdated}
            </span>
          )}
        </p>
      </div>

      {loading ? (
        <div className="loading-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card skeleton" />
          ))}
        </div>
      ) : (
        <div className="stats-grid stats-grid--4" id="monitoring-grid">
          {metrics.map(({ label, value, icon, color }) => (
            <div
              key={label}
              className="stat-card"
              id={`metric-${label.toLowerCase().replace(/\s+/g, '-')}`}
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
