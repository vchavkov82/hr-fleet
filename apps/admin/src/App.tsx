import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React, { lazy } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';

import { LoginPage } from './auth/LoginPage';
import { RequireAuth } from './auth/RequireAuth';
import { AdminLayout } from './layout/AdminLayout';

const Dashboard = lazy(() => import('./features/dashboard').then((m) => ({ default: m.Dashboard })));
const EmployeeList = lazy(() => import('./features/employees').then((m) => ({ default: m.EmployeeList })));
const EmployeeDetail = lazy(() => import('./features/employees').then((m) => ({ default: m.EmployeeDetail })));
const DepartmentList = lazy(() => import('./features/departments').then((m) => ({ default: m.DepartmentList })));
const DepartmentDetail = lazy(() => import('./features/departments').then((m) => ({ default: m.DepartmentDetail })));
const ContractList = lazy(() => import('./features/contracts').then((m) => ({ default: m.ContractList })));
const LeaveList = lazy(() => import('./features/leave').then((m) => ({ default: m.LeaveList })));
const TimesheetList = lazy(() => import('./features/timesheets').then((m) => ({ default: m.TimesheetList })));
const AttendanceList = lazy(() => import('./features/attendance').then((m) => ({ default: m.AttendanceList })));
const PayrollList = lazy(() => import('./features/payroll').then((m) => ({ default: m.PayrollList })));
const PayrollRunDetail = lazy(() => import('./features/payroll').then((m) => ({ default: m.PayrollRunDetail })));
const PayslipList = lazy(() => import('./features/payslips').then((m) => ({ default: m.PayslipList })));
const ExpenseList = lazy(() => import('./features/expenses').then((m) => ({ default: m.ExpenseList })));
const AppraisalList = lazy(() => import('./features/appraisals').then((m) => ({ default: m.AppraisalList })));
const TrainingList = lazy(() => import('./features/training').then((m) => ({ default: m.TrainingList })));
const ReportsDashboard = lazy(() => import('./features/reports').then((m) => ({ default: m.ReportsDashboard })));
const UserList = lazy(() => import('./features/users').then((m) => ({ default: m.UserList })));
const AuditLog = lazy(() => import('./features/audit-log').then((m) => ({ default: m.AuditLog })));
const Settings = lazy(() => import('./features/settings').then((m) => ({ default: m.Settings })));

const NotFound: React.FC = () => (
  <Box sx={{ textAlign: 'center', mt: 10 }}>
    <Typography variant="h3" fontWeight={700} gutterBottom>
      404
    </Typography>
    <Typography variant="h6" color="text.secondary" gutterBottom>
      Page not found
    </Typography>
    <Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>
      Go to Dashboard
    </Button>
  </Box>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/departments" element={<DepartmentList />} />
          <Route path="/departments/:id" element={<DepartmentDetail />} />
          <Route path="/contracts" element={<ContractList />} />
          <Route path="/leave" element={<LeaveList />} />
          <Route path="/timesheets" element={<TimesheetList />} />
          <Route path="/attendance" element={<AttendanceList />} />
          <Route path="/payroll" element={<PayrollList />} />
          <Route path="/payroll/:id" element={<PayrollRunDetail />} />
          <Route path="/payslips" element={<PayslipList />} />
          <Route path="/expenses" element={<ExpenseList />} />
          <Route path="/appraisals" element={<AppraisalList />} />
          <Route path="/training" element={<TrainingList />} />
          <Route path="/reports" element={<ReportsDashboard />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/audit-log" element={<AuditLog />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
