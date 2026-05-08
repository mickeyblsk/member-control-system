import { listCustomers } from "./_lib/store";
import CustomersClient from "./_components/CustomersClient";

export default async function CustomersPage() {
  const customers = listCustomers();
  return <CustomersClient customers={customers} />;
}
