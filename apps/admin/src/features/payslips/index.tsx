import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useState } from 'react';

import { getPayslips, type Payslip, type PaginatedResponse } from '@/api/api';

export const PayslipList: React.FC = () => {
  const [data, setData] = useState<PaginatedResponse<Payslip> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPayslips({ page: page + 1, per_page: rowsPerPage });
      setData(result);
    } catch {
      setError('Failed to load payslips.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const statusColor = (status: string): 'success' | 'default' | 'warning' => {
    switch (status) {
      case 'viewed':
        return 'success';
      case 'sent':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Payslips
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Employee pay statements
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
                  <TableCell>Period</TableCell>
                  <TableCell>Gross Salary</TableCell>
                  <TableCell>Net Salary</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.map((payslip) => (
                  <TableRow key={payslip.id} hover sx={{ cursor: 'pointer' }}>
                    <TableCell>{payslip.employee_name}</TableCell>
                    <TableCell>
                      {new Date(payslip.period_start).toLocaleDateString()} -{' '}
                      {new Date(payslip.period_end).toLocaleDateString()}
                    </TableCell>
                    <TableCell>${payslip.gross_salary.toLocaleString()}</TableCell>
                    <TableCell>${payslip.net_salary.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip label={payslip.status} size="small" color={statusColor(payslip.status)} />
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.data || data.data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No payslips found
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
    </Stack>
  );
};
