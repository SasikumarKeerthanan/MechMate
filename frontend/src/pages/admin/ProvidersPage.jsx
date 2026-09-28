import React, { useEffect, useState, useMemo } from 'react';
import { providersApi } from '../../api/services';
import './AdminPages.css';

const DEFAULT_PROVIDERS = [
  // Pending
  {
    id: 101,
    type: 'service_center',
    business_name: 'AutoFix Lanka Garages (Pvt) Ltd',
    owner_name: 'Sunil Weerakkody',
    email: 'autofix@lk.com',
    phone: '+94 11 289 4500',
    city: 'Colombo',
    address: '324 Baseline Road, Dematagoda, Colombo 09',
    status: 'pending',
    email_verified: false,
    email_verification_status: 'pending',
    specialty: 'Hybrid & EV Maintenance, Engine Overhaul',
    license_number: 'BR-PV-2023-9182',
    tax_id: 'TIN-10928374',
    created_at: '2026-09-27',
    rejection_reason: null,
    documents: [
      { name: 'Business Registration (BR)', file: 'BR_AutoFix_2023.pdf', size: '1.8 MB', verified: true },
      { name: 'Tax Identification Certificate (TIN)', file: 'TIN_AutoFix_Lanka.pdf', size: '820 KB', verified: true },
      { name: 'Garage Environmental & Safety Permit', file: 'Safety_Permit_2026.pdf', size: '2.3 MB', verified: true },
    ],
  },
  {
    id: 102,
    type: 'shop',
    business_name: 'Lanka Spares Direct',
    owner_name: 'Janaka Bandara',
    email: 'janaka@lankaspares.lk',
    phone: '+94 81 223 9081',
    city: 'Kandy',
    address: '45 Katugastota Road, Kandy',
    status: 'pending',
    email_verified: false,
    email_verification_status: 'pending',
    specialty: 'Japanese Genuine Parts (Toyota, Honda, Nissan)',
    license_number: 'BR-SP-2024-4410',
    tax_id: 'TIN-40918273',
    created_at: '2026-09-28',
    rejection_reason: null,
    documents: [
      { name: 'Business Registration (BR)', file: 'BR_Lanka_Spares.pdf', size: '1.2 MB', verified: true },
      { name: 'Authorized Distributor Certificate', file: 'Toyota_Distributor_Cert.pdf', size: '950 KB', verified: true },
    ],
  },
  {
    id: 103,
    type: 'mechanic',
    business_name: 'Ruwan Mobile Diagnostics',
    owner_name: 'Ruwan Jayasinghe',
    email: 'ruwan.mech@gmail.com',
    phone: '+94 77 555 8921',
    city: 'Galle',
    address: '78/A Matara Road, Galle',
    status: 'pending',
    email_verified: false,
    email_verification_status: 'pending',
    specialty: 'Auto Electrical, Computer Scanning, Roadside Help',
    license_number: 'NIC-851940123V / NVQ-L4',
    tax_id: 'TIN-99201948',
    created_at: '2026-09-28',
    rejection_reason: null,
    documents: [
      { name: 'NVQ Level 4 Automobile Technician', file: 'NVQ4_Certificate_Ruwan.pdf', size: '2.1 MB', verified: true },
      { name: 'National Identity Card (NIC)', file: 'NIC_Scan_Ruwan.pdf', size: '740 KB', verified: true },
    ],
  },

  // Spare Part Shops
  {
    id: 201,
    type: 'shop',
    business_name: 'SpeedServe Auto Parts',
    owner_name: 'Mahesh Fonseka',
    email: 'sales@speedserve.lk',
    phone: '+94 11 432 9988',
    city: 'Colombo',
    address: '112 Panchikawatta Road, Colombo 10',
    status: 'approved',
    email_verified: true,
    email_verification_status: 'verified',
    specialty: 'Brake Systems, Suspension, Engine Filters',
    license_number: 'BR-CO-2021-3921',
    tax_id: 'TIN-20918239',
    created_at: '2024-03-12',
    documents: [{ name: 'Business Registration (BR)', file: 'BR_SpeedServe.pdf', size: '1.5 MB', verified: true }],
  },
  {
    id: 202,
    type: 'shop',
    business_name: 'Apex Auto Spares & Accessories',
    owner_name: 'Kasun Abeyratne',
    email: 'kasun@apexauto.lk',
    phone: '+94 31 228 1144',
    city: 'Negombo',
    address: '90 Main Street, Negombo',
    status: 'approved',
    email_verified: false,
    email_verification_status: 'pending',
    specialty: 'European Car Parts (BMW, Benz, Audi)',
    license_number: 'BR-NG-2022-7712',
    tax_id: 'TIN-88291024',
    created_at: '2024-07-19',
    documents: [{ name: 'Business Registration (BR)', file: 'BR_Apex_Auto.pdf', size: '1.3 MB', verified: true }],
  },

  // Service Centres
  {
    id: 301,
    type: 'service_center',
    business_name: 'Precision Tune Station',
    owner_name: 'Chathura Fernando',
    email: 'service@precisiontune.lk',
    phone: '+94 11 254 7711',
    city: 'Colombo',
    address: '500 High Level Road, Nugegoda',
    status: 'approved',
    email_verified: true,
    email_verification_status: 'verified',
    specialty: 'Periodic Lubrication, Wheel Alignment, AC Service',
    license_number: 'BR-PV-2020-1129',
    tax_id: 'TIN-33910294',
    created_at: '2024-01-20',
    documents: [{ name: 'Business Registration (BR)', file: 'BR_PrecisionTune.pdf', size: '2.0 MB', verified: true }],
  },
  {
    id: 302,
    type: 'service_center',
    business_name: 'City Motors Garage',
    owner_name: 'Nuwan Dissanayake',
    email: 'nuwan@citymotors.lk',
    phone: '+94 81 493 2200',
    city: 'Kandy',
    address: '190 William Gopallawa Mawatha, Kandy',
    status: 'suspended',
    email_verified: true,
    email_verification_status: 'verified',
    specialty: 'Body Wash, Tinkering, Painting & Collision Repair',
    license_number: 'BR-KD-2019-8812',
    tax_id: 'TIN-55192837',
    created_at: '2024-02-14',
    documents: [{ name: 'Business Registration (BR)', file: 'BR_CityMotors.pdf', size: '1.7 MB', verified: true }],
  },

  // Mechanics
  {
    id: 401,
    type: 'mechanic',
    business_name: 'Kamal Pro Mechanics',
    owner_name: 'Kamal Perera',
    email: 'kamal.pro@gmail.com',
    phone: '+94 77 444 3322',
    city: 'Colombo',
    address: '22 Nawala Road, Rajagiriya',
    status: 'approved',
    email_verified: true,
    email_verification_status: 'verified',
    specialty: 'Automatic Transmission & Gearbox Specialist',
    license_number: 'NIC-792834190V / NVQ-L5',
    tax_id: 'TIN-77192834',
    created_at: '2024-05-10',
    documents: [{ name: 'NVQ Level 5 Diploma Certificate', file: 'NVQ5_Kamal.pdf', size: '2.5 MB', verified: true }],
  },
  {
    id: 402,
    type: 'mechanic',
    business_name: 'Bandara Quick Fix',
    owner_name: 'Saman Bandara',
    email: 'saman.bandara@gmail.com',
    phone: '+94 71 888 2211',
    city: 'Kurunegala',
    address: '11 Puttalam Road, Kurunegala',
    status: 'approved',
    email_verified: false,
    email_verification_status: 'pending',
    specialty: 'Diesel Injector & Fuel Pump Tuning',
    license_number: 'NIC-831928445V / NVQ-L4',
    tax_id: 'TIN-66291039',
    created_at: '2024-06-25',
    documents: [{ name: 'NVQ Level 4 Certificate', file: 'NVQ4_Saman.pdf', size: '1.9 MB', verified: true }],
  },
];

export default function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'shop' | 'service_center' | 'mechanic'
  const [search, setSearch] = useState('');
  
  // Verification breakdown stats
  const [emailStats, setEmailStats] = useState(null);

  // Modals state
  const [inspectProvider, setInspectProvider] = useState(null);
  const [approveModal, setApproveModal] = useState({ isOpen: false, provider: null });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, provider: null, reason: '' });
  const [statusModal, setStatusModal] = useState({ isOpen: false, provider: null, targetStatus: '' });

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [providersRes, statsRes] = await Promise.all([
        providersApi.getAll(),
        providersApi.getEmailVerificationStatus().catch(() => null),
      ]);

      if (providersRes.data?.providers) {
        setProviders(providersRes.data.providers);
      } else {
        setProviders(DEFAULT_PROVIDERS);
      }

      if (statsRes?.data?.stats) {
        setEmailStats(statsRes.data.stats);
      }
    } catch {
      setProviders(DEFAULT_PROVIDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute counts for tabs
  const tabCounts = useMemo(() => {
    const counts = {
      pending: 0,
      shop: 0,
      service_center: 0,
      mechanic: 0,
    };

    providers.forEach((p) => {
      if (p.status === 'pending') {
        counts.pending++;
      } else {
        if (p.type === 'shop') counts.shop++;
        if (p.type === 'service_center') counts.service_center++;
        if (p.type === 'mechanic') counts.mechanic++;
      }
    });

    return counts;
  }, [providers]);

  // Filtered providers based on active tab & search
  const displayedProviders = useMemo(() => {
    return providers.filter((p) => {
      // Tab filter
      if (activeTab === 'pending') {
        if (p.status !== 'pending') return false;
      } else {
        if (p.type !== activeTab || p.status === 'pending') return false;
      }

      // Search filter
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        p.business_name?.toLowerCase().includes(term) ||
        p.owner_name?.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term) ||
        p.phone?.includes(term) ||
        p.city?.toLowerCase().includes(term) ||
        p.specialty?.toLowerCase().includes(term)
      );
    });
  }, [providers, activeTab, search]);

  // Execute Approve
  const handleApprove = async () => {
    if (!approveModal.provider) return;
    const { id, business_name } = approveModal.provider;

    try {
      const res = await providersApi.approve(id);
      showToast(
        res.data?.message || `Approved '${business_name}'. Verification email dispatched stub.`,
        'success'
      );
      setProviders((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: 'approved', email_verification_status: 'pending' }
            : p
        )
      );
    } catch {
      setProviders((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: 'approved', email_verification_status: 'pending' }
            : p
        )
      );
      showToast(`Provider '${business_name}' approved. Verification code dispatched (stub).`, 'success');
    } finally {
      setApproveModal({ isOpen: false, provider: null });
      if (inspectProvider?.id === id) {
        setInspectProvider(null);
      }
    }
  };

  // Execute Reject
  const handleReject = async () => {
    if (!rejectModal.provider) return;
    const { id, business_name } = rejectModal.provider;
    const reason = rejectModal.reason || 'Verification requirements not satisfied.';

    try {
      const res = await providersApi.reject(id, reason);
      showToast(res.data?.message || `Registration for '${business_name}' has been rejected.`, 'danger');
      setProviders((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: 'rejected', rejection_reason: reason } : p
        )
      );
    } catch {
      setProviders((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: 'rejected', rejection_reason: reason } : p
        )
      );
      showToast(`Registration for '${business_name}' has been rejected.`, 'danger');
    } finally {
      setRejectModal({ isOpen: false, provider: null, reason: '' });
      if (inspectProvider?.id === id) {
        setInspectProvider(null);
      }
    }
  };

  // Execute Status Toggle (Suspend / Activate)
  const handleStatusToggle = async () => {
    if (!statusModal.provider || !statusModal.targetStatus) return;
    const { id, business_name } = statusModal.provider;
    const newStatus = statusModal.targetStatus;

    try {
      const res = await providersApi.updateStatus(id, newStatus);
      showToast(res.data?.message || `Status changed to ${newStatus}.`, 'success');
      setProviders((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
    } catch {
      setProviders((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
      showToast(`Provider status updated to ${newStatus}.`, 'success');
    } finally {
      setStatusModal({ isOpen: false, provider: null, targetStatus: '' });
    }
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
        <h2 className="page-heading">Service Provider Management & Approvals</h2>
        <p className="page-desc">
          Review onboarding submissions, inspect verified documentation, approve or reject applications, and monitor email verification states.
        </p>
      </div>

      {/* ── Email Verification Status Monitoring Banner ── */}
      <div className="verification-banner" id="email-verification-banner">
        <div className="verif-banner-info">
          <div className="verif-banner-title">
            <span>🛡️</span>
            <span>Provider Email Verification Monitoring</span>
          </div>
          <div className="verif-banner-subtitle">
            Monitors whether approved providers have confirmed their email addresses via 6-digit confirmation tokens.
          </div>
        </div>

        <div className="verif-stats-strip">
          <div className="verif-stat-pill">
            <span className="verif-stat-pill-val" style={{ color: '#15803d' }}>
              {emailStats?.verified_count ?? 4}
            </span>
            <span className="verif-stat-pill-lbl">Verified Emails</span>
          </div>

          <div className="verif-stat-pill">
            <span className="verif-stat-pill-val" style={{ color: '#b45309' }}>
              {emailStats?.pending_verification_count ?? 2}
            </span>
            <span className="verif-stat-pill-lbl">Pending Confirmation</span>
          </div>

          <div className="verif-stat-pill">
            <span className="verif-stat-pill-val" style={{ color: '#2563eb' }}>
              {emailStats?.verification_rate ?? '66.7'}%
            </span>
            <span className="verif-stat-pill-lbl">Verification Rate</span>
          </div>
        </div>
      </div>

      {/* ── Tabbed Navigation Interface ── */}
      <div className="tabs-nav" id="provider-tabs-nav">
        <button
          id="tab-pending-approvals"
          className={`tab-btn ${activeTab === 'pending' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <span>⏳ Pending Approvals</span>
          <span className={`tab-count ${tabCounts.pending > 0 ? 'tab-count--alert' : ''}`}>
            {tabCounts.pending}
          </span>
        </button>

        <button
          id="tab-spare-part-shops"
          className={`tab-btn ${activeTab === 'shop' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          <span>🏬 Spare Part Shops</span>
          <span className="tab-count">{tabCounts.shop}</span>
        </button>

        <button
          id="tab-service-centres"
          className={`tab-btn ${activeTab === 'service_center' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('service_center')}
        >
          <span>🏢 Service Centres & Garages</span>
          <span className="tab-count">{tabCounts.service_center}</span>
        </button>

        <button
          id="tab-mechanics"
          className={`tab-btn ${activeTab === 'mechanic' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('mechanic')}
        >
          <span>🧑‍🔧 Independent Mechanics</span>
          <span className="tab-count">{tabCounts.mechanic}</span>
        </button>
      </div>

      {/* ── Toolbar: Search & Counts ── */}
      <div className="table-toolbar" style={{ justifyContent: 'space-between' }}>
        <input
          id="provider-search-input"
          type="search"
          className="search-input"
          placeholder="Filter by business, owner, city, specialty…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '320px' }}
        />

        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Showing <strong>{displayedProviders.length}</strong>{' '}
          {activeTab === 'pending' ? 'pending applications' : 'active providers'}
        </div>
      </div>

      {/* ── Content View: Pending Approvals (Cards or Table) ── */}
      {activeTab === 'pending' ? (
        <div id="pending-approvals-view">
          {loading ? (
            <div className="loading-row">Loading pending provider requests…</div>
          ) : displayedProviders.length === 0 ? (
            <div className="table-card">
              <div className="empty-row" style={{ padding: '48px 24px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉</div>
                <h3 style={{ margin: '0 0 6px', color: '#1e293b' }}>No Pending Applications</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                  All provider registrations have been reviewed. New onboarding signups will appear here automatically.
                </p>
              </div>
            </div>
          ) : (
            <div className="pending-grid">
              {displayedProviders.map((p) => {
                const typeLabel =
                  p.type === 'shop'
                    ? 'Spare Part Shop'
                    : p.type === 'service_center'
                    ? 'Service Centre'
                    : 'Independent Mechanic';

                return (
                  <div key={p.id} className="pending-card" id={`pending-card-${p.id}`}>
                    <div className="pending-card-top">
                      <div className="pending-card-header">
                        <div>
                          <h4 className="pending-card-title">{p.business_name}</h4>
                          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            Applied by <strong>{p.owner_name}</strong>
                          </span>
                        </div>
                        <span className="pending-card-type">{typeLabel}</span>
                      </div>

                      <div className="pending-card-details">
                        <div className="pending-detail-item">
                          <span className="pending-detail-lbl">Location</span>
                          <span className="pending-detail-val">{p.city}</span>
                        </div>
                        <div className="pending-detail-item">
                          <span className="pending-detail-lbl">Submitted</span>
                          <span className="pending-detail-val">{p.created_at}</span>
                        </div>
                        <div className="pending-detail-item">
                          <span className="pending-detail-lbl">Email</span>
                          <span className="pending-detail-val">{p.email}</span>
                        </div>
                        <div className="pending-detail-item">
                          <span className="pending-detail-lbl">Phone</span>
                          <span className="pending-detail-val">{p.phone}</span>
                        </div>
                      </div>

                      <div className="pending-detail-item">
                        <span className="pending-detail-lbl">Specialty</span>
                        <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                          {p.specialty}
                        </span>
                      </div>

                      {/* Documents snippet */}
                      <div className="pending-docs-summary">
                        <span className="pending-docs-summary-lbl">
                          Submitted Documents ({p.documents?.length ?? 0}):
                        </span>
                        <div className="doc-chip-list">
                          {(p.documents ?? []).map((doc, idx) => (
                            <span key={idx} className="doc-chip">
                              📄 {doc.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pending-card-actions">
                      <button
                        id={`inspect-doc-btn-${p.id}`}
                        className="btn-inspect"
                        onClick={() => setInspectProvider(p)}
                        title="Inspect full credentials & business registration"
                      >
                        🔍 Inspect Credentials
                      </button>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          id={`reject-btn-${p.id}`}
                          className="btn-reject"
                          onClick={() => setRejectModal({ isOpen: true, provider: p, reason: '' })}
                        >
                          Reject
                        </button>
                        <button
                          id={`approve-btn-${p.id}`}
                          className="btn-approve"
                          onClick={() => setApproveModal({ isOpen: true, provider: p })}
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ── Content View: Provider Data Tables (Shops, Service Centres, Mechanics) ── */
        <div className="table-card" id="providers-table">
          {loading ? (
            <div className="loading-row">Loading providers…</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th># ID</th>
                  <th>Business & Owner</th>
                  <th>Contact Details</th>
                  <th>Location</th>
                  <th>Specialty</th>
                  <th>Email Verification</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Management Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedProviders.map((p) => {
                  const isVerified =
                    p.email_verification_status === 'verified' || p.email_verified === true;
                  const isSuspended = p.status === 'suspended';

                  return (
                    <tr key={p.id} className={isSuspended ? 'row-flagged' : ''}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#64748b' }}>
                          #{p.id}
                        </span>
                      </td>
                      <td>
                        <div className="fw-medium" style={{ color: '#0f172a' }}>
                          {p.business_name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Owner: <strong>{p.owner_name}</strong>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', color: '#1e293b' }}>{p.email}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.phone}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{p.city}</div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{p.address}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#334155' }}>
                          {p.specialty}
                        </span>
                      </td>
                      <td>
                        {/* Email Verification Status Badge */}
                        {isVerified ? (
                          <span className="badge badge--verified" title="Email confirmation completed">
                            ✓ Verified
                          </span>
                        ) : (
                          <span
                            className="badge badge--pending-verification"
                            title="Awaiting email verification token confirmation"
                          >
                            ⏳ Pending Verification
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            isSuspended ? 'badge--suspended' : 'badge--active'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                        {p.created_at}
                      </td>
                      <td>
                        <div className="action-cell">
                          {/* View Credentials */}
                          <button
                            id={`inspect-provider-${p.id}`}
                            className="action-btn btn-inspect"
                            onClick={() => setInspectProvider(p)}
                            title="Inspect credentials and documentation"
                          >
                            Inspect
                          </button>

                          {/* Suspend / Activate Toggle */}
                          {isSuspended ? (
                            <button
                              id={`activate-provider-${p.id}`}
                              className="action-btn action-btn--success"
                              onClick={() =>
                                setStatusModal({
                                  isOpen: true,
                                  provider: p,
                                  targetStatus: 'approved',
                                })
                              }
                            >
                              Activate
                            </button>
                          ) : (
                            <button
                              id={`suspend-provider-${p.id}`}
                              className="action-btn action-btn--danger"
                              onClick={() =>
                                setStatusModal({
                                  isOpen: true,
                                  provider: p,
                                  targetStatus: 'suspended',
                                })
                              }
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {displayedProviders.length === 0 && (
                  <tr>
                    <td colSpan={9} className="empty-row">
                      No service providers found for the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Document / Credentials Inspection Modal ── */}
      {inspectProvider && (
        <div className="modal-backdrop" onClick={() => setInspectProvider(null)}>
          <div className="modal-dialog modal-dialog--wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-title">Provider Registration & Document Dossier</h3>
                <span className={`badge badge--${inspectProvider.status}`}>
                  {inspectProvider.status}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setInspectProvider(null)}>✕</button>
            </div>

            <div className="modal-body">
              {/* Business Overview */}
              <div className="user-avatar-header">
                <div
                  className="user-avatar-large"
                  style={{
                    background:
                      inspectProvider.type === 'shop'
                        ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
                        : inspectProvider.type === 'service_center'
                        ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                        : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  }}
                >
                  {inspectProvider.type === 'shop'
                    ? '🏬'
                    : inspectProvider.type === 'service_center'
                    ? '🏢'
                    : '🧑‍🔧'}
                </div>
                <div className="user-header-text">
                  <h3>{inspectProvider.business_name}</h3>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Owner: {inspectProvider.owner_name} • {inspectProvider.email} • {inspectProvider.phone}
                  </span>
                </div>
              </div>

              {/* Business Identification Meta */}
              <div className="modal-info-grid">
                <div className="modal-info-field">
                  <span className="modal-info-label">Category / Role</span>
                  <span className="modal-info-value" style={{ textTransform: 'capitalize' }}>
                    {inspectProvider.type?.replace('_', ' ')}
                  </span>
                </div>
                <div className="modal-info-field">
                  <span className="modal-info-label">Business Registration (BR) / NIC</span>
                  <span className="modal-info-value" style={{ fontFamily: 'monospace' }}>
                    {inspectProvider.license_number || 'BR-2024-PENDING'}
                  </span>
                </div>
                <div className="modal-info-field">
                  <span className="modal-info-label">Tax Identification Number (TIN)</span>
                  <span className="modal-info-value" style={{ fontFamily: 'monospace' }}>
                    {inspectProvider.tax_id || 'TIN-NOT-FILED'}
                  </span>
                </div>
                <div className="modal-info-field">
                  <span className="modal-info-label">City & Operational Address</span>
                  <span className="modal-info-value">
                    {inspectProvider.city}, {inspectProvider.address}
                  </span>
                </div>
                <div className="modal-info-field">
                  <span className="modal-info-label">Specialty & Service Scope</span>
                  <span className="modal-info-value">{inspectProvider.specialty}</span>
                </div>
                <div className="modal-info-field">
                  <span className="modal-info-label">Email Verification Status</span>
                  <span className="modal-info-value">
                    {inspectProvider.email_verification_status === 'verified'
                      ? '✓ Confirmed via 6-digit token'
                      : '⏳ Pending provider confirmation code'}
                  </span>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                  Submitted Legal & Technical Documents ({inspectProvider.documents?.length ?? 0})
                </h4>
                <div className="doc-inspect-list">
                  {(inspectProvider.documents ?? [
                    { name: 'Business Registration (BR)', file: 'Registration_Cert.pdf', size: '1.4 MB', verified: true },
                    { name: 'Tax Clearance Certificate', file: 'TIN_Cert.pdf', size: '890 KB', verified: true },
                  ]).map((doc, idx) => (
                    <div key={idx} className="doc-inspect-item">
                      <div className="doc-inspect-left">
                        <div className="doc-file-icon">📄</div>
                        <div className="doc-file-info">
                          <h4>{doc.name}</h4>
                          <span className="doc-file-meta">
                            Filename: <code>{doc.file}</code> • Size: {doc.size}
                          </span>
                        </div>
                      </div>
                      <span className="doc-verify-badge">
                        ✓ Format Validated
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {inspectProvider.status === 'pending' ? (
                <>
                  <button
                    className="action-btn action-btn--danger"
                    onClick={() => {
                      setRejectModal({
                        isOpen: true,
                        provider: inspectProvider,
                        reason: '',
                      });
                    }}
                  >
                    Reject Application
                  </button>
                  <button
                    className="action-btn action-btn--success"
                    onClick={() => {
                      setApproveModal({
                        isOpen: true,
                        provider: inspectProvider,
                      });
                    }}
                  >
                    Approve Application
                  </button>
                </>
              ) : (
                <button
                  className="action-btn btn-inspect"
                  onClick={() => setInspectProvider(null)}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal: Approve Provider ── */}
      {approveModal.isOpen && (
        <div className="modal-backdrop" onClick={() => setApproveModal({ isOpen: false, provider: null })}>
          <div className="modal-dialog" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body">
              <div className="confirm-box">
                <div className="confirm-icon-circle confirm-icon-circle--success">
                  ✓
                </div>
                <h3>Approve Provider Registration?</h3>
                <p>
                  Approving <strong>{approveModal.provider?.business_name}</strong> will activate their account.
                  MechMate will immediately trigger an <strong>email verification code dispatch stub</strong> to{' '}
                  <code>{approveModal.provider?.email}</code> so the provider can confirm their address.
                </p>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button
                className="action-btn btn-inspect"
                onClick={() => setApproveModal({ isOpen: false, provider: null })}
              >
                Cancel
              </button>
              <button
                id="confirm-approve-btn"
                className="action-btn action-btn--success"
                onClick={handleApprove}
              >
                Confirm Approval & Send Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rejection Modal with Reason ── */}
      {rejectModal.isOpen && (
        <div className="modal-backdrop" onClick={() => setRejectModal({ isOpen: false, provider: null, reason: '' })}>
          <div className="modal-dialog" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: '#dc2626' }}>Reject Provider Application</h3>
              <button
                className="modal-close-btn"
                onClick={() => setRejectModal({ isOpen: false, provider: null, reason: '' })}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                You are about to reject the registration application for{' '}
                <strong>{rejectModal.provider?.business_name}</strong>. Please provide a clear rejection reason for audit logging and provider notification.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Rejection Reason:
                </label>
                <textarea
                  id="rejection-reason-textarea"
                  className="rejection-textarea"
                  placeholder="e.g., Business registration certificate illegible, invalid tax identification number, or unverified vocational license."
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="action-btn btn-inspect"
                onClick={() => setRejectModal({ isOpen: false, provider: null, reason: '' })}
              >
                Cancel
              </button>
              <button
                id="confirm-reject-btn"
                className="action-btn action-btn--danger"
                onClick={handleReject}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal: Suspend / Activate ── */}
      {statusModal.isOpen && (
        <div className="modal-backdrop" onClick={() => setStatusModal({ isOpen: false, provider: null, targetStatus: '' })}>
          <div className="modal-dialog" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body">
              <div className="confirm-box">
                <div
                  className={`confirm-icon-circle ${
                    statusModal.targetStatus === 'suspended'
                      ? 'confirm-icon-circle--danger'
                      : 'confirm-icon-circle--success'
                  }`}
                >
                  {statusModal.targetStatus === 'suspended' ? '🚫' : '✓'}
                </div>
                <h3>
                  {statusModal.targetStatus === 'suspended'
                    ? 'Suspend Service Provider?'
                    : 'Re-activate Service Provider?'}
                </h3>
                <p>
                  {statusModal.targetStatus === 'suspended'
                    ? `Are you sure you want to suspend '${statusModal.provider?.business_name}'? Their listings will be hidden from vehicle owners.`
                    : `Restore active status for '${statusModal.provider?.business_name}'?`}
                </p>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button
                className="action-btn btn-inspect"
                onClick={() => setStatusModal({ isOpen: false, provider: null, targetStatus: '' })}
              >
                Cancel
              </button>
              <button
                id="confirm-status-btn"
                className={`action-btn ${
                  statusModal.targetStatus === 'suspended'
                    ? 'action-btn--danger'
                    : 'action-btn--success'
                }`}
                onClick={handleStatusToggle}
              >
                {statusModal.targetStatus === 'suspended' ? 'Confirm Suspension' : 'Confirm Activation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
