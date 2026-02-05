"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";
import {
  LayoutDashboard,
  ScanBarcode,
  DollarSign,
  Package,
  ClipboardList,
  Truck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "SKU Decoder", href: "/sku-decoder", icon: ScanBarcode },
  { name: "Pricing", href: "/pricing", icon: DollarSign },
  { name: "Catalog", href: "/catalog", icon: Package },
  { name: "Queue", href: "/queue", icon: ClipboardList },
  { name: "Freight", href: "/freight", icon: Truck },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useSidebar();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-brand-navy transition-all duration-300 ease-in-out",
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
              <p className="text-[10px] text-white/50 uppercase tracking-widest">Quote Analytics</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-1", sidebarOpen ? "px-3 py-4" : "px-2 py-4")}>
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

      {/* Collapse Toggle */}
      <div className={cn("absolute bottom-4 left-0 right-0", sidebarOpen ? "px-3" : "px-2")}>
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
