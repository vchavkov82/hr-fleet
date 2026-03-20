import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { describe, it, expect } from 'vitest';

import { StatusChip } from './StatusChip';

const theme = createTheme();

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('StatusChip', () => {
  const allStatuses: [string, string][] = [
    ['active', 'Active'],
    ['inactive', 'Inactive'],
    ['terminated', 'Terminated'],
    ['pending', 'Pending'],
    ['approved', 'Approved'],
    ['rejected', 'Rejected'],
    ['cancelled', 'Cancelled'],
    ['draft', 'Draft'],
    ['submitted', 'Submitted'],
    ['processing', 'Processing'],
    ['completed', 'Completed'],
    ['generated', 'Generated'],
    ['sent', 'Sent'],
    ['viewed', 'Viewed'],
    ['reimbursed', 'Reimbursed'],
    ['in_progress', 'In Progress'],
    ['present', 'Present'],
    ['absent', 'Absent'],
    ['late', 'Late'],
    ['half_day', 'Half Day'],
    ['on_leave', 'On Leave'],
    ['expired', 'Expired'],
  ];

  it.each(allStatuses)('renders "%s" with label "%s"', (status, expectedLabel) => {
    renderWithTheme(<StatusChip status={status} />);
    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });

  describe('custom labels', () => {
    it('renders "In Progress" for in_progress', () => {
      renderWithTheme(<StatusChip status="in_progress" />);
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('renders "Half Day" for half_day', () => {
      renderWithTheme(<StatusChip status="half_day" />);
      expect(screen.getByText('Half Day')).toBeInTheDocument();
    });

    it('renders "On Leave" for on_leave', () => {
      renderWithTheme(<StatusChip status="on_leave" />);
      expect(screen.getByText('On Leave')).toBeInTheDocument();
    });
  });

  describe('auto-capitalization', () => {
    it('capitalizes "active" to "Active"', () => {
      renderWithTheme(<StatusChip status="active" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('capitalizes "pending" to "Pending"', () => {
      renderWithTheme(<StatusChip status="pending" />);
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  describe('unknown status', () => {
    it('renders with default color and capitalized label', () => {
      renderWithTheme(<StatusChip status="something_unknown" />);
      expect(screen.getByText('Something unknown')).toBeInTheDocument();
    });
  });

  describe('null/undefined status', () => {
    it('renders em dash for null status', () => {
      renderWithTheme(<StatusChip status={null} />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('renders em dash for undefined status', () => {
      renderWithTheme(<StatusChip status={undefined} />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });
});
