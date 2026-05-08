"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Customer } from "@/types/customer";
import { useT } from "@/lib/i18n/I18nProvider";
import {
  createCustomerAction,
  updateCustomerAction,
} from "../actions";

type FormState = {
  errorCode?: "REQUIRED_NAME" | "INVALID_BIRTHDAY" | "CUSTOMER_NOT_FOUND";
  ok?: boolean;
};

const INITIAL_STATE: FormState = {};

const formatBirthday = (d: Date | null): string =>
  d ? d.toISOString().split("T")[0] : "";

const wrapAction = (
  fn: (formData: FormData) => Promise<unknown>
): ((prev: FormState, formData: FormData) => Promise<FormState>) => {
  return async (_prev, formData) => {
    try {
      await fn(formData);
      return { ok: true };
    } catch (err) {
      const code =
        err instanceof Error ? (err.message as FormState["errorCode"]) : undefined;
      return { errorCode: code };
    }
  };
};

export default function CustomerFormModal({
  mode,
  initial,
  onClose,
}: {
  mode: "create" | "edit";
  initial: Customer | null;
  onClose: () => void;
}) {
  const t = useT();

  const action =
    mode === "edit" && initial
      ? updateCustomerAction.bind(null, initial.id)
      : createCustomerAction;

  const [state, formAction, pending] = useActionState(
    wrapAction(action),
    INITIAL_STATE
  );

  useEffect(() => {
    if (state.ok) onClose();
  }, [state, onClose]);

  useEffect(() => {
    if (!state.errorCode) return;
    const msg =
      state.errorCode === "REQUIRED_NAME"
        ? t("customers.requiredName")
        : state.errorCode === "INVALID_BIRTHDAY"
        ? t("customers.birthdayFormat")
        : mode === "edit"
        ? t("customers.mutationUpdateFailed")
        : t("customers.mutationCreateFailed");
    toast.error(msg);
  }, [state, t, mode]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        action={formAction}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 className="mb-4 text-xl font-semibold text-pri">
          {mode === "edit"
            ? t("customers.formEditTitle")
            : t("customers.formCreateTitle")}
        </h2>

        <div className="flex flex-col gap-3">
          <FormField label={t("customers.colName")}>
            <input
              name="name"
              defaultValue={initial?.name ?? ""}
              required
              className="w-full rounded-md border border-pri/20 px-3 py-2 outline-none focus:border-pri"
            />
          </FormField>
          <FormField label={t("customers.colPhone")}>
            <input
              name="phone"
              defaultValue={initial?.phone ?? ""}
              className="w-full rounded-md border border-pri/20 px-3 py-2 outline-none focus:border-pri"
            />
          </FormField>
          <FormField label={t("customers.colAddress")}>
            <input
              name="address"
              defaultValue={initial?.address ?? ""}
              className="w-full rounded-md border border-pri/20 px-3 py-2 outline-none focus:border-pri"
            />
          </FormField>
          <FormField label={t("customers.colEmail")}>
            <input
              name="email"
              type="email"
              defaultValue={initial?.email ?? ""}
              className="w-full rounded-md border border-pri/20 px-3 py-2 outline-none focus:border-pri"
            />
          </FormField>
          <FormField label={t("customers.colBirthday")}>
            <input
              name="birthday"
              type="date"
              defaultValue={formatBirthday(initial?.birthday ?? null)}
              className="w-full rounded-md border border-pri/20 px-3 py-2 outline-none focus:border-pri"
            />
          </FormField>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-md border border-pri/20 px-4 py-2 text-pri transition hover:bg-pri/5 disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-pri px-4 py-2 text-white transition hover:bg-pri/90 disabled:opacity-50"
          >
            {pending ? t("common.processing") : t("common.confirm")}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-pri">
      {label}
      {children}
    </label>
  );
}
