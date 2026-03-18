import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
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

import {
  getLeaveRequests,
  approveLeave,
  rejectLeave,
  type LeaveRequest,
  type PaginatedResponse,
} from '@/api/api';

export const LeaveList: React.FC = () => {
  const [data, setData] = useState<PaginatedResponse<LeaveRequest> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getLeaveRequests({ page: page + 1, per_page: rowsPerPage });
      setData(result);
    } catch {
      setError('Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (id: string) => {
    try {
      await approveLeave(id);
      loadData();
    } catch {
      setError('Failed to approve leave request.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectLeave(id);
      loadData();
    } catch {
      setError('Failed to reject leave request.');
    }
  };

  const statusColor = (
    status: string,
  ): 'success' | 'default' | 'error' | 'warning' => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Leave Requests
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage employee time off requests
        </Typography>
      </Box>

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
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.map((leave) => (
                  <TableRow key={leave.id} hover>
                    <TableCell>{leave.employee_name}</TableCell>
                    <TableCell>{leave.leave_type}</TableCell>
                    <TableCell>{new Date(leave.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(leave.end_date).toLocaleDateString()}</TableCell>
                    <TableCell>{leave.days}</TableCell>
                    <TableCell>
                      <Chip label={leave.status} size="small" color={statusColor(leave.status)} />
                    </TableCell>
                    <TableCell>
                      {leave.status === 'pending' && (
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApprove(leave.id)}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleReject(leave.id)}
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
                    <TableCell colSpan={7} align="center">
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
    </Stack>
  );
};
