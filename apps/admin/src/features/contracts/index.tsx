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

import { getContracts, type Contract, type PaginatedResponse } from '@/api/api';

export const ContractList: React.FC = () => {
  const [data, setData] = useState<PaginatedResponse<Contract> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getContracts({ page: page + 1, per_page: rowsPerPage });
      setData(result);
    } catch {
      setError('Failed to load contracts.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const statusColor = (status: string): 'success' | 'default' | 'error' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
      case 'terminated':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Contracts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Employment contracts management
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Contract
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
                  <TableCell>Employee</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Salary</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.map((contract) => (
                  <TableRow key={contract.id} hover sx={{ cursor: 'pointer' }}>
                    <TableCell>{contract.employee_name}</TableCell>
                    <TableCell>{contract.contract_type}</TableCell>
                    <TableCell>{new Date(contract.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {contract.end_date ? new Date(contract.end_date).toLocaleDateString() : 'Indefinite'}
                    </TableCell>
                    <TableCell>
                      {contract.salary.toLocaleString()} {contract.currency}
                    </TableCell>
                    <TableCell>
                      <Chip label={contract.status} size="small" color={statusColor(contract.status)} />
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.data || data.data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No contracts found
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
