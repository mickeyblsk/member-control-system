import type { Metadata } from "next";
import { listCustomers } from "./_lib/store";
import CustomersClient from "./_components/CustomersClient";

export const metadata: Metadata = {
  title: "會員列表｜Member Control System",
};

export default async function CustomersPage() {
  const customers = listCustomers();
  return <CustomersClient customers={customers} />;
}
