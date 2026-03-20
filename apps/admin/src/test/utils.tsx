import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import React from 'react';

const theme = createTheme();

export function renderWithProviders(ui: React.ReactElement, { route = '/' } = {}) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="*" element={ui} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

export function paginated<T>(data: T[], total?: number) {
  return {
    data,
    meta: { total: total ?? data.length, page: 1, per_page: 25, total_pages: Math.max(1, Math.ceil((total ?? data.length) / 25)) },
  };
}

export async function waitForLoaded() {
  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
}
