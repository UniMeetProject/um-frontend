import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthClient } from '@/lib/auth-client';
import { AuthProvider } from '@/lib/auth';
import { AuthGate } from '@/components/auth-gate';

const tokens = { accessToken: 'access', refreshToken: 'refresh', tokenType: 'Bearer', expiresIn: 900 };
const account = { id: 'account-1', email: 'nico@example.test', username: 'Nico' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => { sessionStorage.clear(); vi.stubGlobal('fetch', fetchMock); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); fetchMock.mockReset(); });

describe('Backend authentication contract', () => {
  it('submits identifier for login, loads /me and restores the tab session', async () => {
    fetchMock.mockResolvedValueOnce(json(tokens)).mockResolvedValueOnce(json(account));
    const client = new AuthClient('http://localhost:3000', vi.fn());
    expect(await client.signIn('login', { identifier: 'Nico', password: 'password' })).toEqual(account);
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ identifier: 'Nico', password: 'password' }));
    expect(fetchMock.mock.calls[1]?.[1]?.headers).toEqual({ Authorization: 'Bearer access' });
    expect(new AuthClient('', vi.fn()).restore()).toBe(true);
  });

  it('rotates a refresh token only once for concurrent expired requests', async () => {
    sessionStorage.setItem('unimeet.auth', JSON.stringify(tokens));
    const client = new AuthClient('', vi.fn());
    client.restore();
    fetchMock.mockImplementation(async (url, init) => {
      if (url === '/auth/refresh') return json({ ...tokens, accessToken: 'new-access', refreshToken: 'new-refresh' });
      return (init?.headers as Record<string, string>)['Authorization'] === 'Bearer access' ? json({}, 401) : json(account);
    });
    expect(await Promise.all([client.request('/auth/me'), client.request('/auth/me')])).toEqual([account, account]);
    expect(fetchMock.mock.calls.filter(([url]) => url === '/auth/refresh')).toHaveLength(1);
    expect(fetchMock.mock.calls.find(([url]) => url === '/auth/refresh')?.[1]?.headers).toEqual({ Authorization: 'Bearer refresh' });
    expect(JSON.parse(sessionStorage.getItem('unimeet.auth')!).refreshToken).toBe('new-refresh');
  });

  it('clears an expired session but retains it when the backend is offline', async () => {
    sessionStorage.setItem('unimeet.auth', JSON.stringify(tokens));
    const expired = vi.fn();
    const client = new AuthClient('', expired);
    client.restore();
    fetchMock.mockRejectedValueOnce(new TypeError('offline'));
    await expect(client.request('/auth/me')).rejects.toMatchObject({ status: 0 });
    expect(sessionStorage.getItem('unimeet.auth')).not.toBeNull();
    fetchMock.mockResolvedValue(json({}, 401));
    await expect(client.request('/auth/me')).rejects.toMatchObject({ status: 401 });
    expect(sessionStorage.getItem('unimeet.auth')).toBeNull();
    expect(expired).toHaveBeenCalledOnce();
  });

  it('does not resurrect credentials when logout races with token refresh', async () => {
    sessionStorage.setItem('unimeet.auth', JSON.stringify(tokens));
    const client = new AuthClient('', vi.fn());
    client.restore();
    let finishRefresh!: (response: Response) => void;
    fetchMock.mockImplementation(async (url) => url === '/auth/refresh'
      ? new Promise<Response>((resolve) => { finishRefresh = resolve; }) : json({}, 401));
    const request = client.request('/auth/me');
    await waitFor(() => expect(finishRefresh).toBeDefined());
    client.clear();
    finishRefresh(json(tokens));
    await expect(request).rejects.toMatchObject({ status: 401 });
    expect(sessionStorage.getItem('unimeet.auth')).toBeNull();
  });

  it('revokes the backend session before clearing local credentials', async () => {
    sessionStorage.setItem('unimeet.auth', JSON.stringify(tokens));
    const client = new AuthClient('', vi.fn());
    client.restore();
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await client.logout();
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/auth/logout');
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe('POST');
    expect(sessionStorage.getItem('unimeet.auth')).toBeNull();
  });
});

describe('Account forms', () => {
  it('protects app content and displays a failed login without losing the identifier', async () => {
    render(<AuthProvider><AuthGate><p>Private app content</p></AuthGate></AuthProvider>);
    const identifier = await screen.findByLabelText('E-Mail oder Benutzername');
    expect(screen.queryByText('Private app content')).not.toBeInTheDocument();
    fireEvent.change(identifier, { target: { value: 'Nico' } });
    fireEvent.change(screen.getByLabelText('Passwort', { exact: true }), { target: { value: 'password' } });
    fetchMock.mockResolvedValue(json({}, 401));
    fireEvent.submit(screen.getByRole('button', { name: 'Anmelden' }).closest('form')!);
    expect(await screen.findByRole('alert')).toHaveTextContent('Anmeldedaten');
    expect(identifier).toHaveValue('Nico');
  });

  it('registers with matching passwords and shows the protected app', async () => {
    render(<AuthProvider><AuthGate><p>Private app content</p></AuthGate></AuthProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Konto erstellen' }));
    fireEvent.change(screen.getByLabelText('Benutzername'), { target: { value: 'Nico' } });
    fireEvent.change(screen.getByLabelText('E-Mail-Adresse'), { target: { value: account.email } });
    fireEvent.change(screen.getByLabelText('Passwort', { exact: true }), { target: { value: 'password' } });
    const confirmation = screen.getByLabelText('Passwort wiederholen');
    fireEvent.change(confirmation, { target: { value: 'different' } });
    const form = screen.getByRole('button', { name: 'Konto erstellen' }).closest('form')!;
    fireEvent.submit(form);
    expect(screen.getByRole('alert')).toHaveTextContent('stimmen nicht überein');
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.change(confirmation, { target: { value: 'password' } });
    fetchMock.mockResolvedValueOnce(json(tokens)).mockResolvedValueOnce(json(account));
    fireEvent.submit(form);
    expect(await screen.findByText('Private app content')).toBeInTheDocument();
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ username: 'Nico', email: account.email, password: 'password' }));
  });
});
