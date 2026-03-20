import { ThemeProvider, createTheme } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { AppraisalList } from './index';

const makeAppraisal = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  employee_id: '10',
  employee_name: 'John Doe',
  reviewer_name: 'Jane Manager',
  period_start: '2026-01-01',
  period_end: '2026-06-30',
  overall_rating: 4,
  status: 'completed',
  ...overrides,
});

const paginated = (data: unknown[], total?: number) => ({
  data,
  meta: { total: total ?? data.length, page: 1, per_page: 25, total_pages: 1 },
});

const server = setupServer(
  http.get('*/appraisals', () => {
    return HttpResponse.json(paginated([
      makeAppraisal(),
      makeAppraisal({ id: '2', employee_name: 'Jane Smith', status: 'in_progress', overall_rating: null }),
      makeAppraisal({ id: '3', employee_name: 'Bob Wilson', status: 'draft', overall_rating: 2 }),
    ]));
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderAppraisals() {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<AppraisalList />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('AppraisalList', () => {
  it('renders appraisal data from API', async () => {
    renderAppraisals();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    expect(screen.getByText('Jane Manager')).toBeInTheDocument();
  });

  it('shows loading spinner initially', () => {
    renderAppraisals();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders status chips with correct labels', async () => {
    renderAppraisals();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByText('in progress')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
  });

  it('shows empty state when no data', async () => {
    server.use(
      http.get('*/appraisals', () => HttpResponse.json(paginated([]))),
    );

    renderAppraisals();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No appraisals found')).toBeInTheDocument();
  });

  it('shows error and retry on API failure', async () => {
    server.use(
      http.get('*/appraisals', () => HttpResponse.error()),
    );

    renderAppraisals();

    await waitFor(() => {
      expect(screen.getByText('Failed to load appraisals.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('supports pagination controls', async () => {
    server.use(
      http.get('*/appraisals', ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get('page');
        if (page === '2') {
          return HttpResponse.json(paginated(
            [makeAppraisal({ id: '4', employee_name: 'Page Two Employee' })],
            50,
          ));
        }
        return HttpResponse.json(paginated(
          [makeAppraisal({ employee_name: 'Page One Employee' })],
          50,
        ));
      }),
    );

    renderAppraisals();

    await waitFor(() => {
      expect(screen.getByText('Page One Employee')).toBeInTheDocument();
    });

    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(screen.getByText('Page Two Employee')).toBeInTheDocument();
    });
  });

  it('renders New Appraisal button', async () => {
    renderAppraisals();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /new appraisal/i })).toBeInTheDocument();
  });

  it('shows dash for null rating', async () => {
    server.use(
      http.get('*/appraisals', () => HttpResponse.json(paginated([
        makeAppraisal({ id: '2', overall_rating: null, status: 'in_progress' }),
      ]))),
    );

    renderAppraisals();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
