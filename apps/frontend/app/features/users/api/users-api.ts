import { apiClient } from "@/lib/api/client";

import type { Me, UserSummary } from "../types/user";

export const usersApi = {
  join: {
    call: async (name: string) =>
      (await apiClient.post<Me>("/api/users/join", { name })).data,
  },
  me: { call: async () => (await apiClient.get<Me>("/api/users/me")).data },
  update: {
    call: async (patch: { name?: string; image?: string }) =>
      (await apiClient.patch<Me>("/api/users/me", patch)).data,
  },
  search: {
    call: async (q: string, limit = 10) =>
      (
        await apiClient.get<UserSummary[]>("/api/users/search", {
          params: { q, limit },
        })
      ).data,
  },
};
