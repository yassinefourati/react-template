import { http, HttpResponse } from 'msw';
const START = Date.now();
export const systemHandlers = [
  http.get('*/api/system/health', async () => {
    const uptime = Math.floor((Date.now() - START) / 1000);
    return HttpResponse.json({
      status: 'healthy',
      uptime,
      services: [
        { name:'API',      status:'healthy', latencyMs: Math.floor(Math.random()*15)+4 },
        { name:'Database', status:'healthy', latencyMs: Math.floor(Math.random()*20)+8 },
        { name:'Cache',    status:'healthy', latencyMs: Math.floor(Math.random()*5)+1  },
        { name:'Queue',    status:'degraded',latencyMs: Math.floor(Math.random()*200)+150 },
        { name:'Storage',  status:'healthy', latencyMs: Math.floor(Math.random()*30)+10 },
      ],
      memory: { used: 340, total: 512, unit: 'MB' },
      version: '1.0.0',
      environment: 'development',
    });
  }),
];

