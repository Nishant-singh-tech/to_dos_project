import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './auth.jsx';
import { useTasks } from './store.jsx';
import { getVisibleTasks, getAllTags } from './helpers.js';
import Dashboard from './Dashboard.jsx';
import TaskForm from './TaskForm.jsx';
import TaskItem from './TaskItem.jsx';

const FILTERS = ['all', 'active', 'completed'];

function TaskList({ tasks, canReorder }) {
  const { reorder } = useTasks();
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);

  const end = () => { setDragId(null); setOverId(null); };
  const drop = (targetId) => {
    if (dragId && dragId !== targetId) {
      const ids = tasks.map((t) => t.id);
      ids.splice(ids.indexOf(dragId), 1);
      ids.splice(tasks.findIndex((t) => t.id === targetId), 0, dragId);
      reorder(ids);
    }
    end();
  };

  return (
    <ul className="list">
      {tasks.map((t) => (
        <TaskItem key={t.id} task={t} draggable={canReorder}
          dragging={dragId === t.id} over={overId === t.id && dragId !== t.id}
          onDragStart={setDragId} onDragEnter={setOverId} onDrop={drop} onDragEnd={end} />
      ))}
    </ul>
  );
}

export default function Planner({ onToggleTheme }) {
  const { user, logout } = useAuth();
  const { tasks, loading, view, search, add, setFilter, setSort, setTag, setSearch, clearCompleted, completeAll } = useTasks();

  // Business logic lives in helpers, not in the JSX.
  const visible = useMemo(() => getVisibleTasks(tasks, view, search), [tasks, view, search]);
  const tags = useMemo(() => getAllTags(tasks), [tasks]);
  const canReorder = view.sort === 'manual' && view.filter === 'all' && !view.tag && !search;
  const doneCount = tasks.filter((t) => t.done).length;

  // Shortcuts: "n" focuses the new-task box, "/" focuses search.
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.metaKey || e.ctrlKey) return;
      if (e.key === 'n') { e.preventDefault(); document.getElementById('new-title')?.focus(); }
      if (e.key === '/') { e.preventDefault(); document.getElementById('search-box')?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <main>
      <header className="top">
        <div>
          <h1>Today’s plan</h1>
          <p className="sub">Hi {user.name.split(' ')[0]}. Press n to add a task, / to search.</p>
        </div>
        <div className="actions">
          <button className="ghost" onClick={onToggleTheme}>Theme</button>
          <button className="ghost" onClick={logout}>Log out</button>
        </div>
      </header>

      <Dashboard tasks={tasks} />
      <TaskForm idPrefix="new" submitLabel="Add task" onSubmit={add} />

      <section className="toolbar">
        <div className="tabs" role="tablist">
          {FILTERS.map((f) => (
            <button key={f} role="tab" aria-selected={view.filter === f} className={view.filter === f ? 'on' : ''}
              onClick={() => setFilter(f)}>{f[0].toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
        <input id="search-box" className="search" type="search" placeholder="Search tasks" value={search}
          onChange={(e) => setSearch(e.target.value)} aria-label="Search tasks" />
        <select value={view.sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
          <option value="manual">Manual order</option>
          <option value="created">Newest first</option>
          <option value="due">Due date</option>
          <option value="priority">Priority</option>
        </select>
        {tags.length > 0 && (
          <select value={view.tag} onChange={(e) => setTag(e.target.value)} aria-label="Filter by tag">
            <option value="">All tags</option>
            {tags.map((t) => <option key={t} value={t}>#{t}</option>)}
          </select>
        )}
      </section>

      {loading ? (
        <p className="empty">Loading your tasks…</p>
      ) : visible.length === 0 ? (
        <p className="empty">{tasks.length === 0 ? 'No tasks yet. Add your first one above.' : 'No tasks match this view.'}</p>
      ) : (
        <>
          <TaskList tasks={visible} canReorder={canReorder} />
          {!canReorder && view.sort !== 'manual' && <p className="hint">Switch to Manual order to drag tasks.</p>}
        </>
      )}

      <footer>
        <button className="ghost" onClick={completeAll} disabled={doneCount === tasks.length}>Mark all done</button>
        <button className="ghost danger" onClick={clearCompleted} disabled={!doneCount}>Clear completed</button>
      </footer>
    </main>
  );
}
