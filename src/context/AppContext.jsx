import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, AUTH_EXPIRED_EVENT, session } from '../api';

/**
 * App-wide state: auth session, current user, wallet and toasts.
 * Screens load their own data with useApi(); only cross-screen state lives here.
 */
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => session.get()?.user || null);
  const [wallet, setWallet] = useState(null);
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2600);
  }, []);

  const refreshAccount = useCallback(async () => {
    if (!session.isLoggedIn()) return;
    const [profile, w, notes] = await Promise.all([api.getProfile(), api.getWallet(), api.getNotifications()]);
    setUser(profile);
    setWallet(w);
    setUnread(notes.filter((n) => !n.viewed).length);
    session.set({ ...session.get(), user: profile });
  }, []);

  const refreshWallet = useCallback(async () => {
    if (session.isLoggedIn()) setWallet(await api.getWallet());
  }, []);

  const signIn = useCallback(async (auth) => {
    session.set(auth);
    setUser(auth.user);
    await refreshAccount();
  }, [refreshAccount]);

  const signOut = useCallback(async () => {
    await api.logout().catch(() => undefined);
    session.clear();
    setUser(null);
    setWallet(null);
  }, []);

  useEffect(() => {
    refreshAccount().catch(() => undefined);
    const onExpired = () => {
      setUser(null);
      setWallet(null);
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [refreshAccount]);

  const value = useMemo(
    () => ({ user, wallet, setWallet, unread, setUnread, isLoggedIn: Boolean(user), signIn, signOut, refreshAccount, refreshWallet, toast, showToast }),
    [user, wallet, unread, signIn, signOut, refreshAccount, refreshWallet, toast, showToast]
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
