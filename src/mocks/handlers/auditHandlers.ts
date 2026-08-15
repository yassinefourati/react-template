import { http, HttpResponse } from 'msw';

const ACTIONS = ['created user','deleted user','updated user','changed role','login','logout','updated settings','exported data','viewed audit log'];
const USERS = ['Alice Admin','Ed Editor','Vera Viewer','System'];
const db = Array.from({ length: 60 }, (_, i) => ({
  id: `audit-${i+1}`,
  user: USERS[i % USERS.length],
  action: ACTIONS[i % ACTIONS.length],
  resource: ['User','Settings','Analytics','Session'][i % 4],
  resourceId: `${Math.floor(Math.random() * 100) + 1}`,
  ip: `192.168.${i % 10}.${i % 255}`,
  timestamp: new Date(Date.now() - i * 900000).toISOString(),
  severity: (['INFO','INFO','INFO','WARNING','ERROR'] as const)[i % 5],
}));

export const auditHandlers = [
  http.get('*/api/audit', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? 20);
    const severity = url.searchParams.get('severity');
    const search = url.searchParams.get('search')?.toLowerCase();
    let filtered = [...db];
    if (severity) filtered = filtered.filter((e) => e.severity === severity);
    if (search) filtered = filtered.filter((e) => e.user.toLowerCase().includes(search) || e.action.toLowerCase().includes(search));
    const start = (page - 1) * limit;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return HttpResponse.json({
      status: 200, code: 'OK', message: 'Success', timestamp: new Date().toISOString(),
      data: filtered.slice(start, start + limit),
      meta: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    });
  }),
];

