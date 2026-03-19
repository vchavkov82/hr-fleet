import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useState } from 'react';

import { getUsers, type User } from '@/api/api';
import { ConfirmDialog, StatusChip } from '@/components/shared';
import { formatDateTime } from '@/lib/format';

const ROLES = [
  { value: 'super_admin', label: 'Super Admin', description: 'Full system access' },
  { value: 'org_admin', label: 'Org Admin', description: 'Organization management' },
  { value: 'hr_manager', label: 'HR Manager', description: 'Employee and leave management' },
  { value: 'payroll_manager', label: 'Payroll Manager', description: 'Payroll processing' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
];

function getRoleColor(role: string): 'error' | 'warning' | 'primary' | 'info' | 'default' {
  switch (role) {
    case 'super_admin':
      return 'error';
    case 'org_admin':
      return 'warning';
    case 'hr_manager':
      return 'primary';
    case 'payroll_manager':
      return 'info';
    default:
      return 'default';
  }
}

function getRoleIcon(role: string): React.ReactNode {
  switch (role) {
    case 'super_admin':
      return <SecurityIcon fontSize="small" />;
    case 'org_admin':
      return <AdminPanelSettingsIcon fontSize="small" />;
    default:
      return <PersonIcon fontSize="small" />;
  }
}

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', role: 'viewer' });
  const [inviteLoading, setInviteLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState('');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<User | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsers({ per_page: 100 });
      setUsers(res.data ?? []);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setMenuAnchor(event.currentTarget);
    setMenuUser(user);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuUser(null);
  };

  const handleEditRole = (user: User) => {
    setEditUser(user);
    setEditRole(user.role);
    setEditOpen(true);
    handleMenuClose();
  };

  const handleSaveRole = () => {
    if (!editUser) return;
    setUsers(users.map((u) => (u.id === editUser.id ? { ...u, role: editRole } : u)));
    setSuccess(`Role updated for ${editUser.name}.`);
    setEditOpen(false);
    setEditUser(null);
  };

  const handleDeactivate = (user: User) => {
    setUsers(users.map((u) => (u.id === user.id ? { ...u, status: 'inactive' as const } : u)));
    setSuccess(`${user.name} has been deactivated.`);
    handleMenuClose();
  };

  const handleReactivate = (user: User) => {
    setUsers(users.map((u) => (u.id === user.id ? { ...u, status: 'active' as const } : u)));
    setSuccess(`${user.name} has been reactivated.`);
    handleMenuClose();
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    setUsers(users.filter((u) => u.id !== userToDelete.id));
    setSuccess(`${userToDelete.name} has been removed.`);
    setDeleteOpen(false);
    setUserToDelete(null);
  };

  const handleInvite = async () => {
    setInviteLoading(true);
    try {
      const newUser: User = {
        id: String(users.length + 1),
        email: inviteForm.email,
        name: inviteForm.name,
        role: inviteForm.role,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      setUsers([...users, newUser]);
      setSuccess(`Invitation sent to ${inviteForm.email}.`);
      setInviteOpen(false);
      setInviteForm({ email: '', name: '', role: 'viewer' });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleResendInvite = (user: User) => {
    setSuccess(`Invitation resent to ${user.email}.`);
    handleMenuClose();
  };

  const activeCount = users.filter((u) => u.status === 'active').length;
  const pendingCount = users.filter((u) => u.status === 'pending').length;

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Users & Roles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage system users and permissions
            <Chip label={`${activeCount} active`} size="small" color="success" sx={{ ml: 1 }} />
            {pendingCount > 0 && <Chip label={`${pendingCount} pending`} size="small" color="warning" sx={{ ml: 0.5 }} />}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setInviteOpen(true)}>
          Invite User
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" action={<Button onClick={loadData}>Retry</Button>}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Role Legend */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Role Permissions
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          {ROLES.map((role) => (
            <Tooltip key={role.value} title={role.description}>
              <Chip
                icon={getRoleIcon(role.value)}
                label={role.label}
                size="small"
                color={getRoleColor(role.value)}
                variant="outlined"
              />
            </Tooltip>
          ))}
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getRoleIcon(user.role)}
                      label={user.role.replace(/_/g, ' ')}
                      size="small"
                      color={getRoleColor(user.role)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={user.status} />
                  </TableCell>
                  <TableCell>{user.last_login_at ? formatDateTime(user.last_login_at) : 'Never'}</TableCell>
                  <TableCell>{formatDateTime(user.created_at)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No users found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Actions Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => menuUser && handleEditRole(menuUser)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Role</ListItemText>
        </MenuItem>
        {menuUser?.status === 'pending' && (
          <MenuItem onClick={() => menuUser && handleResendInvite(menuUser)}>
            <ListItemIcon>
              <RefreshIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Resend Invite</ListItemText>
          </MenuItem>
        )}
        {menuUser?.status === 'active' && (
          <MenuItem onClick={() => menuUser && handleDeactivate(menuUser)}>
            <ListItemIcon>
              <BlockIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Deactivate</ListItemText>
          </MenuItem>
        )}
        {menuUser?.status === 'inactive' && (
          <MenuItem onClick={() => menuUser && handleReactivate(menuUser)}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Reactivate</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => menuUser && handleDeleteClick(menuUser)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Remove User</ListItemText>
        </MenuItem>
      </Menu>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <MailOutlineIcon color="primary" />
            <Typography variant="h6">Invite User</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Send an invitation email to add a new user to your organization.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Name"
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                fullWidth
                size="small"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                fullWidth
                size="small"
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  value={inviteForm.role}
                  label="Role"
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                >
                  {ROLES.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {getRoleIcon(role.value)}
                        <Box>
                          <Typography variant="body2">{role.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {role.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
          <Button
            onClick={handleInvite}
            variant="contained"
            disabled={inviteLoading || !inviteForm.email || !inviteForm.name}
            startIcon={<MailOutlineIcon />}
          >
            {inviteLoading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Role</DialogTitle>
        <DialogContent>
          {editUser && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Changing role for <strong>{editUser.name}</strong>
              </Typography>
            </Box>
          )}
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select value={editRole} label="Role" onChange={(e) => setEditRole(e.target.value)}>
              {ROLES.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveRole} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        title="Remove User"
        message={`Are you sure you want to remove ${userToDelete?.name}? They will lose access to the system immediately.`}
        confirmLabel="Remove"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteOpen(false);
          setUserToDelete(null);
        }}
      />
    </Stack>
  );
};
