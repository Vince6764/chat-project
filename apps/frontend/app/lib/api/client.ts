import axios from "axios";

import { useIdentityStore } from "@/features/identity/stores/identity-store";

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

// One axios instance for the NestJS backend. The id from POST /api/users/join
// identifies the user via the `x-user-id` header.
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const userId = useIdentityStore.getState().userId;
  if (userId) config.headers.set("x-user-id", userId);
  return config;
});

// Domain endpoints wrap payloads in { success, data, meta }. Unwrap so
// callers get the payload; health responses pass through.
apiClient.interceptors.response.use((response) => {
  const body = response.data;
  if (
    body &&
    typeof body === "object" &&
    body.success === true &&
    "data" in body
  ) {
    response.data = body.data;
  }
  return response;
});
