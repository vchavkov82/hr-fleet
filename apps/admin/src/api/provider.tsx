import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiClient } from '@hr/api-client';
import { createContext, useContext, useMemo } from 'react';

const ApiContext = createContext<ApiClient | null>(null);

export function useApiClient() {
  const client = useContext(ApiContext);
  if (!client) throw new Error('useApiClient must be used within ApiProvider');
  return client;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const apiClient = useMemo(
    () =>
      new ApiClient({
        baseUrl: import.meta.env.VITE_API_URL || '/api/v1',
        getToken: () => localStorage.getItem('access_token'),
      }),
    [],
  );

  return (
    <ApiContext value={apiClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApiContext>
  );
}
