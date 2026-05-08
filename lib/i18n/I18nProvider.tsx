"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LOCALE,
  Dictionary,
  Locale,
  SUPPORTED_LOCALES,
  dictionaries,
} from "./dictionaries";

const STORAGE_KEY = "app_locale";

export type Translator = (
  path: string,
  vars?: Record<string, string | number>
) => string;

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  dict: Dictionary;
  t: Translator;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const isLocale = (v: unknown): v is Locale =>
  typeof v === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(v);

const lookup = (dict: Dictionary, path: string): string => {
  const parts = path.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  return typeof cur === "string" ? cur : path;
};

const interpolate = (
  template: string,
  vars?: Record<string, string | number>
): string => {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{{${k}}}`
  );
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // localStorage is a browser-only external store; sync once on mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (isLocale(saved)) setLocaleState(saved);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[locale];
    return {
      locale,
      setLocale,
      dict,
      t: (path, vars) => interpolate(lookup(dict, path), vars),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useT() {
  return useI18n().t;
}
