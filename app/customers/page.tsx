"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useCreateCustomerMutation,
  useCustomersQuery,
  useDeleteCustomerMutation,
  useImportCustomersMutation,
  useUpdateCustomerMutation,
} from "@/hooks/useCustomers";
import { CustomerSeed, CustomerType } from "@/types/customer";

const formatBirthday = (d: Date | null): string =>
  d ? d.toISOString().split("T")[0] : "";

type ModalState =
  | { open: false }
  | { open: true; mode: "create"; initial: null }
  | { open: true; mode: "edit"; initial: CustomerType };

export default function CustomersPage() {
  const { data, isLoading, isError, error } = useCustomersQuery();
  const deleteMutation = useDeleteCustomerMutation();
  const importMutation = useImportCustomersMutation();

  const [modal, setModal] = useState<ModalState>({ open: false });
  const [importErrors, setImportErrors] = useState<string[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpInput, setJumpInput] = useState<string>("");

  const filtered = useMemo(() => {
    const list = data ?? [];
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const visiblePages = useMemo(() => {
    const maxVisible = 5;
    let start = currentPage - Math.floor(maxVisible / 2);
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
  }, [currentPage, totalPages]);

  const handleDelete = (c: CustomerType) => {
    if (!window.confirm(`確定刪除 ${c.name}？`)) return;
    deleteMutation.mutate(c.id);
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
      toast.error(`讀取檔案失敗: ${String(err)}`);
      return;
    }

    const result = parseCustomerCsv(text);
    if (result.errors.length > 0) {
      setImportErrors(result.errors);
      return;
    }

    try {
      const { imported } = await importMutation.mutateAsync(result.rows);
      toast.success(`匯入成功，共 ${imported} 筆`);
    } catch {
      // toast 已由 mutation onError 處理
    }
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
        <h1 className="text-2xl font-semibold text-pri">會員列表</h1>
        <div className="flex gap-2">
          <button
            onClick={handleImportClick}
            disabled={importMutation.isPending}
            className="rounded-md border border-pri/20 bg-white/70 px-4 py-2 text-pri transition hover:bg-pri/5 disabled:opacity-50"
          >
            {importMutation.isPending ? "匯入中..." : "匯入 CSV"}
          </button>
          <button
            onClick={() => setModal({ open: true, mode: "create", initial: null })}
            className="rounded-md bg-pri px-4 py-2 text-white shadow-sm transition hover:bg-pri/90"
          >
            + 新增會員
          </button>
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
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜尋姓名、電話、地址、Email..."
          className="w-64 rounded-md border border-pri/20 bg-white px-3 py-2 outline-none focus:border-pri"
        />
        <div className="flex items-center gap-3 text-pri/80">
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="rounded-md border border-pri/20 bg-transparent px-2 py-1 outline-none"
          >
            <option value={10}>10 筆 / 頁</option>
            <option value={20}>20 筆 / 頁</option>
            <option value={50}>50 筆 / 頁</option>
            <option value={100}>100 筆 / 頁</option>
          </select>
          <span>共 {totalItems} 筆</span>
        </div>
      </div>

      {isLoading && <p className="text-pri/70">載入中...</p>}

      {isError && (
        <p className="text-red-600">載入失敗: {String(error)}</p>
      )}

      {data && (
        <div className="overflow-hidden rounded-lg border border-pri/10 bg-white/50">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-pri/10 text-pri">
                <tr>
                  <th className="px-4 py-3 font-semibold">序號</th>
                  <th className="px-4 py-3 font-semibold">姓名</th>
                  <th className="px-4 py-3 font-semibold">電話</th>
                  <th className="px-4 py-3 font-semibold">地址</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">生日</th>
                  <th className="px-4 py-3 font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-pri/50"
                    >
                      {searchQuery ? "沒有符合搜尋條件的資料" : "目前沒有資料"}
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
                            onClick={() =>
                              setModal({
                                open: true,
                                mode: "edit",
                                initial: c,
                              })
                            }
                            className="rounded bg-pri/10 px-3 py-1 text-pri transition hover:bg-pri hover:text-white"
                          >
                            修改
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            disabled={deleteMutation.isPending}
                            className="rounded bg-red-100 px-3 py-1 text-red-600 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                          >
                            刪除
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
                  aria-label="第一頁"
                >
                  «
                </PageBtn>
                <PageBtn
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="上一頁"
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
                  aria-label="下一頁"
                >
                  ›
                </PageBtn>
                <PageBtn
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  aria-label="最後一頁"
                >
                  »
                </PageBtn>
              </div>
              <div className="flex items-center gap-2 text-sm text-pri/70">
                <span>跳至</span>
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
                <span>頁 / 共 {totalPages} 頁</span>
              </div>
            </div>
          )}
        </div>
      )}

      {modal.open && (
        <CustomerFormModal
          mode={modal.mode}
          initial={modal.initial}
          onClose={() => setModal({ open: false })}
        />
      )}

      {importErrors && (
        <ImportErrorModal
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

const REQUIRED_HEADERS = ["name", "phone", "address", "email", "birthday"] as const;

function parseCustomerCsv(
  text: string
): { rows: CustomerSeed[]; errors: string[] } {
  const errors: string[] = [];
  const cleaned = text.replace(/^﻿/, "").trim();
  if (!cleaned) {
    return { rows: [], errors: ["CSV 內容為空"] };
  }

  const lines = cleaned.split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    return {
      rows: [],
      errors: [
        `表頭缺少欄位: ${missing.join(", ")} (實際表頭: ${headers.join(", ")})`,
      ],
    };
  }

  const dataLines = lines.slice(1).filter((l) => l.trim() !== "");
  if (dataLines.length === 0) {
    return { rows: [], errors: ["CSV 沒有任何資料列"] };
  }

  const rows: CustomerSeed[] = [];
  dataLines.forEach((line, idx) => {
    const lineNo = idx + 1;
    const values = line.split(",").map((s) => s.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = values[i] ?? ""));

    const rowErrors: string[] = [];
    if (!obj.name) rowErrors.push("姓名為必填");
    if (obj.birthday && !/^\d{4}-\d{2}-\d{2}$/.test(obj.birthday)) {
      rowErrors.push(`生日格式應為 YYYY-MM-DD (實際: ${obj.birthday})`);
    }
    if (values.length !== headers.length) {
      rowErrors.push(
        `欄位數不符 (應 ${headers.length}, 實際 ${values.length})`
      );
    }

    if (rowErrors.length > 0) {
      errors.push(`第 ${lineNo} 列: ${rowErrors.join("；")}`);
      return;
    }

    rows.push({
      name: obj.name,
      phone: obj.phone,
      address: obj.address,
      email: obj.email,
      birthday: obj.birthday || null,
    });
  });

  return errors.length > 0 ? { rows: [], errors } : { rows, errors: [] };
}

function ImportErrorModal({
  errors,
  onClose,
}: {
  errors: string[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-xl font-semibold text-pri">匯入失敗</h2>
        <p className="mb-4 text-sm text-pri/70">
          以下 {errors.length} 筆資料有問題，整批未匯入。請修正後重試。
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
            知道了
          </button>
        </div>
      </div>
    </div>
  );
}

interface FormState {
  name: string;
  phone: string;
  address: string;
  email: string;
  birthday: string;
}

const emptyForm: FormState = {
  name: "",
  phone: "",
  address: "",
  email: "",
  birthday: "",
};

const fromCustomer = (c: CustomerType): FormState => ({
  name: c.name,
  phone: c.phone,
  address: c.address,
  email: c.email,
  birthday: formatBirthday(c.birthday),
});

function CustomerFormModal({
  mode,
  initial,
  onClose,
}: {
  mode: "create" | "edit";
  initial: CustomerType | null;
  onClose: () => void;
}) {
  const createMutation = useCreateCustomerMutation();
  const updateMutation = useUpdateCustomerMutation();

  const [form, setForm] = useState<FormState>(
    initial ? fromCustomer(initial) : emptyForm
  );

  const submitting = createMutation.isPending || updateMutation.isPending;

  const submit = async () => {
    if (!form.name.trim()) {
      alert("姓名為必填");
      return;
    }

    const payload: CustomerType = {
      id: initial?.id ?? 0,
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      email: form.email.trim(),
      birthday: form.birthday ? new Date(form.birthday) : null,
    };

    try {
      if (mode === "edit") {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch {
      // toast 已由 mutation onError 處理
    }
  };

  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((s) => ({ ...s, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold text-pri">
          {mode === "edit" ? "修改會員" : "新增會員"}
        </h2>

        <div className="flex flex-col gap-3">
          <FormField label="姓名">
            <input
              value={form.name}
              onChange={update("name")}
              className="w-full rounded-md border border-pri/20 px-3 py-2 outline-none focus:border-pri"
            />
          </FormField>
          <FormField label="電話">
            <input
              value={form.phone}
              onChange={update("phone")}
              className="w-full rounded-md border border-pri/20 px-3 py-2 outline-none focus:border-pri"
            />
          </FormField>
          <FormField label="地址">
            <input
              value={form.address}
              onChange={update("address")}
              className="w-full rounded-md border border-pri/20 px-3 py-2 outline-none focus:border-pri"
            />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              className="w-full rounded-md border border-pri/20 px-3 py-2 outline-none focus:border-pri"
            />
          </FormField>
          <FormField label="生日">
            <input
              type="date"
              value={form.birthday}
              onChange={update("birthday")}
              className="w-full rounded-md border border-pri/20 px-3 py-2 outline-none focus:border-pri"
            />
          </FormField>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-md border border-pri/20 px-4 py-2 text-pri transition hover:bg-pri/5 disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="rounded-md bg-pri px-4 py-2 text-white transition hover:bg-pri/90 disabled:opacity-50"
          >
            {submitting ? "處理中..." : "確定"}
          </button>
        </div>
      </div>
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
