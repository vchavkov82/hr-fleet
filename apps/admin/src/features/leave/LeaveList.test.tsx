import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { paginated, renderWithProviders, waitForLoaded } from '@/test/utils';

import { LeaveList } from './index';

const makeLeave = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  employee_id: '10',
  employee_name: 'John Doe',
  leave_type: 'annual',
  start_date: '2026-03-20',
  end_date: '2026-03-25',
  days: 5,
  reason: 'Vacation',
  status: 'pending',
  ...overrides,
});

const server = setupServer(
  http.get('*/leave/requests', () => {
    return HttpResponse.json(
      paginated([
        makeLeave(),
        makeLeave({ id: '2', employee_name: 'Jane Smith', status: 'approved', leave_type: 'sick', days: 3 }),
        makeLeave({ id: '3', employee_name: 'Bob Wilson', status: 'rejected', leave_type: 'personal', days: 1 }),
      ]),
    );
  }),
  http.post('*/leave/requests/:id/approve', () => {
    return HttpResponse.json({ success: true });
  }),
  http.post('*/leave/requests/:id/reject', () => {
    return HttpResponse.json({ success: true });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('LeaveList', () => {
  it('renders leave data from API', async () => {
    renderWithProviders(<LeaveList />);
    await waitForLoaded();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    expect(screen.getByText('annual')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows loading spinner initially', () => {
    renderWithProviders(<LeaveList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders status chips', async () => {
    renderWithProviders(<LeaveList />);
    await waitForLoaded();

    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('approved')).toBeInTheDocument();
    expect(screen.getByText('rejected')).toBeInTheDocument();
  });

  it('shows empty state when no data', async () => {
    server.use(
      http.get('*/leave/requests', () => HttpResponse.json(paginated([]))),
    );

    renderWithProviders(<LeaveList />);
    await waitForLoaded();

    expect(screen.getByText('No leave requests found')).toBeInTheDocument();
  });

  it('shows error and retry on API failure', async () => {
    server.use(
      http.get('*/leave/requests', () => HttpResponse.error()),
    );

    renderWithProviders(<LeaveList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load leave requests.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('supports pagination', async () => {
    server.use(
      http.get('*/leave/requests', ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get('page');
        if (page === '2') {
          return HttpResponse.json(
            paginated([makeLeave({ id: '4', employee_name: 'Page Two Employee' })], 50),
          );
        }
        return HttpResponse.json(
          paginated([makeLeave({ employee_name: 'Page One Employee' })], 50),
        );
      }),
    );

    renderWithProviders(<LeaveList />);

    await waitFor(() => {
      expect(screen.getByText('Page One Employee')).toBeInTheDocument();
    });

    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    await userEvent.click(nextPageButton);

    await waitFor(() => {
      expect(screen.getByText('Page Two Employee')).toBeInTheDocument();
    });
  });

  it('shows approve/reject buttons only for pending status', async () => {
    server.use(
      http.get('*/leave/requests', () =>
        HttpResponse.json(
          paginated([
            makeLeave({ id: '1', status: 'pending' }),
            makeLeave({ id: '2', status: 'approved', employee_name: 'Jane Smith' }),
          ]),
        ),
      ),
    );

    renderWithProviders(<LeaveList />);
    await waitForLoaded();

    const approveButtons = screen.getAllByLabelText('Approve');
    expect(approveButtons).toHaveLength(1);

    const rejectButtons = screen.getAllByLabelText('Reject');
    expect(rejectButtons).toHaveLength(1);
  });

  it('approve flow: opens dialog, confirms, calls API, shows success', async () => {
    let called = false;
    server.use(
      http.post('*/leave/requests/:id/approve', () => {
        called = true;
        return HttpResponse.json({ success: true });
      }),
    );

    renderWithProviders(<LeaveList />);
    await waitForLoaded();

    const approveButton = screen.getAllByLabelText('Approve')[0];
    await userEvent.click(approveButton);

    expect(screen.getByText('Approve Leave Request')).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /approve/i });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(called).toBe(true);
    });

    await waitFor(() => {
      expect(screen.getByText(/approved\./i)).toBeInTheDocument();
    });
  });

  it('reject flow: opens dialog, confirms, calls API, shows success', async () => {
    let called = false;
    server.use(
      http.post('*/leave/requests/:id/reject', () => {
        called = true;
        return HttpResponse.json({ success: true });
      }),
    );

    renderWithProviders(<LeaveList />);
    await waitForLoaded();

    const rejectButton = screen.getAllByLabelText('Reject')[0];
    await userEvent.click(rejectButton);

    expect(screen.getByText('Reject Leave Request')).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /reject/i });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(called).toBe(true);
    });

    await waitFor(() => {
      expect(screen.getByText(/rejected\./i)).toBeInTheDocument();
    });
  });

  it('shows error when approve action fails', async () => {
    server.use(
      http.post('*/leave/requests/:id/approve', () => HttpResponse.error()),
    );

    renderWithProviders(<LeaveList />);
    await waitForLoaded();

    const approveButton = screen.getAllByLabelText('Approve')[0];
    await userEvent.click(approveButton);

    const confirmButton = screen.getByRole('button', { name: /approve/i });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to approve leave request.')).toBeInTheDocument();
    });
  });

  it('shows pending count badge when pending items exist', async () => {
    renderWithProviders(<LeaveList />);
    await waitForLoaded();

    expect(screen.getByText(/1 pending/i)).toBeInTheDocument();
  });

  it('filters by status', async () => {
    let lastStatus: string | null = null;
    server.use(
      http.get('*/leave/requests', ({ request }) => {
        const url = new URL(request.url);
        lastStatus = url.searchParams.get('status');
        return HttpResponse.json(
          paginated([makeLeave({ status: lastStatus ?? 'pending' })]),
        );
      }),
    );

    renderWithProviders(<LeaveList />);
    await waitForLoaded();

    const statusFilter = screen.getByLabelText(/status/i);
    await userEvent.click(statusFilter);

    const approvedOption = await screen.findByRole('option', { name: /approved/i });
    await userEvent.click(approvedOption);

    await waitFor(() => {
      expect(lastStatus).toBe('approved');
    });
  });
});
