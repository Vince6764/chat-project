import { z } from "zod";

export const joinSchema = z.object({
  name: z.string().trim().min(1, "Pick a username").max(40, "Use at most 40 characters"),
});

export type JoinValues = z.infer<typeof joinSchema>;
