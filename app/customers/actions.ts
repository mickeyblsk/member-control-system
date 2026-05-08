"use server";

import { revalidatePath } from "next/cache";
import { CustomerInput } from "@/types/customer";
import * as store from "./_lib/store";

const BIRTHDAY_RE = /^\d{4}-\d{2}-\d{2}$/;

class ValidationError extends Error {
  constructor(public code: string) {
    super(code);
    this.name = "ValidationError";
  }
}

const readForm = (formData: FormData): CustomerInput => {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new ValidationError("REQUIRED_NAME");

  const birthday = String(formData.get("birthday") ?? "").trim();
  if (birthday && !BIRTHDAY_RE.test(birthday)) {
    throw new ValidationError("INVALID_BIRTHDAY");
  }

  return {
    name,
    phone: String(formData.get("phone") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    birthday: birthday || null,
  };
};

export async function createCustomerAction(formData: FormData) {
  const input = readForm(formData);
  store.createCustomer(input);
  revalidatePath("/customers");
}

export async function updateCustomerAction(id: number, formData: FormData) {
  const input = readForm(formData);
  const updated = store.updateCustomer(id, input);
  if (!updated) throw new ValidationError("CUSTOMER_NOT_FOUND");
  revalidatePath("/customers");
}

export async function deleteCustomerAction(id: number) {
  store.deleteCustomer(id);
  revalidatePath("/customers");
}

export async function importCustomersAction(rows: CustomerInput[]) {
  for (const row of rows) {
    if (!row.name?.trim()) throw new ValidationError("REQUIRED_NAME");
    if (row.birthday && !BIRTHDAY_RE.test(row.birthday)) {
      throw new ValidationError("INVALID_BIRTHDAY");
    }
  }
  const imported = store.importCustomers(rows);
  revalidatePath("/customers");
  return { imported: imported.length };
}
