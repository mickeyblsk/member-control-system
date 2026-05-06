"use client";

import { useState, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

export default function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <I18nProvider>
      <QueryClientProvider client={client}>
        {children}
        <GlobalLoadingOverlay />
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </I18nProvider>
  );
}
