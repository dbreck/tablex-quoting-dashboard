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
  Library,
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
  KanbanSquare,
  GanttChart,
  ListChecks,
  Server,
  Crosshair,
  Fingerprint,
  LayoutTemplate,
} from "lucide-react";
import { UserMenu } from "./UserMenu";

// ─── Mode definitions ────────────────────────────────────────────────────────

const modes = [
  { id: "project" as const, label: "Project", icon: Crosshair, subtitle: "Project Tracker" },
  { id: "analytics" as const, label: "Analytics", icon: BarChart3, subtitle: "Quote Analytics" },
  { id: "quote-builder" as const, label: "Quoting", icon: FilePlus2, subtitle: "Quoting" },
];

// ─── Nav groups per mode ─────────────────────────────────────────────────────

const projectNavItems = [
  { name: "Dashboard", href: "/project", icon: LayoutDashboard, exact: true },
  { name: "Scope", href: "/project/scope", icon: ClipboardList },
  { name: "Timeline", href: "/project/timeline", icon: GanttChart },
  { name: "Tasks", href: "/project/tasks", icon: ListChecks },
  { name: "Board", href: "/project/board", icon: KanbanSquare },
  { name: "Infra Setup", href: "/project/infrastructure", icon: Server },
];

const overviewItem = { name: "Overview", href: "/overview", icon: LayoutDashboard };

const analyticsNavGroups = [
  {
    label: "Website Redesign",
    items: [
      { name: "User Personas", href: "/user-personas", icon: Users },
      { name: "Customer Journey", href: "/customer-journey", icon: Route },
      { name: "WP Site Audit", href: "/wp-site-audit", icon: Globe },
      { name: "Site Architecture", href: "/site-architecture", icon: Network },
      { name: "Wireframes", href: "/wireframes", icon: LayoutTemplate },
      { name: "Product Library", href: "/product-library", icon: Library },
      { name: "Catalog", href: "/catalog", icon: Package },
      { name: "Configurator", href: "/configurator", icon: Box },
    ],
  },
  {
    label: "Business Intelligence",
    items: [
      { name: "TableX DNA", href: "/tablex-dna", icon: Fingerprint },
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
    } else if (pathname.startsWith("/admin")) {
      // Admin pages keep current mode (don't switch)
    } else if (pathname.startsWith("/project")) {
      setSidebarMode("project");
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

  const activeMode = modes.find((m) => m.id === sidebarMode) ?? modes[0];

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
        "fixed left-0 top-0 z-40 h-screen bg-[#030609] transition-all duration-300 ease-in-out flex flex-col",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <Link href="/project" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl p-1.5">
            <img src="/tablex-logomark.svg" alt="TableX" className="h-full w-full" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold tracking-tight"><span className="text-white">TABLE</span><span className="text-[#ff6b6b]">X</span></h1>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">{activeMode.subtitle}</p>
            </div>
          )}
        </Link>
      </div>

      {/* Mode Switcher — 3-way vertical icon tabs (hidden for reps) */}
      {!isRep && (
        <div className={cn("border-b border-white/10", sidebarOpen ? "px-3 pt-3 pb-2" : "px-2 pt-3 pb-2")}>
          <div className="space-y-1">
            {modes.map((mode) => {
              const isActive = sidebarMode === mode.id;
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSidebarMode(mode.id)}
                  className={cn(
                    "flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/40 hover:bg-white/5 hover:text-white/70",
                    !sidebarOpen && "justify-center px-0"
                  )}
                  title={!sidebarOpen ? mode.label : undefined}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-brand-green")} />
                  {sidebarOpen && <span>{mode.label}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto", sidebarOpen ? "px-3 py-2" : "px-2 py-2")}>
        {sidebarMode === "project" ? (
          /* ── Project Mode ─────────────────────────────────────────── */
          <div className="space-y-0.5">
            {projectNavItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
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
        ) : sidebarMode === "analytics" ? (
          /* ── Analytics Mode ───────────────────────────────────────── */
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
          /* ── Quoting Mode ─────────────────────────────────────────── */
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

      {/* Admin + User + Collapse */}
      <div className={cn("border-t border-white/10", sidebarOpen ? "px-3 py-3" : "px-2 py-3")}>
        {/* Admin Link (was Settings) */}
        {isAdmin && (
          <Link
            href="/admin/users"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors mb-2",
              pathname.startsWith("/admin") && "bg-white/10 text-white",
              !sidebarOpen && "justify-center px-0"
            )}
            title={!sidebarOpen ? "Admin" : undefined}
          >
            <Settings className={cn("h-5 w-5 shrink-0", pathname.startsWith("/admin") && "text-brand-green")} />
            {sidebarOpen && <span>Admin</span>}
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
