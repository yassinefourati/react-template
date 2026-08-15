import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box, Button, Chip, TextField, InputAdornment,
  Paper, Stack, Collapse, FormControl, InputLabel, Select, MenuItem,
  ToggleButtonGroup, ToggleButton, Tooltip,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridDensity } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import TuneIcon from '@mui/icons-material/Tune';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useUsers, useDeleteUser, useUpdateUser } from '../hooks/useUsers';
import { useConfirmStore } from '@/shared/stores/useConfirmStore';
import Can from '@/shared/components/Can';
import { usePermission } from '@/shared/hooks/usePermission';
import TableSkeleton from '@/shared/components/skeletons/TableSkeleton';
import RowActionsMenu from '@/shared/components/RowActionsMenu';
import PageHeader from '@/shared/components/PageHeader';
import EmptyState from '@/shared/components/EmptyState/EmptyState';
import UserFormDialog from '../components/UserFormDialog';
import type { User } from '../api/usersApi';

// API returns uppercase roles ("ADMIN") — normalise to lowercase for colour lookup
const roleColors: Record<string, 'error' | 'warning' | 'default'> = {
  admin: 'error', editor: 'warning', viewer: 'default',
};

export default function Users() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | User['status']>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const [density, setDensity] = useState<GridDensity>('standard');

  useEffect(() => { setPage(0); }, [debouncedSearch, roleFilter, statusFilter]);

  const { data, isLoading, error, refetch } = useUsers(page + 1, pageSize, {
    search: debouncedSearch, role: roleFilter, status: statusFilter,
  });
  const { mutate: remove } = useDeleteUser();
  const { mutate: updateUser } = useUpdateUser();
  const { confirm } = useConfirmStore();
  const canEdit = usePermission('users', 'edit');
  const canDelete = usePermission('users', 'delete');

  const rows = useMemo(() => data?.data ?? [], [data]);
  const rowCount = useMemo(() => data?.meta?.total ?? 0, [data]);
  const activeFilterCount = (roleFilter ? 1 : 0) + (statusFilter ? 1 : 0);

  useEffect(() => {
    setIsDataReady(!isLoading && data !== undefined);
  }, [isLoading, data]);

  const toggleStatus = useCallback((user: User) => {
    const next = user.status === 'active' ? 'disabled' : 'active';
    updateUser({ id: user.id, body: { status: next } });
  }, [updateUser]);

  const clearFilters = useCallback(() => { setRoleFilter(''); setStatusFilter(''); }, []);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'name',  headerName: t('users.name'),  flex: 1,   minWidth: 140 },
    { field: 'email', headerName: t('users.email'), flex: 1.5, minWidth: 180 },
    {
      field: 'role',
      headerName: t('users.role'),
      width: 120,
      renderCell: ({ value }) => (
        <Chip
          label={value}
          size="small"
          color={roleColors[(value as string)?.toLowerCase()] ?? 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: ({ value }) => (
        <Chip
          icon={value === 'active' ? <CheckCircleIcon /> : <CancelIcon />}
          label={value === 'active' ? 'Active' : 'Disabled'}
          size="small"
          color={value === 'active' ? 'success' : 'default'}
          variant={value === 'active' ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 70,
      sortable: false,
      disableClickEventBubbling: true,
      renderCell: ({ row }) => (
        <RowActionsMenu
          actions={[
            {
              label: t('common.edit'),
              icon: <EditIcon fontSize="small" />,
              hidden: !canEdit,
              onClick: () => { setEditUser(row as User); setDialogOpen(true); },
            },
            {
              label: row.status === 'active' ? 'Disable' : 'Enable',
              icon: row.status === 'active' ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />,
              hidden: !canEdit,
              onClick: () => toggleStatus(row as User),
            },
            {
              label: t('common.delete'),
              icon: <DeleteIcon fontSize="small" color="error" />,
              color: 'error',
              hidden: !canDelete,
              onClick: () => confirm({
                title: t('users.deleteConfirmTitle'),
                message: t('users.deleteConfirmMessage', { name: row.name }),
                confirmLabel: t('common.delete'),
                severity: 'error',
                onConfirm: () => remove(row.id as string),
              }),
            },
          ]}
        />
      ),
    },
  ], [t, confirm, remove, canEdit, canDelete, toggleStatus]);

  const handlePageChange = useCallback((model: { page: number; pageSize: number }) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  }, []);

  if (isLoading && !data) return <TableSkeleton rows={8} />;

  if (error) {
    return (
      <EmptyState
        icon={<ErrorOutlineIcon />}
        title="Couldn't load users"
        description={error.message || 'Something went wrong while fetching the user list. Check your connection and try again.'}
        action={{ label: 'Retry', onClick: () => refetch() }}
      />
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title={t('users.title')}
        description="Manage team members, roles, and account access."
        actions={
          <Can resource="users" action="create">
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditUser(null); setDialogOpen(true); }}>
              {t('users.addUser')}
            </Button>
          </Can>
        }
      />

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by name, email or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 320 } }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
              endAdornment: search ? (
                <InputAdornment position="end">
                  <ClearIcon fontSize="small" sx={{ cursor: 'pointer' }} onClick={() => setSearch('')} />
                </InputAdornment>
              ) : null,
            },
          }}
        />
        <Button
          size="small"
          variant={showAdvanced ? 'contained' : 'outlined'}
          startIcon={<TuneIcon fontSize="small" />}
          onClick={() => setShowAdvanced((p) => !p)}
        >
          Advanced search{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <ToggleButtonGroup size="small" exclusive value={density} onChange={(_, v: GridDensity | null) => v && setDensity(v)} aria-label="Table density">
          <ToggleButton value="comfortable" aria-label="Comfortable density"><Tooltip title="Comfortable"><ViewStreamIcon fontSize="small" /></Tooltip></ToggleButton>
          <ToggleButton value="standard" aria-label="Standard density"><Tooltip title="Standard"><ViewComfyIcon fontSize="small" /></Tooltip></ToggleButton>
          <ToggleButton value="compact" aria-label="Compact density"><Tooltip title="Compact"><ViewHeadlineIcon fontSize="small" /></Tooltip></ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Collapse in={showAdvanced}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Role</InputLabel>
              <Select label="Role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <MenuItem value="">All roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="editor">Editor</MenuItem>
                <MenuItem value="viewer">Viewer</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as '' | User['status'])}>
                <MenuItem value="">All statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="disabled">Disabled</MenuItem>
              </Select>
            </FormControl>
            {activeFilterCount > 0 && (
              <Button size="small" color="error" onClick={clearFilters}>Clear filters</Button>
            )}
          </Stack>
        </Paper>
      </Collapse>

      <Box sx={{ flex: 1, minHeight: 400, width: '100%' }}>
        {isDataReady ? (
          <DataGrid
            rows={rows}
            rowCount={rowCount}
            columns={columns}
            paginationMode="server"
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={handlePageChange}
            pageSizeOptions={[10, 20, 50]}
            loading={isLoading}
            density={density}
            disableRowSelectionOnClick
            onRowClick={({ id }) => navigate(`/users/${id}`)}
            slots={{
              noRowsOverlay: () => (
                <EmptyState
                  icon={<PersonOffOutlinedIcon />}
                  title={activeFilterCount || debouncedSearch ? 'No matching users' : 'No users yet'}
                  description={activeFilterCount || debouncedSearch
                    ? 'Try a different search term or clear the advanced filters.'
                    : 'Invite your first team member to get started.'}
                  action={activeFilterCount || debouncedSearch ? { label: 'Clear filters', onClick: () => { setSearch(''); clearFilters(); } } : undefined}
                />
              ),
            }}
            sx={{
              '& .MuiDataGrid-row': { cursor: 'pointer' },
              '& .MuiDataGrid-cell:focus': { outline: 'none' },
            }}
          />
        ) : (
          <TableSkeleton rows={pageSize} showToolbar={false} />
        )}
      </Box>

      <UserFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditUser(null); }}
        editUser={editUser}
      />
    </Box>
  );
}
