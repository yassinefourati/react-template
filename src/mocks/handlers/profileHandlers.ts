import { http, HttpResponse } from 'msw';

let profile = { id: 1, name: 'Alice Admin', email: 'admin@demo.com', role: 'admin', avatarUrl: '', bio: '', phone: '' };
const sessions = [
  { id: 's1', device: 'Chrome on MacOS', ip: '192.168.1.1', lastActive: new Date().toISOString(), current: true },
  { id: 's2', device: 'Safari on iPhone', ip: '10.0.0.2', lastActive: new Date(Date.now() - 3600000).toISOString(), current: false },
];

export const profileHandlers = [
  http.get('*/api/profile', () => HttpResponse.json(profile)),
  http.put('*/api/profile', async ({ request }) => {
    const body = await request.json() as Partial<typeof profile>;
    profile = { ...profile, ...body };
    return HttpResponse.json(profile);
  }),
  http.put('*/api/profile/password', async ({ request }) => {
    const { currentPassword } = await request.json() as { currentPassword: string; newPassword: string };
    if (currentPassword !== 'password') return HttpResponse.json({ message: 'Current password incorrect' }, { status: 400 });
    return HttpResponse.json({ success: true });
  }),
  http.get('*/api/profile/sessions', () => HttpResponse.json(sessions)),
  http.delete('*/api/profile/sessions/:id', ({ params }) => {
    const idx = sessions.findIndex((s) => s.id === params.id);
    if (idx !== -1) sessions.splice(idx, 1);
    return HttpResponse.json({ success: true });
  }),
  http.delete('*/api/profile/sessions', () => {
    sessions.splice(0, sessions.length, sessions[0]);
    return HttpResponse.json({ success: true });
  }),
  // 2FA
  http.post('*/api/profile/2fa/setup', () => HttpResponse.json({ qrCode: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0id2hpdGUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNCI+UVIgQ29kZTwvdGV4dD48L3N2Zz4=', secret: 'JBSWY3DPEHPK3PXP' })),
  http.post('*/api/profile/2fa/verify', async ({ request }) => {
    const { code } = await request.json() as { code: string };
    if (code === '123456') return HttpResponse.json({ success: true, backupCodes: ['AAAA-BBBB','CCCC-DDDD','EEEE-FFFF'] });
    return HttpResponse.json({ message: 'Invalid code' }, { status: 400 });
  }),
];

