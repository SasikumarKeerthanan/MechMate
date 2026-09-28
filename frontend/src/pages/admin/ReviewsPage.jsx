import React, { useEffect, useState } from 'react';
import { reviewsApi } from '../../api/services';
import './AdminPages.css';

const MOCK_REVIEWS = [
  { id: 1, user: 'Ashan P.',    provider: 'AutoFix Lanka',  rating: 2, comment: 'Very slow service.',   flagged: true  },
  { id: 2, user: 'Nimal S.',    provider: 'SpeedServe Co.', rating: 1, comment: 'Rude staff behavior.', flagged: true  },
  { id: 3, user: 'Kumari F.',   provider: 'FastWrench Ltd', rating: 5, comment: 'Excellent work!',      flagged: false },
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewsApi
      .getFlagged()
      .then(({ data }) => setReviews(data.reviews ?? MOCK_REVIEWS))
      .catch(() => setReviews(MOCK_REVIEWS))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    try { await reviewsApi.approve(id); } catch { /* stub */ }
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, flagged: false } : r)));
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this review?')) return;
    try { await reviewsApi.remove(id); } catch { /* stub */ }
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2 className="page-heading">Reviews & Moderation</h2>
        <p className="page-desc">Review flagged content and take moderation actions.</p>
      </div>

      <div className="table-card" id="reviews-table">
        {loading ? (
          <div className="loading-row">Loading reviews…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Provider</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Flagged</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className={r.flagged ? 'row-flagged' : ''}>
                  <td>{r.id}</td>
                  <td>{r.user}</td>
                  <td>{r.provider}</td>
                  <td style={{ color: '#f59e0b', letterSpacing: 1 }}>{stars(r.rating)}</td>
                  <td className="text-muted" style={{ maxWidth: 200 }}>{r.comment}</td>
                  <td>
                    <span className={`badge badge--${r.flagged ? 'danger' : 'success'}`}>
                      {r.flagged ? 'Flagged' : 'OK'}
                    </span>
                  </td>
                  <td className="action-cell">
                    {r.flagged && (
                      <button
                        id={`approve-review-${r.id}`}
                        className="action-btn action-btn--success"
                        onClick={() => handleApprove(r.id)}
                      >
                        Approve
                      </button>
                    )}
                    <button
                      id={`remove-review-${r.id}`}
                      className="action-btn action-btn--danger"
                      onClick={() => handleRemove(r.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-row">No reviews to moderate.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
