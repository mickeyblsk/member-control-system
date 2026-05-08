import { CustomerInput } from "@/types/customer";

export const BIRTHDAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export type CustomerValidationCode = "REQUIRED_NAME" | "INVALID_BIRTHDAY";

export const isValidName = (v: string | null | undefined): boolean =>
  Boolean(v?.trim());

export const isValidBirthday = (v: string | null | undefined): boolean => {
  if (!v) return true;
  return BIRTHDAY_RE.test(v);
};

export function validateCustomerInput(
  input: CustomerInput
): CustomerValidationCode | null {
  if (!isValidName(input.name)) return "REQUIRED_NAME";
  if (!isValidBirthday(input.birthday)) return "INVALID_BIRTHDAY";
  return null;
}
