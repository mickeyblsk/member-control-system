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

export async function GET() {
  try {
    const data = await request<CustomerResponse[]>("/get_customers");

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { message: "Invalid response shape" },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch customers", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const qs = buildQuery(body);
    const data = await request<BackendEnvelope<CustomerResponse[]>>(
      `/new_customer?${qs}`
    );

    if (data.error !== "") {
      return NextResponse.json({ message: data.error }, { status: 400 });
    }

    return NextResponse.json(data.result?.[0] ?? null);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create customer", error: String(error) },
      { status: 500 }
    );
  }
}
