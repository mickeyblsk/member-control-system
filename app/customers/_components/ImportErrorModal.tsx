"use client";

import { useT } from "@/lib/i18n/I18nProvider";

export default function ImportErrorModal({
  errors,
  onClose,
}: {
  errors: string[];
  onClose: () => void;
}) {
  const t = useT();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-xl font-semibold text-pri">
          {t("customers.importFailedTitle")}
        </h2>
        <p className="mb-4 text-sm text-pri/70">
          {t("customers.importFailedDesc", { n: errors.length })}
        </p>
        <ul className="max-h-80 list-disc overflow-y-auto pl-6 text-sm text-pri">
          {errors.map((err, i) => (
            <li key={i} className="py-0.5">
              {err}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-pri px-4 py-2 text-white transition hover:bg-pri/90"
          >
            {t("common.ack")}
          </button>
        </div>
      </div>
    </div>
  );
}
