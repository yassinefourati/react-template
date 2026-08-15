import { Box, Typography, Paper, TextField, MenuItem, Button, Stack, Alert, Chip, Table, TableHead, TableBody, TableRow, TableCell, IconButton, Divider, CircularProgress, Grid } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '@/core/api/client';
import { queryClient } from '@/shared/lib/queryClient';
import { useAppStore } from '@/shared/stores/useAppStore';

const schema = z.object({ email: z.string().email('Invalid email'), role: z.enum(['admin','editor','viewer']) });
type FormData = z.infer<typeof schema>;
interface Invite { id: string; email: string; role: string; token: string; inviteUrl?: string; expiresAt: string; status: string; }

export default function InvitePage() {
  const { notify } = useAppStore();
  const KEY = ['invites'];

  const { data: invites } = useQuery({ queryKey: KEY, queryFn: () => apiClient.get<Invite[]>('/invites').then(r => r.data) });
  const { mutate: send, isPending, data: sent } = useMutation({
    mutationFn: (data: FormData) => apiClient.post<Invite>('/invites', data).then(r => r.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: KEY }); notify('Invite sent', 'success'); reset(); },
  });
  const { mutate: revoke } = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/invites/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema), defaultValues: { role: 'viewer' },
  });

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Invite User</Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 3 }} component="form" onSubmit={handleSubmit((d) => send(d))}>
            <Stack spacing={2}>
              <TextField label="Email address" fullWidth {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
              <TextField label="Role" select fullWidth defaultValue="viewer" {...register('role')}>
                {['admin','editor','viewer'].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </TextField>
              <Button type="submit" variant="contained" disabled={isPending}
                startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : null}>
                Send invite
              </Button>
            </Stack>
          </Paper>
          {sent?.inviteUrl && (
            <Alert severity="success" action={
              <IconButton size="small" onClick={() => { navigator.clipboard.writeText(window.location.origin + (sent.inviteUrl ?? '')); notify('Copied!','success'); }}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>}>
              Invite link ready — check MSW console for token.
            </Alert>
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          {invites && invites.length > 0 && (
            <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 2 }}><Typography variant="subtitle1" fontWeight={700}>Pending Invites</Typography></Box>
              <Divider />
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell sx={{ fontWeight:700 }}>Email</TableCell><TableCell sx={{ fontWeight:700 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight:700 }}>Expires</TableCell><TableCell sx={{ fontWeight:700 }}>Status</TableCell><TableCell />
                </TableRow></TableHead>
                <TableBody>
                  {invites.map((inv) => (
                    <TableRow key={inv.id} hover>
                      <TableCell>{inv.email}</TableCell>
                      <TableCell><Chip label={inv.role} size="small" /></TableCell>
                      <TableCell sx={{ fontSize:'0.75rem' }}>{new Date(inv.expiresAt).toLocaleDateString()}</TableCell>
                      <TableCell><Chip label={inv.status} size="small" color={inv.status==='pending'?'warning':'success'} /></TableCell>
                      <TableCell><IconButton size="small" color="error" onClick={() => revoke(inv.id)}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
