import React, { useState, useEffect, useMemo } from 'react';
import { garageApi } from '../../api/services';
import './GaragePages.css';

export default function GarageReviews() {
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
    garageApi.getReviews()
      .then(({ data }) => {
        if (data.success && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      })
      .catch((err) => {
        console.error('Failed to load garage reviews:', err);
        showToast('Error loading reviews.', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

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
          <h1>Customer Ratings & Service Reviews</h1>
          <p>Driver feedback on workmanship quality, transparency, turnaround speed, and customer care.</p>
        </div>
        <div className="garage-page-actions">
          <button className="garage-btn garage-btn-secondary" onClick={fetchReviews}>
            🔄 Refresh Reviews
          </button>
        </div>
      </div>

      {/* ── Rating Score & Distribution ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0b1120 0%, #134e4a 100%)',
          color: 'white',
          borderRadius: '14px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        {/* Score */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, color: '#fbbf24' }}>
            {stats.average}
          </span>
          <div style={{ color: '#fbbf24', fontSize: '1.4rem', marginTop: '4px' }}>
            {renderStars(stats.average)}
          </div>
          <span style={{ fontSize: '0.82rem', color: '#99f6e4', marginTop: '4px' }}>
            Based on {stats.total} verified driver review{stats.total === 1 ? '' : 's'}
          </span>
        </div>

        {/* Breakdown Bars */}
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
                <div style={{ flex: 1, height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: star >= 4 ? '#14b8a6' : star === 3 ? '#f59e0b' : '#ef4444',
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
      <div className="garage-card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b', marginRight: '6px' }}>Filter:</span>
          {['all', '5', '4', '3', '2', '1'].map((val) => (
            <button
              key={val}
              className={`garage-btn ${ratingFilter === val ? 'garage-btn-primary' : 'garage-btn-secondary'} garage-btn-sm`}
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
          <div className="garage-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Loading reviews and ratings...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="garage-card" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⭐</div>
            <strong style={{ fontSize: '1.1rem', color: '#1e293b', display: 'block' }}>
              No reviews in this filter
            </strong>
            <span style={{ fontSize: '0.85rem' }}>Customer workshop ratings and reviews will appear here as services are completed.</span>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div key={rev.id} className="garage-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#f0fdfa',
                      color: '#0d9488',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {(rev.user_name || rev.author || 'D').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                      {rev.user_name || rev.author || 'Verified Vehicle Owner'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent Service Job'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ color: '#f59e0b', fontSize: '0.95rem' }}>
                    {renderStars(rev.rating)}
                  </div>
                  <strong style={{ color: '#0f172a', fontSize: '0.88rem' }}>
                    {rev.rating}.0
                  </strong>
                </div>
              </div>

              {rev.target_name && (
                <div style={{ fontSize: '0.78rem', color: '#0d9488', background: '#f0fdfa', padding: '3px 8px', borderRadius: '4px', alignSelf: 'flex-start' }}>
                  🔧 Service: {rev.target_name}
                </div>
              )}

              <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                "{rev.comment || rev.text || 'Highly professional workshop and excellent service.'}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
