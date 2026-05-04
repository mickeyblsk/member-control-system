"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginService } from "@/services/loginService";

export default function LoginPage() {
    const router = useRouter();

    const [account, setAccount] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const login = async () => {

        if (!account || !password) {
            alert("請輸入帳號與密碼");
            return;
        }

        setLoading(true);

        try {
            const user = await loginService(account, password);

            sessionStorage.setItem("user", JSON.stringify(user));

            router.replace("/"); // 你預留的
        } catch (e) {
            alert(`登入失敗: ${e}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex flex-col items-center gap-4 h-screen justify-center">
            <input
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="帳號"
                className="border p-2"
            />

            <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="密碼"
                className="border p-2"
            />

            <button onClick={login} disabled={loading}>
                {loading ? "登入中..." : "登入"}
            </button>
        </main>
    );
}