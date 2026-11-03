import { type ReactNode, useEffect } from "react";
import { Navigate } from "react-router";

import { LoadingScreen } from "@/components/states/loading-screen";

import { useIdentityService } from "../api/use-identity-service";
import { useIdentityStore } from "../stores/identity-store";

/** Chat pages: send visitors without a username to the join page. */
export function RouteGuard({ children }: { children: ReactNode }) {
  const { userId, session } = useIdentityService();
  const setUserId = useIdentityStore((s) => s.setUserId);
  const unknown = session.isError;

  // The stored id no longer exists on the server (e.g. database reset).
  useEffect(() => {
    if (unknown) setUserId(null);
  }, [unknown, setUserId]);

  if (!userId || unknown) return <Navigate to="/join" replace />;
  if (session.isPending) return <LoadingScreen />;
  return <>{children}</>;
}

/** Join page: skip it for visitors who already picked a username. */
export function GuestGuard({ children }: { children: ReactNode }) {
  const userId = useIdentityStore((s) => s.userId);
  if (userId) return <Navigate to="/chat" replace />;
  return <>{children}</>;
}
