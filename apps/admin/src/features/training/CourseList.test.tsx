import { ThemeProvider, createTheme } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { TrainingList } from './index';

const makeCourse = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  name: 'React Fundamentals',
  description: 'Learn React basics',
  duration_hours: 8,
  instructor: 'Prof. Smith',
  enrolled_count: 15,
  status: 'active',
  ...overrides,
});

const paginated = (data: unknown[], total?: number) => ({
  data,
  meta: { total: total ?? data.length, page: 1, per_page: 25, total_pages: 1 },
});

const server = setupServer(
  http.get('*/training/courses', () => {
    return HttpResponse.json(paginated([
      makeCourse(),
      makeCourse({ id: '2', name: 'TypeScript Advanced', status: 'draft', duration_hours: 16, instructor: 'Dr. Jones' }),
      makeCourse({ id: '3', name: 'Go Concurrency', status: 'archived', duration_hours: 4, instructor: 'Prof. Lee' }),
    ]));
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderCourses() {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<TrainingList />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('CourseList', () => {
  it('renders course data from API', async () => {
    renderCourses();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('TypeScript Advanced')).toBeInTheDocument();
    expect(screen.getByText('Go Concurrency')).toBeInTheDocument();
    expect(screen.getByText('Prof. Smith')).toBeInTheDocument();
    expect(screen.getByText('8h')).toBeInTheDocument();
  });

  it('shows loading spinner initially', () => {
    renderCourses();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders status chips with correct labels', async () => {
    renderCourses();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
    expect(screen.getByText('archived')).toBeInTheDocument();
  });

  it('shows empty state when no data', async () => {
    server.use(
      http.get('*/training/courses', () => HttpResponse.json(paginated([]))),
    );

    renderCourses();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No courses found')).toBeInTheDocument();
  });

  it('shows error and retry on API failure', async () => {
    server.use(
      http.get('*/training/courses', () => HttpResponse.error()),
    );

    renderCourses();

    await waitFor(() => {
      expect(screen.getByText('Failed to load training courses.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('supports pagination controls', async () => {
    server.use(
      http.get('*/training/courses', ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get('page');
        if (page === '2') {
          return HttpResponse.json(paginated(
            [makeCourse({ id: '4', name: 'Page Two Course' })],
            50,
          ));
        }
        return HttpResponse.json(paginated(
          [makeCourse({ name: 'Page One Course' })],
          50,
        ));
      }),
    );

    renderCourses();

    await waitFor(() => {
      expect(screen.getByText('Page One Course')).toBeInTheDocument();
    });

    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(screen.getByText('Page Two Course')).toBeInTheDocument();
    });
  });

  it('renders Add Course button', async () => {
    renderCourses();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /add course/i })).toBeInTheDocument();
  });

  it('renders duration in hours format', async () => {
    renderCourses();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('8h')).toBeInTheDocument();
    expect(screen.getByText('16h')).toBeInTheDocument();
    expect(screen.getByText('4h')).toBeInTheDocument();
  });
});
