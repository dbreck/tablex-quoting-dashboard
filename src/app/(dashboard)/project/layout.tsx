"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { MondaySyncIndicator } from "@/components/project/MondaySyncIndicator";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();

  if (!profile?.can_access_proposal) return null;

  return (
    <>
      {/* Fixed to the viewport so it aligns with the comment toggle (which is
          also fixed top-4 right-4 z-50). Sits to its left with a small gap. */}
      <div className="fixed top-5 right-16 z-40">
        <MondaySyncIndicator />
      </div>
      {children}
    </>
  );
}
