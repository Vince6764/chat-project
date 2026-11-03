import { LoginForm } from "@/features/auth/components/login-form";

export const meta = () => [{ title: "Sign in · Relay Chat" }];

export default function LoginRoute() {
  return <LoginForm />;
}
