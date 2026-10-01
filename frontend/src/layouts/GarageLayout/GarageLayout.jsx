import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { garageApi } from '../../api/services';
import './GarageLayout.css';

const NAV_ITEMS = [
  { path: '/garage/dashboard', icon: '📊', label: 'Overview / Dashboard' },
  { path: '/garage/profile',   icon: '🏢', label: 'Business Profile' },
  { path: '/garage/vehicles',  icon: '🚗', label: 'Supported Vehicles' },
  { path: '/garage/services',  icon: '🔧', label: 'Service Packages Catalog' },
  { path: '/garage/inquiries', icon: '💬', label: 'Customer Inquiries' },
  { path: '/garage/reviews',   icon: '⭐', label: 'Ratings & Reviews' },
];

export default function GarageLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [garageProfile, setGarageProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Load profile
    garageApi.getProfile()
      .then(({ data }) => {
        if (data.success && data.profile) {
          setGarageProfile(data.profile);
        }
      })
      .catch((err) => console.error('Failed to load garage profile:', err));

    // Load analytics for badges
    garageApi.getAnalytics()
      .then(({ data }) => {
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      })
      .catch((err) => console.error('Failed to load garage analytics:', err));
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('mechmate_token');
    localStorage.removeItem('mechmate_role');
    navigate('/admin/login');
  };

  const pendingInquiriesCount = stats?.pending_inquiries || 0;

  return (
    <div className={`garage-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* ── Sidebar ── */}
      <aside className="garage-sidebar">
        {/* Brand */}
        <div className="garage-brand">
          {!collapsed ? (
            <div className="garage-brand-content">
              <div className="garage-brand-logo-badge">🔧</div>
              <div className="garage-brand-meta">
                <span className="garage-brand-title">
                  Mech<span className="garage-brand-highlight">Mate</span>
                </span>
                <span className="garage-brand-sub">Service Centre</span>
              </div>
            </div>
          ) : (
            <div className="garage-brand-logo-badge" title="MechMate Service Centre">🔧</div>
          )}

          <button
            className="garage-toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="garage-nav" aria-label="Service Centre Navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `garage-nav-item ${isActive ? 'active' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <span className="garage-nav-icon">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="garage-nav-label">{item.label}</span>
                  {item.path === '/garage/inquiries' && pendingInquiriesCount > 0 && (
                    <span className="garage-nav-badge">{pendingInquiriesCount} new</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="garage-sidebar-footer">
          {!collapsed && (
            <div className="garage-quick-info">
              <span className="garage-pulse-dot"></span>
              <span>Garage Online & Accepting Jobs</span>
            </div>
          )}
          <button
            className="garage-logout-btn"
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
          >
            <span>🚪</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <div className="garage-main">
        {/* Header Bar */}
        <header className="garage-header">
          <div className="garage-header-left">
            <div className="garage-header-title">
              <h2 className="garage-header-name">
                {garageProfile?.business_name || 'Precision Tune Station'}
                {garageProfile?.email_verification_status === 'pending' || garageProfile?.email_verified === false ? (
                  <span style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }} title="Email confirmation is pending">
                    ⏳ Verification Pending
                  </span>
                ) : (
                  <span className="garage-verified-badge" title="Verified Service Centre">
                    ✓ Verified Service Centre
                  </span>
                )}

              </h2>
              <p className="garage-header-loc">
                📍 {garageProfile?.city || 'Colombo'} • {garageProfile?.address || '500 High Level Road, Nugegoda'} • 📞 {garageProfile?.phone || '+94 11 254 7711'}
              </p>
            </div>
          </div>

          <div className="garage-header-right">
            {/* Notification Bell */}
            <div className="garage-notif-wrap">
              <button
                className="garage-icon-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
                aria-label="View notifications"
              >
                🔔
                {pendingInquiriesCount > 0 && (
                  <span className="garage-notif-badge">{pendingInquiriesCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="garage-notif-dropdown">
                  <div className="garage-notif-head">
                    <h4>Customer Alerts</h4>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {pendingInquiriesCount} pending
                    </span>
                  </div>

                  {pendingInquiriesCount > 0 ? (
                    <div
                      className="garage-notif-item inquiry"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/garage/inquiries');
                      }}
                    >
                      <span>💬</span>
                      <div>
                        <strong>{pendingInquiriesCount} Vehicle Owner Inquiries Waiting</strong>
                        <div>Customers requested repair quotes or service booking details.</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '12px 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                      🎉 No pending customer inquiries!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Garage Manager Chip */}
            <div className="garage-avatar-chip">
              <div className="garage-avatar">
                {garageProfile?.owner_name ? garageProfile.owner_name.charAt(0).toUpperCase() : 'G'}
              </div>
              <div className="garage-avatar-text">
                <span className="garage-avatar-name">
                  {garageProfile?.owner_name || 'Chathura Fernando'}
                </span>
                <span className="garage-avatar-role">Service Manager</span>
              </div>
            </div>

            {/* Logout Button */}
            <button className="garage-header-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="garage-content">
          {children}
        </main>
      </div>
    </div>
  );
}
