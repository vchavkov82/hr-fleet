import AddIcon from '@mui/icons-material/Add';
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
import { useNavigate } from 'react-router-dom';

import { getPayrollRuns, type PayrollRun, type PaginatedResponse } from '@/api/api';
import { StatusChip } from '@/components/shared';
import { formatCurrency, formatDate } from '@/lib/format';

export { PayrollRunDetail } from './PayrollRunDetail';

export const PayrollList: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PaginatedResponse<PayrollRun> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPayrollRuns({ page: page + 1, per_page: rowsPerPage });
      setData(result);
    } catch {
      setError('Failed to load payroll runs.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRowClick = (run: PayrollRun) => {
    navigate(`/payroll/${run.id}`);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Payroll
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Payroll run management
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Run Payroll
        </Button>
      </Stack>

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
                  <TableCell>Period</TableCell>
                  <TableCell>Employees</TableCell>
                  <TableCell align="right">Gross Total</TableCell>
                  <TableCell align="right">Net Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.map((run) => (
                  <TableRow key={run.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleRowClick(run)}>
                    <TableCell>
                      <Typography fontWeight={500}>
                        {formatDate(run.period_start)} — {formatDate(run.period_end)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={run.employee_count} size="small" />
                    </TableCell>
                    <TableCell align="right">{formatCurrency(run.total_gross)}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>{formatCurrency(run.total_net)}</Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={run.status} />
                    </TableCell>
                    <TableCell>{formatDate(run.created_at)}</TableCell>
                  </TableRow>
                ))}
                {(!data?.data || data.data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No payroll runs found
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
