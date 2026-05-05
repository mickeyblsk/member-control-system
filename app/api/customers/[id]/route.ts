import { NextRequest, NextResponse } from "next/server";
import { request } from "@/lib/serverRequest";
import { CustomerResponse } from "@/types/customer";

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

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const qs = buildQuery({ customer_id: id, ...body });
    const data = await request<BackendEnvelope<CustomerResponse[]>>(
      `/update_customer?${qs}`
    );

    if (data.error !== "") {
      return NextResponse.json({ message: data.error }, { status: 400 });
    }

    return NextResponse.json(data.result?.[0] ?? null);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update customer", error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const qs = buildQuery({ customer_id: id });
    const data = await request<BackendEnvelope<null>>(
      `/delete_customer?${qs}`
    );

    if (data.error !== "") {
      return NextResponse.json({ message: data.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete customer", error: String(error) },
      { status: 500 }
    );
  }
}
