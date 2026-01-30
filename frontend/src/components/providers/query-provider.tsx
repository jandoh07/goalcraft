"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { useState } from "react";

/**
 * React Query Provider with Local Storage Persistence
 * Creates a stable QueryClient instance that persists across renders
 * and syncs query cache to localStorage for offline support
 */
export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: true,
            retry: 1,
            staleTime: 5 * 60 * 1000,
            gcTime: 1000 * 60 * 60 * 24,
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  );

  const localStoragePersister = createAsyncStoragePersister({
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  });

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: localStoragePersister,
        maxAge: 24 * 60 * 60 * 1000,
        buster: "v1.0.0",
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
