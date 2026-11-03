import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { usersApi } from "@/features/users/api/users-api";
import { handleError } from "@/lib/handle-error";
import { queryKeys } from "@/lib/query-keys";

import { useUserSessionStore } from "../stores/user-session-store";
import { authApi } from "./auth-api";

export function useAuthService() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const devUserId = useUserSessionStore((s) => s.devUserId);
  const setDevUserId = useUserSessionStore((s) => s.setDevUserId);

  // Dev identity -> /api/users/me with the dev header; otherwise the cookie session.
  const session = useQuery({
    queryKey: queryKeys.session(devUserId),
    queryFn: () =>
      devUserId ? usersApi.me.call() : authApi.getSession.call(),
    retry: false,
    staleTime: 5 * 60_000,
  });

  // A real login replaces any leftover dev identity, then confirms the
  // cookie session took before sending the user to the chat.
  const startSession = async (message: string) => {
    setDevUserId(null);
    await queryClient.resetQueries();
    const me = await authApi.getSession.call().catch(() => null);
    if (!me) {
      toast.error("Signed in, but no session was started. Check cookie and CORS settings.");
      return;
    }
    queryClient.setQueryData(queryKeys.session(null), me);
    toast.success(message);
    navigate("/chat", { replace: true });
  };

  const signIn = useMutation({
    mutationFn: authApi.signIn.call,
    onSuccess: () => startSession("Signed in"),
    onError: (e) => handleError(e),
  });

  const signUp = useMutation({
    mutationFn: authApi.signUp.call,
    onSuccess: () => startSession("Account created"),
    onError: (e) => handleError(e),
  });

  const devSignIn = (id: string) => {
    setDevUserId(id.trim());
    return queryClient.resetQueries();
  };

  const signOut = useMutation({
    mutationFn: async () => {
      if (devUserId) return;
      await authApi.signOut.call();
    },
    onSettled: () => {
      setDevUserId(null);
      queryClient.clear();
    },
    onError: (e) => handleError(e),
  });

  return { session, signIn, signUp, devSignIn, signOut };
}
