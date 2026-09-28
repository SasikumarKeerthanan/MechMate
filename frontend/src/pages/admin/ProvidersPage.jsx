import React, { useEffect, useState } from 'react';
import { providersApi } from '../../api/services';
import './AdminPages.css';

const MOCK_PROVIDERS = [
  { id: 1, name: 'AutoFix Lanka',    email: 'autofix@lk.com',   status: 'pending',  specialty: 'Engine Repair',    createdAt: '2024-06-01' },
  { id: 2, name: 'SpeedServe Co.',   email: 'speed@srv.com',    status: 'approved', specialty: 'Tire & Wheel',     createdAt: '2024-05-14' },
  { id: 3, name: 'FastWrench Ltd.',  email: 'fw@ltd.com',       status: 'rejected', specialty: 'Brake Service',    createdAt: '2024-04-20' },
];

const STATUS_COLOR = { pending: 'warning', approved: 'success', rejected: 'danger' };

export default function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    providersApi
      .getAll()
      .then(({ data }) => setProviders(data.providers ?? MOCK_PROVIDERS))
      .catch(() => setProviders(MOCK_PROVIDERS))
      .finally(() => setLoading(false));
  }, []);

  const filteredProviders = filter === 'all'
    ? providers
    : providers.filter((p) => p.status === filter);

  const handleApprove = async (id) => {
    try { await providersApi.approve(id); } catch { /* stub */ }
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'approved' } : p)),
    );
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Rejection reason (optional):') ?? '';
    try { await providersApi.reject(id, reason); } catch { /* stub */ }
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'rejected' } : p)),
    );
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2 className="page-heading">Provider Management</h2>
        <p className="page-desc">Approve or reject service provider applications.</p>
      </div>

      <div className="table-toolbar">
        {['all', 'pending', 'approved', 'rejected'].map((f) => (
          <button
            key={f}
            id={`filter-providers-${f}`}
            className={`filter-btn ${filter === f ? 'filter-btn--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="table-card" id="providers-table">
        {loading ? (
          <div className="loading-row">Loading providers…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Provider</th>
                <th>Email</th>
                <th>Specialty</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td className="fw-medium">{p.name}</td>
                  <td className="text-muted">{p.email}</td>
                  <td>{p.specialty}</td>
                  <td>
                    <span className={`badge badge--${STATUS_COLOR[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="text-muted">{p.createdAt}</td>
                  <td className="action-cell">
                    {p.status === 'pending' && (
                      <>
                        <button
                          id={`approve-provider-${p.id}`}
                          className="action-btn action-btn--success"
                          onClick={() => handleApprove(p.id)}
                        >
                          Approve
                        </button>
                        <button
                          id={`reject-provider-${p.id}`}
                          className="action-btn action-btn--danger"
                          onClick={() => handleReject(p.id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {p.status !== 'pending' && (
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredProviders.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-row">No providers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
