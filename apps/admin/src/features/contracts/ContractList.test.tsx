import { ThemeProvider, createTheme } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ContractList } from './index';

const makeContract = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  employee_id: '10',
  employee_name: 'John Doe',
  contract_type: 'Full-time',
  start_date: '2026-01-01',
  end_date: '2027-01-01',
  salary: 5000,
  currency: 'BGN',
  status: 'active',
  ...overrides,
});

const paginated = (data: unknown[], total?: number) => ({
  data,
  meta: { total: total ?? data.length, page: 1, per_page: 25, total_pages: 1 },
});

const server = setupServer(
  http.get('*/contracts', () => {
    return HttpResponse.json(paginated([
      makeContract(),
      makeContract({ id: '2', employee_name: 'Jane Smith', status: 'expired', contract_type: 'Part-time' }),
      makeContract({ id: '3', employee_name: 'Bob Wilson', status: 'pending', contract_type: 'Contractor' }),
    ]));
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderContracts() {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<ContractList />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('ContractList', () => {
  it('renders contract data from API', async () => {
    renderContracts();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    expect(screen.getByText('Full-time')).toBeInTheDocument();
  });

  it('shows loading spinner initially', () => {
    renderContracts();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders status chips with correct labels', async () => {
    renderContracts();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('expired')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('shows empty state when no data', async () => {
    server.use(
      http.get('*/contracts', () => HttpResponse.json(paginated([]))),
    );

    renderContracts();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No contracts found')).toBeInTheDocument();
  });

  it('shows error and retry on API failure', async () => {
    server.use(
      http.get('*/contracts', () => HttpResponse.error()),
    );

    renderContracts();

    await waitFor(() => {
      expect(screen.getByText('Failed to load contracts.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('supports pagination controls', async () => {
    server.use(
      http.get('*/contracts', ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get('page');
        if (page === '2') {
          return HttpResponse.json(paginated(
            [makeContract({ id: '4', employee_name: 'Page Two Employee' })],
            50,
          ));
        }
        return HttpResponse.json(paginated(
          [makeContract({ employee_name: 'Page One Employee' })],
          50,
        ));
      }),
    );

    renderContracts();

    await waitFor(() => {
      expect(screen.getByText('Page One Employee')).toBeInTheDocument();
    });

    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(screen.getByText('Page Two Employee')).toBeInTheDocument();
    });
  });

  it('renders Add Contract button', async () => {
    renderContracts();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /add contract/i })).toBeInTheDocument();
  });
});
