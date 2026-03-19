import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  deleteDepartment,
  getDepartment,
  getDepartmentEmployees,
  type Department,
  type Employee,
} from '@/api/api';
import { ConfirmDialog, FieldRow, Section, StatusChip } from '@/components/shared';
import { formatDate } from '@/lib/format';

import { DepartmentForm } from './DepartmentForm';

export const DepartmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [department, setDepartment] = useState<Department | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadDepartment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [deptData, empData] = await Promise.all([getDepartment(id), getDepartmentEmployees(id, { per_page: 50 })]);
      setDepartment(deptData);
      setEmployees(empData.data);
    } catch {
      setError('Failed to load department details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDepartment();
  }, [loadDepartment]);

  const handleDelete = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await deleteDepartment(id);
      navigate('/departments');
    } catch {
      setError('Failed to delete department. It may have employees assigned.');
    } finally {
      setActionLoading(false);
      setDeleteOpen(false);
    }
  };

  const handleEditSuccess = () => {
    setEditOpen(false);
    setSuccess('Department updated successfully.');
    loadDepartment();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!department) {
    return <Alert severity="error">{error || 'Department not found'}</Alert>;
  }

  return (
    <>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/departments')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
          <BusinessIcon fontSize="large" />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h5" fontWeight={700}>
              {department.name}
            </Typography>
            <Chip label={department.code} size="small" variant="outlined" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {department.employee_count} employee{department.employee_count !== 1 ? 's' : ''}
            {department.manager_name && ` · Manager: ${department.manager_name}`}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteOpen(true)}
            disabled={department.employee_count > 0}
          >
            Delete
          </Button>
        </Stack>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Info Section */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Section title="Department Information" icon={<BusinessIcon color="primary" fontSize="small" />}>
            <FieldRow label="Name" value={department.name} />
            <FieldRow label="Code" value={department.code} mono />
            <FieldRow label="Manager" value={department.manager_name} />
            <FieldRow label="Employee Count" value={department.employee_count} />
          </Section>
        </Grid>
      </Grid>

      {/* Employees Table */}
      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <GroupIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={600}>
            Employees ({employees.length})
          </Typography>
        </Box>

        {employees.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee #</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Job Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Hire Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow
                    key={emp.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/employees/${emp.id}`)}
                  >
                    <TableCell>{emp.employee_number}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                          {emp.first_name?.[0]}
                          {emp.last_name?.[0]}
                        </Avatar>
                        {emp.first_name} {emp.last_name}
                        {department.manager_id === emp.id && (
                          <Chip icon={<PersonIcon />} label="Manager" size="small" color="primary" variant="outlined" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.job_title}</TableCell>
                    <TableCell>
                      <StatusChip status={emp.status} />
                    </TableCell>
                    <TableCell>{formatDate(emp.hire_date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary" variant="body2">
            No employees assigned to this department.
          </Typography>
        )}
      </Paper>

      {/* Dialogs */}
      <DepartmentForm
        open={editOpen}
        department={department}
        onClose={() => setEditOpen(false)}
        onSuccess={handleEditSuccess}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Department"
        message={`Are you sure you want to delete "${department.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
};
