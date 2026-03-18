import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupIcon from '@mui/icons-material/Group';
import PaymentsIcon from '@mui/icons-material/Payments';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getDashboardStats, type DashboardStats } from '@/api/api';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch {
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={loadStats}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const toneStyles: Record<
    string,
    {
      background: string;
      border: string;
      iconBg: string;
      chipColor?: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'success';
    }
  > = {
    teal: {
      background: 'linear-gradient(145deg, rgba(45,212,191,0.16), rgba(6,95,88,0.24))',
      border: 'rgba(45,212,191,0.35)',
      iconBg: 'rgba(45,212,191,0.18)',
      chipColor: 'success',
    },
    amber: {
      background: 'linear-gradient(145deg, rgba(249,115,22,0.16), rgba(120,53,15,0.18))',
      border: 'rgba(249,115,22,0.35)',
      iconBg: 'rgba(249,115,22,0.16)',
      chipColor: 'warning',
    },
    indigo: {
      background: 'linear-gradient(145deg, rgba(99,102,241,0.18), rgba(49,46,129,0.2))',
      border: 'rgba(99,102,241,0.28)',
      iconBg: 'rgba(99,102,241,0.16)',
      chipColor: 'primary',
    },
    slate: {
      background: 'linear-gradient(145deg, rgba(148,163,184,0.12), rgba(15,23,42,0.35))',
      border: 'rgba(148,163,184,0.25)',
      iconBg: 'rgba(148,163,184,0.14)',
    },
  };

  const cards = [
    {
      label: 'Active Employees',
      value: stats?.active_employees ?? 0,
      icon: <GroupIcon sx={{ fontSize: 28 }} />,
      path: '/employees?status=active',
      tone: 'teal',
      badge: 'Active',
    },
    {
      label: 'Total Employees',
      value: stats?.total_employees ?? 0,
      icon: <GroupIcon sx={{ fontSize: 28 }} />,
      path: '/employees',
      tone: 'indigo',
      badge: 'All',
    },
    {
      label: 'Pending Leaves',
      value: stats?.pending_leaves ?? 0,
      icon: <CalendarMonthIcon sx={{ fontSize: 28 }} />,
      path: '/leave?status=pending',
      tone: 'amber',
      badge: 'Review',
    },
    {
      label: 'Contracts',
      value: stats?.expiring_contracts ?? 0,
      icon: <DescriptionIcon sx={{ fontSize: 28 }} />,
      path: '/contracts',
      tone: 'slate',
      badge: 'Records',
    },
  ];

  const quickActions = [
    { label: 'Add Employee', icon: <GroupIcon />, path: '/employees' },
    { label: 'Leave Requests', icon: <CalendarMonthIcon />, path: '/leave' },
    { label: 'Run Payroll', icon: <PaymentsIcon />, path: '/payroll' },
    { label: 'Timesheets', icon: <AccessTimeIcon />, path: '/timesheets' },
  ];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of your HR operations
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {cards.map((card) => {
          const tone = toneStyles[card.tone] ?? toneStyles.teal;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
              <Paper
                sx={{
                  p: 2.5,
                  height: '100%',
                  cursor: card.path ? 'pointer' : 'default',
                  transition: 'all 0.25s ease',
                  background: tone.background,
                  borderColor: tone.border,
                  boxShadow: '0 24px 48px rgba(0,0,0,0.38)',
                  '&:hover': card.path
                    ? {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 32px 64px rgba(0,0,0,0.48)',
                      }
                    : {},
                }}
                onClick={() => card.path && navigate(card.path)}
              >
                <Stack spacing={1.25} alignItems="flex-start">
                  <Stack direction="row" alignItems="center" spacing={1.2} sx={{ width: '100%' }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        display: 'grid',
                        placeItems: 'center',
                        background: tone.iconBg,
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Chip
                      label={card.badge}
                      size="small"
                      color={tone.chipColor}
                      variant={tone.chipColor ? 'filled' : 'outlined'}
                      sx={{ ml: 'auto', fontWeight: 600 }}
                    />
                  </Stack>
                  <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1 }}>
                    {card.value.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.label}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={action.label}>
              <Paper
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  },
                }}
                onClick={() => navigate(action.path)}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'primary.main',
                      color: 'white',
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography fontWeight={500}>{action.label}</Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  );
};
