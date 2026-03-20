import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import GroupIcon from '@mui/icons-material/Group';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SchoolIcon from '@mui/icons-material/School';
import SettingsIcon from '@mui/icons-material/Settings';
import StarIcon from '@mui/icons-material/Star';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

import { useAuth } from '../auth/useAuth';
import { useColorMode } from '../theme/ColorMode';

const DRAWER_WIDTH = 240;

const navSections = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', path: '/', icon: <DashboardIcon /> }],
  },
  {
    title: 'People',
    items: [
      { label: 'Employees', path: '/employees', icon: <GroupIcon />, permission: 'employees:read' },
      { label: 'Departments', path: '/departments', icon: <BusinessIcon />, permission: 'employees:read' },
      { label: 'Contracts', path: '/contracts', icon: <DescriptionIcon />, permission: 'employees:read' },
    ],
  },
  {
    title: 'Time & Attendance',
    items: [
      { label: 'Leave', path: '/leave', icon: <CalendarMonthIcon />, permission: 'employees:read' },
      { label: 'Timesheets', path: '/timesheets', icon: <AccessTimeIcon />, permission: 'employees:read' },
      { label: 'Attendance', path: '/attendance', icon: <BadgeIcon />, permission: 'employees:read' },
    ],
  },
  {
    title: 'Payroll & Expenses',
    items: [
      { label: 'Payroll', path: '/payroll', icon: <PaymentsIcon />, permission: 'payroll:read' },
      { label: 'Payslips', path: '/payslips', icon: <ReceiptLongIcon />, permission: 'payroll:read' },
      { label: 'Expenses', path: '/expenses', icon: <ReceiptLongIcon />, permission: 'employees:read' },
    ],
  },
  {
    title: 'Development',
    items: [
      { label: 'Appraisals', path: '/appraisals', icon: <StarIcon />, permission: 'employees:read' },
      { label: 'Training', path: '/training', icon: <SchoolIcon />, permission: 'employees:read' },
    ],
  },
  {
    title: 'Reports & Admin',
    items: [
      { label: 'Reports', path: '/reports', icon: <AssessmentIcon />, permission: 'reports:read' },
      { label: 'Users & Roles', path: '/users', icon: <AssignmentIndIcon />, permission: 'users:manage' },
      { label: 'Audit Log', path: '/audit-log', icon: <GavelIcon />, permission: 'audit:read' },
      { label: 'Settings', path: '/settings', icon: <SettingsIcon />, permission: 'settings:write' },
    ],
  },
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const { toggleMode } = useColorMode();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [flashPath, setFlashPath] = React.useState<string | null>(null);
  const flashTimer = React.useRef<number | undefined>(undefined);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  React.useEffect(
    () => () => {
      if (flashTimer.current) {
        window.clearTimeout(flashTimer.current);
      }
    },
    [],
  );

  const handleNavClick = (path: string) => {
    if (flashTimer.current) {
      window.clearTimeout(flashTimer.current);
    }
    setFlashPath(path);
    flashTimer.current = window.setTimeout(() => setFlashPath(null), 420);
    navigate(path);
  };

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const userLabel = user?.name || user?.email || 'Admin';
  const initials = userLabel
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: isDark
          ? '#0b1116'
          : 'radial-gradient(circle at 10% 10%, rgba(16,185,129,0.08), transparent 35%), #f7f8fb',
      }}
    >
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}>
        <Toolbar sx={{ gap: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: '#2563EB',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#ffffff',
              }}
            >
              HR
            </Box>
            <Box>
              <Typography variant="h6" noWrap sx={{ letterSpacing: '0.03em' }}>
                HR Admin
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Human Resources Management
              </Typography>
            </Box>
            <Chip label="Live" color="primary" size="small" variant="filled" sx={{ fontWeight: 600 }} />
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

            <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton
                onClick={toggleMode}
                sx={{
                  color: isDark ? '#e5e7eb' : '#0f172a',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.12)',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                  boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 10px 20px rgba(15,23,42,0.08)',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,1)',
                  },
                }}
                size="small"
              >
                {isDark ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontWeight: 700 }}>
                {initials || 'A'}
              </Avatar>
              <Box sx={{ minWidth: 120 }}>
                <Typography variant="subtitle2" noWrap>
                  {user?.name || 'Admin'}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {user?.email}
                </Typography>
              </Box>
            </Stack>

            <Tooltip title="Logout">
              <IconButton color="inherit" onClick={handleLogout} size="small" sx={{ ml: 0.5 }}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            paddingTop: 1,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1 }}>
          <List sx={{ flex: 1, pt: 1 }}>
            {navSections.map((section) => (
              <Box key={section.title} sx={{ mb: 1.5 }}>
                <ListSubheader sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  {section.title}
                </ListSubheader>
                {section.items.map((item) => {
                  const permission = (item as { permission?: string }).permission;
                  if (permission && !hasPermission(permission)) {
                    return null;
                  }
                  return (
                    <ListItemButton
                      key={item.path}
                      selected={flashPath === item.path}
                      data-active={isActive(item.path)}
                      onClick={() => handleNavClick(item.path)}
                      sx={{
                        position: 'relative',
                        mb: 0.5,
                        px: 2,
                        color: isActive(item.path) ? 'text.primary' : 'text.secondary',
                        fontWeight: isActive(item.path) ? 600 : 500,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 4,
                          height: 22,
                          borderRadius: 999,
                          backgroundColor: 'primary.main',
                          opacity: isActive(item.path) ? 0.85 : 0,
                          transition: 'opacity 0.2s ease, transform 0.2s ease',
                        },
                        '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 36 },
                      }}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  );
                })}
              </Box>
            ))}
          </List>

          <Box sx={{ px: 1.5, pb: 2 }}>
            <List>
              <ListItemButton onClick={handleLogout} sx={{ borderRadius: 10, mx: 0.5 }}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </List>
          </Box>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          background: isDark
            ? 'radial-gradient(circle at 0% 0%, rgba(45,212,191,0.05), transparent 25%), radial-gradient(circle at 90% 10%, rgba(249,115,22,0.04), transparent 30%), #0b1116'
            : 'radial-gradient(circle at 0% 0%, rgba(16,185,129,0.08), transparent 25%), radial-gradient(circle at 80% 10%, rgba(234,88,12,0.06), transparent 30%), #f7f8fb',
        }}
      >
        <Toolbar />
        <Suspense
          fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
              <CircularProgress />
            </Box>
          }
        >
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
};
