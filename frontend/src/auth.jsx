import { createContext, useContext, useEffect, useState } from 'react';
import { api, session } from './api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const logout = () => { session.set(null); setUser(null); };

  useEffect(() => {
    session.onUnauthorized = logout;
    if (!session.get()) return setReady(true);
    api.me().then((r) => setUser(r.user)).catch(logout).finally(() => setReady(true));
  }, []);

  const enter = ({ token, user }) => { session.set(token); setUser(user); };
  const login = async (body) => enter(await api.login(body));
  const register = async (body) => enter(await api.register(body));

  return <Ctx.Provider value={{ user, ready, login, register, logout }}>{children}</Ctx.Provider>;
}
