import { NextRequest, NextResponse } from "next/server";
import { CustomerResponse } from "@/types/customer";
import { customerStore, nextId } from "./_store";

export async function GET() {
  console.log("demo GET /api/customers/demo");
  return NextResponse.json(customerStore);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("demo POST /api/customers/demo body:", body);

  const created: CustomerResponse = {
    id: nextId(),
    name: String(body.name ?? ""),
    phone: String(body.phone ?? ""),
    address: String(body.address ?? ""),
    email: String(body.email ?? ""),
    birthday: body.birthday ? String(body.birthday) : null,
  };

  customerStore.push(created);
  return NextResponse.json(created);
}
