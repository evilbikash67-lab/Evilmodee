const BASE = '';

export const fetchModels = () =>
  fetch(`${BASE}/api/models`).then(res => res.json()).then(d => d.models);

export const adminLogin = (password) =>
  fetch(`${BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  }).then(res => {
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  });

export const fetchAdminSettings = (token) =>
  fetch(`${BASE}/api/admin/settings`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.json());

export const updateModelConfig = (token, alias, config) =>
  fetch(`${BASE}/api/admin/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ alias, ...config }),
  });

export const toggleMaintenance = (token, enabled) =>
  fetch(`${BASE}/api/admin/maintenance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ enabled }),
  });

export const fetchAnnouncement = () =>
  fetch(`${BASE}/api/admin/announcement`).then(res => res.json());

export const fetchLogs = (token) =>
  fetch(`${BASE}/api/admin/logs`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.json());

export const clearLogs = (token) =>
  fetch(`${BASE}/api/admin/logs`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
