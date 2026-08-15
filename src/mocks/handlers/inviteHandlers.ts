import { http, HttpResponse } from 'msw';
const invites: Array<{ id: string; email: string; role: string; token: string; createdAt: string; expiresAt: string; status: string }> = [];
export const inviteHandlers = [
  http.post('*/api/invites', async ({ request }) => {
    const { email, role } = await request.json() as { email: string; role: string };
    const token = Math.random().toString(36).slice(2);
    const invite = { id: `inv-${Date.now()}`, email, role, token, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(), status: 'pending' };
    invites.push(invite);
    console.log(`[MSW] Invite link: /accept-invite?token=${token}`);
    return HttpResponse.json({ ...invite, inviteUrl: `/accept-invite?token=${token}` }, { status: 201 });
  }),
  http.get('*/api/invites', () => HttpResponse.json(invites)),
  http.delete('*/api/invites/:id', ({ params }) => {
    const idx = invites.findIndex((i) => i.id === params.id);
    if (idx !== -1) invites.splice(idx, 1);
    return HttpResponse.json({ success: true });
  }),
];

