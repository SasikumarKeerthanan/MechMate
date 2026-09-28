import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const NAV_ITEMS = [
  { path: '/admin/dashboard',      icon: '📊', label: 'Dashboard'      },
  { path: '/admin/users',          icon: '👥', label: 'Users'           },
  { path: '/admin/providers',      icon: '🔧', label: 'Providers'       },
  { path: '/admin/categories',     icon: '🗂️',  label: 'Categories'     },
  { path: '/admin/diagnosis-data', icon: '🩺', label: 'Diagnosis Data'  },
  { path: '/admin/monitoring',     icon: '📡', label: 'Monitoring'      },
  { path: '/admin/reviews',        icon: '⭐', label: 'Reviews'         },
  { path: '/admin/reports',        icon: '📈', label: 'Reports'         },
];

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className={`admin-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          {!collapsed && (
            <span className="brand-text">
              <span className="brand-mech">Mech</span>
              <span className="brand-mate">Mate</span>
              <span className="brand-badge">Admin</span>
            </span>
          )}
          <button
            id="sidebar-toggle"
            className="sidebar-toggle"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Admin navigation">
          {NAV_ITEMS.map(({ path, icon, label }) => (
            <NavLink
              key={path}
              to={path}
              id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item--active' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <span className="nav-icon">{icon}</span>
              {!collapsed && <span className="nav-label">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            id="logout-btn"
            className="logout-btn"
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
          >
            <span className="nav-icon">🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────────────────── */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <h1 className="page-title" id="page-title">MechMate Admin</h1>
          </div>
          <div className="header-right">
            <div className="admin-profile" id="admin-profile">
              <span className="profile-avatar">
                {admin?.name?.charAt(0)?.toUpperCase() ?? 'A'}
              </span>
              <span className="profile-name">{admin?.name ?? 'Administrator'}</span>
            </div>
            <button
              id="header-logout-btn"
              className="header-logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content" id="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
