import { Box, Typography, Paper, Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Stack, Divider, Alert, Skeleton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/core/api/client';
import { queryClient } from '@/shared/lib/queryClient';
import { useAppStore } from '@/shared/stores/useAppStore';

interface Schedule { id: string; name: string; format: string; frequency: string; email: string; lastRun: string | null; status: string; }

function ReportsTableSkeleton() {
  return (
    <TableBody>
      {Array.from({ length: 4 }).map((_, i) => (
        <TableRow key={i} sx={{ opacity: 1 - i * 0.15 }}>
          {Array.from({ length: 7 }).map((__, j) => (
            <TableCell key={j}><Skeleton variant="text" /></TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

export default function ReportsPage() {
  const { notify } = useAppStore();
  const KEY = ['reports', 'schedules'];
  const { data: schedules, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: () => apiClient.get<Schedule[]>('/reports/schedules').then((r) => r.data),
  });
  const { mutate: run } = useMutation({
    mutationFn: (id: string) => apiClient.post(`/reports/run/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: KEY }); notify('Report running…', 'info'); },
  });
  const { mutate: del } = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/reports/schedules/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Reports</Typography>
        <Alert severity="info" sx={{ py: 0.5 }}>Scheduled exports run automatically via server cron jobs.</Alert>
      </Stack>
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2 }}><Typography variant="subtitle1" fontWeight={700}>Scheduled Exports</Typography></Box>
        <Divider />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Report</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Format</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Frequency</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Recipient</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Last Run</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          {isLoading ? (
            <ReportsTableSkeleton />
          ) : (
            <TableBody>
              {schedules?.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell fontWeight="600">{s.name}</TableCell>
                  <TableCell><Chip label={s.format.toUpperCase()} size="small" variant="outlined" /></TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{s.frequency}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>{s.email}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{s.lastRun ? new Date(s.lastRun).toLocaleString() : '—'}</TableCell>
                  <TableCell>
                    <Chip label={s.status} size="small" color={s.status === 'success' ? 'success' : s.status === 'pending' ? 'warning' : 'error'} />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" color="primary" onClick={() => run(s.id)} title="Run now">
                        <PlayArrowIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => del(s.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </Paper>
    </Box>
  );
}
