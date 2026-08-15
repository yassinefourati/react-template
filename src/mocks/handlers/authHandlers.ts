import { http, HttpResponse } from 'msw';
const USERS = [
  { id:1, name:'Alice Admin',  email:'admin@demo.com',  role:'admin' },
  { id:2, name:'Ed Editor',    email:'editor@demo.com', role:'editor' },
  { id:3, name:'Vera Viewer',  email:'viewer@demo.com', role:'viewer' },
];
const resetTokens = new Map<string, string>();
const envelope = <T,>(data: T) => ({ status: 'success', code: 200, message: 'OK', timestamp: new Date().toISOString(), data });
export const authHandlers = [
  http.get('*/api/csrf-token', () => HttpResponse.json(envelope({ token: 'msw-csrf-token-dev' }))),
  http.post('*/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as { email: string; password: string };
    const user = USERS.find((u) => u.email === email);
    if (user && password === 'password') return HttpResponse.json(envelope({ accessToken: `fake-jwt-${user.role}`, user }));
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),
  http.post('*/api/auth/refresh', ({ request }) => {
    const auth = request.headers.get('Authorization') ?? '';
    if (auth.startsWith('Bearer fake-jwt-')) return HttpResponse.json(envelope({ accessToken: `${auth.replace('Bearer ', '')}-refreshed` }));
    return HttpResponse.json({ message: 'Invalid token' }, { status: 401 });
  }),
  http.get('*/api/auth/oauth/google', () =>
    HttpResponse.json({ redirectUrl: `${window.location.origin}/auth/oauth/callback?provider=google&token=fake-google-jwt-admin&name=Google+User&email=google@demo.com` })
  ),
  http.post('*/api/auth/oauth/callback', async ({ request }) => {
    const { token } = await request.json() as { token: string };
    if (token.startsWith('fake-google')) return HttpResponse.json({ token: 'fake-jwt-editor', user: USERS[1] });
    return HttpResponse.json({ message: 'OAuth failed' }, { status: 400 });
  }),
  http.post('*/api/auth/forgot-password', async ({ request }) => {
    const { email } = await request.json() as { email: string };
    const t = Math.random().toString(36).slice(2);
    resetTokens.set(t, email);
    console.log(`[MSW] Reset token for ${email}: ${t}`);
    return HttpResponse.json({ message: 'Reset link sent.' });
  }),
  http.post('*/api/auth/reset-password', async ({ request }) => {
    const { token, password } = await request.json() as { token: string; password: string };
    if (!resetTokens.has(token)) return HttpResponse.json({ message: 'Invalid token' }, { status: 400 });
    if (password.length < 6) return HttpResponse.json({ message: 'Too short' }, { status: 400 });
    resetTokens.delete(token);
    return HttpResponse.json({ success: true });
  }),
  http.delete('*/api/profile/account', () => HttpResponse.json({ success: true })),
];

