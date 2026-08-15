import { http, HttpResponse } from 'msw';
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const analyticsHandlers = [
  http.get('*/api/analytics/overview', ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to   = url.searchParams.get('to');
    const slice = from && to ? months.slice(0, 6) : months;
    return HttpResponse.json({
      revenue: slice.map((month, i) => ({ month, value: 8000 + Math.round(Math.sin(i) * 2000 + i * 400) })),
      signups: slice.map((month, i) => ({ month, value: 40 + Math.round(i * 8 + 20) })),
      topPages: [
        { page:'/dashboard', views:4200 }, { page:'/users', views:3100 },
        { page:'/analytics', views:2400 }, { page:'/settings', views:1800 },
        { page:'/roles', views:900 },
      ],
    });
  }),
  http.get('*/api/analytics/retention', () => {
    const cohorts = ['Jan','Feb','Mar','Apr','May'];
    return HttpResponse.json(cohorts.map((cohort, i) => ({
      cohort,
      w1: 100, w2: 80 - i*3, w4: 62 - i*4, w8: 48 - i*5, w12: 35 - i*4,
    })));
  }),
  http.get('*/api/analytics/geography', () =>
    HttpResponse.json([
      { country:'Canada', users:3200, pct:28 }, { country:'USA', users:2800, pct:24 },
      { country:'France', users:1900, pct:17 }, { country:'Germany', users:1400, pct:12 },
      { country:'UK', users:1100, pct:10 }, { country:'Other', users:1000, pct:9 },
    ])
  ),
  http.get('*/api/analytics/funnel', () =>
    HttpResponse.json([
      { stage:'Visitors',    value:12000 }, { stage:'Sign-up page', value:4800 },
      { stage:'Registered',  value:2100 }, { stage:'Activated',    value:1560 },
      { stage:'Paid',        value:890 },
    ])
  ),
];

