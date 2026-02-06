"use client";

import Link from "next/link";
import { Settings, LogOut, User } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface UserMenuProps {
  sidebarOpen: boolean;
}

export function UserMenu({ sidebarOpen }: UserMenuProps) {
  const { signOut } = useAuth();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={
            sidebarOpen
              ? "text-white/40 hover:text-white transition-colors"
              : "flex h-9 w-9 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
          }
          title="User menu"
        >
          <Settings
            className={sidebarOpen ? "h-4 w-4" : "h-4.5 w-4.5"}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-48 p-2">
        <Link
          href="/profile"
          className="text-sm text-slate-700 hover:bg-slate-100 rounded-lg px-3 py-2 flex items-center gap-2 w-full"
        >
          <User className="h-4 w-4" />
          Profile
        </Link>
        <hr className="my-1 border-slate-200" />
        <button
          onClick={signOut}
          className="text-sm text-slate-700 hover:bg-slate-100 rounded-lg px-3 py-2 flex items-center gap-2 w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </PopoverContent>
    </Popover>
  );
}
