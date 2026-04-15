"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";

const tabs = [
  { name: "Users", href: "/admin/users" },
  { name: "Scope", href: "/admin/scope" },
  { name: "Timeline", href: "/admin/timeline" },
  { name: "Estimate", href: "/admin/estimate" },
  { name: "Infrastructure", href: "/admin/infrastructure" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  return (
    <div>
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6 px-1" aria-label="Admin tabs">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/admin/users"
                ? pathname.startsWith("/admin/users") || pathname === "/admin"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-brand-green text-brand-green"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </div>
  );
}
