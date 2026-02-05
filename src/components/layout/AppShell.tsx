"use client";

import { Sidebar } from "./Sidebar";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { cn } from "@/lib/utils";

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-20"
        )}
      >
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppShellInner>{children}</AppShellInner>
    </SidebarProvider>
  );
}
