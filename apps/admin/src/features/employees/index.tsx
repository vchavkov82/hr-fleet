import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getEmployees, type Employee, type PaginatedResponse } from '@/api/api';
import { StatusChip } from '@/components/shared';
import { formatDate } from '@/lib/format';

import { EmployeeForm } from './EmployeeForm';

export { EmployeeDetail } from './EmployeeDetail';
export { EmployeeForm } from './EmployeeForm';

export const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PaginatedResponse<Employee> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getEmployees({
        page: page + 1,
        per_page: rowsPerPage,
        search: search || undefined,
      });
      setData(result);
    } catch {
      setError('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRowClick = (employee: Employee) => {
    navigate(`/employees/${employee.id}`);
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
            Employees
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your workforce
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
          Add Employee
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <TextField
          placeholder="Search employees..."
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
          sx={{ minWidth: 300 }}
        />
      </Paper>

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
                  <TableCell>Employee #</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Job Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Hire Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.map((employee) => (
                  <TableRow
                    key={employee.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleRowClick(employee)}
                  >
                    <TableCell>{employee.employee_number}</TableCell>
                    <TableCell>
                      {employee.first_name} {employee.last_name}
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.department_name ?? '-'}</TableCell>
                    <TableCell>{employee.job_title}</TableCell>
                    <TableCell>
                      <StatusChip status={employee.status} />
                    </TableCell>
                    <TableCell>{formatDate(employee.hire_date)}</TableCell>
                  </TableRow>
                ))}
                {(!data?.data || data.data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No employees found
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

      <EmployeeForm open={addOpen} onClose={() => setAddOpen(false)} onSuccess={handleAddSuccess} />
    </Stack>
  );
};
