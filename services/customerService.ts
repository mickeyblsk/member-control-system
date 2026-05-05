import { CustomerResponse, CustomerType } from "@/types/customer";
import { mapCustomer, mapCustomerRequest } from "@/lib/customerMapper";

const API = "/api/customers/demo";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail: unknown;
    try {
      detail = await res.json();
    } catch {
      detail = await res.text();
    }
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(detail)}`);
  }
  return (await res.json()) as T;
}

export async function getCustomers(): Promise<CustomerType[]> {
  const res = await fetch(API);
  const data = await handle<CustomerResponse[]>(res);
  return data.map(mapCustomer).sort((a, b) => b.id - a.id);
}

export async function createCustomer(
  customer: CustomerType
): Promise<CustomerType> {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapCustomerRequest(customer)),
  });
  const data = await handle<CustomerResponse>(res);
  return mapCustomer(data);
}

export async function updateCustomer(
  customer: CustomerType
): Promise<CustomerType> {
  const res = await fetch(`${API}/${customer.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapCustomerRequest(customer)),
  });
  const data = await handle<CustomerResponse>(res);
  return mapCustomer(data);
}

export async function deleteCustomer(id: number): Promise<boolean> {
  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  await handle<{ ok: boolean }>(res);
  return true;
}
