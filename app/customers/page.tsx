"use client";

import { useRef, useState } from "react";
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

  return (
    <main className="flex flex-1 flex-col gap-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">會員列表</h1>
        <div className="flex gap-2">
          <button
            onClick={handleImportClick}
            disabled={importMutation.isPending}
            className="rounded border border-zinc-300 px-4 py-2 hover:bg-zinc-100 disabled:opacity-50"
          >
            {importMutation.isPending ? "匯入中..." : "匯入 CSV"}
          </button>
          <button
            onClick={() => setModal({ open: true, mode: "create", initial: null })}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            新增
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

      {isLoading && <p>載入中...</p>}

      {isError && (
        <p className="text-red-600">
          載入失敗: {String(error)}
        </p>
      )}

      {data && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead className="border-b">
              <tr>
                <th className="px-4 py-2">姓名</th>
                <th className="px-4 py-2">電話</th>
                <th className="px-4 py-2">地址</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">生日</th>
                <th className="px-4 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                    目前沒有資料
                  </td>
                </tr>
              ) : (
                data.map((c: CustomerType) => (
                  <tr key={c.id} className="border-b">
                    <td className="px-4 py-2">{c.name}</td>
                    <td className="px-4 py-2">{c.phone}</td>
                    <td className="px-4 py-2">{c.address}</td>
                    <td className="px-4 py-2">{c.email}</td>
                    <td className="px-4 py-2">{formatBirthday(c.birthday)}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setModal({ open: true, mode: "edit", initial: c })
                          }
                          className="rounded border border-zinc-300 px-3 py-1 hover:bg-zinc-100"
                        >
                          修改
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          disabled={deleteMutation.isPending}
                          className="rounded border border-red-300 px-3 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
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
    const lineNo = idx + 1; // 0-indexed; +1 for 1-based, header不會算入列
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
      <div className="w-full max-w-lg rounded bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-xl font-semibold">匯入失敗</h2>
        <p className="mb-4 text-sm text-zinc-600">
          以下 {errors.length} 筆資料有問題，整批未匯入。請修正後重試。
        </p>
        <ul className="max-h-80 list-disc overflow-y-auto pl-6 text-sm">
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
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
      // toast 已由 mutation onError 處理；保持 modal 開啟讓使用者重試
    }
  };

  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((s) => ({ ...s, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold">
          {mode === "edit" ? "修改會員" : "新增會員"}
        </h2>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            姓名
            <input
              value={form.name}
              onChange={update("name")}
              className="border p-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            電話
            <input
              value={form.phone}
              onChange={update("phone")}
              className="border p-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            地址
            <input
              value={form.address}
              onChange={update("address")}
              className="border p-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              className="border p-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            生日
            <input
              type="date"
              value={form.birthday}
              onChange={update("birthday")}
              className="border p-2"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded border border-zinc-300 px-4 py-2 hover:bg-zinc-100 disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "處理中..." : "確定"}
          </button>
        </div>
      </div>
    </div>
  );
}
