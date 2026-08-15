import { http, HttpResponse } from 'msw';

interface Notification { id: string; title: string; message: string; read: boolean; type: 'INFO'|'WARNING'|'SUCCESS'|'ERROR'; createdAt: string; }
const db: Notification[] = [
  { id:'n1', title:'New user registered', message:'alice@new.com joined', read:false, type:'SUCCESS', createdAt: new Date(Date.now()-60000).toISOString() },
  { id:'n2', title:'Settings changed', message:'Notifications settings updated', read:false, type:'INFO', createdAt: new Date(Date.now()-3600000).toISOString() },
  { id:'n3', title:'Failed login attempt', message:'3 failed attempts from 10.0.0.1', read:false, type:'WARNING', createdAt: new Date(Date.now()-7200000).toISOString() },
  { id:'n4', title:'Export completed', message:'Users export downloaded', read:true, type:'INFO', createdAt: new Date(Date.now()-86400000).toISOString() },
  { id:'n5', title:'Database backup', message:'Weekly backup completed successfully', read:true, type:'SUCCESS', createdAt: new Date(Date.now()-172800000).toISOString() },
];

export const notificationsHandlers = [
  http.get('*/api/notifications', () => HttpResponse.json({
    status: 200, code: 'OK', message: 'Success', timestamp: new Date().toISOString(),
    data: db, unreadCount: db.filter((n) => !n.read).length,
  })),
  http.put('*/api/notifications/:id/read', ({ params }) => {
    const n = db.find((x) => x.id === params.id);
    if (n) n.read = true;
    return HttpResponse.json({ success: true });
  }),
  http.put('*/api/notifications/read-all', () => { db.forEach((n) => { n.read = true; }); return HttpResponse.json({ success: true }); }),
];

