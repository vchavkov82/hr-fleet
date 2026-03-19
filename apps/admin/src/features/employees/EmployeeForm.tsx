import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import React, { useEffect, useState } from 'react';

import { createEmployee, getDepartments, updateEmployee, type Department, type Employee } from '@/api/api';

interface EmployeeFormProps {
  open: boolean;
  employee?: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  department_id: string;
  work_phone: string;
  hire_date: string;
  status: 'active' | 'inactive' | 'terminated';
}

const initialFormData: FormData = {
  first_name: '',
  last_name: '',
  email: '',
  job_title: '',
  department_id: '',
  work_phone: '',
  hire_date: new Date().toISOString().split('T')[0],
  status: 'active',
};

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ open, employee, onClose, onSuccess }) => {
  const isEdit = !!employee;
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      getDepartments({ per_page: 100 })
        .then((res) => setDepartments(res.data))
        .catch(() => setDepartments([]));

      if (employee) {
        setFormData({
          first_name: employee.first_name || '',
          last_name: employee.last_name || '',
          email: employee.email || '',
          job_title: employee.job_title || '',
          department_id: employee.department_id || '',
          work_phone: employee.work_phone || '',
          hire_date: employee.hire_date?.split('T')[0] || '',
          status: employee.status || 'active',
        });
      } else {
        setFormData(initialFormData);
      }
      setError(null);
    }
  }, [open, employee]);

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isEdit && employee) {
        await updateEmployee(employee.id, formData);
      } else {
        await createEmployee(formData);
      }
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save employee';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isValid = formData.first_name && formData.last_name && formData.email && formData.job_title;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="First Name"
              value={formData.first_name}
              onChange={handleChange('first_name')}
              fullWidth
              required
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Last Name"
              value={formData.last_name}
              onChange={handleChange('last_name')}
              fullWidth
              required
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              fullWidth
              required
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Job Title"
              value={formData.job_title}
              onChange={handleChange('job_title')}
              fullWidth
              required
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.department_id}
                label="Department"
                onChange={(e) => setFormData((prev) => ({ ...prev, department_id: e.target.value }))}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Work Phone"
              value={formData.work_phone}
              onChange={handleChange('work_phone')}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Hire Date"
              type="date"
              value={formData.hire_date}
              onChange={handleChange('hire_date')}
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as FormData['status'],
                  }))
                }
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="terminated">Terminated</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || !isValid}>
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
