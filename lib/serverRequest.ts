import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE!;

interface RequestConfig extends RequestInit {
  timeout?: number;
}

const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(id);
  }
};

export async function request<T>(
  url: string,
  config: RequestConfig = {}
): Promise<T> {
  const { timeout = 10000, headers, ...rest } = config;

  // 從 cookie 拿 token
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const isLoginRequest = url.startsWith("/login");

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (headers) {
    Object.assign(finalHeaders, headers);
  }

  if (!isLoginRequest && token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetchWithTimeout(
    `${BASE_URL}${url}`,
    {
      ...rest,
      headers: finalHeaders,
    },
    timeout
  );

  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = await res.text();
    }
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(error)}`);
  }

  const contentType = res.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return (await res.json()) as T;
  }

  return undefined as unknown as T;
}