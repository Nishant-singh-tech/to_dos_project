const test = require('node:test');
const assert = require('node:assert');
const { nextDue } = require('./recurrence');

const T = '2026-01-01';

test('daily and weekly', () => {
  assert.strictEqual(nextDue('2026-01-31', 'daily', T), '2026-02-01');
  assert.strictEqual(nextDue('2026-01-05', 'weekly', T), '2026-01-12');
});

test('monthly clamps to month end and rolls over the year', () => {
  assert.strictEqual(nextDue('2026-01-31', 'monthly', T), '2026-02-28');
  assert.strictEqual(nextDue('2026-12-15', 'monthly', '2026-01-01'), '2027-01-15');
});

test('overdue recurring tasks skip to the next future date', () => {
  assert.strictEqual(nextDue('2026-01-01', 'daily', '2026-01-10'), '2026-01-10');
});

test('no due date starts from today', () => {
  assert.strictEqual(nextDue('', 'daily', '2026-03-10'), '2026-03-11');
});
