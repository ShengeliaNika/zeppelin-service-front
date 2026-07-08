import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type { Supplier } from "../../api/types";

export function useSuppliers(search?: string) {
  return useQuery({
    queryKey: ["suppliers", search],
    queryFn: () => {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      return apiFetch<Supplier[]>(`/api/suppliers${params}`);
    },
  });
}

