import Chip from '@mui/material/Chip';
import React from 'react';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusConfig {
  color: StatusType;
  label?: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  active: { color: 'success' },
  inactive: { color: 'default' },
  terminated: { color: 'error' },
  pending: { color: 'warning' },
  approved: { color: 'success' },
  rejected: { color: 'error' },
  cancelled: { color: 'default' },
  draft: { color: 'default' },
  submitted: { color: 'info' },
  processing: { color: 'info' },
  completed: { color: 'success' },
  generated: { color: 'info' },
  sent: { color: 'success' },
  viewed: { color: 'success' },
  reimbursed: { color: 'success' },
  in_progress: { color: 'info', label: 'In Progress' },
  present: { color: 'success' },
  absent: { color: 'error' },
  late: { color: 'warning' },
  half_day: { color: 'warning', label: 'Half Day' },
  on_leave: { color: 'info', label: 'On Leave' },
  expired: { color: 'error' },
};

interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'small' }) => {
  const config = STATUS_MAP[status] || { color: 'default' as StatusType };
  const label = config.label || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');

  return <Chip label={label} size={size} color={config.color} />;
};
