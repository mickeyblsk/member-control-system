import { CustomerInput } from "@/types/customer";

export type Translator = (
  path: string,
  vars?: Record<string, string | number>
) => string;

const REQUIRED_HEADERS = ["name", "phone", "address", "email", "birthday"] as const;
const BIRTHDAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export type ParseResult = {
  rows: CustomerInput[];
  errors: string[];
};

export function parseCustomerCsv(text: string, t: Translator): ParseResult {
  const cleaned = text.replace(/^﻿/, "").trim();
  if (!cleaned) {
    return { rows: [], errors: [t("customers.csvEmpty")] };
  }

  const lines = cleaned.split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    return {
      rows: [],
      errors: [
        t("customers.csvHeaderMissing", {
          missing: missing.join(", "),
          actual: headers.join(", "),
        }),
      ],
    };
  }

  const dataLines = lines.slice(1).filter((l) => l.trim() !== "");
  if (dataLines.length === 0) {
    return { rows: [], errors: [t("customers.csvNoRows")] };
  }

  const rowJoin = t("customers.csvRowJoin");
  const rows: CustomerInput[] = [];
  const errors: string[] = [];

  dataLines.forEach((line, idx) => {
    const lineNo = idx + 1;
    const values = line.split(",").map((s) => s.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = values[i] ?? ""));

    const rowErrors: string[] = [];
    if (!obj.name) rowErrors.push(t("customers.requiredName"));
    if (obj.birthday && !BIRTHDAY_RE.test(obj.birthday)) {
      rowErrors.push(
        t("customers.csvBirthdayFormat", { value: obj.birthday })
      );
    }
    if (values.length !== headers.length) {
      rowErrors.push(
        t("customers.csvFieldCount", {
          expected: headers.length,
          actual: values.length,
        })
      );
    }

    if (rowErrors.length > 0) {
      errors.push(
        `${t("customers.csvRowPrefix", { n: lineNo })}: ${rowErrors.join(rowJoin)}`
      );
      return;
    }

    rows.push({
      name: obj.name,
      phone: obj.phone,
      address: obj.address,
      email: obj.email,
      birthday: obj.birthday || null,
    });
  });

  return errors.length > 0 ? { rows: [], errors } : { rows, errors: [] };
}
