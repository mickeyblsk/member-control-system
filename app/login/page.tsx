import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LoginForm from "./_components/LoginForm";

export default async function LoginPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("token")) {
    redirect("/customers");
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center bg-pri/10 px-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <LoginForm />
    </main>
  );
}
