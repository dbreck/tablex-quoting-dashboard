"use client";

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
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

// localStorage is an external store; same-tab writes don't fire "storage"
// events, so there is nothing to subscribe to — the snapshot is simply
// re-read on render.
const emptySubscribe = () => () => {};

function readStoredOpen(): "0" | "1" | null {
  try {
    const stored = window.localStorage.getItem(OPEN_KEY);
    return stored === "0" || stored === "1" ? stored : null;
  } catch {
    return null; // privacy mode
  }
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Persisted collapse state, hydration-safe: the server snapshot is null
  // (default open), the client snapshot reads localStorage.
  const storedOpen = useSyncExternalStore(
    emptySubscribe,
    readStoredOpen,
    () => null
  );
  // An explicit toggle this session wins over the persisted value (and keeps
  // the toggle working even when localStorage writes fail).
  const [openOverride, setOpenOverride] = useState<boolean | null>(null);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("analytics");

  // Default to open; stored "0" = collapsed.
  const sidebarOpen = openOverride ?? storedOpen !== "0";

  const setSidebarOpen = (open: boolean) => {
    setOpenOverride(open);
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
