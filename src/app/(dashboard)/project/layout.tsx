"use client";

import { useAuth } from "@/components/providers/AuthProvider";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();

  if (!profile?.can_access_proposal) return null;

  return <>{children}</>;
}
