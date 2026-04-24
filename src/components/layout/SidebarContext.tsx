"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type SidebarMode =
  | "project"
  | "analytics"
  | "quote-builder"
  | "content";

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

const OPEN_KEY = "tablex-sidebar-open";

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpenState] = useState(true);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("analytics");

  // Rehydrate collapse state on mount. Default to open; stored "0" = collapsed.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(OPEN_KEY);
      if (stored === "0") setSidebarOpenState(false);
      else if (stored === "1") setSidebarOpenState(true);
    } catch {
      // ignore (SSR, privacy mode)
    }
  }, []);

  const setSidebarOpen = (open: boolean) => {
    setSidebarOpenState(open);
    try {
      window.localStorage.setItem(OPEN_KEY, open ? "1" : "0");
    } catch {
      // ignore
    }
  };

  return (
    <SidebarContext.Provider
      value={{ sidebarOpen, setSidebarOpen, sidebarMode, setSidebarMode }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
