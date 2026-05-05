import { LoginUser } from "@/types/auth";

interface LoginResponse {
  user: LoginUser;
}

export async function loginService(
  name: string,
  password: string
): Promise<LoginUser> {
  const res = await fetch(
    `/api/auth/login/demo?name=${name}&password=${password}`
  );

  if (!res.ok) {
    throw new Error("Login service login failed");
  }

  const data: LoginResponse = await res.json();

  return data.user;
}