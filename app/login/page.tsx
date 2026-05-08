import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LanguageSwitcherClient from "@/components/LanguageSwitcherClient";
import LoginFormClient from "./_components/LoginFormClient";

export const metadata: Metadata = {
  title: "登入｜Member Control System",
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("token")) {
    redirect("/customers");
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center bg-pri/10 px-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcherClient />
      </div>
      <LoginFormClient />
    </main>
  );
}
