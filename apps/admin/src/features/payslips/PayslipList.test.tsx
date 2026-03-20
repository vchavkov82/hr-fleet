import { ThemeProvider, createTheme } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { PayslipList } from './index';

const makePayslip = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  employee_id: '10',
  employee_name: 'John Doe',
  period_start: '2026-03-01',
  period_end: '2026-03-31',
  gross_salary: 5000,
  net_salary: 3800,
  status: 'generated',
  ...overrides,
});

const paginated = (data: unknown[], total?: number) => ({
  data,
  meta: { total: total ?? data.length, page: 1, per_page: 25, total_pages: 1 },
});

const server = setupServer(
  http.get('*/payslips', () => {
    return HttpResponse.json(paginated([
      makePayslip(),
      makePayslip({ id: '2', employee_name: 'Jane Smith', status: 'paid', gross_salary: 6000, net_salary: 4500 }),
      makePayslip({ id: '3', employee_name: 'Bob Wilson', status: 'draft', gross_salary: 4000, net_salary: 3000 }),
    ]));
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderPayslips() {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<PayslipList />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('PayslipList', () => {
  it('renders payslip data from API', async () => {
    renderPayslips();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
    expect(screen.getByText('$3,800')).toBeInTheDocument();
  });

  it('shows loading spinner initially', () => {
    renderPayslips();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders status chips with correct labels', async () => {
    renderPayslips();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('generated')).toBeInTheDocument();
    expect(screen.getByText('paid')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
  });

  it('shows empty state when no data', async () => {
    server.use(
      http.get('*/payslips', () => HttpResponse.json(paginated([]))),
    );

    renderPayslips();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No payslips found')).toBeInTheDocument();
  });

  it('shows error and retry on API failure', async () => {
    server.use(
      http.get('*/payslips', () => HttpResponse.error()),
    );

    renderPayslips();

    await waitFor(() => {
      expect(screen.getByText('Failed to load payslips.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('supports pagination controls', async () => {
    server.use(
      http.get('*/payslips', ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get('page');
        if (page === '2') {
          return HttpResponse.json(paginated(
            [makePayslip({ id: '4', employee_name: 'Page Two Employee' })],
            50,
          ));
        }
        return HttpResponse.json(paginated(
          [makePayslip({ employee_name: 'Page One Employee' })],
          50,
        ));
      }),
    );

    renderPayslips();

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
