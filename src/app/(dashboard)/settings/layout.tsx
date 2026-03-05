"use client";

import { useAuth } from "@/components/providers/AuthProvider";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  return <div>{children}</div>;
}
