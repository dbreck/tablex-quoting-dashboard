"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { MondaySyncIndicator } from "@/components/project/MondaySyncIndicator";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();

  if (!profile?.can_access_proposal) return null;

  return (
    <>
      <div className="absolute top-6 right-8 z-10">
        <MondaySyncIndicator />
      </div>
      {children}
    </>
  );
}
