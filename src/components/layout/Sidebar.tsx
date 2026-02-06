"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";
import { useAuth } from "@/components/providers/AuthProvider";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Workflow,
  Route,
  ScanBarcode,
  DollarSign,
  Package,
  ClipboardList,
  Truck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FilePlus,
  FilePlus2,
  FileStack,
  Building2,
  LogOut,
  User,
} from "lucide-react";

const analyticsNav = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "Workflow", href: "/workflow", icon: Workflow },
  { name: "Customer Journey", href: "/customer-journey", icon: Route },
  { name: "SKU Decoder", href: "/sku-decoder", icon: ScanBarcode },
  { name: "Pricing", href: "/pricing", icon: DollarSign },
  { name: "Catalog", href: "/catalog", icon: Package },
  { name: "Queue", href: "/queue", icon: ClipboardList },
  { name: "Freight", href: "/freight", icon: Truck },
  { name: "How Quoting Works", href: "/how-quoting-works", icon: BookOpen },
];

const quoteBuilderNav = [
  { name: "Dashboard", href: "/quote/dashboard", icon: LayoutDashboard },
  { name: "New Quote", href: "/quote/new", icon: FilePlus },
  { name: "Quotes", href: "/quote/list", icon: FileStack },
  { name: "CRM", href: "/quote/crm", icon: Building2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, sidebarMode, setSidebarMode } = useSidebar();
  const { profile, isAdmin, signOut } = useAuth();

  // Auto-detect mode from route
  useEffect(() => {
    if (pathname.startsWith("/quote")) {
      setSidebarMode("quote-builder");
    } else {
      setSidebarMode("analytics");
    }
  }, [pathname, setSidebarMode]);

  const navigation = sidebarMode === "analytics" ? analyticsNav : quoteBuilderNav;
  const subtitle = sidebarMode === "analytics" ? "Quote Analytics" : "Quote Builder";

  // Get user initials
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-brand-navy transition-all duration-300 ease-in-out flex flex-col",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <Link href="/overview" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green">
            <span className="text-xl font-bold text-white">T</span>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-white tracking-tight">TableX</h1>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">{subtitle}</p>
            </div>
          )}
        </Link>
      </div>

      {/* Mode Switcher */}
      {sidebarOpen ? (
        <div className="px-3 pt-4 pb-2">
          <div className="flex rounded-lg bg-white/5 p-1">
            <button
              onClick={() => setSidebarMode("analytics")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200",
                sidebarMode === "analytics"
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:text-white/70"
              )}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setSidebarMode("quote-builder")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200",
                sidebarMode === "quote-builder"
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:text-white/70"
              )}
            >
              <FilePlus2 className="h-3.5 w-3.5" />
              <span>Builder</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 px-2 pt-4 pb-2">
          <button
            onClick={() => setSidebarMode("analytics")}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
              sidebarMode === "analytics"
                ? "bg-white/10 text-brand-green"
                : "text-white/40 hover:text-white/70"
            )}
            title="Analytics"
          >
            <BarChart3 className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => setSidebarMode("quote-builder")}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
              sidebarMode === "quote-builder"
                ? "bg-white/10 text-brand-green"
                : "text-white/40 hover:text-white/70"
            )}
            title="Quote Builder"
          >
            <FilePlus2 className="h-4.5 w-4.5" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-1", sidebarOpen ? "px-3 py-2" : "px-2 py-2")}>
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white",
                !sidebarOpen && "justify-center px-0"
              )}
              title={!sidebarOpen ? item.name : undefined}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-brand-green")} />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Menu + Collapse Toggle */}
      <div className={cn("border-t border-white/10", sidebarOpen ? "px-3 py-3" : "px-2 py-3")}>
        {/* User info */}
        {profile && (
          <div className={cn(
            "mb-2 rounded-xl p-2.5",
            sidebarOpen ? "bg-white/5" : "flex justify-center"
          )}>
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green/20 text-brand-green text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {profile.full_name || profile.email}
                  </p>
                  <Badge
                    variant={isAdmin ? "default" : "secondary"}
                    className="text-[9px] mt-0.5"
                  >
                    {profile.role}
                  </Badge>
                </div>
                <button
                  onClick={signOut}
                  className="text-white/40 hover:text-white transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signOut}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                title={`${profile.full_name || profile.email} (${profile.role}) — Sign out`}
              >
                <User className="h-4.5 w-4.5" />
              </button>
            )}
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            "flex items-center gap-2 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors",
            !sidebarOpen && "justify-center px-0"
          )}
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Collapse</span>
            </>
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </aside>
  );
}
