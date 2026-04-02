"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { trpc } from "@/lib/trpc";
import superjson from "superjson";
import { NotificationProvider } from "@/context/NotificationContext";
import { ToastContainer } from "@/components/ui/Toast";
import { store } from "@/store";
import { PWARegister } from "./PWARegister";
import { OfflineIndicator } from "./ui/OfflineIndicator";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
            retry: 1,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <ReduxProvider store={store}>
      <SessionProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <NotificationProvider>
              {children}
              <ToastContainer />
              <OfflineIndicator />
            </NotificationProvider>
          </QueryClientProvider>
        </trpc.Provider>
      </SessionProvider>
      <PWARegister />
    </ReduxProvider>
  );
}
