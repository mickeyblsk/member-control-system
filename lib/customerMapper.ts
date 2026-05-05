import { CustomerResponse, CustomerType } from "@/types/customer";

const formatDate = (date: Date | null): string =>
  date ? date.toISOString().split("T")[0] : "";

export const mapCustomerRequest = (c: CustomerType) => ({
  name: c.name,
  phone: c.phone,
  address: c.address,
  email: c.email,
  birthday: formatDate(c.birthday),
});

export const mapCustomer = (data: CustomerResponse): CustomerType => ({
  id: data.id,
  name: data.name,
  phone: data.phone,
  address: data.address,
  email: data.email,
  birthday: data.birthday ? new Date(data.birthday) : null,
});
