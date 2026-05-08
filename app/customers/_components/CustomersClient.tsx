"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import LanguageSwitcherClient from "@/components/LanguageSwitcherClient";
import { Customer } from "@/types/customer";
import { useT } from "@/lib/i18n/I18nProvider";
import {
  deleteCustomerAction,
  importCustomersAction,
} from "../actions";
import { logoutAction } from "../../login/actions";
import CustomerFormModalClient from "./CustomerFormModalClient";
import ImportErrorModalClient from "./ImportErrorModalClient";
import { parseCustomerCsv } from "./parseCsv";

type ModalState =
  | { open: false }
  | { open: true; mode: "create"; initial: null }
  | { open: true; mode: "edit"; initial: Customer };

const formatBirthday = (d: Date | null): string =>
  d ? d.toISOString().split("T")[0] : "";

export default function CustomersClient({
  customers,
}: {
  customers: Customer[];
}) {
  const t = useT();
  const [pending, startTransition] = useTransition();

  const [modal, setModal] = useState<ModalState>({ open: false });
  const [importErrors, setImportErrors] = useState<string[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpInput, setJumpInput] = useState<string>("");

  const filtered = useMemo(() => {
    if (!searchQuery) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, safePage, itemsPerPage]);

  const visiblePages = useMemo(() => {
    const maxVisible = 5;
    let start = safePage - Math.floor(maxVisible / 2);
    let end = start + maxVisible - 1;
    if (start < 1) {
      start = 1;
      end = Math.min(totalPages, maxVisible);
    }
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [safePage, totalPages]);

  const handleDelete = (c: Customer) => {
    if (!window.confirm(t("customers.confirmDelete", { name: c.name }))) return;
    startTransition(async () => {
      try {
        await deleteCustomerAction(c.id);
      } catch {
        toast.error(t("customers.mutationDeleteFailed"));
      }
    });
  };

  const handleImportClick = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    let text: string;
    try {
      text = await file.text();
    } catch (err) {
      toast.error(`${t("customers.readFileFailed")}: ${String(err)}`);
      return;
    }

    const result = parseCustomerCsv(text, t);
    if (result.errors.length > 0) {
      setImportErrors(result.errors);
      return;
    }

    startTransition(async () => {
      try {
        const { imported } = await importCustomersAction(result.rows);
        toast.success(t("customers.importSuccess", { n: imported }));
      } catch {
        toast.error(t("customers.mutationImportFailed"));
      }
    });
  };

  const jumpToPage = () => {
    const n = Number(jumpInput);
    if (!Number.isFinite(n) || n <= 0) {
      setJumpInput("");
      return;
    }
    const p = Math.min(Math.max(1, Math.floor(n)), totalPages);
    setCurrentPage(p);
    setJumpInput("");
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-pri">
          {t("customers.title")}
        </h1>
        <div className="flex items-center gap-2">
          <LanguageSwitcherClient className="ml-2" />
          <button
            type="button"
            onClick={handleImportClick}
            disabled={pending}
            className="rounded-md border border-pri/20 bg-white/70 px-4 py-2 text-pri transition hover:bg-pri/5 disabled:opacity-50"
          >
            {pending ? t("customers.importing") : t("customers.importCsv")}
          </button>
          <button
            type="button"
            onClick={() =>
              setModal({ open: true, mode: "create", initial: null })
            }
            className="rounded-md bg-pri px-4 py-2 text-white shadow-sm transition hover:bg-pri/90"
          >
            {t("customers.addMember")}
          </button>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-pri/20 bg-white/70 px-4 py-2 text-pri transition hover:bg-pri/5"
            >
              {t("common.logout")}
            </button>
          </form>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFile}
        className="hidden"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-pri/10 bg-white/50 px-4 py-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder={t("customers.searchPlaceholder")}
          className="w-64 rounded-md border border-pri/20 bg-white px-3 py-2 outline-none focus:border-pri"
        />
        <div className="flex items-center gap-3 text-pri/80">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-md border border-pri/20 bg-transparent px-2 py-1 outline-none"
          >
            <option value={10}>{t("customers.perPage", { n: 10 })}</option>
            <option value={20}>{t("customers.perPage", { n: 20 })}</option>
            <option value={50}>{t("customers.perPage", { n: 50 })}</option>
            <option value={100}>{t("customers.perPage", { n: 100 })}</option>
          </select>
          <span>{t("customers.totalItems", { n: totalItems })}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-pri/10 bg-white/50">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-pri/10 text-pri">
              <tr>
                <th className="px-4 py-3 font-semibold">
                  {t("customers.colIndex")}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {t("customers.colName")}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {t("customers.colPhone")}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {t("customers.colAddress")}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {t("customers.colEmail")}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {t("customers.colBirthday")}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {t("customers.colActions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-pri/50"
                  >
                    {searchQuery
                      ? t("customers.noMatch")
                      : t("customers.noData")}
                  </td>
                </tr>
              ) : (
                paginated.map((c, idx) => (
                  <tr
                    key={c.id}
                    className="border-t border-pri/5 transition hover:bg-pri/[0.03]"
                  >
                    <td className="px-4 py-3">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-4 py-3">{c.name}</td>
                    <td className="px-4 py-3">{c.phone || "-"}</td>
                    <td
                      className="max-w-xs truncate px-4 py-3"
                      title={c.address}
                    >
                      {c.address || "-"}
                    </td>
                    <td className="px-4 py-3">{c.email || "-"}</td>
                    <td className="px-4 py-3">
                      {formatBirthday(c.birthday) || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setModal({
                              open: true,
                              mode: "edit",
                              initial: c,
                            })
                          }
                          className="rounded bg-pri/10 px-3 py-1 text-pri transition hover:bg-pri hover:text-white"
                        >
                          {t("customers.edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          disabled={pending}
                          className="rounded bg-red-100 px-3 py-1 text-red-600 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                        >
                          {t("customers.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-3 border-t border-pri/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <PageBtn
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                aria-label={t("customers.pageFirst")}
              >
                «
              </PageBtn>
              <PageBtn
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label={t("customers.pagePrev")}
              >
                ‹
              </PageBtn>
              {visiblePages.map((p) => (
                <PageBtn
                  key={p}
                  active={p === currentPage}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </PageBtn>
              ))}
              <PageBtn
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                aria-label={t("customers.pageNext")}
              >
                ›
              </PageBtn>
              <PageBtn
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                aria-label={t("customers.pageLast")}
              >
                »
              </PageBtn>
            </div>
            <div className="flex items-center gap-2 text-sm text-pri/70">
              <span>{t("customers.jumpTo")}</span>
              <input
                type="number"
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                onBlur={jumpToPage}
                onKeyDown={(e) => {
                  if (e.key === "Enter") jumpToPage();
                }}
                min={1}
                max={totalPages}
                placeholder={String(currentPage)}
                className="w-16 rounded-md border border-pri/20 bg-white px-2 py-1 text-center outline-none focus:border-pri [appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span>{t("customers.pageOfTotal", { n: totalPages })}</span>
            </div>
          </div>
        )}
      </div>

      {modal.open && (
        <CustomerFormModalClient
          mode={modal.mode}
          initial={modal.initial}
          onClose={() => setModal({ open: false })}
        />
      )}

      {importErrors && (
        <ImportErrorModalClient
          errors={importErrors}
          onClose={() => setImportErrors(null)}
        />
      )}
    </main>
  );
}

function PageBtn({
  active = false,
  disabled = false,
  onClick,
  children,
  ...rest
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "flex h-9 w-9 items-center justify-center rounded-md border text-sm transition";
  const state = active
    ? "border-pri bg-pri text-white"
    : disabled
    ? "border-pri/10 text-pri/30 cursor-not-allowed"
    : "border-pri/20 bg-white text-pri hover:bg-pri/10";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${state}`}
      {...rest}
    >
      {children}
    </button>
  );
}
