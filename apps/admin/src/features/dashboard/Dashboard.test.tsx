import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { renderWithProviders, waitForLoaded } from '@/test/utils';

import { Dashboard } from './index';

const listMeta = (total: number) => ({
  data: [],
  meta: { total, page: 1, per_page: 1, total_pages: Math.max(1, total) },
});

const server = setupServer(
  http.get('*/employees', ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('active') === 'true') {
      return HttpResponse.json(listMeta(5));
    }
    return HttpResponse.json(listMeta(10));
  }),
  http.get('*/leave/requests', () => HttpResponse.json(listMeta(2))),
  http.get('*/contracts', () => HttpResponse.json(listMeta(1))),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderDashboard() {
  return renderWithProviders(<Dashboard />);
}

describe('Dashboard', () => {
  it('renders stats from mocked API', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Active Employees')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
