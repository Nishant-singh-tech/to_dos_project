import { getStats, getWeekActivity } from './helpers.js';

export default function Dashboard({ tasks }) {
  const s = getStats(tasks);
  const week = getWeekActivity(tasks);
  const max = Math.max(1, ...week.map((d) => d.count));

  return (
    <section className="dash" aria-label="Progress summary">
      <div>
        <p className="big">{s.done}<span>/{s.total}</span></p>
        <p className="sub">tasks completed ({s.pct}%)</p>
        <div className="bar" role="progressbar" aria-valuenow={s.pct} aria-valuemin="0" aria-valuemax="100">
          <div style={{ width: `${s.pct}%` }} />
        </div>
        <p className="flags">
          {s.overdue > 0 && <b className="overdue">{s.overdue} overdue</b>}
          {s.dueToday > 0 && <b className="today">{s.dueToday} due today</b>}
          {s.overdue === 0 && s.dueToday === 0 && <span className="sub">Nothing urgent right now.</span>}
        </p>
      </div>
      <figure>
        <div className="chart">
          {week.map((d) => (
            <div className="col" key={d.key} title={`${d.count} completed`}>
              <i style={{ height: `${(d.count / max) * 100}%` }} />
              <span>{d.label}</span>
            </div>
          ))}
        </div>
        <figcaption>Completed in the last 7 days</figcaption>
      </figure>
    </section>
  );
}
