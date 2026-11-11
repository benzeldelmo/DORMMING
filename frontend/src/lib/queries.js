import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { REFETCH_MS } from "./sync";

/** GET with polling. */
export const useGet = (path, options = {}) =>
  useQuery({ queryKey: [path], queryFn: () => api(path), refetchInterval: REFETCH_MS, ...options });

/** POST/PUT/PATCH/DELETE that refreshes every screen afterwards. */
export function useSend() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ path, method = "POST", body }) => api(path, { method, body }),
    onSuccess: () => client.invalidateQueries(),
  });
}
