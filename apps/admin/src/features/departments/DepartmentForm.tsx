import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import React, { useEffect, useState } from 'react';

import { createDepartment, updateDepartment, type Department } from '@/api/api';

interface DepartmentFormProps {
  open: boolean;
  department?: Department | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  code: string;
}

const initialFormData: FormData = {
  name: '',
  code: '',
};

export const DepartmentForm: React.FC<DepartmentFormProps> = ({ open, department, onClose, onSuccess }) => {
  const isEdit = !!department;
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (department) {
        setFormData({
          name: department.name || '',
          code: department.code || '',
        });
      } else {
        setFormData(initialFormData);
      }
      setError(null);
    }
  }, [open, department]);

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isEdit && department) {
        await updateDepartment(department.id, formData);
      } else {
        await createDepartment(formData);
      }
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save department';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isValid = formData.name && formData.code;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Department' : 'Add Department'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Department Name"
              value={formData.name}
              onChange={handleChange('name')}
              fullWidth
              required
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Code"
              value={formData.code}
              onChange={handleChange('code')}
              fullWidth
              required
              size="small"
              placeholder="e.g., ENG, HR, FIN"
            />
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
