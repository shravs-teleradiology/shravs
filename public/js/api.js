// js/api.js
const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("token") || "";
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function clearToken() {
  localStorage.removeItem("token");
}

async function request(path, { method = "GET", body = null } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ---------- Auth ----------
export async function authLogin(email, password) {
  const data = await request("/auth-login", { method: "POST", body: { email, password } });
  if (!data.access_token) throw new Error("No token returned");
  setToken(data.access_token);
  return data;
}

export async function authMe() {
  const data = await request("/auth-me");
  return data.profile;
}

export function logout() {
  clearToken();
  window.location.href = "login.html";
}

// ---------- Admin: create employee, set role ----------
export async function adminCreateEmployee({ name, email, password, organization }) {
  return request("/admin-create-employee", {
    method: "POST",
    body: { name, email, password, organization },
  });
}

export async function adminSetRole({ user_id, role }) {
  return request("/admin-set-role", {
    method: "PATCH",
    body: { user_id, role },
  });
}

// ---------- DM room ----------
export async function dmRoom(peer_id) {
  const data = await request("/dm-room", { method: "POST", body: { peer_id } });
  return data.room;
}

// ---------- Tasks ----------
export async function tasksList() {
  const data = await request("/tasks");
  return data.tasks || [];
}

export async function tasksAssign({ title, description, priority, due_date, assigned_to }) {
  const data = await request("/tasks", {
    method: "POST",
    body: { title, description, priority, due_date, assigned_to },
  });
  return data.task;
}

export async function tasksSetStatus({ id, status }) {
  const data = await request("/tasks", { method: "PATCH", body: { id, status } });
  return data.task;
}

// ---------- Messages ----------
export async function messagesList({ room_type = "common", dm_room_id = null, limit = 50 }) {
  const params = new URLSearchParams({ room_type, limit: String(limit) });
  if (dm_room_id) params.set("dm_room_id", dm_room_id);
  const data = await request(`/messages?${params.toString()}`);
  return data.messages || [];
}

export async function messagesSend({ room_type, dm_room_id = null, text = "", attachment_url = null }) {
  const data = await request("/messages", {
    method: "POST",
    body: { room_type, dm_room_id, text, attachment_url },
  });
  return data.message;
}
