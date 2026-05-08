import { ReactNode } from "react";
import { Toaster } from "sonner";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      {children}
      <Toaster position="top-center" richColors />
    </I18nProvider>
  );
}
