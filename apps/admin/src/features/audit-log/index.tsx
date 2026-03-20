import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useState } from 'react';

import { getAuditLog, type AuditLogEntry, type PaginatedResponse } from '@/api/api';
import { formatDateTime } from '@/lib/format';

const RESOURCE_TYPES = ['employee', 'department', 'contract', 'leave', 'payroll', 'user', 'settings'];

const ACTION_ICONS: Record<string, React.ReactNode> = {
  create: <AddIcon fontSize="small" />,
  update: <EditIcon fontSize="small" />,
  delete: <DeleteIcon fontSize="small" />,
  view: <VisibilityIcon fontSize="small" />,
};

function getActionIcon(action: string): React.ReactNode {
  if (action.includes('create') || action.includes('add')) return ACTION_ICONS.create;
  if (action.includes('delete') || action.includes('remove')) return ACTION_ICONS.delete;
  if (action.includes('update') || action.includes('edit')) return ACTION_ICONS.update;
  return ACTION_ICONS.view;
}

function getActionColor(action: string): 'success' | 'error' | 'warning' | 'info' | 'default' {
  if (action.includes('create') || action.includes('add')) return 'success';
  if (action.includes('delete') || action.includes('remove')) return 'error';
  if (action.includes('update') || action.includes('edit')) return 'warning';
  if (action.includes('login') || action.includes('logout')) return 'info';
  return 'default';
}

interface DiffViewerProps {
  changes: Record<string, unknown> | undefined;
}

function DiffViewer({ changes }: DiffViewerProps) {
  if (!changes || Object.keys(changes).length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No changes recorded.
      </Typography>
    );
  }

  return (
    <Box sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
      {Object.entries(changes).map(([key, value]) => {
        const change = value as { old?: unknown; new?: unknown } | unknown;
        const isChangeObject =
          typeof change === 'object' && change !== null && ('old' in change || 'new' in change);

        if (isChangeObject) {
          const typedChange = change as { old?: unknown; new?: unknown };
          return (
            <Box key={key} sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {key}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Box
                  sx={{
                    flex: 1,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'error.lighter',
                    border: '1px solid',
                    borderColor: 'error.light',
                  }}
                >
                  <Typography variant="caption" color="error.main" display="block">
                    - Old
                  </Typography>
                  <Typography variant="body2">{String(typedChange.old ?? 'null')}</Typography>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'success.lighter',
                    border: '1px solid',
                    borderColor: 'success.light',
                  }}
                >
                  <Typography variant="caption" color="success.main" display="block">
                    + New
                  </Typography>
                  <Typography variant="body2">{String(typedChange.new ?? 'null')}</Typography>
                </Box>
              </Box>
            </Box>
          );
        }

        return (
          <Box key={key} sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {key}:
            </Typography>{' '}
            <Typography variant="body2" component="span">
              {String(change)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export const AuditLog: React.FC = () => {
  const [data, setData] = useState<PaginatedResponse<AuditLogEntry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [search, setSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAuditLog({
        page: page + 1,
        per_page: rowsPerPage,
        resource_type: resourceFilter || undefined,
      });
      setData(result);
    } catch {
      setError('Failed to load audit log.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, resourceFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredData = data?.data.filter((entry) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      entry.user_email.toLowerCase().includes(searchLower) ||
      entry.action.toLowerCase().includes(searchLower) ||
      entry.resource_type.toLowerCase().includes(searchLower)
    );
  });

  const clearFilters = () => {
    setSearch('');
    setResourceFilter('');
    setPage(0);
  };

  const hasFilters = search || resourceFilter;

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Audit Log
          </Typography>
          <Typography variant="body2" color="text.secondary">
            System activity and change history
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant={showFilters ? 'contained' : 'outlined'}
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
            {hasFilters && (
              <Chip label="Active" size="small" color="primary" sx={{ ml: 1, height: 20 }} />
            )}
          </Button>
        </Stack>
      </Stack>

      {showFilters && (
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Search by user, action..."
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ minWidth: 250 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Resource Type</InputLabel>
              <Select
                value={resourceFilter}
                label="Resource Type"
                onChange={(e) => {
                  setResourceFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All</MenuItem>
                {RESOURCE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {hasFilters && (
              <Button size="small" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </Stack>
        </Paper>
      )}

      {error && (
        <Alert severity="error" action={<Button onClick={loadData}>Retry</Button>}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={180}>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell align="right">Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData?.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <HistoryIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                          {formatDateTime(entry.created_at)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                          <PersonIcon sx={{ fontSize: 14 }} />
                        </Avatar>
                        <Typography variant="body2">{entry.user_email}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getActionIcon(entry.action)}
                        label={entry.action}
                        size="small"
                        color={getActionColor(entry.action)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={entry.resource_type} size="small" variant="outlined" />
                        <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                          {entry.resource_id.slice(0, 8)}...
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {entry.ip_address ?? '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {entry.changes && Object.keys(entry.changes).length > 0 && (
                        <Tooltip title="View changes">
                          <IconButton size="small" onClick={() => setSelectedEntry(entry)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredData || filteredData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No audit log entries found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={data?.meta?.total ?? 0}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </TableContainer>

      {/* Changes Detail Dialog */}
      <Dialog open={!!selectedEntry} onClose={() => setSelectedEntry(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Change Details
              </Typography>
              {selectedEntry && (
                <Typography variant="body2" color="text.secondary">
                  {selectedEntry.action} on {selectedEntry.resource_type} · {formatDateTime(selectedEntry.created_at)}
                </Typography>
              )}
            </Box>
            <IconButton onClick={() => setSelectedEntry(null)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedEntry && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Performed by
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedEntry.user_email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      IP: {selectedEntry.ip_address ?? 'Unknown'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Resource
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip label={selectedEntry.resource_type} size="small" />
                  <Typography variant="body2" fontFamily="monospace">
                    {selectedEntry.resource_id}
                  </Typography>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Changes
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <DiffViewer changes={selectedEntry.changes} />
                </Paper>
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
};
