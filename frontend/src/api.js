// Token lives here so every request can attach it, even before React state settles.
const KEY = 'planner:token';
let token = null;
try { token = localStorage.getItem(KEY); } catch { /* storage blocked */ }

export const session = {
  get: () => token,
  set(t) {
    token = t;
    try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch { /* ignore */ }
  },
  onUnauthorized: () => {},
};

async function req(method, path, body) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) session.onUnauthorized();
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (b) => req('POST', '/auth/register', b),
  login: (b) => req('POST', '/auth/login', b),
  me: () => req('GET', '/auth/me'),
  list: () => req('GET', '/tasks'),
  create: (t) => req('POST', '/tasks', t),
  update: (id, patch) => req('PATCH', `/tasks/${id}`, patch),
  remove: (id) => req('DELETE', `/tasks/${id}`),
  reorder: (ids) => req('PUT', '/tasks/reorder', { ids }),
  clearCompleted: () => req('DELETE', '/tasks/completed'),
  completeAll: () => req('POST', '/tasks/complete-all'),
};
