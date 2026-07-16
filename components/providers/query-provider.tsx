'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';

/**
 * Global TanStack Query Provider.
 * Wraps the application to provide query caching and management.
 */
export default function QueryProvider({ children }: { children: ReactNode }) {
  // Create a new QueryClient instance once per application lifecycle
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default settings for all queries
            staleTime: 60 * 1000, // 1 minute (data stays fresh for 1 min)
            gcTime: 5 * 60 * 1000, // 5 minutes (data stays in cache for 5 min)
            retry: 1, // Only retry once on failure
            refetchOnWindowFocus: false, // Don't refetch when user switches tabs
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools enabled only in development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
