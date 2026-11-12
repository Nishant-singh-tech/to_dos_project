import { useEffect } from 'react';
import { useAuth } from './auth.jsx';
import { TaskProvider } from './store.jsx';
import { useLocalStorage } from './useLocalStorage';
import AuthPage from './AuthPage.jsx';
import Planner from './Planner.jsx';

export default function App() {
  const { user, ready } = useAuth();
  const [theme, setTheme] = useLocalStorage('planner:theme', null);

  useEffect(() => {
    const dark = theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [theme]);

  if (!ready) return <p className="empty">Loading…</p>;

  const toggleTheme = () =>
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');

  // key={user.id} gives every account a fresh task store
  return user ? (
    <TaskProvider key={user.id}>
      <Planner onToggleTheme={toggleTheme} />
    </TaskProvider>
  ) : (
    <AuthPage />
  );
}
