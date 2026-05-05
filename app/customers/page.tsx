"use client";

import { useCustomersQuery } from "@/hooks/useCustomers";
import { CustomerType } from "@/types/customer";

const formatBirthday = (d: Date | null): string =>
  d ? d.toISOString().split("T")[0] : "";

export default function CustomersPage() {
  const { data, isLoading, isError, error } = useCustomersQuery();

  return (
    <main className="flex flex-1 flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">會員列表</h1>

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
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
