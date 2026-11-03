import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import { usersApi } from "@/features/users/api/users-api";
import { handleError } from "@/lib/handle-error";
import { queryKeys } from "@/lib/query-keys";

import { useIdentityStore } from "../stores/identity-store";

export function useIdentityService() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const userId = useIdentityStore((s) => s.userId);
  const setUserId = useIdentityStore((s) => s.setUserId);

  const session = useQuery({
    queryKey: queryKeys.session(userId),
    queryFn: usersApi.me.call,
    enabled: !!userId,
    retry: false,
    staleTime: 5 * 60_000,
  });

  const join = useMutation({
    mutationFn: usersApi.join.call,
    onSuccess: (me) => {
      setUserId(me.id);
      queryClient.removeQueries();
      queryClient.setQueryData(queryKeys.session(me.id), me);
      navigate("/chat", { replace: true });
    },
    onError: (e) => handleError(e),
  });

  const leave = () => {
    setUserId(null);
    queryClient.clear();
    navigate("/join", { replace: true });
  };

  return { userId, session, join, leave };
}
