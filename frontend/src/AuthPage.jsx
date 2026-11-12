import { useState } from 'react';
import { useAuth } from './auth.jsx';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isLogin = mode === 'login';

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await (isLogin ? login({ email: form.email, password: form.password }) : register(form));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <main className="auth">
      <h1>Smart Planner</h1>
      <p className="sub">{isLogin ? 'Log in to see your tasks.' : 'Create an account to start planning.'}</p>
      <form onSubmit={submit}>
        {!isLogin && <input placeholder="Name" value={form.name} onChange={set('name')} autoComplete="name" required />}
        <input type="email" placeholder="Email" value={form.email} onChange={set('email')} autoComplete="email" required />
        <input type="password" placeholder="Password (6+ characters)" value={form.password} onChange={set('password')}
          autoComplete={isLogin ? 'current-password' : 'new-password'} required minLength={isLogin ? 1 : 6} />
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</button>
      </form>
      <button className="link" onClick={() => { setMode(isLogin ? 'register' : 'login'); setError(''); }}>
        {isLogin ? 'New here? Create an account' : 'Have an account? Log in'}
      </button>
    </main>
  );
}
