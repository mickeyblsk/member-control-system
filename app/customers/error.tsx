"use client";

import { useEffect } from "react";
import { useT } from "@/lib/i18n/I18nProvider";

export default function CustomersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <p className="text-red-600">{t("customers.loadFailed")}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-pri px-4 py-2 text-white transition hover:bg-pri/90"
      >
        {t("common.confirm")}
      </button>
    </div>
  );
}
