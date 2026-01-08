// public/js/api.js - Replace ALL your localStorage calls with this
const API_BASE = '/api'; // Netlify proxies to functions

async function api(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options
  };
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Network error' }));
    throw error;
  }
  return res.json();
}

// ========= AUTH =========
export async function login(email, password) {
  const data = await api('/auth-login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

export async function getMe() {
  const data = await api('/auth-me');
  return data.profile;
}

// ========= EMPLOYEES (Admin) =========
export async function createEmployee({ name, email, password, organization }) {
  const data = await api('/admin-create-employee', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, organization })
  });
  return data;
}

export async function setRole(user_id, role) {
  const data = await api('/admin-set-role', {
    method: 'PATCH',
    body: JSON.stringify({ user_id, role })
  });
  return data;
}

// ========= DM =========
export async function createDmRoom(peer_id) {
  const data = await api('/dm-room', {
    method: 'POST',
    body: JSON.stringify({ peer_id })
  });
  return data.room;
}

// ========= TASKS =========
export async function getTasks() {
  const data = await api('/tasks');
  return data.tasks;
}

export async function toggleTaskStatus(task_id, status) {
  const data = await api('/tasks', {
    method: 'PATCH',
    body: JSON.stringify({ id: task_id, status })
  });
  return data.task;
}

export async function assignTask(taskData) {
  const data = await api('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  });
  return data.task;
}

// ========= MESSAGES =========
export async function getMessages({ room_type = 'common', dm_room_id = null, limit = 50 }) {
  const params = new URLSearchParams({ room_type });
  if (dm_room_id) params.append('dm_room_id', dm_room_id);
  if (limit) params.append('limit', limit);
  const data = await api(`/messages?${params}`);
  return data.messages;
}

export async function sendMessage({ room_type, dm_room_id = null, text }) {
  const data = await api('/messages', {
    method: 'POST',
    body: JSON.stringify({ room_type, dm_room_id, text })
  });
  return data.message;
}
