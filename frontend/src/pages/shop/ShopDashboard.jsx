import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopApi } from '../../api/services';
import './ShopPages.css';

export default function ShopDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Quick Restock modal state
  const [restockModalPart, setRestockModalPart] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState(10);
  const [restockSubmitting, setRestockSubmitting] = useState(false);

  const navigate = useNavigate();

  const loadData = () => {
    setLoading(true);
    shopApi.getAnalytics()
      .then(({ data }) => {
        if (data.success && data.stats) {
          setStats(data.stats);
        } else {
          setError('Failed to parse analytics stats.');
        }
      })
      .catch((err) => {
        console.error('Error fetching dashboard analytics:', err);
        setError('Failed to fetch dashboard data from server.');
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

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockModalPart) return;

    setRestockSubmitting(true);
    try {
      const newStock = Number(restockModalPart.stock_quantity || 0) + Number(restockQuantity);
      const newAvailability = newStock > 5 ? 'in_stock' : (newStock > 0 ? 'low_stock' : 'out_of_stock');

      await shopApi.updatePart(restockModalPart.id, {
        stock_quantity: newStock,
        availability: newAvailability,
        stock_change_type: 'restock',
        stock_notes: `Quick restock +${restockQuantity} units via Dashboard`,
      });

      showToast(`Successfully restocked "${restockModalPart.name}" (+${restockQuantity} units).`);
      setRestockModalPart(null);
      loadData();
    } catch (err) {
      console.error('Failed to restock item:', err);
      showToast('Error updating stock quantity.', 'error');
    } finally {
      setRestockSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="shop-page">
        <div className="shop-page-header">
          <div className="shop-page-title-box">
            <h1>Merchant Dashboard Overview</h1>
            <p>Loading real-time inventory performance metrics and customer demand...</p>
          </div>
        </div>
        <div className="shop-kpi-grid">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="shop-kpi-card" style={{ height: '90px', background: '#f8fafc' }}>
              <div className="shop-kpi-content">
                <span style={{ color: '#94a3b8' }}>Loading metric...</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="shop-page">
        <div className="shop-card" style={{ padding: '32px', textAlign: 'center' }}>
          <p style={{ color: '#ef4444', fontWeight: 600 }}>{error || 'Unable to display dashboard.'}</p>
          <button className="shop-btn shop-btn-primary" onClick={loadData}>
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const lowStockParts = stats.low_stock_parts || [];
  const topViewedParts = stats.top_viewed_parts || [];
  const maxViews = Math.max(...topViewedParts.map((p) => p.views_count || 1), 10);

  return (
    <div className="shop-page">
      {/* Toast Notification */}
      {toast && (
        <div className={`shop-toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '⚠️'} {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="shop-page-header">
        <div className="shop-page-title-box">
          <h1>Merchant Dashboard Overview</h1>
          <p>Real-time inventory levels, customer interest, and catalog health metrics.</p>
        </div>
        <div className="shop-page-actions">
          <button
            className="shop-btn shop-btn-secondary"
            onClick={() => navigate('/shop/inventory')}
          >
            📦 Manage Catalog
          </button>
          <button
            className="shop-btn shop-btn-primary"
            onClick={() => navigate('/shop/inventory?action=add')}
          >
            + Add Spare Part
          </button>
        </div>
      </div>

      {/* ── 5 KPI Cards ── */}
      <div className="shop-kpi-grid">
        {/* Total Active Listings */}
        <div className="shop-kpi-card">
          <div className="shop-kpi-indicator" style={{ '--kpi-color': '#3b82f6' }}></div>
          <div className="shop-kpi-icon-wrap" style={{ '--kpi-bg': '#eff6ff', '--kpi-color': '#2563eb' }}>
            📦
          </div>
          <div className="shop-kpi-content">
            <span className="shop-kpi-val">{stats.total_parts ?? 0}</span>
            <span className="shop-kpi-lbl">Total Active Listings</span>
            <span className="shop-kpi-trend positive">✓ Live in catalog</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="shop-kpi-card">
          <div className="shop-kpi-indicator" style={{ '--kpi-color': '#f59e0b' }}></div>
          <div className="shop-kpi-icon-wrap" style={{ '--kpi-bg': '#fffbeb', '--kpi-color': '#d97706' }}>
            ⚠️
          </div>
          <div className="shop-kpi-content">
            <span className="shop-kpi-val">{stats.low_stock_count ?? 0}</span>
            <span className="shop-kpi-lbl">Low Stock Alerts</span>
            <span className={`shop-kpi-trend ${stats.low_stock_count > 0 ? 'warning' : 'positive'}`}>
              {stats.low_stock_count > 0 ? 'Requires restock' : 'Stock levels healthy'}
            </span>
          </div>
        </div>

        {/* Total Profile Views */}
        <div className="shop-kpi-card">
          <div className="shop-kpi-indicator" style={{ '--kpi-color': '#8b5cf6' }}></div>
          <div className="shop-kpi-icon-wrap" style={{ '--kpi-bg': '#f5f3ff', '--kpi-color': '#7c3aed' }}>
            👁️
          </div>
          <div className="shop-kpi-content">
            <span className="shop-kpi-val">{stats.profile_views ?? 0}</span>
            <span className="shop-kpi-lbl">Total Profile Views</span>
            <span className="shop-kpi-trend positive">📈 +18% this month</span>
          </div>
        </div>

        {/* Unanswered Inquiries */}
        <div className="shop-kpi-card">
          <div className="shop-kpi-indicator" style={{ '--kpi-color': '#06b6d4' }}></div>
          <div className="shop-kpi-icon-wrap" style={{ '--kpi-bg': '#ecfeff', '--kpi-color': '#0891b2' }}>
            💬
          </div>
          <div className="shop-kpi-content">
            <span className="shop-kpi-val">{stats.pending_inquiries ?? 0}</span>
            <span className="shop-kpi-lbl">Unanswered Inquiries</span>
            <span className={`shop-kpi-trend ${stats.pending_inquiries > 0 ? 'warning' : 'positive'}`}>
              {stats.pending_inquiries > 0 ? 'Customer waiting' : 'All caught up'}
            </span>
          </div>
        </div>

        {/* Average Rating */}
        <div className="shop-kpi-card">
          <div className="shop-kpi-indicator" style={{ '--kpi-color': '#eab308' }}></div>
          <div className="shop-kpi-icon-wrap" style={{ '--kpi-bg': '#fefce8', '--kpi-color': '#ca8a04' }}>
            ⭐
          </div>
          <div className="shop-kpi-content">
            <span className="shop-kpi-val">{stats.average_rating ? Number(stats.average_rating).toFixed(1) : '5.0'}</span>
            <span className="shop-kpi-lbl">Average Rating</span>
            <span className="shop-kpi-trend positive">
              Based on {stats.total_reviews ?? 0} reviews
            </span>
          </div>
        </div>
      </div>

      {/* ── Analytics & Low Stock Section ── */}
      <div className="shop-analytics-grid">
        {/* Top 5 Most Viewed Spare Parts */}
        <div className="shop-card">
          <div className="shop-card-head">
            <h3>🔥 Top 5 Most Viewed Spare Parts</h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>By vehicle owner search frequency</span>
          </div>
          <div className="shop-card-body">
            {topViewedParts.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', margin: '20px 0' }}>No search views recorded yet.</p>
            ) : (
              <div className="top-viewed-list">
                {topViewedParts.slice(0, 5).map((part, index) => {
                  const percent = Math.min(100, Math.round(((part.views_count || 1) / maxViews) * 100));
                  return (
                    <div key={part.id || index} className="top-viewed-item">
                      <div className="top-viewed-rank">#{index + 1}</div>
                      <div className="part-thumb-wrap" style={{ width: '42px', height: '42px' }}>
                        <img
                          src={part.image_url || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=100&q=80'}
                          alt={part.name}
                          className="part-thumb"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=100&q=80'; }}
                        />
                      </div>
                      <div className="top-viewed-info">
                        <div className="top-viewed-name">{part.name}</div>
                        <div className="top-viewed-meta">
                          {part.brand || 'OEM'} • LKR {Number(part.price || 0).toLocaleString()} • {Array.isArray(part.vehicle_compatibility) ? part.vehicle_compatibility.slice(0, 2).join(', ') : ''}
                        </div>
                      </div>
                      <div className="top-viewed-bar-wrap">
                        <div className="top-viewed-bar">
                          <div
                            className="top-viewed-bar-fill"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="top-viewed-count">{part.views_count || 0} views</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Shop Demand & Visibility Summary */}
        <div className="shop-card">
          <div className="shop-card-head">
            <h3>📊 Store Visibility</h3>
          </div>
          <div className="shop-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Profile Views This Month</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                {stats.profile_views ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981' }}>
                ↑ High search discovery from Colombo & Western Province
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b' }}>Inquiries Conversion:</span>
                <strong>{stats.total_parts > 0 ? Math.round(((stats.total_inquiries || 0) / stats.total_parts) * 100) : 0}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b' }}>Pending Customer Queries:</span>
                <strong style={{ color: stats.pending_inquiries > 0 ? '#f59e0b' : '#10b981' }}>
                  {stats.pending_inquiries ?? 0}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b' }}>Customer Satisfaction:</span>
                <strong style={{ color: '#eab308' }}>
                  ★ {stats.average_rating ? Number(stats.average_rating).toFixed(1) : '5.0'} / 5.0
                </strong>
              </div>
            </div>

            <button
              className="shop-btn shop-btn-secondary"
              onClick={() => navigate('/shop/inquiries')}
              style={{ marginTop: 'auto' }}
            >
              💬 View Inquiries ({stats.pending_inquiries || 0} Pending)
            </button>
          </div>
        </div>
      </div>

      {/* ── Low Stock Warnings Table ── */}
      <div className="shop-card">
        <div className="shop-card-head">
          <h3>
            ⚠️ Low Stock Warnings
            {lowStockParts.length > 0 && (
              <span className="stock-badge low_stock" style={{ marginLeft: '8px' }}>
                {lowStockParts.length} critical items
              </span>
            )}
          </h3>
          <button
            className="shop-btn shop-btn-secondary shop-btn-sm"
            onClick={() => navigate('/shop/inventory')}
          >
            Go to Full Inventory →
          </button>
        </div>
        <div className="shop-card-body" style={{ padding: 0 }}>
          {lowStockParts.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#10b981' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
              <strong>Great job! All spare parts are well-stocked.</strong>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                No parts currently meet low stock thresholds (&le; 5 units).
              </div>
            </div>
          ) : (
            <div className="shop-table-wrapper">
              <table className="shop-table">
                <thead>
                  <tr>
                    <th>Spare Part</th>
                    <th>Category</th>
                    <th>Condition</th>
                    <th>Current Stock</th>
                    <th>Price (LKR)</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockParts.map((part) => (
                    <tr key={part.id}>
                      <td>
                        <div className="part-info-cell">
                          <div className="part-thumb-wrap">
                            <img
                              src={part.image_url || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=100&q=80'}
                              alt={part.name}
                              className="part-thumb"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=100&q=80'; }}
                            />
                          </div>
                          <div>
                            <div className="part-title-text">{part.name}</div>
                            <div className="part-sku-text">P/N: {part.part_number || 'N/A'} • {part.brand || 'OEM'}</div>
                          </div>
                        </div>
                      </td>
                      <td>{part.category}</td>
                      <td><span className="cond-badge">{part.condition || 'Brand New'}</span></td>
                      <td>
                        <strong style={{ color: part.stock_quantity === 0 ? '#ef4444' : '#f59e0b' }}>
                          {part.stock_quantity ?? 0} units
                        </strong>
                      </td>
                      <td>LKR {Number(part.price || 0).toLocaleString()}</td>
                      <td>
                        <span className={`stock-badge ${part.availability}`}>
                          {part.availability === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="shop-btn shop-btn-primary shop-btn-sm"
                          onClick={() => {
                            setRestockModalPart(part);
                            setRestockQuantity(10);
                          }}
                        >
                          ⚡ Quick Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Restock Modal Dialog ── */}
      {restockModalPart && (
        <div className="shop-modal-overlay">
          <div className="shop-modal-box">
            <div className="shop-modal-head">
              <h3>⚡ Quick Restock Item</h3>
              <button
                className="shop-modal-close-btn"
                onClick={() => setRestockModalPart(null)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleRestockSubmit}>
              <div className="shop-modal-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
                  <div className="part-thumb-wrap" style={{ width: '54px', height: '54px' }}>
                    <img
                      src={restockModalPart.image_url}
                      alt={restockModalPart.name}
                      className="part-thumb"
                    />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', color: '#0f172a' }}>{restockModalPart.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Currently in Stock: <strong style={{ color: '#d97706' }}>{restockModalPart.stock_quantity} units</strong>
                    </span>
                  </div>
                </div>

                <div className="shop-form-group">
                  <label className="shop-form-label">Units to Add into Stock:</label>
                  <input
                    type="number"
                    min="1"
                    className="shop-form-input"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                  />
                  <span className="shop-hint">
                    New total will be: <strong>{Number(restockModalPart.stock_quantity || 0) + Number(restockQuantity)} units</strong>
                  </span>
                </div>
              </div>
              <div className="shop-modal-foot">
                <button
                  type="button"
                  className="shop-btn shop-btn-secondary"
                  onClick={() => setRestockModalPart(null)}
                  disabled={restockSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="shop-btn shop-btn-primary"
                  disabled={restockSubmitting}
                >
                  {restockSubmitting ? 'Updating...' : 'Confirm Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
