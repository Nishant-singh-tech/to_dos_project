import { createContext, useContext, useEffect, useReducer, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from './api';
import { useLocalStorage } from './useLocalStorage';

const Ctx = createContext(null);
export const useTasks = () => useContext(Ctx);

// Every case returns a NEW array/object; state is never mutated.
function reducer(state, a) {
  switch (a.type) {
    case 'SET': return a.tasks;
    case 'ADD': return [a.task, ...state];
    case 'REPLACE': return state.map((t) => (t.id === a.id ? a.task : t));
    case 'UPDATE': return state.map((t) => (t.id === a.id ? { ...t, ...a.patch } : t));
    case 'DELETE': return state.filter((t) => t.id !== a.id);
    case 'CLEAR_COMPLETED': return state.filter((t) => !t.done);
    case 'COMPLETE_ALL':
      return state.map((t) => (t.done ? t : { ...t, done: true, completedAt: new Date().toISOString() }));
    case 'REORDER': {
      const pos = new Map(a.ids.map((id, i) => [id, i]));
      return state.map((t) => (pos.has(t.id) ? { ...t, order: pos.get(t.id) } : t));
    }
    default: return state;
  }
}

export function TaskProvider({ children }) {
  const [tasks, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useLocalStorage('planner:view', { filter: 'all', sort: 'manual', tag: '' });
  const [search, setSearch] = useState('');

  const load = () =>
    api.list()
      .then((t) => dispatch({ type: 'SET', tasks: t }))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  // Optimistic update: change the UI now, then sync. If the server rejects it, reload the truth.
  const optimistic = (action, call) => {
    dispatch(action);
    return call().catch((e) => { toast.error(e.message); load(); });
  };

  const actions = {
    async add(data) {
      try {
        dispatch({ type: 'ADD', task: await api.create(data) });
        return true;
      } catch (e) { toast.error(e.message); return false; }
    },
    async update(id, patch) {
      const completing = patch.done === true;
      const res = await optimistic(
        { type: 'UPDATE', id, patch: completing ? { ...patch, completedAt: new Date().toISOString() } : patch },
        () => api.update(id, patch)
      );
      if (!res) return;
      dispatch({ type: 'REPLACE', id, task: res.task });
      if (res.next) { dispatch({ type: 'ADD', task: res.next }); toast.success('Next occurrence scheduled'); }
    },
    remove: (id) => optimistic({ type: 'DELETE', id }, () => api.remove(id)),
    reorder: (ids) => optimistic({ type: 'REORDER', ids }, () => api.reorder(ids)),
    clearCompleted: () => optimistic({ type: 'CLEAR_COMPLETED' }, api.clearCompleted),
    completeAll: () => optimistic({ type: 'COMPLETE_ALL' }, api.completeAll),
    setFilter: (filter) => setView((v) => ({ ...v, filter })),
    setSort: (sort) => setView((v) => ({ ...v, sort })),
    setTag: (tag) => setView((v) => ({ ...v, tag })),
    setSearch,
  };

  return <Ctx.Provider value={{ tasks, loading, view, search, ...actions }}>{children}</Ctx.Provider>;
}
