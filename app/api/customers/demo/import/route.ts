import { NextRequest, NextResponse } from "next/server";
import { CustomerResponse, CustomerSeed } from "@/types/customer";
import { customerStore, nextId } from "../_store";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rows: CustomerSeed[] = Array.isArray(body?.rows) ? body.rows : [];
  console.log(`demo POST /api/customers/demo/import rows: ${rows.length}`);

  if (rows.length === 0) {
    return NextResponse.json(
      { message: "no rows to import" },
      { status: 400 }
    );
  }

  const customers: CustomerResponse[] = [];
  for (const r of rows) {
    const created: CustomerResponse = {
      id: nextId(),
      name: String(r.name ?? ""),
      phone: String(r.phone ?? ""),
      address: String(r.address ?? ""),
      email: String(r.email ?? ""),
      birthday: r.birthday ? String(r.birthday) : null,
    };
    customerStore.push(created);
    customers.push(created);
  }

  return NextResponse.json({ imported: customers.length, customers });
}
