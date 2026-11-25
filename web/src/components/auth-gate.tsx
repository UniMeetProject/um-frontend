import { useState, type FormEvent, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from './ui-kit';
import campus from '@/assets/campus.jpg';

export function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  if (auth.status !== 'ready') return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 p-6">
    <h1 className="font-serif text-3xl">{auth.status === 'loading' ? 'Sitzung wird geladen …' : 'Verbindung unterbrochen'}</h1>
    <p role="status">{auth.status === 'error' && auth.message}</p>
    {auth.status === 'error' && <Button onClick={auth.retry}>Erneut versuchen</Button>}
  </main>;
  if (auth.user) return children;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    const password = String(data.get('password'));
    if (mode === 'register' && password !== data.get('confirmation')) { setError('Die Passwörter stimmen nicht überein.'); return; }
    setPending(true);
    setError('');
    try {
      await auth.signIn(mode, mode === 'register'
        ? { username: String(data.get('username')).trim(), email: String(data.get('email')).trim(), password }
        : { identifier: String(data.get('identifier')).trim(), password });
    } catch (error) { setError(error instanceof Error ? error.message : 'Bitte versuche es erneut.'); }
    finally { setPending(false); }
  }

  const inputClass = 'mt-2 block min-h-12 w-full rounded-lg border border-input bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-ring';
  return <main className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 py-10 md:grid-cols-2 md:px-10">
    <section className="mx-auto w-full max-w-md">
      <p className="mb-10 font-serif text-2xl">Uni<span className="italic text-primary">Meet</span></p>
      <h1 className="text-4xl leading-tight md:text-5xl">{mode === 'login' ? 'Willkommen zurück.' : 'Gemeinsam besser lernen.'}</h1>
      <p className="mt-4 text-muted-foreground">{mode === 'login' ? 'Melde dich an und plane dein nächstes Lerntreffen.' : 'Erstelle dein Konto für UniMeet.'}</p>
      {auth.message && <p role="status" className="mt-5 text-sm">{auth.message}</p>}
      <form key={mode} onSubmit={submit} className="mt-8 space-y-5" aria-busy={pending}>
        <fieldset disabled={pending} className="space-y-5">
          {mode === 'register' ? <>
            <label className="block text-sm font-medium">Benutzername<input name="username" autoComplete="username" required minLength={3} maxLength={32} className={inputClass} aria-describedby="username-help" /></label>
            <p id="username-help" className="text-sm text-muted-foreground">3–32 Zeichen</p>
            <label className="block text-sm font-medium">E-Mail-Adresse<input name="email" type="email" autoComplete="email" required className={inputClass} /></label>
          </> : <label className="block text-sm font-medium">E-Mail oder Benutzername<input name="identifier" autoComplete="username" required className={inputClass} /></label>}
          <div>
            <label className="block text-sm font-medium" htmlFor="password">Passwort</label>
            <div className="relative"><input id="password" name="password" type={showPassword ? 'text' : 'password'} required
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={mode === 'register' ? 8 : 1} maxLength={128}
              aria-describedby={mode === 'register' ? 'password-help' : undefined} className={`${inputClass} pr-14`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'} aria-pressed={showPassword}
                className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {mode === 'register' && <p id="password-help" className="mt-2 text-sm text-muted-foreground">8–128 Zeichen</p>}
          </div>
          {mode === 'register' && <label className="block text-sm font-medium">Passwort wiederholen<input name="confirmation" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required maxLength={128} className={inputClass} /></label>}
        </fieldset>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={pending} className="w-full">{pending ? 'Bitte warten …' : mode === 'login' ? 'Anmelden' : 'Konto erstellen'}</Button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">{mode === 'login' ? 'Neu bei UniMeet?' : 'Du hast schon ein Konto?'}{' '}
        <button disabled={pending} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setShowPassword(false); }} className="text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring">{mode === 'login' ? 'Konto erstellen' : 'Anmelden'}</button>
      </p>
    </section>
    <img src={campus} alt="Studierende lernen gemeinsam auf dem Campus" className="hidden aspect-square w-full rounded-2xl object-cover md:block" />
  </main>;
}
