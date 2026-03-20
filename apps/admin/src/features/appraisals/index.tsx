import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
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

import { getAppraisals, type Appraisal, type PaginatedResponse } from '@/api/api';

export const AppraisalList: React.FC = () => {
  const [data, setData] = useState<PaginatedResponse<Appraisal> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAppraisals({ page: page + 1, per_page: rowsPerPage });
      setData(result);
    } catch {
      setError('Failed to load appraisals.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const statusColor = (status: string): 'success' | 'default' | 'warning' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Appraisals
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Performance reviews and evaluations
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Appraisal
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
                  <TableCell>Reviewer</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.map((appraisal) => (
                  <TableRow key={appraisal.id} hover sx={{ cursor: 'pointer' }}>
                    <TableCell>{appraisal.employee_name}</TableCell>
                    <TableCell>{appraisal.reviewer_name}</TableCell>
                    <TableCell>
                      {new Date(appraisal.period_start).toLocaleDateString()} -{' '}
                      {new Date(appraisal.period_end).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {appraisal.overall_rating ? (
                        <Rating value={appraisal.overall_rating} readOnly size="small" max={5} />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={appraisal.status.replace('_', ' ')}
                        size="small"
                        color={statusColor(appraisal.status)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.data || data.data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No appraisals found
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
