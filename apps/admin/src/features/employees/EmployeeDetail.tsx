import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PaymentsIcon from '@mui/icons-material/Payments';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  deleteEmployee,
  getEmployee,
  getEmployeeContracts,
  getEmployeeLeaves,
  getEmployeePayslips,
  getEmployeeTimesheets,
  type Contract,
  type Employee,
  type LeaveRequest,
  type Payslip,
  type Timesheet,
} from '@/api/api';
import { ConfirmDialog, FieldRow, Section, StatusChip } from '@/components/shared';
import { formatCurrency, formatDate } from '@/lib/format';

import { EmployeeForm } from './EmployeeForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ py: 2 }}>
      {value === index && children}
    </Box>
  );
}

export const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadEmployee = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployee(id);
      setEmployee(data);
    } catch {
      setError('Failed to load employee details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadRelatedData = useCallback(async () => {
    if (!id) return;
    setRelatedLoading(true);
    try {
      const [contractsRes, leavesRes, timesheetsRes, payslipsRes] = await Promise.all([
        getEmployeeContracts(id),
        getEmployeeLeaves(id),
        getEmployeeTimesheets(id),
        getEmployeePayslips(id),
      ]);
      setContracts(contractsRes.data);
      setLeaves(leavesRes.data);
      setTimesheets(timesheetsRes.data);
      setPayslips(payslipsRes.data);
    } catch {
      // Silently fail for related data
    } finally {
      setRelatedLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEmployee();
    loadRelatedData();
  }, [loadEmployee, loadRelatedData]);

  const handleDelete = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await deleteEmployee(id);
      navigate('/employees');
    } catch {
      setError('Failed to delete employee.');
    } finally {
      setActionLoading(false);
      setDeleteOpen(false);
    }
  };

  const handleEditSuccess = () => {
    setEditOpen(false);
    setSuccess('Employee updated successfully.');
    loadEmployee();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!employee) {
    return <Alert severity="error">{error || 'Employee not found'}</Alert>;
  }

  const initials = `${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`.toUpperCase();

  return (
    <>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/employees')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.25rem', fontWeight: 700 }}>
          {initials}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h5" fontWeight={700}>
              {employee.first_name} {employee.last_name}
            </Typography>
            <StatusChip status={employee.status} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {employee.employee_number} · {employee.job_title}
            {employee.department_name && ` · ${employee.department_name}`}
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

      {/* Main Content Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Section title="Personal Information" icon={<PersonIcon color="primary" fontSize="small" />}>
            <FieldRow label="First Name" value={employee.first_name} />
            <FieldRow label="Last Name" value={employee.last_name} />
            <FieldRow label="Employee #" value={employee.employee_number} mono />
            <FieldRow
              label="Email"
              value={
                employee.email ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <a href={`mailto:${employee.email}`}>{employee.email}</a>
                  </Box>
                ) : null
              }
            />
            <FieldRow
              label="Phone"
              value={
                employee.work_phone ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <a href={`tel:${employee.work_phone}`}>{employee.work_phone}</a>
                  </Box>
                ) : null
              }
            />
          </Section>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Section title="Employment" icon={<WorkIcon color="primary" fontSize="small" />}>
            <FieldRow label="Job Title" value={employee.job_title} />
            <FieldRow label="Department" value={employee.department_name} />
            <FieldRow label="Status" value={<StatusChip status={employee.status} />} />
            <FieldRow label="Hire Date" value={formatDate(employee.hire_date)} />
          </Section>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab icon={<DescriptionIcon />} iconPosition="start" label={`Contracts (${contracts.length})`} />
        <Tab icon={<CalendarMonthIcon />} iconPosition="start" label={`Leave (${leaves.length})`} />
        <Tab icon={<BadgeIcon />} iconPosition="start" label={`Timesheets (${timesheets.length})`} />
        <Tab icon={<PaymentsIcon />} iconPosition="start" label={`Payslips (${payslips.length})`} />
      </Tabs>

      {relatedLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          <TabPanel value={activeTab} index={0}>
            <ContractsTable contracts={contracts} />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <LeaveTable leaves={leaves} />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <TimesheetsTable timesheets={timesheets} />
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <PayslipsTable payslips={payslips} />
          </TabPanel>
        </>
      )}

      {/* Dialogs */}
      <EmployeeForm
        open={editOpen}
        employee={employee}
        onClose={() => setEditOpen(false)}
        onSuccess={handleEditSuccess}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Employee"
        message={`Are you sure you want to delete ${employee.first_name} ${employee.last_name}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
};

function ContractsTable({ contracts }: { contracts: Contract[] }) {
  if (contracts.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        No contracts found.
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Salary</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow key={contract.id} hover>
              <TableCell>{contract.contract_type}</TableCell>
              <TableCell>{formatDate(contract.start_date)}</TableCell>
              <TableCell>{contract.end_date ? formatDate(contract.end_date) : 'Ongoing'}</TableCell>
              <TableCell>{formatCurrency(contract.salary, contract.currency)}</TableCell>
              <TableCell>
                <StatusChip status={contract.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function LeaveTable({ leaves }: { leaves: LeaveRequest[] }) {
  if (leaves.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        No leave requests found.
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Days</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Reason</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leaves.map((leave) => (
            <TableRow key={leave.id} hover>
              <TableCell>
                <Chip label={leave.leave_type} size="small" variant="outlined" />
              </TableCell>
              <TableCell>{formatDate(leave.start_date)}</TableCell>
              <TableCell>{formatDate(leave.end_date)}</TableCell>
              <TableCell>{leave.days}</TableCell>
              <TableCell>
                <StatusChip status={leave.status} />
              </TableCell>
              <TableCell>
                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                  {leave.reason || '-'}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function TimesheetsTable({ timesheets }: { timesheets: Timesheet[] }) {
  if (timesheets.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        No timesheets found.
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Week</TableCell>
            <TableCell>Total Hours</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {timesheets.map((ts) => (
            <TableRow key={ts.id} hover>
              <TableCell>
                {formatDate(ts.week_start)} — {formatDate(ts.week_end)}
              </TableCell>
              <TableCell>{ts.total_hours}h</TableCell>
              <TableCell>
                <StatusChip status={ts.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function PayslipsTable({ payslips }: { payslips: Payslip[] }) {
  if (payslips.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        No payslips found.
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Period</TableCell>
            <TableCell>Gross</TableCell>
            <TableCell>Net</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payslips.map((ps) => (
            <TableRow key={ps.id} hover>
              <TableCell>
                {formatDate(ps.period_start)} — {formatDate(ps.period_end)}
              </TableCell>
              <TableCell>{formatCurrency(ps.gross_salary)}</TableCell>
              <TableCell>{formatCurrency(ps.net_salary)}</TableCell>
              <TableCell>
                <StatusChip status={ps.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
