import { useIdentityService } from "../api/use-identity-service";

/** The current user, or null/undefined while loading or before joining. */
export function useCurrentUser() {
  return useIdentityService().session.data ?? null;
}
