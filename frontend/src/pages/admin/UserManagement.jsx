import React, { useState } from 'react';
import { Users, Search, Filter, Shield, MoreVertical, Ban, CheckCircle2 } from 'lucide-react';

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [users, setUsers] = useState([
    { id: 'usr_001', name: 'Alexander Vance', email: 'alex.vance@example.com', role: 'Vehicle Owner', status: 'active', vehicles: 2, lastActive: '10 mins ago' },
    { id: 'usr_002', name: 'Elena Rostova', email: 'elena.r@speedygarage.com', role: 'Service Provider', status: 'active', vehicles: 0, lastActive: '1 hour ago' },
    { id: 'usr_003', name: 'Marcus Holloway', email: 'marcus.h@techmechanic.io', role: 'Service Provider', status: 'pending_verification', vehicles: 0, lastActive: 'Yesterday' },
    { id: 'usr_004', name: 'Chloe Bennett', email: 'c.bennett@example.com', role: 'Vehicle Owner', status: 'suspended', vehicles: 1, lastActive: '5 days ago' },
    { id: 'usr_005', name: 'Darius Miller', email: 'dmiller.auto@gmail.com', role: 'Parts Supplier', status: 'active', vehicles: 0, lastActive: '3 hours ago' },
  ]);

  const toggleStatus = (id) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'active' ? 'suspended' : 'active' };
      }
      return u;
    }));
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role.toLowerCase().includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control vehicle owners, certified mechanics, and supplier accounts.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by full name or email address..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Roles</option>
            <option value="owner">Vehicle Owner</option>
            <option value="provider">Service Provider</option>
            <option value="supplier">Parts Supplier</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Activity</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">{user.name}</span>
                      <span className="text-xs text-slate-400">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                      <Shield className="w-3 h-3 text-brand-500" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        user.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20'
                          : user.status === 'suspended'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {user.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {user.lastActive}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleStatus(user.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                        user.status === 'active'
                          ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50'
                          : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50'
                      }`}
                    >
                      {user.status === 'active' ? (
                        <>
                          <Ban className="w-3 h-3" /> Suspend
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Activate
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
