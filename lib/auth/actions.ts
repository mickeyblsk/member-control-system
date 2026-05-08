"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type LoginState = {
  errorCode?: "MISSING_CREDENTIALS" | "INVALID_CREDENTIALS";
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { errorCode: "MISSING_CREDENTIALS" };
  }

  if (username !== "admin" || password !== "demo") {
    return { errorCode: "INVALID_CREDENTIALS" };
  }

  const cookieStore = await cookies();
  cookieStore.set("token", "demo-token-123456", {
    httpOnly: false,
    path: "/",
  });

  redirect("/customers");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}
