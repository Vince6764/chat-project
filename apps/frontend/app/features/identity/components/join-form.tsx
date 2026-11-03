import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useIdentityService } from "../api/use-identity-service";
import { joinSchema, type JoinValues } from "../schemas/identity-schema";
import { IdentityContainer } from "./identity-container";

export function JoinForm() {
  const { join } = useIdentityService();
  const form = useForm<JoinValues>({
    resolver: zodResolver(joinSchema),
    defaultValues: { name: "" },
  });

  return (
    <IdentityContainer
      title="Pick a username"
      subtitle="No account needed. Reuse a name to come back as that user."
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((v) => join.mutate(v.name))}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input autoComplete="username" autoFocus {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={join.isPending}>
            {join.isPending && <Loader2 className="animate-spin" />}
            Join chat
          </Button>
        </form>
      </Form>
    </IdentityContainer>
  );
}
