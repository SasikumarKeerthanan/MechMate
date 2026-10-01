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
  updateStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  delete: (id) => api.delete(`/admin/users/${id}`),
  deactivate: (id) => api.patch(`/admin/users/${id}/deactivate`),
  activate: (id) => api.patch(`/admin/users/${id}/activate`),
};

// ── Providers ─────────────────────────────────────────────────────────────────
export const providersApi = {
  getAll: (params) => api.get('/admin/providers', { params }),
  getPending: () => api.get('/admin/providers/pending'),
  getById: (id) => api.get(`/admin/providers/${id}`),
  approve: (id) => api.post(`/admin/providers/${id}/approve`),
  reject: (id, reason) => api.post(`/admin/providers/${id}/reject`, { reason }),
  updateStatus: (id, status) => api.put(`/admin/providers/${id}/status`, { status }),
  getEmailVerificationStatus: () => api.get('/admin/providers/email-verification-status'),
};

// ── Categories (Spare Parts & Services) ───────────────────────────────────────
export const categoriesApi = {
  getAll: () => api.get('/admin/categories'),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),

  // Spare Parts Categories
  getParts: () => api.get('/admin/categories/parts'),
  createPart: (data) => api.post('/admin/categories/parts', data),
  updatePart: (id, data) => api.put(`/admin/categories/parts/${id}`, data),
  deletePart: (id) => api.delete(`/admin/categories/parts/${id}`),

  // Garage Service Categories
  getServices: () => api.get('/admin/categories/services'),
  createService: (data) => api.post('/admin/categories/services', data),
  updateService: (id, data) => api.put(`/admin/categories/services/${id}`, data),
  deleteService: (id) => api.delete(`/admin/categories/services/${id}`),
};

// ── Diagnosis Reference Data & Search History ────────────────────────────────
export const diagnosisApi = {
  getAll: (params) => api.get('/admin/diagnosis-data', { params }),
  create: (data) => api.post('/admin/diagnosis-data', data),
  update: (id, data) => api.put(`/admin/diagnosis-data/${id}`, data),
  delete: (id) => api.delete(`/admin/diagnosis-data/${id}`),
  getHistory: () => api.get('/admin/diagnosis-history'),
};

// ── Reports & System Analytics ────────────────────────────────────────────────
export const reportsApi = {
  getSummary: (params) => api.get('/admin/reports/summary', { params }),
  getExport: (format = 'csv') => api.get('/admin/reports/export', { params: { format } }),
};

// ── Ratings & Reviews Moderation ──────────────────────────────────────────────
export const reviewsApi = {
  getAll: (params) => api.get('/admin/reviews', { params }),
  getFlagged: () => api.get('/admin/reviews/flagged'),
  updateStatus: (id, status) => api.put(`/admin/reviews/${id}/status`, { status }),
  approve: (id) => api.patch(`/admin/reviews/${id}/approve`),
  remove: (id) => api.delete(`/admin/reviews/${id}`),
};

// ── API Usage & System Health Monitoring ──────────────────────────────────────
export const monitoringApi = {
  getLive: () => api.get('/admin/monitoring'),
  getApiLogs: (params) => api.get('/admin/monitoring/api-logs', { params }),
  getAlerts: () => api.get('/admin/monitoring/alerts'),
};

// ── Spare Part Shop Owner ─────────────────────────────────────────────────────
export const shopApi = {
  getProfile: (shopId) => api.get('/shop/profile', { params: shopId ? { shop_id: shopId } : {} }),
  updateProfile: (data, shopId) => api.put('/shop/profile', data, { params: shopId ? { shop_id: shopId } : {} }),
  getParts: (params) => api.get('/shop/parts', { params }),
  addPart: (data, shopId) => api.post('/shop/parts', data, { params: shopId ? { shop_id: shopId } : {} }),
  updatePart: (id, data) => api.put(`/shop/parts/${id}`, data),
  deletePart: (id) => api.delete(`/shop/parts/${id}`),
  getPartHistory: (id) => api.get(`/shop/parts/${id}/history`),
  getInquiries: (params) => api.get('/shop/inquiries', { params }),
  replyInquiry: (id, response) => api.post(`/shop/inquiries/${id}/reply`, { response }),
  getReviews: (params) => api.get('/shop/reviews', { params }),
  getAnalytics: (params) => api.get('/shop/analytics', { params }),
};

// ── Service Centre / Garage Owner ─────────────────────────────────────────────
export const garageApi = {
  getProfile: (garageId) => api.get('/garage/profile', { params: garageId ? { garage_id: garageId } : {} }),
  updateProfile: (data, garageId) => api.put('/garage/profile', data, { params: garageId ? { garage_id: garageId } : {} }),
  getVehicles: (garageId) => api.get('/garage/vehicles', { params: garageId ? { garage_id: garageId } : {} }),
  updateVehicles: (vehicles, garageId) => api.put('/garage/vehicles', { vehicles }, { params: garageId ? { garage_id: garageId } : {} }),
  getServices: (params) => api.get('/garage/services', { params }),
  addService: (data, garageId) => api.post('/garage/services', data, { params: garageId ? { garage_id: garageId } : {} }),
  updateService: (id, data) => api.put(`/garage/services/${id}`, data),
  deleteService: (id) => api.delete(`/garage/services/${id}`),
  getInquiries: (params) => api.get('/garage/inquiries', { params }),
  replyInquiry: (id, reply) => api.post(`/garage/inquiries/${id}/reply`, { reply }),
  getReviews: (params) => api.get('/garage/reviews', { params }),
  getAnalytics: (params) => api.get('/garage/analytics', { params }),
};


