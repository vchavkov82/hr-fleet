import { fireEvent, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { paginated, renderWithProviders, waitForLoaded } from '@/test/utils';

import { TimesheetList } from './index';

const makeTimesheet = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  employee_id: '10',
  employee_name: 'John Doe',
  week_start: '2026-03-09',
  week_end: '2026-03-15',
  total_hours: 40,
  status: 'submitted',
  ...overrides,
});

const server = setupServer(
  http.get('*/timesheets', () => {
    return HttpResponse.json(paginated([
      makeTimesheet(),
      makeTimesheet({ id: '2', employee_name: 'Jane Smith', status: 'approved', total_hours: 38 }),
      makeTimesheet({ id: '3', employee_name: 'Bob Wilson', status: 'rejected', total_hours: 20 }),
    ]));
  }),
  http.post('*/timesheets/:id/approve', () => {
    return HttpResponse.json({ success: true });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderTimesheets() {
  return renderWithProviders(<TimesheetList />);
}

describe('TimesheetList', () => {
  it('renders timesheets from API', async () => {
    renderTimesheets();

    await waitForLoaded();

    expect(screen.getByText('Timesheets')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    expect(screen.getByText('40h')).toBeInTheDocument();
    expect(screen.getByText('38h')).toBeInTheDocument();
    expect(screen.getByText('20h')).toBeInTheDocument();
  });

  it('shows loading spinner initially', () => {
    renderTimesheets();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders status chips with correct labels', async () => {
    renderTimesheets();

    await waitForLoaded();

    expect(screen.getByText('submitted')).toBeInTheDocument();
    expect(screen.getByText('approved')).toBeInTheDocument();
    expect(screen.getByText('rejected')).toBeInTheDocument();
  });

  it('shows approve button only for submitted timesheets', async () => {
    renderTimesheets();

    await waitForLoaded();

    const approveButtons = screen.getAllByRole('button', { name: /approve/i });
    expect(approveButtons).toHaveLength(1);
  });

  it('shows empty state when no data', async () => {
    server.use(
      http.get('*/timesheets', () => HttpResponse.json(paginated([]))),
    );

    renderTimesheets();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No timesheets found')).toBeInTheDocument();
  });

  it('shows error and retry on API failure', async () => {
    server.use(
      http.get('*/timesheets', () => HttpResponse.error()),
    );

    renderTimesheets();

    await waitFor(() => {
      expect(screen.getByText('Failed to load timesheets.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('calls approve endpoint and reloads', async () => {
    let approveCalled = false;
    server.use(
      http.post('*/timesheets/:id/approve', () => {
        approveCalled = true;
        return HttpResponse.json({ success: true });
      }),
    );

    renderTimesheets();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const approveButton = screen.getByRole('button', { name: /approve/i });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(approveCalled).toBe(true);
    });
  });

  it('shows error when approve fails', async () => {
    server.use(
      http.post('*/timesheets/:id/approve', () => HttpResponse.error()),
    );

    renderTimesheets();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const approveButton = screen.getByRole('button', { name: /approve/i });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to approve timesheet.')).toBeInTheDocument();
    });
  });

  it('supports pagination controls', async () => {
    server.use(
      http.get('*/timesheets', ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get('page');
        if (page === '2') {
          return HttpResponse.json(paginated(
            [makeTimesheet({ id: '4', employee_name: 'Page Two Employee' })],
            50,
          ));
        }
        return HttpResponse.json(paginated(
          [makeTimesheet({ employee_name: 'Page One Employee' })],
          50,
        ));
      }),
    );

    renderTimesheets();

    await waitFor(() => {
      expect(screen.getByText('Page One Employee')).toBeInTheDocument();
    });

    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(screen.getByText('Page Two Employee')).toBeInTheDocument();
    });
  });
});
