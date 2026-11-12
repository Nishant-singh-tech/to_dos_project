import { useState } from 'react';
import { useTasks } from './store.jsx';
import { isOverdue, formatDue } from './helpers.js';
import TaskForm from './TaskForm.jsx';

const REPEAT = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };

export default function TaskItem({ task, draggable, dragging, over, onDragStart, onDragEnter, onDrop, onDragEnd }) {
  const { update, remove } = useTasks();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="task editing">
        <TaskForm initial={task} idPrefix={`e-${task.id}`} submitLabel="Save"
          onCancel={() => setEditing(false)}
          onSubmit={async (data) => { await update(task.id, data); setEditing(false); }} />
      </li>
    );
  }

  const overdue = isOverdue(task);
  return (
    <li className={`task p-${task.priority} ${task.done ? 'done' : ''} ${dragging ? 'dragging' : ''} ${over ? 'over' : ''}`}
      draggable={draggable}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(task.id); }}
      onDragOver={(e) => { if (draggable) { e.preventDefault(); onDragEnter(task.id); } }}
      onDrop={(e) => { e.preventDefault(); onDrop(task.id); }}
      onDragEnd={onDragEnd}>
      {draggable && <span className="grip" aria-hidden="true" title="Drag to reorder">⠿</span>}
      <input type="checkbox" checked={task.done} onChange={() => update(task.id, { done: !task.done })}
        aria-label={`Mark "${task.title}" ${task.done ? 'active' : 'done'}`} />
      <div className="body">
        <span className="title">{task.title}</span>
        {task.notes && <span className="notes">{task.notes}</span>}
        <span className="meta">
          <b className="pri">{task.priority}</b>
          {task.due && <span className={overdue ? 'overdue' : ''}>{overdue ? 'Overdue: ' : 'Due '}{formatDue(task.due)}</span>}
          {task.recurrence !== 'none' && <span>Repeats {REPEAT[task.recurrence].toLowerCase()}</span>}
          {task.tags.map((t) => <span key={t} className="tag">#{t}</span>)}
        </span>
      </div>
      <button className="ghost" onClick={() => setEditing(true)}>Edit</button>
      <button className="ghost danger" onClick={() => remove(task.id)}>Delete</button>
    </li>
  );
}
