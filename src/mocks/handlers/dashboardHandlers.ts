import { http, HttpResponse } from 'msw';

const ACTIONS = ['created user','deleted user','updated settings','exported data','login','logout'];
const USERS = ['Alice Admin','Ed Editor','Vera Viewer'];

export const dashboardHandlers = [
  http.get('*/api/dashboard/stats', () =>
    HttpResponse.json({ users: 1245, revenue: 12340, orders: 320, activeUsers: 847 })
  ),
  http.get('*/api/dashboard/online', () =>
    HttpResponse.json({ count: Math.floor(Math.random() * 20) + 3 })
  ),
  http.get('*/api/dashboard/activity', () => {
    const feed = Array.from({ length: 8 }, (_, i) => ({
      id: `act-${i}`,
      user: USERS[i % USERS.length],
      action: ACTIONS[i % ACTIONS.length],
      timestamp: new Date(Date.now() - i * 240000).toISOString(),
    }));
    return HttpResponse.json(feed);
  }),
  http.get('*/api/dashboard/recent-signups', () => {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    return HttpResponse.json(days.map((day, i) => ({ day, signups: Math.floor(Math.random() * 15) + i + 1 })));
  }),
];

