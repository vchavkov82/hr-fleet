import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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

import { getPayrollRun, getPayrollRunPayslips, type Payslip, type PayrollRun } from '@/api/api';
import { FieldRow, Section, StatusChip } from '@/components/shared';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';

export const PayrollRunDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [run, setRun] = useState<PayrollRun | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [runData, payslipsData] = await Promise.all([
        getPayrollRun(id),
        getPayrollRunPayslips(id, { per_page: 100 }),
      ]);
      setRun(runData);
      setPayslips(payslipsData.data);
    } catch {
      setError('Failed to load payroll run details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!run) {
    return <Alert severity="error">{error || 'Payroll run not found'}</Alert>;
  }

  const totalGross = payslips.reduce((sum, ps) => sum + ps.gross_salary, 0);
  const totalNet = payslips.reduce((sum, ps) => sum + ps.net_salary, 0);

  return (
    <>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/payroll')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
          <PaymentsIcon fontSize="large" />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h5" fontWeight={700}>
              Payroll Run
            </Typography>
            <StatusChip status={run.status} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {formatDate(run.period_start)} — {formatDate(run.period_end)} · {run.employee_count} employees
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" startIcon={<DownloadIcon />}>
            Export
          </Button>
        </Stack>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Section title="Run Information" icon={<PaymentsIcon color="primary" fontSize="small" />}>
            <FieldRow label="Period" value={`${formatDate(run.period_start)} — ${formatDate(run.period_end)}`} />
            <FieldRow label="Status" value={<StatusChip status={run.status} />} />
            <FieldRow label="Employees" value={run.employee_count} />
            <FieldRow label="Created" value={formatDateTime(run.created_at)} />
          </Section>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              height: '100%',
              background: 'linear-gradient(145deg, rgba(16,185,129,0.08), rgba(6,95,70,0.12))',
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Gross
            </Typography>
            <Typography variant="h4" fontWeight={700} color="success.main">
              {formatCurrency(totalGross)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              From {payslips.length} payslips
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              height: '100%',
              background: 'linear-gradient(145deg, rgba(59,130,246,0.08), rgba(30,64,175,0.12))',
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Net
            </Typography>
            <Typography variant="h4" fontWeight={700} color="primary.main">
              {formatCurrency(totalNet)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Deductions: {formatCurrency(totalGross - totalNet)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Payslips Table */}
      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ReceiptLongIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={600}>
            Payslips ({payslips.length})
          </Typography>
        </Box>

        {payslips.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell align="right">Gross Salary</TableCell>
                  <TableCell align="right">Deductions</TableCell>
                  <TableCell align="right">Net Salary</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payslips.map((ps) => (
                  <TableRow
                    key={ps.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/employees/${ps.employee_id}`)}
                  >
                    <TableCell>
                      <Typography fontWeight={500}>{ps.employee_name}</Typography>
                    </TableCell>
                    <TableCell>
                      {formatDate(ps.period_start)} — {formatDate(ps.period_end)}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(ps.gross_salary)}</TableCell>
                    <TableCell align="right" sx={{ color: 'error.main' }}>
                      -{formatCurrency(ps.gross_salary - ps.net_salary)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>{formatCurrency(ps.net_salary)}</Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={ps.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary" variant="body2">
            No payslips generated yet.
          </Typography>
        )}
      </Paper>
    </>
  );
};
