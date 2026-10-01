import React, { useState, useEffect, useMemo } from 'react';
import { shopApi } from '../../api/services';
import './ShopPages.css';

export default function ShopReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('all'); // 'all', '5', '4', '3', '2', '1'
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchReviews = () => {
    setLoading(true);
    shopApi.getReviews()
      .then(({ data }) => {
        if (data.success && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      })
      .catch((err) => {
        console.error('Failed to load reviews:', err);
        showToast('Error loading reviews.', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return {
        average: 5.0,
        total: 0,
        counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      counts[star] = (counts[star] || 0) + 1;
      sum += Number(r.rating) || 5;
    });

    const average = (sum / reviews.length).toFixed(1);
    return { average, total: reviews.length, counts };
  }, [reviews]);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    if (ratingFilter === 'all') return reviews;
    const filterNum = parseInt(ratingFilter, 10);
    return reviews.filter((r) => Math.round(Number(r.rating) || 5) === filterNum);
  }, [reviews, ratingFilter]);

  const renderStars = (rating) => {
    const stars = [];
    const num = Math.round(Number(rating) || 5);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= num ? '#fbbf24' : '#cbd5e1' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="shop-page">
      {/* Toast Alert */}
      {toast && (
        <div className={`shop-toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '⚠️'} {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="shop-page-header">
        <div className="shop-page-title-box">
          <h1>Customer Ratings & Reviews</h1>
          <p>Verified driver feedback and satisfaction scores regarding your spare parts and service.</p>
        </div>
        <div className="shop-page-actions">
          <button className="shop-btn shop-btn-secondary" onClick={fetchReviews}>
            🔄 Refresh Reviews
          </button>
        </div>
      </div>

      {/* ── Summary & Breakdown ── */}
      <div className="rating-summary-card">
        {/* Overall Score */}
        <div className="rating-big-score">
          <span className="rating-big-val">{stats.average}</span>
          <div className="rating-stars">{renderStars(stats.average)}</div>
          <span className="rating-count-label">
            Based on {stats.total} verified review{stats.total === 1 ? '' : 's'}
          </span>
        </div>

        {/* Rating Breakdown Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '280px', flex: 1, maxWidth: '420px' }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.counts[star] || 0;
            const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            return (
              <div
                key={star}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  opacity: ratingFilter === 'all' || ratingFilter === String(star) ? 1 : 0.5,
                }}
                onClick={() => setRatingFilter(ratingFilter === String(star) ? 'all' : String(star))}
                title={`Filter by ${star} star reviews`}
              >
                <span style={{ width: '45px', color: '#cbd5e1' }}>{star} star</span>
                <div style={{ flex: 1, height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: star >= 4 ? '#10b981' : star === 3 ? '#f59e0b' : '#ef4444',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <span style={{ width: '35px', textAlign: 'right', color: '#94a3b8' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="shop-card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b', marginRight: '6px' }}>Filter:</span>
          {['all', '5', '4', '3', '2', '1'].map((val) => (
            <button
              key={val}
              className={`shop-btn ${ratingFilter === val ? 'shop-btn-primary' : 'shop-btn-secondary'} shop-btn-sm`}
              onClick={() => setRatingFilter(val)}
            >
              {val === 'all' ? `All Reviews (${stats.total})` : `${val} Stars (${stats.counts[val] || 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {loading ? (
          <div className="shop-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Loading reviews and ratings...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="shop-card" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⭐</div>
            <strong style={{ fontSize: '1.1rem', color: '#1e293b', display: 'block' }}>
              No reviews match this filter
            </strong>
            <span style={{ fontSize: '0.85rem' }}>Customer feedback will appear here as orders and inquiries are fulfilled.</span>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div key={rev.id} className="review-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="inquiry-avatar" style={{ background: '#fef3c7', color: '#d97706' }}>
                    {(rev.user_name || rev.author || 'D').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                      {rev.user_name || rev.author || 'Verified Vehicle Owner'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent Verified Purchase'}
                    </div>
                  </div>
                </div>

                <div className="review-stars">
                  {renderStars(rev.rating)}
                  <span style={{ fontWeight: 700, color: '#0f172a', marginLeft: '6px', fontSize: '0.88rem' }}>
                    {rev.rating}.0
                  </span>
                </div>
              </div>

              {rev.target_name && (
                <div style={{ fontSize: '0.78rem', color: '#3b82f6', background: '#eff6ff', padding: '3px 8px', borderRadius: '4px', alignSelf: 'flex-start' }}>
                  📦 {rev.target_name}
                </div>
              )}

              <p className="review-comment" style={{ margin: 0 }}>
                "{rev.comment || rev.text || 'Excellent genuine parts and fast service.'}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
