import { useState } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableBody, TableRow, TableCell, Chip, Checkbox, Button, Alert, CircularProgress, Stack } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { permissions as defaultPerms } from '@/shared/types/roles';
import type { Role, Resource, Action } from '@/shared/types/roles';
import apiClient from '@/core/api/client';
import { usePermission } from '@/shared/hooks/usePermission';
import { useAppStore } from '@/shared/stores/useAppStore';
import { queryClient } from '@/shared/lib/queryClient';

const ROLES: Role[]   = ['admin','editor','viewer'];
const ACTIONS: Action[] = ['view','create','edit','delete'];
const ROLE_COLORS: Record<Role,'error'|'warning'|'default'> = { admin:'error', editor:'warning', viewer:'default' };
const RESOURCES: { key: Resource; label: string }[] = [
  { key:'users', label:'Users' }, { key:'users.roles', label:'Users › Roles' },
  { key:'users.permissions', label:'Users › Permissions' }, { key:'analytics', label:'Analytics' },
  { key:'settings', label:'Settings' }, { key:'settings.notifications', label:'Settings › Notifications' },
  { key:'settings.database', label:'Settings › Database' },
];

export default function UsersRoles() {
  const { t } = useTranslation();
  const { notify } = useAppStore();
  const canEdit = usePermission('users.roles', 'edit');

  const { data: serverPerms } = useQuery({
    queryKey: ['roles','permissions'],
    queryFn: () => apiClient.get<typeof defaultPerms>('/roles/permissions').then((r) => r.data),
    initialData: defaultPerms,
  });

  const [localPerms, setLocalPerms] = useState<typeof defaultPerms>(() => JSON.parse(JSON.stringify(serverPerms)));
  const [dirty, setDirty] = useState(false);

  const { mutate: save, isPending } = useMutation({
    mutationFn: async () => {
      for (const role of ROLES) {
        await apiClient.put(`/roles/${role}/permissions`, localPerms[role]);
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['roles'] }); notify('Permissions saved', 'success'); setDirty(false); },
  });

  const toggle = (role: Role, resource: Resource, action: Action) => {
    if (!canEdit) return;
    setLocalPerms((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as typeof defaultPerms;
      const arr = next[role][resource] ?? [];
      next[role][resource] = arr.includes(action) ? arr.filter((a) => a !== action) : [...arr, action];
      return next;
    });
    setDirty(true);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>{t('menu.roles')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {canEdit ? 'Click cells to toggle permissions, then save.' : 'Read-only — admin role required to edit.'}
          </Typography>
        </Box>
        {canEdit && <Button variant="contained" startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />} onClick={() => save()} disabled={!dirty || isPending}>Save changes</Button>}
      </Stack>
      {dirty && <Alert severity="warning" sx={{ mb:2 }}>You have unsaved permission changes.</Alert>}
      <Paper elevation={2} sx={{ borderRadius:3, overflow:'hidden' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight:700, minWidth:200 }}>Resource</TableCell>
              {ROLES.map((role) => <TableCell key={role} colSpan={4} align="center" sx={{ fontWeight:700, borderLeft:'1px solid', borderColor:'divider' }}><Chip label={role} size="small" color={ROLE_COLORS[role]} /></TableCell>)}
            </TableRow>
            <TableRow>
              <TableCell />
              {ROLES.map((role) => ACTIONS.map((action) => (
                <TableCell key={`${role}-${action}`} align="center" sx={{ fontSize:'0.7rem', color:'text.secondary', py:0.5, borderLeft:action==='view'?'1px solid':undefined, borderColor:'divider' }}>{action}</TableCell>
              )))}
            </TableRow>
          </TableHead>
          <TableBody>
            {RESOURCES.map(({ key, label }) => (
              <TableRow key={key} hover>
                <TableCell sx={{ fontWeight:500, fontSize:'0.8125rem' }}>{label}</TableCell>
                {ROLES.map((role) => ACTIONS.map((action) => {
                  const checked = localPerms[role]?.[key]?.includes(action) ?? false;
                  return (
                    <TableCell key={`${role}-${action}`} align="center" sx={{ borderLeft:action==='view'?'1px solid':undefined, borderColor:'divider', cursor:canEdit?'pointer':'default', '&:hover':canEdit?{ bgcolor:'action.hover' }:{} }}
                      onClick={() => toggle(role, key, action)}>
                      <Checkbox checked={checked} size="small" color={checked ? 'success' : 'default'} disabled={!canEdit} sx={{ p:0.5 }} />
                    </TableCell>
                  );
                }))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
