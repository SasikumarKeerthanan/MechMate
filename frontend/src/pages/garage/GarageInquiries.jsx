import React, { useState, useEffect } from 'react';
import { garageApi } from '../../api/services';
import './GaragePages.css';

const QUICK_GARAGE_RESPONSES = [
  'We have workshop bay availability for your vehicle this week. Please bring your vehicle in for a preliminary diagnostic scan.',
  'Estimated cost and labour duration for this package are confirmed as quoted. We provide genuine parts and a 6-month workshop service warranty.',
  'Our certified hybrid diagnostic technician is available. We can schedule an appointment for you tomorrow morning at 9:00 AM.',
];

export default function GarageInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'answered'
  const [toast, setToast] = useState(null);

  // Reply Modal
  const [activeInquiry, setActiveInquiry] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchInquiries = () => {
    setLoading(true);
    garageApi.getInquiries()
      .then(({ data }) => {
        if (data.success && Array.isArray(data.inquiries)) {
          setInquiries(data.inquiries);
        }
      })
      .catch((err) => {
        console.error('Failed to load inquiries:', err);
        showToast('Error loading customer inquiries.', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const openReplyModal = (inq) => {
    setActiveInquiry(inq);
    setReplyText(inq.response || inq.reply || '');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!activeInquiry || !replyText.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await garageApi.replyInquiry(activeInquiry.id, replyText);
      if (data.success) {
        showToast(`Reply sent to ${activeInquiry.customer_name || 'customer'}!`);
        setInquiries((prev) =>
          prev.map((i) =>
            i.id === activeInquiry.id
              ? {
                  ...i,
                  status: 'answered',
                  response: replyText,
                  reply: replyText,
                  responded_at: new Date().toISOString(),
                }
              : i
          )
        );
        setActiveInquiry(null);
        setReplyText('');
      }
    } catch (err) {
      console.error('Failed to reply inquiry:', err);
      showToast('Error transmitting response.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const isPending = (inq.status || 'pending').toLowerCase() === 'pending';
    if (statusFilter === 'pending') return isPending;
    if (statusFilter === 'answered') return !isPending;
    return true;
  });

  const pendingCount = inquiries.filter((i) => (i.status || 'pending').toLowerCase() === 'pending').length;
  const answeredCount = inquiries.filter((i) => (i.status || 'pending').toLowerCase() !== 'pending').length;

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
          <h1>Customer Service Inquiries & Appointments</h1>
          <p>Direct service requests, symptom diagnostics questions, and repair estimates from vehicle owners.</p>
        </div>
        <div className="garage-page-actions">
          <button className="garage-btn garage-btn-secondary" onClick={fetchInquiries}>
            🔄 Refresh Inquiries
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="garage-card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className={`garage-btn ${statusFilter === 'all' ? 'garage-btn-primary' : 'garage-btn-secondary'} garage-btn-sm`}
            onClick={() => setStatusFilter('all')}
          >
            All Inquiries ({inquiries.length})
          </button>
          <button
            className={`garage-btn ${statusFilter === 'pending' ? 'garage-btn-primary' : 'garage-btn-secondary'} garage-btn-sm`}
            onClick={() => setStatusFilter('pending')}
          >
            ⏳ Pending Action ({pendingCount})
          </button>
          <button
            className={`garage-btn ${statusFilter === 'answered' ? 'garage-btn-primary' : 'garage-btn-secondary'} garage-btn-sm`}
            onClick={() => setStatusFilter('answered')}
          >
            ✓ Answered ({answeredCount})
          </button>
        </div>
      </div>

      {/* Inquiries Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div className="garage-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Loading customer inquiries...
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="garage-card" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💬</div>
            <strong style={{ fontSize: '1.1rem', color: '#1e293b', display: 'block' }}>No inquiries in this category</strong>
            <span style={{ fontSize: '0.85rem' }}>Customer service inquiries and repair booking questions will appear here.</span>
          </div>
        ) : (
          filteredInquiries.map((inq) => {
            const isPending = (inq.status || 'pending').toLowerCase() === 'pending';
            return (
              <div
                key={inq.id}
                className="garage-card"
                style={{
                  padding: '20px',
                  borderLeft: isPending ? '4px solid #f59e0b' : '4px solid #0d9488',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#f0fdfa',
                        color: '#0d9488',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                      }}
                    >
                      {(inq.customer_name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.98rem' }}>
                        {inq.customer_name || 'Vehicle Owner'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        🚗 Vehicle: <strong>{inq.vehicle || inq.vehicle_model || 'Unspecified'}</strong> {inq.service_name ? `• Package: ${inq.service_name}` : ''} • 📅 {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`service-status-badge ${isPending ? 'booking_only' : 'available'}`}>
                      {isPending ? '⏳ Awaiting Reply' : '✓ Answered'}
                    </span>
                    <button
                      className={`garage-btn ${isPending ? 'garage-btn-primary' : 'garage-btn-secondary'} garage-btn-sm`}
                      onClick={() => openReplyModal(inq)}
                    >
                      {isPending ? '💬 Reply' : '✏️ Edit Reply'}
                    </button>
                  </div>
                </div>

                {/* Inquiry Question */}
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.88rem',
                    color: '#334155',
                    marginBottom: inq.response || inq.reply ? '12px' : 0,
                  }}
                >
                  <strong style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                    Customer Request / Problem Description:
                  </strong>
                  {inq.message || inq.question || 'No question details provided.'}
                </div>

                {/* Response Box */}
                {(inq.response || inq.reply) && (
                  <div
                    style={{
                      background: '#f0fdfa',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #99f6e4',
                      fontSize: '0.85rem',
                      color: '#0f766e',
                    }}
                  >
                    <strong style={{ display: 'block', fontSize: '0.8rem', color: '#0f766e', marginBottom: '4px' }}>
                      ✓ Your Service Centre Response:
                    </strong>
                    {inq.response || inq.reply}
                    {inq.responded_at && (
                      <div style={{ fontSize: '0.72rem', color: '#0d9488', marginTop: '6px' }}>
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

      {/* ── Reply Modal ── */}
      {activeInquiry && (
        <div className="garage-modal-overlay">
          <div className="garage-modal-box">
            <div className="garage-modal-head">
              <h3>💬 Reply to Service Inquiry</h3>
              <button
                className="garage-modal-close-btn"
                onClick={() => setActiveInquiry(null)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSendReply}>
              <div className="garage-modal-body">
                {/* Summary */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    {activeInquiry.customer_name || 'Vehicle Owner'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 8px' }}>
                    Vehicle: <strong>{activeInquiry.vehicle || activeInquiry.vehicle_model || 'Unspecified'}</strong> {activeInquiry.service_name ? `• Package: ${activeInquiry.service_name}` : ''}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', fontStyle: 'italic', background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    "{activeInquiry.message || activeInquiry.question || 'Service inquiry'}"
                  </div>
                </div>

                {/* Templates */}
                <div>
                  <span className="garage-form-label" style={{ display: 'block', marginBottom: '6px' }}>
                    Quick Workshop Response Templates:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {QUICK_GARAGE_RESPONSES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="garage-btn garage-btn-secondary garage-btn-sm"
                        style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '0.78rem', lineHeight: '1.4' }}
                        onClick={() => setReplyText(tmpl)}
                      >
                        ⚡ "{tmpl.slice(0, 75)}..."
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea */}
                <div className="garage-form-group">
                  <label className="garage-form-label">Workshop Response & Booking Slot *</label>
                  <textarea
                    className="garage-form-textarea"
                    rows="4"
                    placeholder="Type your quotation, estimated turnaround, or available bay slots..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    This response will be sent directly to the customer's MechMate app notification inbox.
                  </span>
                </div>
              </div>

              <div className="garage-modal-foot">
                <button
                  type="button"
                  className="garage-btn garage-btn-secondary"
                  onClick={() => setActiveInquiry(null)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="garage-btn garage-btn-primary"
                  disabled={submitting || !replyText.trim()}
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
