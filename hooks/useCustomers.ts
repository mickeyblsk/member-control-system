"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  importCustomers,
  updateCustomer,
} from "@/services/customerService";
import { CustomerType } from "@/types/customer";
import { useT } from "@/lib/i18n/I18nProvider";

const QUERY_KEY = ["customers"] as const;

export function useCustomersQuery() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getCustomers,
  });
}

export function useCreateCustomerMutation() {
  const qc = useQueryClient();
  const t = useT();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    onError: (err) =>
      toast.error(`${t("customers.mutationCreateFailed")}: ${String(err)}`),
  });
}

export function useUpdateCustomerMutation() {
  const qc = useQueryClient();
  const t = useT();
  return useMutation({
    mutationFn: updateCustomer,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    onError: (err) =>
      toast.error(`${t("customers.mutationUpdateFailed")}: ${String(err)}`),
  });
}

export function useDeleteCustomerMutation() {
  const qc = useQueryClient();
  const t = useT();
  return useMutation({
    mutationFn: (id: number) => deleteCustomer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    onError: (err) =>
      toast.error(`${t("customers.mutationDeleteFailed")}: ${String(err)}`),
  });
}

export function useImportCustomersMutation() {
  const qc = useQueryClient();
  const t = useT();
  return useMutation({
    mutationFn: importCustomers,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    onError: (err) =>
      toast.error(`${t("customers.mutationImportFailed")}: ${String(err)}`),
  });
}

export type { CustomerType };
