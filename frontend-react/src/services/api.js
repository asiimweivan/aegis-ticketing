const API_BASE = 'http://localhost:8001/api/v1';

const getToken = () => localStorage.getItem('access_token');

export const apiFetch = async (endpoint, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = '/login';
    return null;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
};

export const auth = {
  login: (email, password) => apiFetch('/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password })
  }),
  me: () => apiFetch('/auth/me'),
  register: (data) => apiFetch('/auth/register', {
    method: 'POST', body: JSON.stringify(data)
  }),
  // ── Forgot password / reset flow (2-step OTP verification) ──
  forgotPassword: (email) => apiFetch('/auth/forgot-password', {
    method: 'POST', body: JSON.stringify({ email })
  }),
  verifyResetOTP: (email, code) => apiFetch('/auth/verify-otp', {
    method: 'POST', body: JSON.stringify({ email, code })
  }),
  resetPassword: (email, code, new_password) => apiFetch('/auth/reset-password', {
    method: 'POST', body: JSON.stringify({ email, code, new_password })
  }),
};

export const tickets = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/tickets?${q}`);
  },
  get: (id) => apiFetch(`/tickets/${id}`),
  create: (data) => apiFetch('/tickets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  reclassify: (id) => apiFetch(`/tickets/${id}/reclassify`, { method: 'POST' }),
  comments: (id) => apiFetch(`/tickets/${id}/comments`),
  addComment: (id, data) => apiFetch(`/tickets/${id}/comments`, {
    method: 'POST', body: JSON.stringify(data)
  }),
  audit: (id) => apiFetch(`/tickets/${id}/audit`),
};

export const users = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/users?${q}`);
  },
  create: (data) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deactivate: (id) => apiFetch(`/users/${id}`, { method: 'DELETE' }),
};

export const notifications = {
  // NOTE: trailing slash added before the query string — the backend route is
  // registered as /notifications/, so calling it without the slash triggered
  // a 307 redirect on every poll (and risked the Authorization header being
  // dropped on some clients during that redirect).
  list: (unreadOnly = false) => apiFetch(`/notifications/?unread_only=${unreadOnly}`),
  unreadCount: () => apiFetch('/notifications/unread-count'),
  markRead: (id) => apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiFetch('/notifications/mark-all-read', { method: 'POST' }),
  delete: (id) => apiFetch(`/notifications/${id}`, { method: 'DELETE' }),
};

export const analytics = {
  dashboard: () => apiFetch('/analytics/dashboard'),
  myStats: () => apiFetch('/analytics/my-stats'),
  retrainML: () => apiFetch('/analytics/retrain-ml', { method: 'POST' }),
};

export const helpers = {
  statusBadge: (status) => {
    const map = {
      open: { color: '#00C9A7', bg: 'rgba(0,201,167,0.12)', label: 'Open' },
      in_progress: { color: '#6366F1', bg: 'rgba(99,102,241,0.12)', label: 'In Progress' },
      pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Pending' },
      resolved: { color: '#22C55E', bg: 'rgba(34,197,94,0.12)', label: 'Resolved' },
      closed: { color: '#8B9BB4', bg: 'rgba(139,155,180,0.12)', label: 'Closed' },
    };
    return map[status] || map.open;
  },
  priorityBadge: (priority) => {
    const map = {
      low: { color: '#8B9BB4', bg: 'rgba(139,155,180,0.12)', label: 'Low' },
      medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Medium' },
      high: { color: '#F97316', bg: 'rgba(249,115,22,0.12)', label: 'High' },
      critical: { color: '#F43F5E', bg: 'rgba(244,63,94,0.12)', label: 'Critical' },
    };
    return map[priority] || map.medium;
  },
  categoryLabel: (cat) => {
    const map = {
      technical: '💻 Technical',
      administrative: '📋 Administrative',
      billing: '💳 Billing',
      infrastructure: '🏗️ Infrastructure',
      hr: '👥 HR',
      security: '🔒 Security',
      general: '📌 General',
    };
    return map[cat] || cat;
  },
  timeAgo: (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  },
  formatDate: (dateStr) => new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }),
};