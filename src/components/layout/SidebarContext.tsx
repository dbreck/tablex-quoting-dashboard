"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type SidebarMode = "analytics" | "quote-builder";

interface SidebarContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarMode: SidebarMode;
  setSidebarMode: (mode: SidebarMode) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  sidebarOpen: true,
  setSidebarOpen: () => {},
  sidebarMode: "analytics",
  setSidebarMode: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("analytics");
  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen, sidebarMode, setSidebarMode }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
