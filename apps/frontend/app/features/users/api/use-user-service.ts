import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useIdentityStore } from "@/features/identity/stores/identity-store";
import { handleError } from "@/lib/handle-error";
import { queryKeys } from "@/lib/query-keys";

import { usersApi } from "./users-api";

export function useUserSearch(q: string) {
  return useQuery({
    queryKey: queryKeys.userSearch(q),
    queryFn: () => usersApi.search.call(q.trim()),
    enabled: q.trim().length >= 2,
    staleTime: 30_000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const userId = useIdentityStore((s) => s.userId);
  return useMutation({
    mutationFn: usersApi.update.call,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.session(userId) }),
    onError: (e) => handleError(e, "update your profile"),
  });
}
