"use server";

import { revalidatePath } from "next/cache";
import { CustomerInput } from "@/types/customer";
import * as store from "./_lib/store";
import { validateCustomerInput } from "./_lib/validation";

class ValidationError extends Error {
  constructor(public code: string) {
    super(code);
    this.name = "ValidationError";
  }
}

const readForm = (formData: FormData): CustomerInput => {
  const input: CustomerInput = {
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    birthday: String(formData.get("birthday") ?? "").trim() || null,
  };
  const code = validateCustomerInput(input);
  if (code) throw new ValidationError(code);
  return input;
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
    const code = validateCustomerInput(row);
    if (code) throw new ValidationError(code);
  }
  const imported = store.importCustomers(rows);
  revalidatePath("/customers");
  return { imported: imported.length };
}
