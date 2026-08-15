import { http, HttpResponse } from 'msw';

let notifSettings = { emailEnabled:true, pushEnabled:false, inAppEnabled:true, weeklyDigest:true, securityAlerts:true };

const backups = Array.from({ length: 7 }, (_, i) => ({
  id: `bk-${i}`,
  filename: `backup_${new Date(Date.now() - i * 86400000).toISOString().split('T')[0]}.sql.gz`,
  size: `${(Math.random() * 50 + 10).toFixed(1)} MB`,
  status: i === 0 ? 'running' : 'success',
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

export const settingsHandlers = [
  http.get('*/api/settings/notifications', () => HttpResponse.json(notifSettings)),
  http.put('*/api/settings/notifications', async ({ request }) => {
    notifSettings = { ...notifSettings, ...await request.json() as typeof notifSettings };
    return HttpResponse.json(notifSettings);
  }),
  http.get('*/api/settings/database', () => HttpResponse.json({
    host: 'db.internal.example.com',
    port: 5432,
    name: 'admin_prod',
    user: 'app_user',
    ssl: true,
    poolSize: 10,
    status: 'connected',
  })),
  http.post('*/api/settings/database/test', async () => {
    await new Promise((r) => setTimeout(r, 800));
    return HttpResponse.json({ success: true, latencyMs: 12 });
  }),
  http.get('*/api/settings/database/backups', () => HttpResponse.json(backups)),
];

