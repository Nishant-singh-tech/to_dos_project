const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

function step(date, recurrence) {
  const [y, m, d] = date.split('-').map(Number);
  if (recurrence === 'daily') return iso(new Date(Date.UTC(y, m - 1, d + 1)));
  if (recurrence === 'weekly') return iso(new Date(Date.UTC(y, m - 1, d + 7)));
  // monthly: keep the day, clamped to the last day of the next month (Jan 31 -> Feb 28)
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return iso(new Date(Date.UTC(y, m, Math.min(d, lastDay))));
}

// Next due date after completing a recurring task. Skips dates already in the past.
function nextDue(due, recurrence, today = iso(new Date())) {
  let next = step(due || today, recurrence);
  for (let i = 0; next < today && i < 400; i++) next = step(next, recurrence);
  return next;
}

module.exports = { nextDue };
