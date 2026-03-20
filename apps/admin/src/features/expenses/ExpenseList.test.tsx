import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { paginated, renderWithProviders, waitForLoaded } from '@/test/utils';

import { ExpenseList } from './index';

const makeExpense = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  employee_id: '10',
  employee_name: 'John Doe',
  category: 'Travel',
  amount: 250,
  currency: 'BGN',
  date: '2026-03-15',
  description: 'Flight tickets',
  status: 'pending',
  ...overrides,
});

const server = setupServer(
  http.get('*/expenses', () => {
    return HttpResponse.json(
      paginated([
        makeExpense(),
        makeExpense({ id: '2', employee_name: 'Jane Smith', status: 'approved', category: 'Food', amount: 45 }),
        makeExpense({ id: '3', employee_name: 'Bob Wilson', status: 'rejected', category: 'Equipment', amount: 800 }),
      ]),
    );
  }),
  http.post('*/expenses/:id/approve', () => {
    return HttpResponse.json({ success: true });
  }),
  http.post('*/expenses/:id/reject', () => {
    return HttpResponse.json({ success: true });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ExpenseList', () => {
  it('renders expense data from API', async () => {
    renderWithProviders(<ExpenseList />);
    await waitForLoaded();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Travel')).toBeInTheDocument();
    expect(screen.getByText(/250/)).toBeInTheDocument();
    expect(screen.getByText(/BGN/)).toBeInTheDocument();
    expect(screen.getByText('Flight tickets')).toBeInTheDocument();
  });

  it('shows loading spinner initially', () => {
    renderWithProviders(<ExpenseList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders status chips', async () => {
    renderWithProviders(<ExpenseList />);
    await waitForLoaded();

    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('approved')).toBeInTheDocument();
    expect(screen.getByText('rejected')).toBeInTheDocument();
  });

  it('shows empty state when no data', async () => {
    server.use(
      http.get('*/expenses', () => HttpResponse.json(paginated([]))),
    );

    renderWithProviders(<ExpenseList />);
    await waitForLoaded();

    expect(screen.getByText('No expenses found')).toBeInTheDocument();
  });

  it('shows error and retry on API failure', async () => {
    server.use(
      http.get('*/expenses', () => HttpResponse.error()),
    );

    renderWithProviders(<ExpenseList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load expenses.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('supports pagination', async () => {
    server.use(
      http.get('*/expenses', ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get('page');
        if (page === '2') {
          return HttpResponse.json(
            paginated([makeExpense({ id: '4', employee_name: 'Page Two Employee' })], 50),
          );
        }
        return HttpResponse.json(
          paginated([makeExpense({ employee_name: 'Page One Employee' })], 50),
        );
      }),
    );

    renderWithProviders(<ExpenseList />);

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
      http.get('*/expenses', () =>
        HttpResponse.json(
          paginated([
            makeExpense({ id: '1', status: 'pending' }),
            makeExpense({ id: '2', status: 'approved', employee_name: 'Jane Smith' }),
          ]),
        ),
      ),
    );

    renderWithProviders(<ExpenseList />);
    await waitForLoaded();

    const approveButtons = screen.getAllByLabelText('Approve');
    expect(approveButtons).toHaveLength(1);

    const rejectButtons = screen.getAllByLabelText('Reject');
    expect(rejectButtons).toHaveLength(1);
  });

  it('approve calls POST endpoint directly', async () => {
    let called = false;
    server.use(
      http.post('*/expenses/:id/approve', () => {
        called = true;
        return HttpResponse.json({ success: true });
      }),
    );

    renderWithProviders(<ExpenseList />);
    await waitForLoaded();

    const approveButton = screen.getAllByLabelText('Approve')[0];
    await userEvent.click(approveButton);

    await waitFor(() => {
      expect(called).toBe(true);
    });
  });

  it('shows error when reject fails', async () => {
    server.use(
      http.post('*/expenses/:id/reject', () => HttpResponse.error()),
    );

    renderWithProviders(<ExpenseList />);
    await waitForLoaded();

    const rejectButton = screen.getAllByLabelText('Reject')[0];
    await userEvent.click(rejectButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to reject expense.')).toBeInTheDocument();
    });
  });
});
