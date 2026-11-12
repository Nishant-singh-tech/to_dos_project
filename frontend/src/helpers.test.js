import test from 'node:test';
import assert from 'node:assert';
import { getVisibleTasks, getStats, getWeekActivity, isOverdue } from './helpers.js';

const mk = (o) => ({ id: o.id, title: 'x', notes: '', priority: 'Medium', due: '', tags: [], done: false,
  completedAt: null, order: 0, createdAt: '2026-01-01T00:00:00Z', ...o });

const tasks = [
  mk({ id: 'a', title: 'Buy milk', priority: 'Low', due: '2026-02-01', order: 2, tags: ['home'] }),
  mk({ id: 'b', title: 'Write report', priority: 'High', due: '2026-01-10', order: 1 }),
  mk({ id: 'c', title: 'Gym', done: true, completedAt: '2026-01-20T10:00:00', order: 3 }),
];
const view = (o) => ({ filter: 'all', sort: 'manual', tag: '', ...o });

test('filters by status, tag and search', () => {
  assert.deepStrictEqual(getVisibleTasks(tasks, view({ filter: 'active' }), '').map((t) => t.id), ['b', 'a']);
  assert.deepStrictEqual(getVisibleTasks(tasks, view({ filter: 'completed' }), '').map((t) => t.id), ['c']);
  assert.deepStrictEqual(getVisibleTasks(tasks, view({ tag: 'home' }), '').map((t) => t.id), ['a']);
  assert.deepStrictEqual(getVisibleTasks(tasks, view(), 'report').map((t) => t.id), ['b']);
});

test('sorts by priority and due date, and never mutates the input', () => {
  const before = tasks.map((t) => t.id).join();
  assert.strictEqual(getVisibleTasks(tasks, view({ sort: 'priority' }), '')[0].id, 'b');
  assert.strictEqual(getVisibleTasks(tasks, view({ sort: 'due' }), '')[0].id, 'b');
  assert.strictEqual(tasks.map((t) => t.id).join(), before);
});

test('overdue and stats', () => {
  assert.strictEqual(isOverdue(tasks[1], '2026-01-15'), true);
  assert.strictEqual(isOverdue(tasks[2], '2026-01-15'), false);
  const s = getStats(tasks, '2026-01-15');
  assert.deepStrictEqual([s.total, s.done, s.overdue, s.pct], [3, 1, 1, 33]);
});

test('week activity counts completions per day', () => {
  const week = getWeekActivity(tasks, new Date(2026, 0, 22));
  assert.strictEqual(week.length, 7);
  assert.strictEqual(week.find((d) => d.key === '2026-01-20').count, 1);
});
