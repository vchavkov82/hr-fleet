import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DownloadIcon from '@mui/icons-material/Download';
import GroupIcon from '@mui/icons-material/Group';
import PaymentsIcon from '@mui/icons-material/Payments';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCurrency } from '@/lib/format';

const PAYROLL_DATA = [
  { month: 'Jan', gross: 125000, net: 95000, tax: 30000 },
  { month: 'Feb', gross: 128000, net: 97000, tax: 31000 },
  { month: 'Mar', gross: 132000, net: 100000, tax: 32000 },
  { month: 'Apr', gross: 135000, net: 102000, tax: 33000 },
  { month: 'May', gross: 140000, net: 106000, tax: 34000 },
  { month: 'Jun', gross: 145000, net: 110000, tax: 35000 },
];

const HEADCOUNT_DATA = [
  { month: 'Jan', total: 45, new_hires: 3, departures: 1 },
  { month: 'Feb', total: 47, new_hires: 4, departures: 2 },
  { month: 'Mar', total: 49, new_hires: 3, departures: 1 },
  { month: 'Apr', total: 52, new_hires: 5, departures: 2 },
  { month: 'May', total: 55, new_hires: 4, departures: 1 },
  { month: 'Jun', total: 58, new_hires: 4, departures: 1 },
];

const DEPARTMENT_DATA = [
  { name: 'Engineering', value: 25, color: '#3B82F6' },
  { name: 'Sales', value: 12, color: '#10B981' },
  { name: 'Marketing', value: 8, color: '#F59E0B' },
  { name: 'HR', value: 5, color: '#EF4444' },
  { name: 'Finance', value: 4, color: '#8B5CF6' },
  { name: 'Operations', value: 4, color: '#EC4899' },
];

const LEAVE_DATA = [
  { type: 'Annual', used: 120, remaining: 80, total: 200 },
  { type: 'Sick', used: 45, remaining: 155, total: 200 },
  { type: 'Personal', used: 25, remaining: 75, total: 100 },
  { type: 'Parental', used: 30, remaining: 70, total: 100 },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ py: 3 }}>
      {value === index && children}
    </Box>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, value, change, icon, color }: MetricCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        height: '100%',
        background: `linear-gradient(145deg, ${color}15, ${color}08)`,
        borderColor: `${color}30`,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
          {change !== undefined && (
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
              {change >= 0 ? (
                <TrendingUpIcon fontSize="small" sx={{ color: 'success.main' }} />
              ) : (
                <TrendingDownIcon fontSize="small" sx={{ color: 'error.main' }} />
              )}
              <Typography variant="body2" color={change >= 0 ? 'success.main' : 'error.main'}>
                {change >= 0 ? '+' : ''}
                {change}% vs last month
              </Typography>
            </Stack>
          )}
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 12,
            bgcolor: color,
            display: 'grid',
            placeItems: 'center',
            color: 'white',
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

export const ReportsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [period, setPeriod] = useState('6m');

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Reports & Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            HR metrics and insights
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select value={period} label="Period" onChange={(e) => setPeriod(e.target.value)}>
              <MenuItem value="1m">Last Month</MenuItem>
              <MenuItem value="3m">Last 3 Months</MenuItem>
              <MenuItem value="6m">Last 6 Months</MenuItem>
              <MenuItem value="1y">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export
          </Button>
        </Stack>
      </Stack>

      {/* KPI Cards */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Total Employees"
            value={58}
            change={5.5}
            icon={<GroupIcon />}
            color="#3B82F6"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Payroll This Month"
            value={formatCurrency(145000)}
            change={3.6}
            icon={<PaymentsIcon />}
            color="#10B981"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Pending Leaves"
            value={8}
            change={-12}
            icon={<CalendarMonthIcon />}
            color="#F59E0B"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Avg. Tenure"
            value="2.4 years"
            icon={<GroupIcon />}
            color="#8B5CF6"
          />
        </Grid>
      </Grid>

      <Paper sx={{ px: 2 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Payroll Trends" />
          <Tab label="Headcount" />
          <Tab label="Department Distribution" />
          <Tab label="Leave Analysis" />
        </Tabs>
      </Paper>

      {/* Payroll Trends */}
      <TabPanel value={activeTab} index={0}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Payroll Trends
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monthly gross, net, and tax breakdown
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Chip icon={<Box sx={{ width: 12, height: 12, borderRadius: 6, bgcolor: '#3B82F6' }} />} label="Gross" size="small" variant="outlined" />
              <Chip icon={<Box sx={{ width: 12, height: 12, borderRadius: 6, bgcolor: '#10B981' }} />} label="Net" size="small" variant="outlined" />
              <Chip icon={<Box sx={{ width: 12, height: 12, borderRadius: 6, bgcolor: '#EF4444' }} />} label="Tax" size="small" variant="outlined" />
            </Stack>
          </Stack>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={PAYROLL_DATA}>
              <defs>
                <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Area type="monotone" dataKey="gross" stroke="#3B82F6" fill="url(#colorGross)" strokeWidth={2} />
              <Area type="monotone" dataKey="net" stroke="#10B981" fill="url(#colorNet)" strokeWidth={2} />
              <Area type="monotone" dataKey="tax" stroke="#EF4444" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </TabPanel>

      {/* Headcount */}
      <TabPanel value={activeTab} index={1}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Headcount Trends
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total employees, new hires, and departures
            </Typography>
          </Box>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={HEADCOUNT_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Legend />
              <Bar dataKey="total" name="Total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="new_hires" name="New Hires" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="departures" name="Departures" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </TabPanel>

      {/* Department Distribution */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Employees by Department
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current distribution
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={DEPARTMENT_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {DEPARTMENT_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Department Breakdown
                </Typography>
              </Box>
              <Stack spacing={2}>
                {DEPARTMENT_DATA.map((dept) => (
                  <Box key={dept.name}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="body2">{dept.name}</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {dept.value} employees
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'grey.100',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${(dept.value / 58) * 100}%`,
                          bgcolor: dept.color,
                          borderRadius: 4,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Leave Analysis */}
      <TabPanel value={activeTab} index={3}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Leave Utilization
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Days used vs remaining by leave type
            </Typography>
          </Box>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={LEAVE_DATA} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="type" type="category" stroke="#9ca3af" width={80} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Legend />
              <Bar dataKey="used" name="Used" fill="#EF4444" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="remaining" name="Remaining" fill="#10B981" stackId="a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </TabPanel>
    </Stack>
  );
};
