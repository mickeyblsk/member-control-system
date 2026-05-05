import { NextRequest, NextResponse } from "next/server";
import { request } from "@/lib/serverRequest";
import { CustomerResponse, CustomerSeed } from "@/types/customer";

interface BackendEnvelope<T> {
  error: string;
  result: T;
}

const buildQuery = (obj: Record<string, unknown>): string => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null) sp.append(k, String(v));
  }
  return sp.toString();
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows: CustomerSeed[] = Array.isArray(body?.rows) ? body.rows : [];

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "no rows to import" },
        { status: 400 }
      );
    }

    const customers: CustomerResponse[] = [];
    for (const r of rows) {
      const qs = buildQuery({
        name: r.name,
        phone: r.phone,
        address: r.address,
        email: r.email,
        birthday: r.birthday ?? "",
      });
      const data = await request<BackendEnvelope<CustomerResponse[]>>(
        `/new_customer?${qs}`
      );
      if (data.error !== "") {
        return NextResponse.json(
          {
            message: `匯入第 ${customers.length} 筆失敗: ${data.error}`,
            imported: customers.length,
            customers,
          },
          { status: 400 }
        );
      }
      if (data.result?.[0]) customers.push(data.result[0]);
    }

    return NextResponse.json({ imported: customers.length, customers });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to import customers", error: String(error) },
      { status: 500 }
    );
  }
}
