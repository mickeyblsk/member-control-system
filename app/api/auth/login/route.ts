import { NextRequest, NextResponse } from "next/server";
import { request } from "@/lib/serverRequest";
import { LoginResponse } from "@/types/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const name = searchParams.get("name");
  const password = searchParams.get("password");

  if (!name || !password) {
    return NextResponse.json(
      { message: "Missing name or password" },
      { status: 400 }
    );
  }

  try {
    const data = await request<LoginResponse>(
      `/login?name=${name}&password=${password}`
    );
    const res = NextResponse.json({
      user: data.user,
    });

    // 設 cookie（demo版）
    res.cookies.set("token", data.secret, {
      httpOnly: false, // demo 可用
      path: "/",
    });

    return res;
  } catch (error) {
    return NextResponse.json(
      { message: "Login failed", error: String(error) },
      { status: 500 }
    );
  }
}