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
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Target,
  Globe,
  Box,
  FilePlus,
  FilePlus2,
  FileStack,
  Building2,
  Settings,
  User,
  Users,
  Network,
  Inbox,
  ShieldAlert,
  ShoppingCart,
  Receipt,
} from "lucide-react";
import { UserMenu } from "./UserMenu";

const overviewItem = { name: "Overview", href: "/overview", icon: LayoutDashboard };

const analyticsNavGroups = [
  {
    label: "Website Redesign",
    items: [
      { name: "User Personas", href: "/user-personas", icon: Users },
      { name: "Customer Journey", href: "/customer-journey", icon: Route },
      { name: "WP Site Audit", href: "/wp-site-audit", icon: Globe },
      { name: "Site Architecture", href: "/site-architecture", icon: Network },
      { name: "Catalog", href: "/catalog", icon: Package },
      { name: "Configurator", href: "/configurator", icon: Box },
    ],
  },
  {
    label: "Business Intelligence",
    items: [
      { name: "SKU Decoder", href: "/sku-decoder", icon: ScanBarcode },
      { name: "Pricing", href: "/pricing", icon: DollarSign },
      { name: "Queue", href: "/queue", icon: ClipboardList },
      { name: "Freight", href: "/freight", icon: Truck },
      { name: "Competitor Analysis", href: "/competitor-analysis", icon: ShieldAlert },
    ],
  },
];

const builderOverviewItem = { name: "Overview", href: "/how-quoting-works", icon: LayoutDashboard };

const builderNavGroups = [
  {
    label: "Quoting System",
    items: [
      { name: "Quoting Process", href: "/quoting-process", icon: Workflow },
      { name: "CPQ Gap Analysis", href: "/cpq-gap-analysis", icon: Target },
    ],
  },
  {
    label: "QuoteX Platform",
    items: [
      { name: "Dashboard", href: "/quote/dashboard", icon: LayoutDashboard },
      { name: "Quote Requests", href: "/quote/requests", icon: Inbox },
      { name: "New Quote", href: "/quote/new", icon: FilePlus },
      { name: "Quotes", href: "/quote/list", icon: FileStack },
      { name: "CRM", href: "/quote/crm", icon: Building2 },
      { name: "Orders", href: "/orders", icon: ShoppingCart },
      { name: "Invoices", href: "/invoices", icon: Receipt },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, sidebarMode, setSidebarMode } = useSidebar();
  const { profile, isAdmin, isRep } = useAuth();

  // Auto-detect mode from route (reps are always locked to quote-builder)
  useEffect(() => {
    if (isRep) {
      setSidebarMode("quote-builder");
    } else if (pathname.startsWith("/quote") || pathname === "/quoting-process" || pathname === "/cpq-gap-analysis" || pathname === "/how-quoting-works" || pathname === "/orders" || pathname === "/invoices") {
      setSidebarMode("quote-builder");
    } else {
      setSidebarMode("analytics");
    }
  }, [pathname, setSidebarMode, isRep]);

  // Rep-specific nav: hide Quoting System group, hide Quote Requests and Invoices
  const repBuilderNavGroups = builderNavGroups
    .filter((group) => group.label !== "Quoting System")
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => item.name !== "Quote Requests" && item.name !== "Invoices"
      ),
    }));

  const activeBuilderNavGroups = isRep ? repBuilderNavGroups : builderNavGroups;

  const subtitle = sidebarMode === "analytics" ? "Quote Analytics" : "Quoting";

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green p-1.5">
            <img src="/tablex-logomark.svg" alt="TableX" className="h-full w-full" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-white tracking-tight">TableX</h1>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">{subtitle}</p>
            </div>
          )}
        </Link>
      </div>

      {/* Mode Switcher — hidden for reps (locked to Quoting mode) */}
      {!isRep && (
        sidebarOpen ? (
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
                <span>Quoting</span>
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
              title="Quoting"
            >
              <FilePlus2 className="h-4.5 w-4.5" />
            </button>
          </div>
        )
      )}

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto", sidebarOpen ? "px-3 py-2" : "px-2 py-2")}>
        {sidebarMode === "analytics" ? (
          <>
            {/* Overview — standalone */}
            {(() => {
              const isActive = pathname === "/overview" || pathname === "/";
              return (
                <Link
                  href={overviewItem.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white",
                    !sidebarOpen && "justify-center px-0"
                  )}
                  title={!sidebarOpen ? overviewItem.name : undefined}
                >
                  <overviewItem.icon className={cn("h-5 w-5 shrink-0", isActive && "text-brand-green")} />
                  {sidebarOpen && <span>{overviewItem.name}</span>}
                </Link>
              );
            })()}

            {/* Grouped sections */}
            {analyticsNavGroups.map((group, groupIdx) => (
              <div key={group.label} className={cn(groupIdx === 0 ? "mt-2" : "mt-1")}>
                {sidebarOpen ? (
                  <p className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-widest text-white/50 font-semibold">
                    {group.label}
                  </p>
                ) : (
                  <div className="mx-2 my-2 border-t border-white/10" />
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
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
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {/* Overview — standalone */}
            {(() => {
              const isActive = pathname === builderOverviewItem.href;
              return (
                <Link
                  href={builderOverviewItem.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white",
                    !sidebarOpen && "justify-center px-0"
                  )}
                  title={!sidebarOpen ? builderOverviewItem.name : undefined}
                >
                  <builderOverviewItem.icon className={cn("h-5 w-5 shrink-0", isActive && "text-brand-green")} />
                  {sidebarOpen && <span>{builderOverviewItem.name}</span>}
                </Link>
              );
            })()}

            {/* Grouped sections */}
            {activeBuilderNavGroups.map((group, groupIdx) => (
              <div key={group.label} className={cn(groupIdx === 0 ? "mt-2" : "mt-1")}>
                {sidebarOpen ? (
                  <p className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-widest text-white/50 font-semibold">
                    {group.label}
                  </p>
                ) : (
                  <div className="mx-2 my-2 border-t border-white/10" />
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
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
                </div>
              </div>
            ))}
          </>
        )}
      </nav>

      {/* User Menu + Collapse Toggle */}
      <div className={cn("border-t border-white/10", sidebarOpen ? "px-3 py-3" : "px-2 py-3")}>
        {/* Admin Settings Link */}
        {isAdmin && (
          <Link
            href="/settings/users"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors mb-2",
              pathname.startsWith("/settings") && "bg-white/10 text-white",
              !sidebarOpen && "justify-center px-0"
            )}
            title={!sidebarOpen ? "Settings" : undefined}
          >
            <Settings className={cn("h-5 w-5 shrink-0", pathname.startsWith("/settings") && "text-brand-green")} />
            {sidebarOpen && <span>Settings</span>}
          </Link>
        )}

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
                <UserMenu sidebarOpen={true} />
              </div>
            ) : (
              <UserMenu sidebarOpen={false} />
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
