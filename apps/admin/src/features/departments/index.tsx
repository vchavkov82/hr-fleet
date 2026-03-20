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

import { getDepartments, type Department, type PaginatedResponse } from '@/api/api';

import { DepartmentForm } from './DepartmentForm';

export { DepartmentDetail } from './DepartmentDetail';
export { DepartmentForm } from './DepartmentForm';

export const DepartmentList: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PaginatedResponse<Department> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [addOpen, setAddOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDepartments({ page: page + 1, per_page: rowsPerPage });
      setData(result);
    } catch {
      setError('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRowClick = (dept: Department) => {
    navigate(`/departments/${dept.id}`);
  };

  const handleAddSuccess = () => {
    setAddOpen(false);
    loadData();
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Departments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organizational structure
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
          Add Department
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
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Manager</TableCell>
                  <TableCell>Employees</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.map((dept) => (
                  <TableRow key={dept.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleRowClick(dept)}>
                    <TableCell>
                      <Chip label={dept.code} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>{dept.name}</Typography>
                    </TableCell>
                    <TableCell>{dept.manager_name ?? '-'}</TableCell>
                    <TableCell>
                      <Chip label={dept.employee_count} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.data || data.data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No departments found
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

      <DepartmentForm open={addOpen} onClose={() => setAddOpen(false)} onSuccess={handleAddSuccess} />
    </Stack>
  );
};
