import { useState } from 'react';

const parseTags = (s) => [...new Set(s.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 5);

// Used for both adding and editing a task.
export default function TaskForm({ initial, submitLabel, onSubmit, onCancel, idPrefix = 'f' }) {
  const [f, setF] = useState({
    title: initial?.title ?? '',
    notes: initial?.notes ?? '',
    priority: initial?.priority ?? 'Medium',
    due: initial?.due ?? '',
    tags: (initial?.tags ?? []).join(', '),
    recurrence: initial?.recurrence ?? 'none',
  });
  const [open, setOpen] = useState(!!initial);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!f.title.trim()) return;
    const ok = await onSubmit({ ...f, title: f.title.trim(), tags: parseTags(f.tags) });
    if (ok !== false && !initial) setF({ ...f, title: '', notes: '', due: '', tags: '', recurrence: 'none' });
  };

  return (
    <form className="tform" onSubmit={submit}>
      <div className="row">
        <input id={`${idPrefix}-title`} className="grow" placeholder="What needs doing?" value={f.title}
          onChange={set('title')} maxLength={200} aria-label="Task title" autoFocus={!!initial} />
        {!initial && <button type="button" className="ghost" onClick={() => setOpen(!open)} aria-expanded={open}>Options</button>}
        <button className="primary" type="submit">{submitLabel}</button>
        {onCancel && <button type="button" className="ghost" onClick={onCancel}>Cancel</button>}
      </div>
      {open && (
        <div className="row opts">
          <label>Priority
            <select value={f.priority} onChange={set('priority')}>
              <option>High</option><option>Medium</option><option>Low</option>
            </select>
          </label>
          <label>Due date<input type="date" value={f.due} onChange={set('due')} /></label>
          <label>Repeats
            <select value={f.recurrence} onChange={set('recurrence')}>
              <option value="none">Never</option><option value="daily">Daily</option>
              <option value="weekly">Weekly</option><option value="monthly">Monthly</option>
            </select>
          </label>
          <label className="grow">Tags (comma separated)
            <input value={f.tags} onChange={set('tags')} placeholder="work, study" />
          </label>
          <label className="full">Notes
            <textarea rows={2} value={f.notes} onChange={set('notes')} maxLength={1000} />
          </label>
        </div>
      )}
    </form>
  );
}
