import { NextRequest, NextResponse } from "next/server";
import { CustomerResponse } from "@/types/customer";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  console.log(`demo PUT /api/customers/demo/${id} body:`, body);

  const updated: CustomerResponse = {
    id: Number(id),
    name: String(body.name ?? ""),
    phone: String(body.phone ?? ""),
    address: String(body.address ?? ""),
    email: String(body.email ?? ""),
    birthday: body.birthday ? String(body.birthday) : null,
  };

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  console.log(`demo DELETE /api/customers/demo/${id}`);

  return NextResponse.json({ ok: true });
}
