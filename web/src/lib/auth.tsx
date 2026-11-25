import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Account, ApiError, AuthClient } from './auth-client';

type Auth = {
  user: Account | null;
  status: 'loading' | 'ready' | 'error';
  message: string;
  signIn: (mode: 'login' | 'register', body: unknown) => Promise<void>;
  logout: () => Promise<void>;
  retry: () => void;
};
const Context = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [status, setStatus] = useState<Auth['status']>('loading');
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [client] = useState(() => new AuthClient(
    (import.meta.env['VITE_API_URL'] ?? 'http://localhost:3000').replace(/\/$/, ''),
    () => { setUser(null); setMessage('Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.'); },
  ));
  const restoring = useRef<Promise<Account> | null>(null);
  useEffect(() => {
    let active = true;
    if (!client.restore()) { setStatus('ready'); return; }
    restoring.current ??= client.request<Account>('/auth/me');
    restoring.current.then((account) => { if (active) { setUser(account); setStatus('ready'); } })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) setStatus('ready');
        else { setMessage(error instanceof Error ? error.message : 'Die Sitzung konnte nicht geladen werden.'); setStatus('error'); }
      });
    return () => { active = false; };
  }, [client, attempt]);

  return <Context.Provider value={{ user, status, message,
    signIn: async (mode, body) => { const account = await client.signIn(mode, body); setMessage(''); setUser(account); },
    logout: async () => { await client.logout(); setUser(null); setMessage('Du bist abgemeldet.'); },
    retry: () => { restoring.current = null; setStatus('loading'); setAttempt((value) => value + 1); },
  }}>{children}</Context.Provider>;
}

export function useAuth() {
  const auth = useContext(Context);
  if (!auth) throw new Error('AuthProvider fehlt');
  return auth;
}
