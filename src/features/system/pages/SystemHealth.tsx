import { Box, Typography, Paper, Grid, Chip, LinearProgress, Stack, Table, TableHead, TableBody, TableRow, TableCell, CircularProgress, Skeleton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/core/api/client';
import { STALE } from '@/shared/lib/queryClient';

interface Service { name: string; status: 'healthy' | 'degraded' | 'down'; latencyMs: number; }
interface Health { status: string; uptime: number; services: Service[]; memory: { used: number; total: number; unit: string }; version: string; environment: string; }

const statusIcon = { healthy: <CheckCircleIcon color="success" />, degraded: <WarningIcon color="warning" />, down: <ErrorIcon color="error" /> };
const statusColor = { healthy: 'success', degraded: 'warning', down: 'error' } as const;

function formatUptime(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

function SystemHealthSkeleton() {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Skeleton variant="text" width={200} height={44} />
        <Skeleton variant="rounded" width={120} height={32} sx={{ borderRadius: 4 }} />
      </Stack>
      <Grid container spacing={3}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
              <Skeleton variant="text" width="60%" height={16} sx={{ mx: 'auto' }} />
              <Skeleton variant="text" width="80%" height={36} sx={{ mx: 'auto' }} />
            </Paper>
          </Grid>
        ))}
        <Grid size={{ xs: 12 }}>
          <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 2 }}><Skeleton variant="text" width={80} height={28} /></Box>
            <Table>
              <TableHead>
                <TableRow>
                  {['Service', 'Status', 'Latency', 'Health Bar'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: 4 }} /></TableCell>
                    <TableCell><Skeleton variant="text" width={50} /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={200} height={8} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default function SystemHealth() {
  const { data, isLoading, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => apiClient.get<Health>('/system/health').then((r) => r.data),
    staleTime: STALE.REALTIME,
    refetchInterval: STALE.REALTIME,
  });

  if (isLoading && !data) return <SystemHealthSkeleton />;

  const overallOk = data?.services.every((s) => s.status === 'healthy');

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>System Health</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {isFetching && !isLoading ? <CircularProgress size={16} /> : null}
          <Chip label={data?.status ?? 'checking…'} color={overallOk ? 'success' : 'warning'} icon={overallOk ? <CheckCircleIcon /> : <WarningIcon />} />
          {dataUpdatedAt > 0 && (
            <Typography variant="caption" color="text.secondary">
              Updated {new Date(dataUpdatedAt).toLocaleTimeString()}
            </Typography>
          )}
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Uptime</Typography>
            <Typography variant="h6" fontWeight={700}>{data ? formatUptime(data.uptime) : '—'}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Version</Typography>
            <Typography variant="h6" fontWeight={700}>{data?.version ?? '—'}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Environment</Typography>
            <Typography variant="h6" fontWeight={700} sx={{ textTransform: 'capitalize' }}>{data?.environment ?? '—'}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">Memory</Typography>
            <Typography variant="h6" fontWeight={700}>
              {data ? `${data.memory.used}/${data.memory.total} ${data.memory.unit}` : '—'}
            </Typography>
            {data && (
              <LinearProgress
                variant="determinate"
                value={(data.memory.used / data.memory.total) * 100}
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
                color={(data.memory.used / data.memory.total) > 0.8 ? 'error' : 'primary'}
              />
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 2 }}><Typography variant="subtitle1" fontWeight={700}>Services</Typography></Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Service</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Latency</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Health Bar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.services.map((s) => (
                  <TableRow key={s.name} hover>
                    <TableCell fontWeight="600">{s.name}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {statusIcon[s.status]}
                        <Chip label={s.status} size="small" color={statusColor[s.status]} />
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{s.latencyMs}ms</TableCell>
                    <TableCell sx={{ width: 200 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, (s.latencyMs / 300) * 100)}
                        color={s.status === 'healthy' ? 'success' : s.status === 'degraded' ? 'warning' : 'error'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
