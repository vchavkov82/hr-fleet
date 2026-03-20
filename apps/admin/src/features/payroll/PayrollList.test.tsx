import { fireEvent, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { renderWithProviders, paginated, waitForLoaded } from '@/test/utils';

import { PayrollList } from './index';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const makePayrollRun = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  period_start: '2026-03-01',
  period_end: '2026-03-31',
  employee_count: 50,
  total_gross: 250000,
  total_net: 190000,
  status: 'completed',
  created_at: '2026-03-15T10:00:00Z',
  ...overrides,
});

const server = setupServer(
  http.get('*/payroll/runs', () => {
    return HttpResponse.json(paginated([
      makePayrollRun(),
      makePayrollRun({ id: '2', status: 'draft', employee_count: 30, total_gross: 150000, total_net: 115000 }),
    ]));
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  mockNavigate.mockReset();
});
afterAll(() => server.close());

describe('PayrollList', () => {
  it('renders payroll run data', async () => {
    renderWithProviders(<PayrollList />);
    await waitForLoaded();

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('shows loading spinner initially', () => {
    renderWithProviders(<PayrollList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows empty state when no payroll runs', async () => {
    server.use(
      http.get('*/payroll/runs', () => HttpResponse.json(paginated([]))),
    );

    renderWithProviders(<PayrollList />);
    await waitForLoaded();

    expect(screen.getByText('No payroll runs found')).toBeInTheDocument();
  });

  it('shows error and retry on API failure', async () => {
    server.use(
      http.get('*/payroll/runs', () => HttpResponse.error()),
    );

    renderWithProviders(<PayrollList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load payroll runs.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('supports pagination controls', async () => {
    server.use(
      http.get('*/payroll/runs', ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get('page');
        if (page === '2') {
          return HttpResponse.json(paginated(
            [makePayrollRun({ id: '4', employee_count: 99 })],
            50,
          ));
        }
        return HttpResponse.json(paginated(
          [makePayrollRun({ employee_count: 50 })],
          50,
        ));
      }),
    );

    renderWithProviders(<PayrollList />);
    await waitForLoaded();

    expect(screen.getByText('50')).toBeInTheDocument();

    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(screen.getByText('99')).toBeInTheDocument();
    });
  });

  it('renders Run Payroll button', async () => {
    renderWithProviders(<PayrollList />);
    await waitForLoaded();

    expect(screen.getByRole('button', { name: /run payroll/i })).toBeInTheDocument();
  });

  it('navigates to payroll detail on row click', async () => {
    renderWithProviders(<PayrollList />);
    await waitForLoaded();

    const row = screen.getByText('50').closest('tr');
    expect(row).toBeTruthy();
    fireEvent.click(row!);

    expect(mockNavigate).toHaveBeenCalledWith('/payroll/1');
  });
});
