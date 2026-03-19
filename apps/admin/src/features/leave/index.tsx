import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { approveLeave, getLeaveRequests, rejectLeave, type LeaveRequest, type PaginatedResponse } from '@/api/api';
import { ConfirmDialog, StatusChip } from '@/components/shared';
import { formatDate } from '@/lib/format';

export const LeaveList: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PaginatedResponse<LeaveRequest> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject'; leave: LeaveRequest } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getLeaveRequests({
        page: page + 1,
        per_page: rowsPerPage,
        status: statusFilter || undefined,
      });
      setData(result);
    } catch {
      setError('Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      if (confirmAction.type === 'approve') {
        await approveLeave(confirmAction.leave.id);
        setSuccess(`Leave request for ${confirmAction.leave.employee_name} approved.`);
      } else {
        await rejectLeave(confirmAction.leave.id);
        setSuccess(`Leave request for ${confirmAction.leave.employee_name} rejected.`);
      }
      loadData();
    } catch {
      setError(`Failed to ${confirmAction.type} leave request.`);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const pendingCount = data?.data.filter((l) => l.status === 'pending').length ?? 0;

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Leave Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage employee time off requests
            {pendingCount > 0 && (
              <Chip label={`${pendingCount} pending`} size="small" color="warning" sx={{ ml: 1 }} />
            )}
          </Typography>
        </Box>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} action={<Button onClick={loadData}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.map((leave) => (
                  <TableRow
                    key={leave.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/employees/${leave.employee_id}`)}
                  >
                    <TableCell>{leave.employee_name}</TableCell>
                    <TableCell>
                      <Chip label={leave.leave_type} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{formatDate(leave.start_date)}</TableCell>
                    <TableCell>{formatDate(leave.end_date)}</TableCell>
                    <TableCell>{leave.days}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {leave.reason || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={leave.status} />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      {leave.status === 'pending' && (
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => setConfirmAction({ type: 'approve', leave })}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setConfirmAction({ type: 'reject', leave })}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.data || data.data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No leave requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={data?.meta.total ?? 0}
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

      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.type === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
        message={
          confirmAction
            ? `Are you sure you want to ${confirmAction.type} the leave request for ${confirmAction.leave.employee_name}? (${confirmAction.leave.leave_type}, ${confirmAction.leave.days} days from ${formatDate(confirmAction.leave.start_date)} to ${formatDate(confirmAction.leave.end_date)})`
            : ''
        }
        confirmLabel={confirmAction?.type === 'approve' ? 'Approve' : 'Reject'}
        confirmColor={confirmAction?.type === 'approve' ? 'success' : 'error'}
        loading={actionLoading}
        onConfirm={handleAction}
        onCancel={() => setConfirmAction(null)}
      />
    </Stack>
  );
};
