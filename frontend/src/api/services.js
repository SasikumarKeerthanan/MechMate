import api from './axios';

// ── Auth / Password Reset ─────────────────────────────────────────────────────
export const authApi = {
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
  forgotPassword: (emailOrData) => {
    const payload = typeof emailOrData === 'string' ? { email: emailOrData } : emailOrData;
    return api.post('/auth/forgot-password', payload);
  },
  verifyCode: (data) => api.post('/auth/verify-code', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get('/admin/dashboard-stats'),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  deactivate: (id) => api.patch(`/admin/users/${id}/deactivate`),
  activate: (id) => api.patch(`/admin/users/${id}/activate`),
};

// ── Providers ─────────────────────────────────────────────────────────────────
export const providersApi = {
  getAll: (params) => api.get('/admin/providers', { params }),
  getPending: () => api.get('/admin/providers/pending'),
  approve: (id) => api.post(`/admin/providers/${id}/approve`),
  reject: (id, reason) => api.post(`/admin/providers/${id}/reject`, { reason }),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () => api.get('/admin/categories'),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
};

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportsApi = {
  getSummary: (params) => api.get('/admin/reports', { params }),
};

// ── Reviews / Moderation ─────────────────────────────────────────────────────
export const reviewsApi = {
  getFlagged: () => api.get('/admin/reviews/flagged'),
  approve: (id) => api.patch(`/admin/reviews/${id}/approve`),
  remove: (id) => api.delete(`/admin/reviews/${id}`),
};

// ── Monitoring ────────────────────────────────────────────────────────────────
export const monitoringApi = {
  getLive: () => api.get('/admin/monitoring'),
};
