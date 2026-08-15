import { useState } from 'react';
import {
  Box, Paper, Chip, Table, TableHead, TableBody,
  TableRow, TableCell, TablePagination, TextField, Select,
  MenuItem, FormControl, InputLabel, Stack, Skeleton, LinearProgress,
} from '@mui/material';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import { useAuditLog } from '../hooks/useAudit';
import type { AuditEntry } from '../api/auditApi';
import PageHeader from '@/shared/components/PageHeader';
import EmptyState from '@/shared/components/EmptyState/EmptyState';

// Keys must match the backend's uppercase enum values.
const severityColor: Record<AuditEntry['severity'], 'info' | 'warning' | 'error'> = {
  INFO:    'info',
  WARNING: 'warning',
  ERROR:   'error',
};

export default function AuditLog() {
  const [page, setSeverityPage] = useState(0);
  const [severity, setSeverity] = useState('');
  const [search, setSearch]     = useState('');

  const { data, isLoading, isFetching } = useAuditLog(page + 1, severity, search);

  // data is an ApiResponse envelope — rows at .data, total at .meta.total.
  const rows  = data?.data  ?? [];
  const total = data?.meta?.total ?? 0;

  const hasFilters = Boolean(search) || Boolean(severity);

  return (
    <Box>
      <PageHeader title="Audit Log" description="A chronological record of account activity, changes, and security events." />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField
          size="small"
          placeholder="Search user or action…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSeverityPage(0); }}
          sx={{ minWidth: 240 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Severity</InputLabel>
          {/* Send uppercase to match the backend enum. */}
          <Select
            label="Severity"
            value={severity}
            onChange={(e) => { setSeverity(e.target.value); setSeverityPage(0); }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="INFO">Info</MenuItem>
            <MenuItem value="WARNING">Warning</MenuItem>
            <MenuItem value="ERROR">Error</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {isFetching && !isLoading && (
        <LinearProgress sx={{ mb: 0.5, borderRadius: 1 }} />
      )}

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          opacity: isFetching ? 0.7 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {!isLoading && rows.length === 0 ? (
          <EmptyState
            icon={<HistoryToggleOffIcon />}
            title={hasFilters ? 'No matching events' : 'No activity yet'}
            description={hasFilters
              ? 'Try a different search term or clear the severity filter.'
              : 'Account activity, changes, and security events will show up here as they happen.'}
            action={hasFilters ? { label: 'Clear filters', onClick: () => { setSearch(''); setSeverity(''); } } : undefined}
          />
        ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Resource</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>IP</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Severity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              : rows.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{entry.user}</TableCell>
                    <TableCell>{entry.action}</TableCell>
                    <TableCell>
                      <Chip
                        label={entry.resourceId
                          ? `${entry.resource} #${entry.resourceId}`
                          : entry.resource}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      {entry.ip}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={entry.severity}
                        size="small"
                        color={severityColor[entry.severity] ?? 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        )}

        {rows.length > 0 && (
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setSeverityPage(p)}
            rowsPerPage={20}
            rowsPerPageOptions={[20]}
          />
        )}
      </Paper>
    </Box>
  );
}