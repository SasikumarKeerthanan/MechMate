import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { shopApi } from '../../api/services';
import './ShopLayout.css';

const NAV_ITEMS = [
  { path: '/shop/dashboard', icon: '📊', label: 'Overview / Dashboard' },
  { path: '/shop/profile',   icon: '🏬', label: 'Shop Profile' },
  { path: '/shop/inventory', icon: '📦', label: 'Spare Parts Inventory' },
  { path: '/shop/inquiries', icon: '💬', label: 'Customer Inquiries' },
  { path: '/shop/reviews',   icon: '⭐', label: 'Ratings & Reviews' },
];

export default function ShopLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [shopProfile, setShopProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Load shop profile
    shopApi.getProfile()
      .then(({ data }) => {
        if (data.success && data.profile) {
          setShopProfile(data.profile);
        }
      })
      .catch((err) => console.error('Failed to load shop profile in layout:', err));

    // Load analytics for notification badges
    shopApi.getAnalytics()
      .then(({ data }) => {
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      })
      .catch((err) => console.error('Failed to load stats in layout:', err));
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('mechmate_token');
    localStorage.removeItem('mechmate_role');
    navigate('/admin/login');
  };

  const pendingInquiriesCount = stats?.pending_inquiries || 0;
  const lowStockCount = stats?.low_stock_count || 0;
  const totalNotifications = pendingInquiriesCount + lowStockCount;

  return (
    <div className={`shop-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* ── Sidebar ── */}
      <aside className="shop-sidebar">
        {/* Brand */}
        <div className="shop-brand">
          {!collapsed ? (
            <div className="shop-brand-content">
              <div className="shop-brand-logo-badge">⚙️</div>
              <div className="shop-brand-meta">
                <span className="shop-brand-title">
                  Mech<span className="shop-brand-highlight">Mate</span>
                </span>
                <span className="shop-brand-sub">Parts Merchant</span>
              </div>
            </div>
          ) : (
            <div className="shop-brand-logo-badge" title="MechMate Parts Merchant">⚙️</div>
          )}

          <button
            className="shop-toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="shop-nav" aria-label="Shop Owner Navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `shop-nav-item ${isActive ? 'active' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <span className="shop-nav-icon">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="shop-nav-label">{item.label}</span>
                  {item.path === '/shop/inquiries' && pendingInquiriesCount > 0 && (
                    <span className="shop-nav-badge">{pendingInquiriesCount} new</span>
                  )}
                  {item.path === '/shop/inventory' && lowStockCount > 0 && (
                    <span className="shop-nav-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
                      {lowStockCount} alert
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="shop-sidebar-footer">
          {!collapsed && (
            <div className="shop-quick-info">
              <span className="shop-pulse-dot"></span>
              <span>Shop Online & Active</span>
            </div>
          )}
          <button
            className="shop-logout-btn"
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
          >
            <span>🚪</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <div className="shop-main">
        {/* Header Bar */}
        <header className="shop-header">
          <div className="shop-header-left">
            <div className="shop-header-shop-title">
              <h2 className="shop-header-name">
                {shopProfile?.name || 'SpeedServe Auto Parts'}
                {shopProfile?.email_verification_status === 'pending' || shopProfile?.email_verified === false ? (
                  <span style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }} title="Email confirmation is pending">
                    ⏳ Verification Pending
                  </span>
                ) : (
                  <span className="shop-verified-badge" title="Official Verified Merchant">
                    ✓ Verified Provider
                  </span>
                )}

              </h2>
              <p className="shop-header-loc">
                📍 {shopProfile?.city || 'Colombo'}, Sri Lanka • {shopProfile?.phone || '+94 11 432 9988'}
              </p>
            </div>
          </div>

          <div className="shop-header-right">
            {/* Notification Bell */}
            <div className="shop-notif-wrap">
              <button
                className="shop-icon-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
                aria-label="View notifications"
              >
                🔔
                {totalNotifications > 0 && (
                  <span className="shop-notif-badge">{totalNotifications}</span>
                )}
              </button>

              {showNotifications && (
                <div className="shop-notif-dropdown">
                  <div className="shop-notif-head">
                    <h4>Notifications</h4>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {totalNotifications} action items
                    </span>
                  </div>
                  {lowStockCount > 0 && (
                    <div
                      className="shop-notif-item warning"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/shop/inventory');
                      }}
                    >
                      <span>⚠️</span>
                      <div>
                        <strong>{lowStockCount} Parts Low on Stock!</strong>
                        <div>Reorder soon to avoid running out of stock.</div>
                      </div>
                    </div>
                  )}
                  {pendingInquiriesCount > 0 && (
                    <div
                      className="shop-notif-item info"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/shop/inquiries');
                      }}
                    >
                      <span>💬</span>
                      <div>
                        <strong>{pendingInquiriesCount} Customer Inquiry Awaiting Reply</strong>
                        <div>Vehicle owners requested part compatibility.</div>
                      </div>
                    </div>
                  )}
                  {totalNotifications === 0 && (
                    <div style={{ textAlign: 'center', padding: '12px 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                      🎉 All clear! No urgent alerts.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shop Owner Avatar Chip */}
            <div className="shop-avatar-chip">
              <div className="shop-avatar">
                {shopProfile?.owner_name ? shopProfile.owner_name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="shop-avatar-text">
                <span className="shop-avatar-name">
                  {shopProfile?.owner_name || 'Mahesh Fonseka'}
                </span>
                <span className="shop-avatar-role">Shop Manager</span>
              </div>
            </div>

            {/* Logout Button */}
            <button className="shop-header-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="shop-content">
          {children}
        </main>
      </div>
    </div>
  );
}
