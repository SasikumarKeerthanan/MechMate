import React, { useEffect, useState } from 'react';
import { reportsApi } from '../../api/services';
import './AdminPages.css';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d'); // '7d' | '30d' | 'this_month' | 'quarter' | 'ytd'
  const [exporting, setExporting] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getSummary({ range: dateRange });
      if (res.data?.report) {
        setReport(res.data.report);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [dateRange]);

  // Export to CSV Function
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await reportsApi.getExport('csv');
      const rows = res.data?.rows || [
        ['Metric', 'Category', 'Recorded Value', 'Period'],
        ['Total Registered Users', 'Platform Total', '1420', 'September 2026'],
        ['Vehicle Owners', 'Account Category', '920', 'September 2026'],
        ['Spare Part Vendors', 'Verified Vendors', '140', 'September 2026'],
        ['Garages & Service Centres', 'Approved Providers', '95', 'September 2026'],
        ['On-Demand Mechanics', 'Field Technicians', '265', 'September 2026'],
        ['Emergency Roadside Requests', 'SOS Operations', '482', 'September 2026'],
        ['AI Diagnosis Sessions', 'Gemini / Knowledge Base', '2190', 'September 2026'],
        ['Platform Gross Booking Volume', 'Financials', 'LKR 4,680,000', 'September 2026'],
      ];

      // Convert rows to CSV string
      const csvContent = rows
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', res.data?.filename || `MechMate_Analytics_Report_${dateRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Analytics report exported as CSV successfully.', 'success');
    } catch {
      showToast('Error exporting CSV report.', 'danger');
    } finally {
      setExporting(false);
    }
  };

  const overview = report?.overview || {
    total_users: 1420,
    vehicle_owners: 920,
    spare_part_shops: 140,
    service_centres: 95,
    mechanics: 265,
    mechanic_emergency_reqs: 482,
    diagnosis_scans_total: 2190,
    successful_ai_rate: 98.4,
    total_gross_volume: 'LKR 4,680,000',
    active_disputes: 3,
  };

  const monthlyGrowth = report?.monthly_growth || [
    { month: 'May', users: 110, bookings: 280, revenue: 840000 },
    { month: 'Jun', users: 160, bookings: 360, revenue: 1120000 },
    { month: 'Jul', users: 210, bookings: 450, revenue: 1390000 },
    { month: 'Aug', users: 290, bookings: 540, revenue: 1710000 },
    { month: 'Sep', users: 340, bookings: 680, revenue: 2140000 },
  ];

  const maxBookings = Math.max(...monthlyGrowth.map((m) => m.bookings), 700);

  const categoriesDist = report?.category_distribution || [
    { category: 'Periodic Lubrication & Oil', share: 34 },
    { category: 'Brakes & Hydraulics', share: 22 },
    { category: 'Engine & Transmission', share: 18 },
    { category: 'Suspension & Steering', share: 14 },
    { category: 'Electrical & Diagnostics', share: 12 },
  ];

  const severityDist = report?.diagnosis_by_severity || [
    { severity: 'Critical', count: 340, percentage: 15.5 },
    { severity: 'High', count: 690, percentage: 31.5 },
    { severity: 'Medium', count: 820, percentage: 37.4 },
    { severity: 'Low', count: 340, percentage: 15.6 },
  ];

  return (
    <div className="admin-page">
      {/* ── Toast Alert ── */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast--${toast.type}`}>
            <span>{toast.type === 'success' ? '✓' : toast.type === 'danger' ? '✕' : 'ℹ'}</span>
            <span>{toast.message}</span>
            <button className="toast-close-btn" onClick={() => setToast(null)}>×</button>
          </div>
        </div>
      )}

      {/* ── Page Header & Export Action ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h2 className="page-heading">System Analytics & Operational Reports</h2>
          <p className="page-desc">
            Aggregated performance metrics covering customer growth, on-demand mechanics, AI diagnosis adoption, and revenue volume.
          </p>
        </div>

        <button
          id="export-csv-btn"
          className="btn-export-csv"
          onClick={handleExportCSV}
          disabled={exporting}
        >
          <span>📥</span>
          <span>{exporting ? 'Generating CSV…' : 'Export to CSV'}</span>
        </button>
      </div>

      {/* ── Date Range Selector Toolbar ── */}
      <div className="table-toolbar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', marginRight: '6px' }}>
            Reporting Window:
          </span>
          {[
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: 'this_month', label: 'This Month' },
            { id: 'quarter', label: 'This Quarter' },
            { id: 'ytd', label: 'Year to Date' },
          ].map((period) => (
            <button
              key={period.id}
              id={`period-btn-${period.id}`}
              className={`filter-btn ${dateRange === period.id ? 'filter-btn--active' : ''}`}
              onClick={() => setDateRange(period.id)}
            >
              {period.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Data updated: <strong>{new Date().toLocaleDateString()}</strong>
        </div>
      </div>

      {/* ── High-Level Metric Cards ── */}
      <div className="reports-grid" id="reports-kpi-grid">
        <div className="stat-card" style={{ '--accent': '#3b82f6' }}>
          <div className="stat-icon">👥</div>
          <div className="stat-body">
            <span className="stat-value">{overview.total_users.toLocaleString()}</span>
            <span className="stat-label">Total Registered Users</span>
          </div>
          <div className="stat-bar" />
        </div>

        <div className="stat-card" style={{ '--accent': '#10b981' }}>
          <div className="stat-icon">🔧</div>
          <div className="stat-body">
            <span className="stat-value">
              {(overview.spare_part_shops + overview.service_centres + overview.mechanics).toLocaleString()}
            </span>
            <span className="stat-label">Active Service Providers</span>
          </div>
          <div className="stat-bar" />
        </div>

        <div className="stat-card" style={{ '--accent': '#f59e0b' }}>
          <div className="stat-icon">🚨</div>
          <div className="stat-body">
            <span className="stat-value" style={{ color: '#d97706' }}>
              {overview.mechanic_emergency_reqs.toLocaleString()}
            </span>
            <span className="stat-label">Emergency SOS Requests</span>
          </div>
          <div className="stat-bar" />
        </div>

        <div className="stat-card" style={{ '--accent': '#8b5cf6' }}>
          <div className="stat-icon">🩺</div>
          <div className="stat-body">
            <span className="stat-value">{overview.diagnosis_scans_total.toLocaleString()}</span>
            <span className="stat-label">AI Diagnostic Scans</span>
          </div>
          <div className="stat-bar" />
        </div>

        <div className="stat-card" style={{ '--accent': '#059669' }}>
          <div className="stat-icon">💰</div>
          <div className="stat-body">
            <span className="stat-value" style={{ fontSize: '1.25rem' }}>
              {overview.total_gross_volume}
            </span>
            <span className="stat-label">Platform Gross Volume</span>
          </div>
          <div className="stat-bar" />
        </div>
      </div>

      {/* ── Charts & Visualizations ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Monthly Booking Velocity Bar Chart */}
        <div className="analytics-chart-card" id="monthly-booking-chart">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Completed Bookings Growth Trend</h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Monthly Volume</span>
          </div>

          <div className="bar-chart-container">
            {monthlyGrowth.map((item, idx) => {
              const heightPct = Math.round((item.bookings / maxBookings) * 100);

              return (
                <div key={idx} className="bar-group">
                  <div className="bar-visual-wrap">
                    <div className="bar-fill" style={{ height: `${heightPct}%` }}>
                      <span className="bar-val-tooltip">{item.bookings}</span>
                    </div>
                  </div>
                  <span className="bar-label">{item.month}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Growth: <strong>+142% over past 5 months</strong></span>
            <span>Current Month: <strong>{monthlyGrowth[monthlyGrowth.length - 1]?.bookings} bookings</strong></span>
          </div>
        </div>

        {/* Category Revenue Distribution Progress */}
        <div className="analytics-chart-card" id="category-distribution-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Service Category Market Share</h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>By Request Volume</span>
          </div>

          <div className="distribution-list">
            {categoriesDist.map((cat, idx) => {
              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
              const color = colors[idx % colors.length];

              return (
                <div key={cat.category} className="distribution-item">
                  <div className="distribution-header">
                    <span>{cat.category}</span>
                    <strong>{cat.share}%</strong>
                  </div>
                  <div className="distribution-track">
                    <div className="distribution-bar" style={{ width: `${cat.share}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Diagnosis Severity Breakdown ── */}
      <div className="card" id="severity-breakdown-card">
        <h3 className="card-title">AI Diagnosis Issues Categorized by Severity Tier</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {severityDist.map((sev) => {
            const colors = {
              Critical: { text: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' },
              High: { text: '#c2410c', bg: '#ffedd5', border: '#fed7aa' },
              Medium: { text: '#a16207', bg: '#fef9c3', border: '#fde047' },
              Low: { text: '#15803d', bg: '#dcfce7', border: '#bbf7d0' },
            };
            const c = colors[sev.severity] || colors.Medium;

            return (
              <div
                key={sev.severity}
                style={{
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: c.text, textTransform: 'uppercase' }}>
                  {sev.severity} Severity
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: c.text }}>
                  {sev.count.toLocaleString()} cases
                </span>
                <span style={{ fontSize: '0.78rem', color: c.text, opacity: 0.85 }}>
                  {sev.percentage}% of all detected vehicle faults
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
