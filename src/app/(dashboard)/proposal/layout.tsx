"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";

const tabs = [
  { name: "Scope", href: "/proposal" },
  { name: "Timeline", href: "/proposal/timeline" },
  { name: "Estimate", href: "/proposal/estimate" },
];

export default function ProposalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile } = useAuth();

  if (!profile?.can_access_proposal) return null;

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6 px-1" aria-label="Proposal tabs">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/proposal"
                ? pathname === "/proposal"
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
