const RANK = { High: 0, Medium: 1, Low: 2 };
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n) => String(n).padStart(2, '0');

// Local date as YYYY-MM-DD (not UTC, so "today" matches the user's calendar).
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => ymd(new Date());

export const isOverdue = (t, now = today()) => !t.done && !!t.due && t.due < now;

export const formatDue = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export const getAllTags = (tasks) => [...new Set(tasks.flatMap((t) => t.tags))].sort();

// Derived state: computed from tasks + view settings, never stored separately.
export function getVisibleTasks(tasks, { filter, sort, tag }, search) {
  const q = search.trim().toLowerCase();
  const list = tasks.filter((t) => {
    if (filter === 'active' && t.done) return false;
    if (filter === 'completed' && !t.done) return false;
    if (tag && !t.tags.includes(tag)) return false;
    return !q || t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q);
  });
  const by = {
    manual: (a, b) => a.order - b.order,
    created: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    priority: (a, b) => RANK[a.priority] - RANK[b.priority],
    due: (a, b) => (a.due || '9999').localeCompare(b.due || '9999'),
  }[sort] || (() => 0);
  return [...list].sort(by);
}

export function getStats(tasks, now = today()) {
  const done = tasks.filter((t) => t.done).length;
  return {
    total: tasks.length,
    done,
    pending: tasks.length - done,
    overdue: tasks.filter((t) => isOverdue(t, now)).length,
    dueToday: tasks.filter((t) => !t.done && t.due === now).length,
    pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
  };
}

// Tasks completed per day for the last 7 days (oldest first).
export function getWeekActivity(tasks, now = new Date()) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
    const key = ymd(d);
    const count = tasks.filter((t) => t.completedAt && ymd(new Date(t.completedAt)) === key).length;
    return { key, label: DAYS[d.getDay()], count };
  });
}
