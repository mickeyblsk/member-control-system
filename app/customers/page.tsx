"use client";

import { useState } from "react";
import {
  useCreateCustomerMutation,
  useCustomersQuery,
  useDeleteCustomerMutation,
  useUpdateCustomerMutation,
} from "@/hooks/useCustomers";
import { CustomerType } from "@/types/customer";

const formatBirthday = (d: Date | null): string =>
  d ? d.toISOString().split("T")[0] : "";

type ModalState =
  | { open: false }
  | { open: true; mode: "create"; initial: null }
  | { open: true; mode: "edit"; initial: CustomerType };

export default function CustomersPage() {
  const { data, isLoading, isError, error } = useCustomersQuery();
  const deleteMutation = useDeleteCustomerMutation();

  const [modal, setModal] = useState<ModalState>({ open: false });

  const handleDelete = (c: CustomerType) => {
    if (!window.confirm(`確定刪除 ${c.name}？`)) return;
    deleteMutation.mutate(c.id);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">會員列表</h1>
        <button
          onClick={() => setModal({ open: true, mode: "create", initial: null })}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          新增
        </button>
      </div>

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
    </main>
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
