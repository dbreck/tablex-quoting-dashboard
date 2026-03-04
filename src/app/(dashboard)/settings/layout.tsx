"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";

const tabs = [
  { name: "Users", href: "/settings/users" },
  { name: "Project Scope", href: "/settings/project" },
  { name: "Timeline", href: "/settings/project/timeline" },
  { name: "Estimate", href: "/settings/project/estimate" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6 px-1" aria-label="Settings tabs">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/settings/project"
                ? pathname === "/settings/project"
                : pathname === tab.href;

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
