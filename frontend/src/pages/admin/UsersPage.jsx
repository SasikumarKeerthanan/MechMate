import React, { useEffect, useState } from 'react';
import { usersApi } from '../../api/services';
import './AdminPages.css';

const MOCK_USERS = [
  { id: 1, name: 'Ashan Perera',    email: 'ashan@email.com',   status: 'active',   createdAt: '2024-01-10' },
  { id: 2, name: 'Nimal Silva',     email: 'nimal@email.com',   status: 'active',   createdAt: '2024-02-15' },
  { id: 3, name: 'Kumari Fernando', email: 'kumari@email.com',  status: 'inactive', createdAt: '2024-03-08' },
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    usersApi
      .getAll()
      .then(({ data }) => setUsers(data.users ?? MOCK_USERS))
      .catch(() => setUsers(MOCK_USERS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleStatus = async (user) => {
    const action = user.status === 'active' ? usersApi.deactivate : usersApi.activate;
    try {
      await action(user.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
            : u,
        ),
      );
    } catch {
      // In stub mode, toggle locally anyway
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
            : u,
        ),
      );
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2 className="page-heading">User Management</h2>
        <p className="page-desc">View and manage all registered users.</p>
      </div>

      <div className="table-toolbar">
        <input
          id="user-search"
          type="search"
          className="search-input"
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-card" id="users-table">
        {loading ? (
          <div className="loading-row">Loading users…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td className="fw-medium">{user.name}</td>
                  <td className="text-muted">{user.email}</td>
                  <td>
                    <span className={`badge badge--${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="text-muted">{user.createdAt}</td>
                  <td>
                    <button
                      id={`toggle-user-${user.id}`}
                      className={`action-btn ${user.status === 'active' ? 'action-btn--danger' : 'action-btn--success'}`}
                      onClick={() => toggleStatus(user)}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-row">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
