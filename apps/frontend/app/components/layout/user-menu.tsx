import { LogOut, Settings } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIdentityService } from "@/features/identity/api/use-identity-service";
import { UserAvatar } from "@/features/users/components/user-avatar";
import { useProfileDialogStore } from "@/features/users/stores/profile-dialog-store";

import { ThemeToggle } from "./theme-toggle";

export function UserMenu() {
  const { session, leave } = useIdentityService();
  const onOpenProfile = useProfileDialogStore((s) => s.onOpen);
  const me = session.data;
  if (!me) return null;

  return (
    <div className="flex items-center gap-1 border-t p-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="hover:bg-sidebar-accent/50 flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1.5 text-left outline-none">
          <UserAvatar name={me.name} image={me.image} userId={me.id} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{me.name}</span>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-56">
          <DropdownMenuItem onClick={onOpenProfile}>
            <Settings /> Edit profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={leave}>
            <LogOut /> Switch user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ThemeToggle />
    </div>
  );
}
