"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useT } from "@/lib/i18n/I18nProvider";
import { loginAction, type LoginState } from "../actions";

const SAVED_ACCOUNTS_KEY = "login_saved_accounts";
const INITIAL_STATE: LoginState = {};

export default function LoginFormClient() {
  const t = useT();
  const [state, formAction, pending] = useActionState(loginAction, INITIAL_STATE);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<string[]>([]);
  const [rememberAccount, setRememberAccount] = useState(false);

  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let list: string[] = [];
    try {
      const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      list = raw ? JSON.parse(raw) : [];
    } catch {
      list = [];
    }
    // localStorage is a browser-only external store; sync once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSavedAccounts(list);
    if (list.length > 0) {
      setUsername(list[list.length - 1]);
      setRememberAccount(true);
      requestAnimationFrame(() => passwordRef.current?.focus());
    }
  }, []);

  const matchedAccount = useMemo(() => {
    if (!username) return "";
    const lower = username.toLowerCase();
    return (
      savedAccounts.find(
        (acc) =>
          acc.toLowerCase().startsWith(lower) && acc.toLowerCase() !== lower
      ) ?? ""
    );
  }, [username, savedAccounts]);

  const suggestionSuffix = matchedAccount
    ? matchedAccount.slice(username.length)
    : "";

  const handleSubmit = (formData: FormData) => {
    if (rememberAccount && username) {
      const list = savedAccounts.filter((a) => a !== username);
      list.push(username);
      setSavedAccounts(list);
      try {
        localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(list));
      } catch {
        // ignore
      }
    }
    return formAction(formData);
  };

  const handleUsernameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Tab" || e.key === "ArrowRight") && suggestionSuffix) {
      e.preventDefault();
      setUsername(matchedAccount);
    }
  };

  const errorMessage =
    state.errorCode === "MISSING_CREDENTIALS"
      ? t("login.missingCredentials")
      : state.errorCode === "INVALID_CREDENTIALS"
      ? t("login.failed")
      : null;

  return (
    <form
      action={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-5 rounded-xl border border-pri/10 bg-white/80 p-8 shadow-xl backdrop-blur"
    >
      <h1 className="text-center text-2xl font-bold text-pri">
        {t("common.appTitle")}
      </h1>

      <div className="relative w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center whitespace-pre px-3 text-base"
        >
          <span className="text-transparent">{username}</span>
          <span className="text-zinc-400">{suggestionSuffix}</span>
        </div>
        <input
          name="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleUsernameKeyDown}
          spellCheck={false}
          autoComplete="off"
          placeholder={t("login.accountPlaceholder")}
          className="relative w-full rounded-md border border-pri/20 bg-transparent px-3 py-2 text-base outline-none focus:border-pri"
        />
        {suggestionSuffix && (
          <p className="mt-1 text-xs text-zinc-500">
            {t("login.autocompleteHintBefore")}{" "}
            <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1 py-px text-[10px]">
              Tab
            </kbd>{" "}
            {t("login.autocompleteHintMiddle")}{" "}
            <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1 py-px text-[10px]">
              →
            </kbd>{" "}
            {t("login.autocompleteHintAfter")}
          </p>
        )}
      </div>

      <div className="relative w-full">
        <input
          ref={passwordRef}
          name="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("login.passwordPlaceholder")}
          className="w-full rounded-md border border-pri/20 bg-transparent px-3 py-2 pr-10 text-base outline-none focus:border-pri"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={
            showPassword ? t("login.hidePassword") : t("login.showPassword")
          }
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center text-pri/40 transition-colors hover:text-pri"
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-pri">
        <input
          type="checkbox"
          checked={rememberAccount}
          onChange={(e) => setRememberAccount(e.target.checked)}
          className="h-4 w-4 cursor-pointer accent-[var(--color-pri)]"
        />
        {t("login.rememberAccount")}
      </label>

      {errorMessage && (
        <p role="alert" className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg border-2 border-sec bg-pri py-3 text-base text-sec transition hover:bg-pri/90 disabled:opacity-50"
      >
        {pending ? t("login.submitting") : t("login.submit")}
      </button>
    </form>
  );
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L9.88 9.88"
      />
    </svg>
  );
}
