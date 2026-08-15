import { Box, Typography, Paper, Avatar, Chip, Grid, Divider, Table, TableHead, TableBody, TableRow, TableCell, Button } from '@mui/material';
import DetailSkeleton from '@/shared/components/skeletons/DetailSkeleton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/core/api/client';
import { useAuditLog } from '@/features/audit/hooks/useAudit';
import { ROUTES } from '@/core/router/routes';
import type { User } from '../api/usersApi';

const roleColors: Record<string,'error'|'warning'|'default'> = { admin:'error', editor:'warning', viewer:'default' };

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ['users', 'detail', id],
    queryFn: () => apiClient.get<User>(`/users/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });

  const { data: audit } = useAuditLog(1, undefined, user?.name);

  if (isLoading) return <DetailSkeleton />;
  if (!user) return <Box sx={{ p: 4 }}><Typography>User not found.</Typography></Box>;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(ROUTES.USERS)} sx={{ mb: 2 }}>Back to Users</Button>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem', mx: 'auto', mb: 2 }}>
              {user.name[0].toUpperCase()}
            </Avatar>
            <Typography variant="h6" fontWeight={700}>{user.name}</Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>{user.email}</Typography>
            <Chip label={user.role} color={roleColors[user.role] ?? 'default'} size="small" />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={700}>Recent Activity</Typography>
            </Box>
            <Divider />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Resource</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {audit?.data.slice(0, 8).map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell>{e.action}</TableCell>
                    <TableCell><Chip label={e.resource} size="small" variant="outlined" /></TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{new Date(e.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                )) ?? <TableRow><TableCell colSpan={3} align="center" sx={{ color: 'text.secondary', py: 4 }}>No activity found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
