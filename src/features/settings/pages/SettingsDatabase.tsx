import { Box, Typography, Paper, Stack, Grid, Chip, Table, TableHead, TableBody, TableRow, TableCell, Button, CircularProgress, Alert, Divider, TextField } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WifiIcon from '@mui/icons-material/Wifi';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/core/api/client';
import Can from '@/shared/components/Can';
import { useTranslation } from 'react-i18next';

interface DbInfo { host: string; port: number; name: string; user: string; ssl: boolean; poolSize: number; status: string; }
interface Backup { id: string; filename: string; size: string; status: string; createdAt: string; }

function mask(str: string) { return str.slice(0, 4) + '••••' + str.slice(-4); }

export default function SettingsDatabase() {
  const { t } = useTranslation();
  const { data: db } = useQuery({ queryKey: ['settings','db'], queryFn: () => apiClient.get<DbInfo>('/settings/database').then(r => r.data) });
  const { data: backups } = useQuery({ queryKey: ['settings','db-backups'], queryFn: () => apiClient.get<Backup[]>('/settings/database/backups').then(r => r.data) });
  const { mutate: testConn, isPending: testing, data: testResult } = useMutation({ mutationFn: () => apiClient.post<{ success: boolean; latencyMs: number }>('/settings/database/test').then(r => r.data) });

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>{t('settings.database')}</Typography>
      <Can resource="settings.database" action="view" fallback={<Alert severity="error">{t('common.noAccess')}</Alert>}>
        <Grid container spacing={3}>
          {/* Connection info */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <StorageIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>Connection</Typography>
                <Chip label={db?.status ?? 'unknown'} size="small" color={db?.status === 'connected' ? 'success' : 'error'} icon={<CheckCircleIcon />} />
              </Stack>
              <Stack spacing={1.5}>
                {[
                  { label: 'Host',      value: mask(db?.host ?? '') },
                  { label: 'Port',      value: String(db?.port ?? '') },
                  { label: 'Database',  value: db?.name ?? '' },
                  { label: 'User',      value: db?.user ?? '' },
                  { label: 'SSL',       value: db?.ssl ? 'Enabled' : 'Disabled' },
                  { label: 'Pool size', value: String(db?.poolSize ?? '') },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <TextField value={value} size="small" sx={{ width: 200, '& input':{ fontFamily:'monospace', fontSize:'0.8rem' } }} InputProps={{ readOnly: true }} />
                  </Box>
                ))}
              </Stack>
              <Can resource="settings.database" action="edit">
                <Box sx={{ mt: 2, display:'flex', gap: 1, alignItems:'center' }}>
                  <Button variant="outlined" size="small" startIcon={testing ? <CircularProgress size={14} /> : <WifiIcon />} onClick={() => testConn()} disabled={testing}>
                    Test connection
                  </Button>
                  {testResult && <Chip label={testResult.success ? `OK · ${testResult.latencyMs}ms` : 'Failed'} size="small" color={testResult.success ? 'success' : 'error'} />}
                </Box>
              </Can>
            </Paper>
          </Grid>

          {/* Backups */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 2 }}><Typography variant="subtitle1" fontWeight={700}>Backup History</Typography></Box>
              <Divider />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight:700 }}>File</TableCell>
                    <TableCell sx={{ fontWeight:700 }}>Size</TableCell>
                    <TableCell sx={{ fontWeight:700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight:700 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {backups?.map((b) => (
                    <TableRow key={b.id} hover>
                      <TableCell sx={{ fontSize:'0.75rem', fontFamily:'monospace', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.filename}</TableCell>
                      <TableCell>{b.size}</TableCell>
                      <TableCell><Chip label={b.status} size="small" color={b.status === 'success' ? 'success' : b.status === 'running' ? 'warning' : 'error'} /></TableCell>
                      <TableCell sx={{ fontSize:'0.75rem' }}>{new Date(b.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      </Can>
    </Box>
  );
}
