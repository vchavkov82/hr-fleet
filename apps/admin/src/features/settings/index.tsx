import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyIcon from '@mui/icons-material/Key';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import SyncIcon from '@mui/icons-material/Sync';
import WebhookIcon from '@mui/icons-material/Webhook';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useState } from 'react';

import { getOrgSettings, updateOrgSettings, type OrgSettings } from '@/api/api';
import { Section } from '@/components/shared';
import { formatDateTime } from '@/lib/format';

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

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used_at?: string;
  scopes: string[];
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
  last_triggered_at?: string;
}

const MOCK_API_KEYS: ApiKey[] = [
  {
    id: '1',
    name: 'Production API',
    key: 'hr_live_sk_xxxxxxxxxxxxx',
    created_at: '2024-01-15T10:00:00Z',
    last_used_at: '2024-03-19T08:30:00Z',
    scopes: ['employees:read', 'employees:write', 'payroll:read'],
  },
  {
    id: '2',
    name: 'Integration Service',
    key: 'hr_live_sk_yyyyyyyyyyyyy',
    created_at: '2024-02-20T14:00:00Z',
    scopes: ['employees:read'],
  },
];

const MOCK_WEBHOOKS: Webhook[] = [
  {
    id: '1',
    url: 'https://api.example.com/webhooks/hr',
    events: ['employee.created', 'employee.updated', 'payroll.completed'],
    active: true,
    created_at: '2024-01-10T09:00:00Z',
    last_triggered_at: '2024-03-18T16:45:00Z',
  },
  {
    id: '2',
    url: 'https://slack.example.com/hooks/hr-notifications',
    events: ['leave.approved', 'leave.rejected'],
    active: false,
    created_at: '2024-02-05T11:00:00Z',
  },
];

const WEBHOOK_EVENTS = [
  'employee.created',
  'employee.updated',
  'employee.terminated',
  'leave.requested',
  'leave.approved',
  'leave.rejected',
  'payroll.started',
  'payroll.completed',
  'expense.submitted',
  'expense.approved',
];

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [orgSettings, setOrgSettings] = useState<OrgSettings>({
    company_name: '',
    timezone: 'UTC',
    currency: 'BGN',
    date_format: 'DD/MM/YYYY',
    fiscal_year_start: '01-01',
  });

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoApproveLeave, setAutoApproveLeave] = useState(false);

  const [apiKeys, setApiKeys] = useState<ApiKey[]>(MOCK_API_KEYS);
  const [webhooks, setWebhooks] = useState<Webhook[]>(MOCK_WEBHOOKS);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ url: '', events: [] as string[] });

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const settings = await getOrgSettings();
      setOrgSettings(settings);
    } catch {
      // Use defaults on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveOrg = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateOrgSettings(orgSettings);
      setSuccess('Organization settings saved successfully.');
    } catch {
      setError('Failed to save organization settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setSuccess('API key copied to clipboard.');
  };

  const handleCreateApiKey = () => {
    const newKey: ApiKey = {
      id: String(apiKeys.length + 1),
      name: newApiKeyName,
      key: `hr_live_sk_${Math.random().toString(36).slice(2, 15)}`,
      created_at: new Date().toISOString(),
      scopes: ['employees:read'],
    };
    setApiKeys([...apiKeys, newKey]);
    setApiKeyDialogOpen(false);
    setNewApiKeyName('');
    setSuccess('API key created successfully.');
  };

  const handleDeleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
    setSuccess('API key deleted.');
  };

  const handleCreateWebhook = () => {
    const webhook: Webhook = {
      id: String(webhooks.length + 1),
      url: newWebhook.url,
      events: newWebhook.events,
      active: true,
      created_at: new Date().toISOString(),
    };
    setWebhooks([...webhooks, webhook]);
    setWebhookDialogOpen(false);
    setNewWebhook({ url: '', events: [] });
    setSuccess('Webhook created successfully.');
  };

  const handleToggleWebhook = (id: string) => {
    setWebhooks(webhooks.map((w) => (w.id === id ? { ...w, active: !w.active } : w)));
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter((w) => w.id !== id));
    setSuccess('Webhook deleted.');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure your HR system
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Paper sx={{ px: 2 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab icon={<BusinessIcon />} iconPosition="start" label="Organization" />
          <Tab icon={<KeyIcon />} iconPosition="start" label="API Keys" />
          <Tab icon={<WebhookIcon />} iconPosition="start" label="Webhooks" />
          <Tab icon={<SyncIcon />} iconPosition="start" label="Integrations" />
        </Tabs>
      </Paper>

      {/* Organization Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Section title="Company Information" icon={<BusinessIcon color="primary" fontSize="small" />}>
              <Stack spacing={2.5}>
                <TextField
                  label="Company Name"
                  value={orgSettings.company_name}
                  onChange={(e) => setOrgSettings({ ...orgSettings, company_name: e.target.value })}
                  fullWidth
                  size="small"
                />
                <FormControl fullWidth size="small">
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={orgSettings.timezone}
                    label="Timezone"
                    onChange={(e) => setOrgSettings({ ...orgSettings, timezone: e.target.value })}
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="Europe/Sofia">Europe/Sofia (EET)</MenuItem>
                    <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                    <MenuItem value="Europe/Paris">Europe/Paris (CET)</MenuItem>
                    <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                    <MenuItem value="America/Los_Angeles">America/Los_Angeles (PST)</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={orgSettings.currency}
                    label="Currency"
                    onChange={(e) => setOrgSettings({ ...orgSettings, currency: e.target.value })}
                  >
                    <MenuItem value="BGN">BGN (Bulgarian Lev)</MenuItem>
                    <MenuItem value="EUR">EUR (Euro)</MenuItem>
                    <MenuItem value="USD">USD (US Dollar)</MenuItem>
                    <MenuItem value="GBP">GBP (British Pound)</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={orgSettings.date_format}
                    label="Date Format"
                    onChange={(e) => setOrgSettings({ ...orgSettings, date_format: e.target.value })}
                  >
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Section>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Section title="Automation & Notifications">
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
                  }
                  label="Email notifications for pending approvals"
                />
                <FormControlLabel
                  control={
                    <Switch checked={autoApproveLeave} onChange={(e) => setAutoApproveLeave(e.target.checked)} />
                  }
                  label="Auto-approve leave requests under 3 days"
                />
              </Stack>
            </Section>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveOrg} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </TabPanel>

      {/* API Keys Tab */}
      <TabPanel value={activeTab} index={1}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              API Keys
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setApiKeyDialogOpen(true)}>
              Create API Key
            </Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Key</TableCell>
                  <TableCell>Scopes</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Last Used</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <Typography fontWeight={500}>{key.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontFamily="monospace">
                          {key.key.slice(0, 20)}...
                        </Typography>
                        <Tooltip title="Copy to clipboard">
                          <IconButton size="small" onClick={() => handleCopyKey(key.key)}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {key.scopes.map((scope) => (
                          <Chip key={scope} label={scope} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>{formatDateTime(key.created_at)}</TableCell>
                    <TableCell>{key.last_used_at ? formatDateTime(key.last_used_at) : 'Never'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Regenerate">
                        <IconButton size="small">
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDeleteApiKey(key.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </TabPanel>

      {/* Webhooks Tab */}
      <TabPanel value={activeTab} index={2}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Webhooks
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setWebhookDialogOpen(true)}>
              Add Webhook
            </Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>URL</TableCell>
                  <TableCell>Events</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Triggered</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {webhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" noWrap sx={{ maxWidth: 300 }}>
                        {webhook.url}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {webhook.events.slice(0, 2).map((event) => (
                          <Chip key={event} label={event} size="small" variant="outlined" />
                        ))}
                        {webhook.events.length > 2 && (
                          <Chip label={`+${webhook.events.length - 2}`} size="small" />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={webhook.active ? 'Active' : 'Inactive'}
                        size="small"
                        color={webhook.active ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {webhook.last_triggered_at ? formatDateTime(webhook.last_triggered_at) : 'Never'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={webhook.active ? 'Disable' : 'Enable'}>
                        <Switch
                          size="small"
                          checked={webhook.active}
                          onChange={() => handleToggleWebhook(webhook.id)}
                        />
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDeleteWebhook(webhook.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </TabPanel>

      {/* Integrations Tab */}
      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    bgcolor: 'purple',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'white',
                    fontWeight: 700,
                  }}
                >
                  O
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Odoo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ERP Integration
                  </Typography>
                </Box>
                <Chip label="Connected" color="success" size="small" />
              </Stack>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Instance:</strong> hr.odoo.com
                </Typography>
                <Typography variant="body2">
                  <strong>Last Sync:</strong> 5 minutes ago
                </Typography>
              </Stack>
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" size="small" startIcon={<SyncIcon />}>
                  Sync Now
                </Button>
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    bgcolor: '#4A154B',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'white',
                    fontWeight: 700,
                  }}
                >
                  S
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Slack
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Notifications
                  </Typography>
                </Box>
                <Chip label="Not Connected" color="default" size="small" />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Connect Slack to receive HR notifications in your workspace.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" size="small">
                  Connect Slack
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Create API Key Dialog */}
      <Dialog open={apiKeyDialogOpen} onClose={() => setApiKeyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create API Key</DialogTitle>
        <DialogContent>
          <TextField
            label="Key Name"
            value={newApiKeyName}
            onChange={(e) => setNewApiKeyName(e.target.value)}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
            placeholder="e.g., Production API"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiKeyDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateApiKey} variant="contained" disabled={!newApiKeyName}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Webhook Dialog */}
      <Dialog open={webhookDialogOpen} onClose={() => setWebhookDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Webhook</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Endpoint URL"
              value={newWebhook.url}
              onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
              fullWidth
              size="small"
              placeholder="https://api.example.com/webhooks"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Events</InputLabel>
              <Select
                multiple
                value={newWebhook.events}
                label="Events"
                onChange={(e) => setNewWebhook({ ...newWebhook, events: e.target.value as string[] })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {WEBHOOK_EVENTS.map((event) => (
                  <MenuItem key={event} value={event}>
                    {event}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWebhookDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateWebhook}
            variant="contained"
            disabled={!newWebhook.url || newWebhook.events.length === 0}
          >
            Add Webhook
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
