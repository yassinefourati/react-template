import { http, HttpResponse } from 'msw';
const schedules = [
  { id:'r1', name:'Daily Users Export', format:'csv', frequency:'daily', hour:2, email:'admin@demo.com', lastRun:new Date(Date.now()-86400000).toISOString(), status:'success', resource:'users' },
  { id:'r2', name:'Weekly Revenue PDF', format:'pdf', frequency:'weekly', hour:6, email:'admin@demo.com', lastRun:new Date(Date.now()-604800000).toISOString(), status:'success', resource:'revenue' },
];
export const reportsHandlers = [
  http.get('*/api/reports/schedules', () => HttpResponse.json(schedules)),
  http.post('*/api/reports/schedules', async ({ request }) => {
    const body = await request.json() as (typeof schedules)[0];
    const s = { ...body, id:`r-${Date.now()}`, lastRun: null as unknown as string, status:'pending' };
    schedules.push(s as typeof schedules[0]);
    return HttpResponse.json(s, { status: 201 });
  }),
  http.delete('*/api/reports/schedules/:id', ({ params }) => {
    const idx = schedules.findIndex((s) => s.id === params.id);
    if (idx !== -1) schedules.splice(idx, 1);
    return HttpResponse.json({ success: true });
  }),
  http.post('*/api/reports/run/:id', ({ params }) => {
    const s = schedules.find((s) => s.id === params.id);
    if (s) { s.lastRun = new Date().toISOString(); s.status = 'success'; }
    return HttpResponse.json({ success: true });
  }),
];

