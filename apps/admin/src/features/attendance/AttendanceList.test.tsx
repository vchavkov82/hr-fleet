import { ThemeProvider, createTheme } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { AttendanceList } from './index';

const makeAttendance = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  employee_id: '10',
  employee_name: 'John Doe',
  date: '2026-03-15',
  check_in: '09:00',
  check_out: '17:00',
  status: 'present',
  ...overrides,
});

const paginated = (data: unknown[], total?: number) => ({
  data,
  meta: { total: total ?? data.length, page: 1, per_page: 25, total_pages: 1 },
});

const server = setupServer(
  http.get('*/attendance', () => {
    return HttpResponse.json(paginated([
      makeAttendance(),
      makeAttendance({ id: '2', employee_name: 'Jane Smith', status: 'late', check_in: '10:30', check_out: '18:00' }),
      makeAttendance({ id: '3', employee_name: 'Bob Wilson', status: 'absent', check_in: null, check_out: null }),
    ]));
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderAttendance() {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<AttendanceList />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('AttendanceList', () => {
  it('renders attendance data from API', async () => {
    renderAttendance();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('17:00')).toBeInTheDocument();
  });

  it('shows loading spinner initially', () => {
    renderAttendance();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders status chips with correct labels', async () => {
    renderAttendance();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('present')).toBeInTheDocument();
    expect(screen.getByText('late')).toBeInTheDocument();
    expect(screen.getByText('absent')).toBeInTheDocument();
  });

  it('shows empty state when no data', async () => {
    server.use(
      http.get('*/attendance', () => HttpResponse.json(paginated([]))),
    );

    renderAttendance();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No attendance records found')).toBeInTheDocument();
  });

  it('shows error and retry on API failure', async () => {
    server.use(
      http.get('*/attendance', () => HttpResponse.error()),
    );

    renderAttendance();

    await waitFor(() => {
      expect(screen.getByText('Failed to load attendance records.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('supports pagination controls', async () => {
    server.use(
      http.get('*/attendance', ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get('page');
        if (page === '2') {
          return HttpResponse.json(paginated(
            [makeAttendance({ id: '4', employee_name: 'Page Two Employee' })],
            50,
          ));
        }
        return HttpResponse.json(paginated(
          [makeAttendance({ employee_name: 'Page One Employee' })],
          50,
        ));
      }),
    );

    renderAttendance();

    await waitFor(() => {
      expect(screen.getByText('Page One Employee')).toBeInTheDocument();
    });

    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(screen.getByText('Page Two Employee')).toBeInTheDocument();
    });
  });

  it('shows dash when check_in and check_out are null', async () => {
    server.use(
      http.get('*/attendance', () => HttpResponse.json(paginated([
        makeAttendance({ id: '2', check_in: null, check_out: null }),
      ]))),
    );

    renderAttendance();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });
});
