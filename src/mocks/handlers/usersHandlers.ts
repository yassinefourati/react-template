import { http, HttpResponse } from 'msw';
import type { Action, Resource, Role } from '@/shared/types/roles';

type User = { id: string; name: string; email: string; role: string; status: 'active' | 'disabled'; bio: string | null; phone: string | null; createdAt: string; updatedAt: string };
const now = new Date().toISOString();
const db: User[] = [
  { id:'1', name:'Alice Martin', email:'alice@demo.com', role:'admin', status:'active', bio: 'Product lead', phone: '+1-514-555-0101', createdAt: now, updatedAt: now },
  { id:'2', name:'Bob Tremblay', email:'bob@demo.com', role:'editor', status:'active', bio: null, phone: null, createdAt: now, updatedAt: now },
  { id:'3', name:'Claire Dubois', email:'claire@demo.com', role:'viewer', status:'active', bio: null, phone: null, createdAt: now, updatedAt: now },
  { id:'4', name:'David Lavoie', email:'david@demo.com', role:'viewer', status:'disabled', bio: null, phone: null, createdAt: now, updatedAt: now },
  { id:'5', name:'Eva Bergeron', email:'eva@demo.com', role:'editor', status:'active', bio: null, phone: null, createdAt: now, updatedAt: now },
];
let nextId = 6;
const userEnvelope = (data: unknown, meta?: unknown) => ({ status: 200, code: 'OK', message: 'Success', data, ...(meta ? { meta } : {}) });

// Mutable permissions for the Roles editor
import { permissions as defaultPerms } from '@/shared/types/roles';
const mutablePerms: typeof defaultPerms = JSON.parse(JSON.stringify(defaultPerms));

export const usersHandlers = [
  http.get('*/api/users/:id', ({ params }) => {
    const user = db.find((u) => u.id === String(params.id));
    if (!user) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(user);
  }),
  http.get('*/api/users', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? 10);
    const search = url.searchParams.get('search')?.trim().toLowerCase();
    const role = url.searchParams.get('role')?.trim().toLowerCase();
    const status = url.searchParams.get('status')?.trim().toLowerCase();
    let filtered = db;
    if (search) filtered = filtered.filter((u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search) || u.role.toLowerCase().includes(search));
    if (role) filtered = filtered.filter((u) => u.role.toLowerCase() === role);
    if (status) filtered = filtered.filter((u) => u.status === status);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return HttpResponse.json(userEnvelope(filtered.slice((page-1)*limit, page*limit), {
      page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1,
    }));
  }),
  http.post('*/api/users', async ({ request }) => {
    const body = await request.json() as Pick<User,'name'|'email'|'role'>;
    const ts = new Date().toISOString();
    const user: User = { id: String(nextId++), status: 'active', bio: null, phone: null, createdAt: ts, updatedAt: ts, ...body };
    db.push(user);
    return HttpResponse.json(user, { status: 201 });
  }),
  http.put('*/api/users/:id', async ({ params, request }) => {
    const idx = db.findIndex((u) => u.id === String(params.id));
    if (idx === -1) return HttpResponse.json({ message:'Not found' }, { status:404 });
    db[idx] = { ...db[idx], ...await request.json() as Partial<User>, updatedAt: new Date().toISOString() };
    return HttpResponse.json(db[idx]);
  }),
  http.delete('*/api/users/:id', ({ params }) => {
    const idx = db.findIndex((u) => u.id === String(params.id));
    if (idx !== -1) db.splice(idx, 1);
    return HttpResponse.json({ success: true });
  }),
  http.delete('*/api/users', async ({ request }) => {
    const { ids } = await request.json() as { ids: string[] };
    ids.forEach((id) => { const i = db.findIndex((u) => u.id === id); if (i !== -1) db.splice(i, 1); });
    return HttpResponse.json({ success: true, deleted: ids.length });
  }),
  // Roles permissions
  http.get('*/api/roles/permissions', () => HttpResponse.json(mutablePerms)),
  http.put('*/api/roles/:role/permissions', async ({ params, request }) => {
    const role = params.role as Role;
    const body = await request.json() as Partial<Record<Resource, Action[]>>;
    mutablePerms[role] = { ...mutablePerms[role], ...body };
    return HttpResponse.json(mutablePerms[role]);
  }),
];

