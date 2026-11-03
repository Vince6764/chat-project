import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IdentityState {
  /** Id returned by POST /api/users/join, sent as `x-user-id`. */
  userId: string | null;
  setUserId: (id: string | null) => void;
}

export const useIdentityStore = create<IdentityState>()(
  persist(
    (set) => ({
      userId: null,
      setUserId: (userId) => set({ userId }),
    }),
    { name: "relay-identity" },
  ),
);
