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
  updateCustomer,
} from "@/services/customerService";
import { CustomerType } from "@/types/customer";

const QUERY_KEY = ["customers"] as const;

export function useCustomersQuery() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getCustomers,
  });
}

export function useCreateCustomerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    onError: (err) => toast.error(`新增香客失敗: ${String(err)}`),
  });
}

export function useUpdateCustomerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateCustomer,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    onError: (err) => toast.error(`更新香客失敗: ${String(err)}`),
  });
}

export function useDeleteCustomerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCustomer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    onError: (err) => toast.error(`刪除香客失敗: ${String(err)}`),
  });
}

export type { CustomerType };
