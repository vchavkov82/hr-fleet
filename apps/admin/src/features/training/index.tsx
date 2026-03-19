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

import { getCourses, type Course, type PaginatedResponse } from '@/api/api';

export const TrainingList: React.FC = () => {
  const [data, setData] = useState<PaginatedResponse<Course> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCourses({ page: page + 1, per_page: rowsPerPage });
      setData(result);
    } catch {
      setError('Failed to load training courses.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Training
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Learning and development courses
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Course
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
                  <TableCell>Course Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Instructor</TableCell>
                  <TableCell>Enrolled</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.map((course) => (
                  <TableRow key={course.id} hover sx={{ cursor: 'pointer' }}>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{course.description ?? '-'}</TableCell>
                    <TableCell>{course.duration_hours}h</TableCell>
                    <TableCell>{course.instructor ?? '-'}</TableCell>
                    <TableCell>{course.enrolled_count}</TableCell>
                    <TableCell>
                      <Chip
                        label={course.status}
                        size="small"
                        color={course.status === 'active' ? 'success' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.data || data.data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No courses found
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
