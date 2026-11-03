import { SignupForm } from "@/features/auth/components/signup-form";

export const meta = () => [{ title: "Sign up · Relay Chat" }];

export default function SignupRoute() {
  return <SignupForm />;
}
