import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { renderWithProviders, paginated, waitForLoaded } from '@/test/utils';

import { AuditLog } from './index';

const makeEntry = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  user_email: 'admin@example.com',
  action: 'create_employee',
  resource_type: 'employee',
  resource_id: '12345678-abcd-efgh-ijkl-mnopqrstuvwx',
  ip_address: '192.168.1.1',
  changes: { name: { old: 'John', new: 'Jonathan' } },
  created_at: '2026-03-15T10:30:00Z',
  ...overrides,
});

const server = setupServer(
  http.get('*/audit-log', () => {
    return HttpResponse.json(paginated([
      makeEntry(),
      makeEntry({ id: '2', user_email: 'user@example.com', action: 'update_employee', resource_type: 'employee' }),
    ]));
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AuditLog', () => {
  it('renders audit log data', async () => {
    renderWithProviders(<AuditLog />);
    await waitForLoaded();

    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('create_employee')).toBeInTheDocument();
    expect(screen.getByText('employee')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
  });

  it('shows loading spinner initially', () => {
    renderWithProviders(<AuditLog />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows empty state when no entries', async () => {
    server.use(
      http.get('*/audit-log', () => HttpResponse.json(paginated([]))),
    );

    renderWithProviders(<AuditLog />);
    await waitForLoaded();

    expect(screen.getByText('No audit log entries found')).toBeInTheDocument();
  });

  it('shows error and retry on API failure', async () => {
    server.use(
      http.get('*/audit-log', () => HttpResponse.error()),
    );

    renderWithProviders(<AuditLog />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load audit log.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('supports pagination controls', async () => {
    server.use(
      http.get('*/audit-log', ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get('page');
        if (page === '2') {
          return HttpResponse.json(paginated(
            [makeEntry({ id: '4', user_email: 'page2@example.com' })],
            50,
          ));
        }
        return HttpResponse.json(paginated(
          [makeEntry({ user_email: 'page1@example.com' })],
          50,
        ));
      }),
    );

    renderWithProviders(<AuditLog />);
    await waitForLoaded();

    expect(screen.getByText('page1@example.com')).toBeInTheDocument();

    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(screen.getByText('page2@example.com')).toBeInTheDocument();
    });
  });

  it('renders Audit Log heading', async () => {
    renderWithProviders(<AuditLog />);
    await waitForLoaded();

    expect(screen.getByText('Audit Log')).toBeInTheDocument();
  });

  it('shows truncated resource_id', async () => {
    renderWithProviders(<AuditLog />);
    await waitForLoaded();

    expect(screen.getByText('12345678...')).toBeInTheDocument();
  });
});
