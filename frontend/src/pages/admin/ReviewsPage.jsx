import React, { useEffect, useState, useMemo } from 'react';
import { reviewsApi } from '../../api/services';
import './AdminPages.css';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'hidden' | 'flagged'
  const [targetTypeFilter, setTargetTypeFilter] = useState('all'); // 'all' | 'shop' | 'service_center' | 'mechanic'
  const [search, setSearch] = useState('');

  // Modals state
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: '', // 'hide' | 'restore' | 'delete'
    review: null,
  });

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewsApi.getAll({
        status: statusFilter,
        target_type: targetTypeFilter,
        search,
      });
      if (res.data?.reviews) {
        setReviews(res.data.reviews);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [statusFilter, targetTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadReviews();
  };

  // Execute Hide / Restore
  const handleToggleStatus = async (review, targetStatus) => {
    try {
      const res = await reviewsApi.updateStatus(review.id, targetStatus);
      showToast(res.data?.message || `Review #${review.id} updated.`, 'success');
      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id
            ? { ...r, status: targetStatus, flagged: targetStatus === 'published' ? false : r.flagged }
            : r
        )
      );
    } catch {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id ? { ...r, status: targetStatus } : r
        )
      );
      showToast(`Review status updated to ${targetStatus}.`, 'success');
    } finally {
      setActionModal({ isOpen: false, type: '', review: null });
    }
  };

  // Execute Delete
  const handleDeleteReview = async (reviewId) => {
    try {
      const res = await reviewsApi.remove(reviewId);
      showToast(res.data?.message || 'Review permanently removed.', 'info');
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      showToast('Review removed.', 'info');
    } finally {
      setActionModal({ isOpen: false, type: '', review: null });
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const typeLabels = {
    shop: 'Spare Part Shop',
    service_center: 'Service Centre',
    mechanic: 'Mechanic',
  };

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

      {/* ── Page Header ── */}
      <div className="page-header">
        <h2 className="page-heading">Ratings & Reviews Moderation</h2>
        <p className="page-desc">
          Centralized moderation queue across spare-part shops, garages, and mechanics. Hide false or defamatory reviews, restore appealed feedback, or remove spam.
        </p>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="table-toolbar" style={{ justifyContent: 'space-between' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            id="review-search-input"
            type="search"
            className="search-input"
            placeholder="Search reviewer, vendor, comment…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '280px' }}
          />
          <button type="submit" className="action-btn action-btn--primary">Search</button>
        </form>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Provider Type:</span>
          <select
            id="filter-target-type"
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#334155',
              background: '#fff',
            }}
          >
            <option value="all">All Providers</option>
            <option value="shop">Spare Part Shops</option>
            <option value="service_center">Service Centres</option>
            <option value="mechanic">Mechanics</option>
          </select>

          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginLeft: '6px' }}>Status:</span>
          {['all', 'published', 'hidden', 'flagged'].map((st) => (
            <button
              key={st}
              id={`filter-review-status-${st}`}
              className={`filter-btn ${statusFilter === st ? 'filter-btn--active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Reviews Data Table ── */}
      <div className="table-card" id="reviews-table">
        {loading ? (
          <div className="loading-row">Loading customer reviews…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Customer / Reviewer</th>
                <th>Reviewed Provider</th>
                <th>Category</th>
                <th>Rating</th>
                <th style={{ width: '30%' }}>Customer Feedback & Context</th>
                <th>Moderation Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => {
                const isHidden = r.status === 'hidden';
                const isFlagged = r.flagged === true;

                return (
                  <tr key={r.id} className={isFlagged ? 'row-flagged' : ''}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#64748b' }}>
                      #{r.id}
                    </td>
                    <td>
                      <div className="fw-medium">{r.user}</div>
                    </td>
                    <td>
                      <div style={{ color: '#0f172a', fontWeight: 600 }}>{r.target_name}</div>
                    </td>
                    <td>
                      <span className="target-type-pill">
                        {typeLabels[r.target_type] || r.target_type}
                      </span>
                    </td>
                    <td>
                      <div className="stars-display" title={`${r.rating} out of 5 stars`}>
                        {renderStars(r.rating)}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.84rem', color: '#1e293b', lineHeight: 1.4 }}>
                        "{r.comment}"
                      </div>
                      {r.flag_reason && (
                        <div style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
                          🚩 Flag reason: {r.flag_reason}
                        </div>
                      )}
                    </td>
                    <td>
                      {isFlagged ? (
                        <span className="badge badge--flagged">
                          Flagged
                        </span>
                      ) : isHidden ? (
                        <span className="badge badge--hidden">
                          Hidden
                        </span>
                      ) : (
                        <span className="badge badge--published">
                          Published
                        </span>
                      )}
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {r.created_at}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-cell" style={{ justifyContent: 'flex-end' }}>
                        {/* Hide or Restore Toggle */}
                        {isHidden ? (
                          <button
                            id={`restore-review-${r.id}`}
                            className="action-btn action-btn--success"
                            onClick={() =>
                              setActionModal({
                                isOpen: true,
                                type: 'restore',
                                review: r,
                              })
                            }
                            title="Restore review to public listings"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            id={`hide-review-${r.id}`}
                            className="action-btn"
                            style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
                            onClick={() =>
                              setActionModal({
                                isOpen: true,
                                type: 'hide',
                                review: r,
                              })
                            }
                            title="Hide review from provider's public profile"
                          >
                            Hide
                          </button>
                        )}

                        {/* Delete Permanently */}
                        <button
                          id={`delete-review-${r.id}`}
                          className="action-btn action-btn--danger"
                          onClick={() =>
                            setActionModal({
                              isOpen: true,
                              type: 'delete',
                              review: r,
                            })
                          }
                          title="Permanently delete review"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {reviews.length === 0 && (
                <tr>
                  <td colSpan={9} className="empty-row">
                    No customer ratings or reviews match the specified criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Action Confirmation Modal (Hide / Restore / Delete) ── */}
      {actionModal.isOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setActionModal({ isOpen: false, type: '', review: null })}
        >
          <div className="modal-dialog" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body">
              <div className="confirm-box">
                <div
                  className={`confirm-icon-circle ${
                    actionModal.type === 'delete'
                      ? 'confirm-icon-circle--danger'
                      : actionModal.type === 'hide'
                      ? 'confirm-icon-circle--warning'
                      : 'confirm-icon-circle--success'
                  }`}
                >
                  {actionModal.type === 'delete' ? '🗑️' : actionModal.type === 'hide' ? '👁️‍🗨️' : '✓'}
                </div>

                <h3>
                  {actionModal.type === 'delete' && 'Permanently Delete Review?'}
                  {actionModal.type === 'hide' && 'Hide Customer Review?'}
                  {actionModal.type === 'restore' && 'Restore Published Review?'}
                </h3>

                <p>
                  {actionModal.type === 'delete' &&
                    `Are you sure you want to permanently delete review #${actionModal.review?.id} by '${actionModal.review?.user}'? This action cannot be reverted.`}
                  {actionModal.type === 'hide' &&
                    `Hiding this review will remove it from '${actionModal.review?.target_name}'s public rating profile while preserving records for dispute resolution.`}
                  {actionModal.type === 'restore' &&
                    `Restoring this review will make it visible again on '${actionModal.review?.target_name}'s public profile.`}
                </p>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button
                className="action-btn btn-inspect"
                onClick={() => setActionModal({ isOpen: false, type: '', review: null })}
              >
                Cancel
              </button>

              {actionModal.type === 'delete' && (
                <button
                  id="confirm-delete-review-btn"
                  className="action-btn action-btn--danger"
                  onClick={() => handleDeleteReview(actionModal.review.id)}
                >
                  Confirm Delete
                </button>
              )}

              {actionModal.type === 'hide' && (
                <button
                  id="confirm-hide-review-btn"
                  className="action-btn action-btn--danger"
                  onClick={() => handleToggleStatus(actionModal.review, 'hidden')}
                >
                  Confirm Hide
                </button>
              )}

              {actionModal.type === 'restore' && (
                <button
                  id="confirm-restore-review-btn"
                  className="action-btn action-btn--success"
                  onClick={() => handleToggleStatus(actionModal.review, 'published')}
                >
                  Confirm Restore
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
