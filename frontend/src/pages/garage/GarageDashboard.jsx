import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { garageApi } from '../../api/services';
import './GaragePages.css';

export default function GarageDashboard() {
  const [stats, setStats] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const loadData = () => {
    setLoading(true);
    Promise.all([garageApi.getAnalytics(), garageApi.getInquiries()])
      .then(([statsRes, inqRes]) => {
        if (statsRes.data?.success && statsRes.data?.stats) {
          setStats(statsRes.data.stats);
        }
        if (inqRes.data?.success && Array.isArray(inqRes.data?.inquiries)) {
          setInquiries(inqRes.data.inquiries);
        }
      })
      .catch((err) => {
        console.error('Error fetching garage dashboard:', err);
        setError('Failed to fetch dashboard data.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  if (loading) {
    return (
      <div className="garage-page">
        <div className="garage-page-header">
          <div className="garage-page-title-box">
            <h1>Service Centre Performance Dashboard</h1>
            <p>Loading real-time workshop metrics, booking demand, and customer feedback...</p>
          </div>
        </div>
        <div className="garage-kpi-grid">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="garage-kpi-card" style={{ height: '90px', background: '#f8fafc' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="garage-page">
        <div className="garage-card" style={{ padding: '32px', textAlign: 'center' }}>
          <p style={{ color: '#ef4444', fontWeight: 600 }}>{error || 'Unable to load garage dashboard.'}</p>
          <button className="garage-btn garage-btn-primary" onClick={loadData}>
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const mostViewed = stats.most_viewed_services || [];
  const maxViews = Math.max(...mostViewed.map((s) => s.views_count || 1), 10);
  const totalServiceViews = mostViewed.reduce((acc, curr) => acc + (curr.views_count || 0), 0);
  const pendingInquiries = inquiries.filter((i) => (i.status || 'pending').toLowerCase() === 'pending');

  return (
    <div className="garage-page">
      {/* Toast Alert */}
      {toast && (
        <div className={`garage-toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '⚠️'} {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="garage-page-header">
        <div className="garage-page-title-box">
          <h1>Service Centre Performance Dashboard</h1>
          <p>Live operational insights, customer appointment requests, and workshop popularity.</p>
        </div>
        <div className="garage-page-actions">
          <button
            className="garage-btn garage-btn-secondary"
            onClick={() => navigate('/garage/services')}
          >
            🔧 Manage Services
          </button>
          <button
            className="garage-btn garage-btn-primary"
            onClick={() => navigate('/garage/services?action=add')}
          >
            + Add New Service
          </button>
        </div>
      </div>

      {/* ── 5 KPI Cards ── */}
      <div className="garage-kpi-grid">
        {/* Total Active Services */}
        <div className="garage-kpi-card">
          <div className="garage-kpi-indicator" style={{ '--kpi-color': '#0d9488' }}></div>
          <div className="garage-kpi-icon-wrap" style={{ '--kpi-bg': '#f0fdfa', '--kpi-color': '#0d9488' }}>
            🔧
          </div>
          <div className="garage-kpi-content">
            <span className="garage-kpi-val">{stats.total_services ?? 0}</span>
            <span className="garage-kpi-lbl">Total Active Services</span>
            <span className="garage-kpi-trend positive">✓ Live in catalog</span>
          </div>
        </div>

        {/* Profile Views */}
        <div className="garage-kpi-card">
          <div className="garage-kpi-indicator" style={{ '--kpi-color': '#0284c7' }}></div>
          <div className="garage-kpi-icon-wrap" style={{ '--kpi-bg': '#f0f9ff', '--kpi-color': '#0284c7' }}>
            🏢
          </div>
          <div className="garage-kpi-content">
            <span className="garage-kpi-val">{stats.profile_views ?? 0}</span>
            <span className="garage-kpi-lbl">Profile Views</span>
            <span className="garage-kpi-trend positive">📈 Driver discovery</span>
          </div>
        </div>

        {/* Service Views */}
        <div className="garage-kpi-card">
          <div className="garage-kpi-indicator" style={{ '--kpi-color': '#6366f1' }}></div>
          <div className="garage-kpi-icon-wrap" style={{ '--kpi-bg': '#eef2ff', '--kpi-color': '#6366f1' }}>
            👁️
          </div>
          <div className="garage-kpi-content">
            <span className="garage-kpi-val">{totalServiceViews}</span>
            <span className="garage-kpi-lbl">Package Views</span>
            <span className="garage-kpi-trend positive">Top service demand</span>
          </div>
        </div>

        {/* Pending Inquiries */}
        <div className="garage-kpi-card">
          <div className="garage-kpi-indicator" style={{ '--kpi-color': '#f59e0b' }}></div>
          <div className="garage-kpi-icon-wrap" style={{ '--kpi-bg': '#fffbeb', '--kpi-color': '#d97706' }}>
            💬
          </div>
          <div className="garage-kpi-content">
            <span className="garage-kpi-val">{stats.pending_inquiries ?? 0}</span>
            <span className="garage-kpi-lbl">Pending Inquiries</span>
            <span className={`garage-kpi-trend ${stats.pending_inquiries > 0 ? 'warning' : 'positive'}`}>
              {stats.pending_inquiries > 0 ? 'Customer waiting' : 'All caught up'}
            </span>
          </div>
        </div>

        {/* Average Rating */}
        <div className="garage-kpi-card">
          <div className="garage-kpi-indicator" style={{ '--kpi-color': '#eab308' }}></div>
          <div className="garage-kpi-icon-wrap" style={{ '--kpi-bg': '#fefce8', '--kpi-color': '#ca8a04' }}>
            ⭐
          </div>
          <div className="garage-kpi-content">
            <span className="garage-kpi-val">
              {stats.average_rating ? Number(stats.average_rating).toFixed(1) : '5.0'}
            </span>
            <span className="garage-kpi-lbl">Average Rating</span>
            <span className="garage-kpi-trend positive">
              Based on {stats.total_reviews ?? 0} reviews
            </span>
          </div>
        </div>
      </div>

      {/* ── Popular Services & Quick Inquiries Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Most Popular / Frequently Viewed Services */}
        <div className="garage-card">
          <div className="garage-card-head">
            <h3>🔥 Most Popular & Frequently Viewed Services</h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>By vehicle owner search frequency</span>
          </div>
          <div className="garage-card-body">
            {mostViewed.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', margin: '20px 0' }}>No service view data available.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {mostViewed.slice(0, 5).map((service, index) => {
                  const percent = Math.min(100, Math.round(((service.views_count || 1) / maxViews) * 100));
                  return (
                    <div
                      key={service.id || index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '10px',
                        background: '#f8fafc',
                        border: '1px solid #f1f5f9',
                      }}
                    >
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#94a3b8', width: '24px', textAlign: 'center' }}>
                        #{index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
                          {service.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {service.category} • LKR {Number(service.estimated_price || 0).toLocaleString()} • ⏱️ {service.estimated_duration || '1 hr'}
                        </div>
                      </div>
                      <div style={{ width: '130px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${percent}%`,
                              background: 'linear-gradient(90deg, #0d9488, #06b6d4)',
                              borderRadius: '3px',
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textAlign: 'right' }}>
                          {service.views_count || 0} views
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Inquiries Quick Action */}
        <div className="garage-card">
          <div className="garage-card-head">
            <h3>💬 Inquiries Requiring Response</h3>
            <button
              className="garage-btn garage-btn-secondary garage-btn-sm"
              onClick={() => navigate('/garage/inquiries')}
            >
              View All Inquiries →
            </button>
          </div>
          <div className="garage-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingInquiries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#0d9488' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
                <strong>All customer inquiries answered!</strong>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                  New repair quotation requests will appear here in real-time.
                </div>
              </div>
            ) : (
              pendingInquiries.slice(0, 4).map((inq) => (
                <div
                  key={inq.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#fcfdfd',
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #f59e0b',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                      {inq.customer_name || 'Vehicle Owner'}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#0d9488' }}>
                    🚗 {inq.vehicle || inq.vehicle_model || 'Unspecified'} {inq.service_name ? `• ${inq.service_name}` : ''}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                    "{inq.message || inq.question || 'Service quote inquiry'}"
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button
                      className="garage-btn garage-btn-primary garage-btn-sm"
                      onClick={() => navigate('/garage/inquiries')}
                    >
                      💬 Respond Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
