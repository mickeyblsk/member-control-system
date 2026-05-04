import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const name = searchParams.get("name");
  const password = searchParams.get("password");
  console.log(`demo login name: ${name}`);
  console.log(`demo login password: ${password}`);

  if (name != "admin" || password != "demo") {
    return NextResponse.json(
      { message: "no such user!" },
      { status: 400 }
    );
  }

  try {
    // demo fake data
    const data = {
      secret: "demo-token-123456",
      user: {
        id: 1,
        name,
        display_name: "Demo User",
        permissions: 1,
        temple_id: "test",
      },
    };

    const res = NextResponse.json({
      user: data.user,
    });

    // 設 cookie（demo版）
    res.cookies.set("token", data.secret, {
      httpOnly: false,
      path: "/",
    });

    return res;
  } catch (error) {
    return NextResponse.json(
      { message: "Demo login failed", error: String(error) },
      { status: 500 }
    );
  }
}