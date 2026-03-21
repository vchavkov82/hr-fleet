import { fireEvent, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { renderWithProviders, paginated, waitForLoaded } from '@/test/utils';

import { DepartmentList } from './index';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const makeDepartment = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  code: 'ENG',
  name: 'Engineering',
  manager_name: 'Jane Manager',
  employee_count: 25,
  ...overrides,
});

const server = setupServer(
  http.get('*/departments', () => {
    return HttpResponse.json(paginated([
      makeDepartment(),
      makeDepartment({ id: '2', code: 'HR', name: 'Human Resources', manager_name: 'Bob Lead', employee_count: 10 }),
    ]));
  }),
  http.post('*/departments', () => {
    return HttpResponse.json(makeDepartment({ id: '3' }));
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  mockNavigate.mockReset();
});
afterAll(() => server.close());

describe('DepartmentList', () => {
  it('renders department data', async () => {
    renderWithProviders(<DepartmentList />);
    await waitForLoaded();

    expect(screen.getByText('ENG')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Jane Manager')).toBeInTheDocument();
    expect(screen.getAllByText('25').length).toBeGreaterThan(0);
  });

  it('shows loading spinner initially', () => {
    renderWithProviders(<DepartmentList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows empty state when no departments', async () => {
    server.use(
      http.get('*/departments', () => HttpResponse.json(paginated([]))),
    );

    renderWithProviders(<DepartmentList />);
    await waitForLoaded();

    expect(screen.getByText('No departments found')).toBeInTheDocument();
  });

  it('shows error and retry on API failure', async () => {
    server.use(
      http.get('*/departments', () => HttpResponse.error()),
    );

    renderWithProviders(<DepartmentList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load departments.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('supports pagination controls', async () => {
    server.use(
      http.get('*/departments', ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get('page');
        if (page === '2') {
          return HttpResponse.json(paginated(
            [makeDepartment({ id: '4', name: 'Page Two Dept' })],
            50,
          ));
        }
        return HttpResponse.json(paginated(
          [makeDepartment({ name: 'Page One Dept' })],
          50,
        ));
      }),
    );

    renderWithProviders(<DepartmentList />);
    await waitForLoaded();

    expect(screen.getByText('Page One Dept')).toBeInTheDocument();

    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(screen.getByText('Page Two Dept')).toBeInTheDocument();
    });
  });

  it('renders Add Department button', async () => {
    renderWithProviders(<DepartmentList />);
    await waitForLoaded();

    expect(screen.getByRole('button', { name: /add department/i })).toBeInTheDocument();
  });

  it('opens form dialog when Add Department is clicked', async () => {
    renderWithProviders(<DepartmentList />);
    await waitForLoaded();

    const addButton = screen.getByRole('button', { name: /add department/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('navigates to department detail on row click', async () => {
    renderWithProviders(<DepartmentList />);
    await waitForLoaded();

    const row = screen.getByText('Engineering').closest('tr');
    expect(row).toBeTruthy();
    fireEvent.click(row!);

    expect(mockNavigate).toHaveBeenCalledWith('/departments/1');
  });
});
