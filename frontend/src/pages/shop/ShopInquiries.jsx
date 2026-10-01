import React, { useState, useEffect } from 'react';
import { shopApi } from '../../api/services';
import './ShopPages.css';

const QUICK_RESPONSES = [
  'Yes, this part is 100% genuine OEM and currently in stock at our shop. Same-day islandwide courier delivery is available.',
  'Confirmed compatible with your vehicle model and chassis code. You can purchase directly or visit our branch.',
  'This item is currently low in stock. Please contact our sales hotline to reserve the part for immediate collection.',
];

export default function ShopInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'responded'
  const [toast, setToast] = useState(null);

  // Reply Modal / Drawer state
  const [activeInquiry, setActiveInquiry] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchInquiries = () => {
    setLoading(true);
    shopApi.getInquiries()
      .then(({ data }) => {
        if (data.success && Array.isArray(data.inquiries)) {
          setInquiries(data.inquiries);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch inquiries:', err);
        showToast('Error loading customer inquiries.', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const openReplyModal = (inquiry) => {
    setActiveInquiry(inquiry);
    setResponseText(inquiry.response || '');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!activeInquiry || !responseText.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await shopApi.replyInquiry(activeInquiry.id, responseText);
      if (data.success) {
        showToast(`Reply sent to ${activeInquiry.customer_name || 'customer'}!`);
        // Update local inquiry record
        setInquiries((prev) =>
          prev.map((inq) =>
            inq.id === activeInquiry.id
              ? {
                  ...inq,
                  status: 'responded',
                  response: responseText,
                  responded_at: new Date().toISOString(),
                }
              : inq
          )
        );
        setActiveInquiry(null);
        setResponseText('');
      }
    } catch (err) {
      console.error('Failed to reply inquiry:', err);
      showToast('Error sending reply. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const isPending = (inq.status || 'pending').toLowerCase() === 'pending';
    if (statusFilter === 'pending') return isPending;
    if (statusFilter === 'responded') return !isPending;
    return true;
  });

  const pendingCount = inquiries.filter((i) => (i.status || 'pending').toLowerCase() === 'pending').length;
  const respondedCount = inquiries.filter((i) => (i.status || 'pending').toLowerCase() !== 'pending').length;

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
          <h1>Customer Inquiries & Messages</h1>
          <p>Direct compatibility queries and part inquiries submitted by vehicle owners.</p>
        </div>
        <div className="shop-page-actions">
          <button className="shop-btn shop-btn-secondary" onClick={fetchInquiries}>
            🔄 Refresh Inquiries
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="shop-card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className={`shop-btn ${statusFilter === 'all' ? 'shop-btn-primary' : 'shop-btn-secondary'} shop-btn-sm`}
            onClick={() => setStatusFilter('all')}
          >
            All Inquiries ({inquiries.length})
          </button>
          <button
            className={`shop-btn ${statusFilter === 'pending' ? 'shop-btn-primary' : 'shop-btn-secondary'} shop-btn-sm`}
            onClick={() => setStatusFilter('pending')}
          >
            ⏳ Pending Awaiting Reply ({pendingCount})
          </button>
          <button
            className={`shop-btn ${statusFilter === 'responded' ? 'shop-btn-primary' : 'shop-btn-secondary'} shop-btn-sm`}
            onClick={() => setStatusFilter('responded')}
          >
            ✓ Replied ({respondedCount})
          </button>
        </div>
      </div>

      {/* Inquiry List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div className="shop-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Loading customer inquiries...
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="shop-card" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💬</div>
            <strong style={{ fontSize: '1.1rem', color: '#1e293b', display: 'block' }}>No inquiries in this view</strong>
            <span style={{ fontSize: '0.85rem' }}>Vehicle owner inquiries will appear here when submitted.</span>
          </div>
        ) : (
          filteredInquiries.map((inq) => {
            const isPending = (inq.status || 'pending').toLowerCase() === 'pending';
            return (
              <div
                key={inq.id}
                className={`inquiry-card ${isPending ? 'pending' : 'replied'}`}
              >
                <div className="inquiry-card-head">
                  <div className="inquiry-user-info">
                    <div className="inquiry-avatar">
                      {(inq.customer_name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                        {inq.customer_name || 'Registered Driver'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        🚗 Vehicle: <strong>{inq.vehicle_model || inq.vehicle || 'Not specified'}</strong> • 📅 {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`stock-badge ${isPending ? 'low_stock' : 'in_stock'}`}>
                      {isPending ? '⏳ Awaiting Reply' : '✓ Replied'}
                    </span>
                    <button
                      className={`shop-btn ${isPending ? 'shop-btn-primary' : 'shop-btn-secondary'} shop-btn-sm`}
                      onClick={() => openReplyModal(inq)}
                    >
                      {isPending ? '💬 Reply' : '✏️ Edit Reply'}
                    </button>
                  </div>
                </div>

                {/* Inquiry Question */}
                <div className="inquiry-question">
                  <strong style={{ display: 'block', fontSize: '0.82rem', color: '#475569', marginBottom: '4px' }}>
                    Customer Question:
                  </strong>
                  {inq.question || inq.message || inq.subject || 'No inquiry text provided.'}
                </div>

                {/* If replied, show previous answer */}
                {inq.response && (
                  <div className="inquiry-reply-box">
                    <strong style={{ display: 'block', fontSize: '0.82rem', color: '#166534', marginBottom: '4px' }}>
                      ✓ Your Shop Response:
                    </strong>
                    {inq.response}
                    {inq.responded_at && (
                      <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '6px' }}>
                        Sent on {new Date(inq.responded_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Reply Drawer / Modal ── */}
      {activeInquiry && (
        <div className="shop-modal-overlay">
          <div className="shop-modal-box">
            <div className="shop-modal-head">
              <h3>💬 Reply to Customer Inquiry</h3>
              <button
                className="shop-modal-close-btn"
                onClick={() => setActiveInquiry(null)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSendReply}>
              <div className="shop-modal-body">
                {/* Inquiry summary banner */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                    {activeInquiry.customer_name || 'Vehicle Owner'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '8px' }}>
                    Vehicle: <strong>{activeInquiry.vehicle_model || activeInquiry.vehicle || 'General Inquiry'}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', fontStyle: 'italic', background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    "{activeInquiry.question || activeInquiry.message || 'Compatibility question'}"
                  </div>
                </div>

                {/* Quick canned replies */}
                <div>
                  <span className="shop-form-label" style={{ display: 'block', marginBottom: '6px' }}>
                    Insert Quick Template:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {QUICK_RESPONSES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="shop-btn shop-btn-secondary shop-btn-sm"
                        style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '0.78rem', lineHeight: '1.4' }}
                        onClick={() => setResponseText(tmpl)}
                      >
                        ⚡ "{tmpl.slice(0, 75)}..."
                      </button>
                    ))}
                  </div>
                </div>

                {/* Response Textarea */}
                <div className="shop-form-group">
                  <label className="shop-form-label">Your Response to Customer *</label>
                  <textarea
                    className="shop-form-textarea"
                    rows="4"
                    placeholder="Type your response regarding spare part availability, pricing, or compatibility..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    required
                  />
                  <span className="shop-hint">
                    This message will be transmitted directly to the vehicle owner in their MechMate inbox.
                  </span>
                </div>
              </div>

              <div className="shop-modal-foot">
                <button
                  type="button"
                  className="shop-btn shop-btn-secondary"
                  onClick={() => setActiveInquiry(null)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="shop-btn shop-btn-primary"
                  disabled={submitting || !responseText.trim()}
                >
                  {submitting ? 'Sending...' : '📨 Send Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
