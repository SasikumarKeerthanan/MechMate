import React, { useEffect, useState, useMemo } from 'react';
import { usersApi } from '../../api/services';
import './AdminPages.css';

const DEFAULT_USERS = [
  {
    id: 1,
    name: 'Ashan Perera',
    email: 'ashan.perera@example.com',
    phone: '+94 77 123 4567',
    role: 'vehicle_owner',
    status: 'active',
    city: 'Colombo',
    address: 'No 45/2, Galle Road, Colombo 03',
    vehicles_count: 2,
    total_bookings: 14,
    last_active: '2026-09-28 16:45',
    created_at: '2024-01-10',
    vehicles: [
      { make: 'Toyota', model: 'Corolla Axio', year: 2018, plate: 'WP-CAB-4819' },
      { make: 'Honda', model: 'Vezel', year: 2016, plate: 'WP-CAD-8120' },
    ],
  },
  {
    id: 2,
    name: 'Nimal Silva',
    email: 'nimal.silva@example.com',
    phone: '+94 77 987 6543',
    role: 'vehicle_owner',
    status: 'active',
    city: 'Kandy',
    address: '12 Peradeniya Road, Kandy',
    vehicles_count: 1,
    total_bookings: 8,
    last_active: '2026-09-27 11:20',
    created_at: '2024-02-15',
    vehicles: [
      { make: 'Nissan', model: 'X-Trail Hybrid', year: 2017, plate: 'CP-KX-5022' },
    ],
  },
  {
    id: 3,
    name: 'Kumari Fernando',
    email: 'kumari.fernando@example.com',
    phone: '+94 76 111 2233',
    role: 'vehicle_owner',
    status: 'inactive',
    city: 'Galle',
    address: '88 Main Street, Galle Fort',
    vehicles_count: 1,
    total_bookings: 3,
    last_active: '2026-08-14 09:10',
    created_at: '2024-03-08',
    vehicles: [
      { make: 'Suzuki', model: 'Wagon R Stingray', year: 2019, plate: 'SP-CAE-3199' },
    ],
  },
  {
    id: 4,
    name: 'Rohan Mendis',
    email: 'rohan.mendis@example.com',
    phone: '+94 75 444 5566',
    role: 'vehicle_owner',
    status: 'blocked',
    city: 'Negombo',
    address: '210 Sea Street, Negombo',
    vehicles_count: 2,
    total_bookings: 22,
    last_active: '2026-09-20 18:30',
    created_at: '2024-04-22',
    vehicles: [
      { make: 'Mitsubishi', model: 'Montero Sport', year: 2020, plate: 'WP-CBD-1002' },
      { make: 'Toyota', model: 'Prius', year: 2015, plate: 'WP-CAC-6204' },
    ],
  },
  {
    id: 5,
    name: 'Priya Karunarathna',
    email: 'priya.k@example.com',
    phone: '+94 77 777 8899',
    role: 'vehicle_owner',
    status: 'active',
    city: 'Gampaha',
    address: '15 Yakkala Road, Gampaha',
    vehicles_count: 1,
    total_bookings: 6,
    last_active: '2026-09-28 20:15',
    created_at: '2024-05-30',
    vehicles: [
      { make: 'Hyundai', model: 'Tucson', year: 2021, plate: 'WP-CBE-7890' },
    ],
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('vehicle_owner');
  
  // Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', user: null });
  
  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await usersApi.getAll({
        role: roleFilter,
        status: statusFilter,
        search,
      });
      if (data?.users) {
        setUsers(data.users);
      } else {
        setUsers(DEFAULT_USERS);
      }
    } catch {
      setUsers(DEFAULT_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  // Status updates
  const handleUpdateStatus = async (user, newStatus) => {
    try {
      const res = await usersApi.updateStatus(user.id, newStatus);
      showToast(res.data?.message || `User status changed to ${newStatus}.`, 'success');
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) => ({ ...prev, status: newStatus }));
      }
    } catch {
      // Local fallback
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
      showToast(`User status set to ${newStatus}.`, 'success');
    } finally {
      setConfirmModal({ isOpen: false, type: '', user: null });
    }
  };

  // Deletion
  const handleDeleteUser = async (userId) => {
    try {
      const res = await usersApi.delete(userId);
      showToast(res.data?.message || 'User permanently deleted.', 'info');
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
    } catch {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast('User record removed.', 'info');
    } finally {
      setConfirmModal({ isOpen: false, type: '', user: null });
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        search === '' ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search) ||
        u.city?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, search, statusFilter, roleFilter]);

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
        <h2 className="page-heading">Vehicle Owner & User Management</h2>
        <p className="page-desc">
          Monitor registered vehicle owners, inspect car profiles, toggle access states, or delete accounts.
        </p>
      </div>

      {/* ── Filters & Search Toolbar ── */}
      <div className="table-toolbar" style={{ justifyContent: 'space-between' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            id="user-search"
            type="search"
            className="search-input"
            placeholder="Search by name, email, phone, city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="action-btn action-btn--primary">Search</button>
        </form>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Role:</span>
          <select
            id="role-filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#334155',
              background: '#fff',
            }}
          >
            <option value="vehicle_owner">Vehicle Owners</option>
            <option value="all">All Roles</option>
          </select>

          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginLeft: '8px' }}>Status:</span>
          {['all', 'active', 'blocked', 'inactive', 'pending'].map((st) => (
            <button
              key={st}
              id={`filter-status-${st}`}
              className={`filter-btn ${statusFilter === st ? 'filter-btn--active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Users Data Table ── */}
      <div className="table-card" id="users-table">
        {loading ? (
          <div className="loading-row">Loading user records…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th># ID</th>
                <th>Owner Name</th>
                <th>Contact Information</th>
                <th>Role</th>
                <th>City</th>
                <th>Vehicles</th>
                <th>Account Status</th>
                <th>Registered</th>
                <th>Management Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isBlocked = u.status === 'blocked';
                const isActive = u.status === 'active';
                const isPending = u.status === 'pending';

                return (
                  <tr key={u.id} className={isBlocked ? 'row-flagged' : ''}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#64748b' }}>
                        #{u.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: isBlocked ? '#fee2e2' : '#e0e7ff',
                            color: isBlocked ? '#dc2626' : '#4338ca',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          {u.name?.charAt(0)?.toUpperCase() ?? 'U'}
                        </div>
                        <div>
                          <div className="fw-medium">{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {u.total_bookings ?? 0} service bookings
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', color: '#1e293b' }}>{u.email}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.phone}</div>
                    </td>
                    <td>
                      <span className="badge badge--role">
                        {u.role === 'vehicle_owner' ? 'Vehicle Owner' : u.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{u.city || '—'}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        🚗 {u.vehicles_count ?? u.vehicles?.length ?? 1}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge--${u.status}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {u.created_at || u.createdAt}
                    </td>
                    <td>
                      <div className="action-cell">
                        {/* View Details */}
                        <button
                          id={`view-user-${u.id}`}
                          className="action-btn btn-inspect"
                          onClick={() => setSelectedUser(u)}
                          title="View user credentials and vehicles"
                        >
                          View Details
                        </button>

                        {/* Block / Unblock Toggle */}
                        {isBlocked ? (
                          <button
                            id={`unblock-user-${u.id}`}
                            className="action-btn action-btn--success"
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                type: 'unblock',
                                user: u,
                              })
                            }
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            id={`block-user-${u.id}`}
                            className="action-btn action-btn--danger"
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                type: 'block',
                                user: u,
                              })
                            }
                          >
                            Block
                          </button>
                        )}

                        {/* Deactivate / Activate Toggle */}
                        {isActive ? (
                          <button
                            id={`deactivate-user-${u.id}`}
                            className="action-btn"
                            style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                type: 'deactivate',
                                user: u,
                              })
                            }
                          >
                            Deactivate
                          </button>
                        ) : !isBlocked && (
                          <button
                            id={`activate-user-${u.id}`}
                            className="action-btn action-btn--success"
                            onClick={() => handleUpdateStatus(u, 'active')}
                          >
                            Activate
                          </button>
                        )}

                        {/* Delete Account */}
                        <button
                          id={`delete-user-${u.id}`}
                          className="action-btn"
                          style={{ background: 'transparent', color: '#ef4444', border: '1px solid #fecaca' }}
                          onClick={() =>
                            setConfirmModal({
                              isOpen: true,
                              type: 'delete',
                              user: u,
                            })
                          }
                          title="Permanently remove user"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={9} className="empty-row">
                    No vehicle owner accounts matched the given search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── User Detail View Modal ── */}
      {selectedUser && (
        <div className="modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-title">Vehicle Owner Profile</h3>
                <span className={`badge badge--${selectedUser.status}`}>
                  {selectedUser.status}
                </span>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedUser(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Header profile */}
              <div className="user-avatar-header">
                <div className="user-avatar-large">
                  {selectedUser.name?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
                <div className="user-header-text">
                  <h3>{selectedUser.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {selectedUser.email} • {selectedUser.phone}
                  </span>
                </div>
              </div>

              {/* Personal Info Grid */}
              <div className="modal-info-grid">
                <div className="modal-info-field">
                  <span className="modal-info-label">Account Role</span>
                  <span className="modal-info-value" style={{ textTransform: 'capitalize' }}>
                    {selectedUser.role?.replace('_', ' ')}
                  </span>
                </div>
                <div className="modal-info-field">
                  <span className="modal-info-label">City / Region</span>
                  <span className="modal-info-value">{selectedUser.city || 'Colombo'}</span>
                </div>
                <div className="modal-info-field">
                  <span className="modal-info-label">Registered Date</span>
                  <span className="modal-info-value">
                    {selectedUser.created_at || selectedUser.createdAt}
                  </span>
                </div>
                <div className="modal-info-field">
                  <span className="modal-info-label">Last Active</span>
                  <span className="modal-info-value">{selectedUser.last_active || 'Recent'}</span>
                </div>
                <div className="modal-info-field">
                  <span className="modal-info-label">Completed Bookings</span>
                  <span className="modal-info-value">{selectedUser.total_bookings ?? 0}</span>
                </div>
                <div className="modal-info-field">
                  <span className="modal-info-label">Residential Address</span>
                  <span className="modal-info-value">{selectedUser.address || 'Not provided'}</span>
                </div>
              </div>

              {/* Registered Vehicles */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                  Registered Vehicles ({selectedUser.vehicles?.length ?? 1})
                </h4>
                <div className="vehicle-list">
                  {(selectedUser.vehicles ?? [
                    { make: 'Toyota', model: 'Corolla', year: 2018, plate: 'WP-CAB-4819' },
                  ]).map((v, i) => (
                    <div key={i} className="vehicle-card">
                      <div>
                        <strong>{v.make} {v.model}</strong> ({v.year})
                      </div>
                      <span className="vehicle-plate">{v.plate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedUser.status === 'blocked' ? (
                <button
                  className="action-btn action-btn--success"
                  onClick={() => handleUpdateStatus(selectedUser, 'active')}
                >
                  Unblock Account
                </button>
              ) : (
                <button
                  className="action-btn action-btn--danger"
                  onClick={() => handleUpdateStatus(selectedUser, 'blocked')}
                >
                  Block Account
                </button>
              )}
              <button
                className="action-btn btn-inspect"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal (Block / Unblock / Deactivate / Delete) ── */}
      {confirmModal.isOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setConfirmModal({ isOpen: false, type: '', user: null })}
        >
          <div className="modal-dialog" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body">
              <div className="confirm-box">
                <div
                  className={`confirm-icon-circle ${
                    confirmModal.type === 'delete' || confirmModal.type === 'block'
                      ? 'confirm-icon-circle--danger'
                      : confirmModal.type === 'unblock'
                      ? 'confirm-icon-circle--success'
                      : 'confirm-icon-circle--warning'
                  }`}
                >
                  {confirmModal.type === 'delete'
                    ? '🗑️'
                    : confirmModal.type === 'block'
                    ? '🚫'
                    : confirmModal.type === 'unblock'
                    ? '✓'
                    : '⏸️'}
                </div>

                <h3>
                  {confirmModal.type === 'delete' && 'Delete User Account?'}
                  {confirmModal.type === 'block' && 'Block User Account?'}
                  {confirmModal.type === 'unblock' && 'Unblock User Account?'}
                  {confirmModal.type === 'deactivate' && 'Deactivate User Account?'}
                </h3>

                <p>
                  {confirmModal.type === 'delete' &&
                    `Are you sure you want to permanently delete '${confirmModal.user?.name}'? This action cannot be undone.`}
                  {confirmModal.type === 'block' &&
                    `Are you sure you want to block '${confirmModal.user?.name}'? They will be immediately prevented from booking services or accessing the platform.`}
                  {confirmModal.type === 'unblock' &&
                    `Restore full access for '${confirmModal.user?.name}'?`}
                  {confirmModal.type === 'deactivate' &&
                    `Temporarily deactivate '${confirmModal.user?.name}'?`}
                </p>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button
                className="action-btn btn-inspect"
                onClick={() => setConfirmModal({ isOpen: false, type: '', user: null })}
              >
                Cancel
              </button>

              {confirmModal.type === 'delete' && (
                <button
                  id="confirm-delete-btn"
                  className="action-btn action-btn--danger"
                  onClick={() => handleDeleteUser(confirmModal.user.id)}
                >
                  Delete Account
                </button>
              )}

              {confirmModal.type === 'block' && (
                <button
                  id="confirm-block-btn"
                  className="action-btn action-btn--danger"
                  onClick={() => handleUpdateStatus(confirmModal.user, 'blocked')}
                >
                  Confirm Block
                </button>
              )}

              {confirmModal.type === 'unblock' && (
                <button
                  id="confirm-unblock-btn"
                  className="action-btn action-btn--success"
                  onClick={() => handleUpdateStatus(confirmModal.user, 'active')}
                >
                  Confirm Unblock
                </button>
              )}

              {confirmModal.type === 'deactivate' && (
                <button
                  id="confirm-deactivate-btn"
                  className="action-btn action-btn--danger"
                  onClick={() => handleUpdateStatus(confirmModal.user, 'inactive')}
                >
                  Confirm Deactivate
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
