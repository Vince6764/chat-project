import { JoinForm } from "@/features/identity/components/join-form";
import { GuestGuard } from "@/features/identity/components/route-guard";

export const meta = () => [{ title: "Join · Relay Chat" }];

export default function JoinRoute() {
  return (
    <GuestGuard>
      <JoinForm />
    </GuestGuard>
  );
}
