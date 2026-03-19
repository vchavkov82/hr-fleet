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

import { getExpenses, approveExpense, rejectExpense, type Expense, type PaginatedResponse } from '@/api/api';

export const ExpenseList: React.FC = () => {
  const [data, setData] = useState<PaginatedResponse<Expense> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getExpenses({ page: page + 1, per_page: rowsPerPage });
      setData(result);
    } catch {
      setError('Failed to load expenses.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (id: string) => {
    try {
      await approveExpense(id);
      loadData();
    } catch {
      setError('Failed to approve expense.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectExpense(id);
      loadData();
    } catch {
      setError('Failed to reject expense.');
    }
  };

  const statusColor = (status: string): 'success' | 'default' | 'error' | 'warning' => {
    switch (status) {
      case 'approved':
      case 'reimbursed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Expenses
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Employee expense claims
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
                  <TableCell>Category</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.map((expense) => (
                  <TableRow key={expense.id} hover>
                    <TableCell>{expense.employee_name}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>
                      {expense.amount.toLocaleString()} {expense.currency}
                    </TableCell>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell>{expense.description ?? '-'}</TableCell>
                    <TableCell>
                      <Chip label={expense.status} size="small" color={statusColor(expense.status)} />
                    </TableCell>
                    <TableCell>
                      {expense.status === 'pending' && (
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Approve">
                            <IconButton size="small" color="success" onClick={() => handleApprove(expense.id)}>
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" color="error" onClick={() => handleReject(expense.id)}>
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
                      No expenses found
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
