import { NextRequest, NextResponse } from "next/server";
import { CustomerResponse } from "@/types/customer";
import { customerStore } from "../_store";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  console.log(`demo PUT /api/customers/demo/${id} body:`, body);

  const targetId = Number(id);
  const idx = customerStore.findIndex((c) => c.id === targetId);
  if (idx === -1) {
    return NextResponse.json(
      { message: `customer ${id} not found` },
      { status: 404 }
    );
  }

  const updated: CustomerResponse = {
    id: targetId,
    name: String(body.name ?? ""),
    phone: String(body.phone ?? ""),
    address: String(body.address ?? ""),
    email: String(body.email ?? ""),
    birthday: body.birthday ? String(body.birthday) : null,
  };

  customerStore[idx] = updated;
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  console.log(`demo DELETE /api/customers/demo/${id}`);

  const targetId = Number(id);
  const idx = customerStore.findIndex((c) => c.id === targetId);
  if (idx === -1) {
    return NextResponse.json(
      { message: `customer ${id} not found` },
      { status: 404 }
    );
  }

  customerStore.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
