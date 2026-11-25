export type Account = { id: string; email: string; username?: string };
type Tokens = { accessToken: string; refreshToken: string };
const storageKey = 'unimeet.auth';

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

// One client per browser provider. Tokens never enter the SSR module state.
export class AuthClient {
  private tokens: Tokens | null = null;
  private refreshing: Promise<void> | null = null;
  private revision = 0;

  constructor(private baseUrl: string, private expired: () => void) {}

  restore() {
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null');
      if (saved && typeof saved === 'object' && 'accessToken' in saved && 'refreshToken' in saved &&
        typeof saved.accessToken === 'string' && typeof saved.refreshToken === 'string') {
        this.tokens = { accessToken: saved.accessToken, refreshToken: saved.refreshToken };
      }
    } catch { /* Storage can be disabled. In-memory sign-in still works. */ }
    return this.tokens !== null;
  }

  clear() {
    this.revision++;
    this.tokens = null;
    try { sessionStorage.removeItem(storageKey); } catch { /* In-memory session. */ }
  }

  private save(tokens: Tokens) {
    this.tokens = tokens;
    try { sessionStorage.setItem(storageKey, JSON.stringify(tokens)); } catch { /* In-memory session. */ }
  }

  private async send(path: string, method: string, token?: string, body?: unknown) {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new ApiError(0, 'Der Server ist nicht erreichbar. Prüfe deine Verbindung und versuche es erneut.');
    }
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const message = response.status === 409
        ? (data.message === 'Username already in use' ? 'Dieser Benutzername ist schon vergeben.' : 'Diese E-Mail-Adresse wird bereits verwendet.')
        : response.status === 401 ? 'Bitte prüfe deine Anmeldedaten oder melde dich erneut an.'
        : response.status === 400 ? 'Bitte prüfe deine Eingaben.'
        : response.status === 429 ? 'Zu viele Versuche. Bitte warte einen Moment.'
        : 'Die Anfrage konnte nicht abgeschlossen werden. Versuche es erneut.';
      throw new ApiError(response.status, message);
    }
    return response.status === 204 ? undefined : response.json();
  }

  async signIn(mode: 'login' | 'register', body: unknown): Promise<Account> {
    this.clear();
    const tokens = await this.send(`/auth/${mode}`, 'POST', undefined, body);
    this.save(tokens);
    try { return await this.request<Account>('/auth/me'); }
    catch (error) { this.clear(); throw error; }
  }

  private refresh() {
    if (!this.refreshing) {
      const revision = this.revision;
      const token = this.tokens?.refreshToken;
      this.refreshing = (async () => {
        if (!token) throw new ApiError(401, 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.');
        try {
          const tokens = await this.send('/auth/refresh', 'POST', token);
          if (revision !== this.revision) throw new ApiError(401, 'Die Sitzung wurde beendet.');
          this.save(tokens);
        } catch (error) {
          if (error instanceof ApiError && error.status === 401 && revision === this.revision) {
            this.clear();
            this.expired();
          }
          throw error;
        }
      })().finally(() => { this.refreshing = null; });
    }
    return this.refreshing;
  }

  async request<T>(path: string, method = 'GET'): Promise<T> {
    const token = this.tokens?.accessToken;
    try { return await this.send(path, method, token); }
    catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) throw error;
      // A parallel request may already have rotated the tokens.
      if (token === this.tokens?.accessToken) await this.refresh();
      try { return await this.send(path, method, this.tokens?.accessToken); }
      catch (retryError) {
        if (retryError instanceof ApiError && retryError.status === 401) {
          this.clear();
          this.expired();
        }
        throw retryError;
      }
    }
  }

  async logout() {
    await this.request<void>('/auth/logout', 'POST');
    this.clear();
  }
}
