"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function PresentationReturnButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on non-presentation pages when a presentation session is active
    const hasSession = sessionStorage.getItem("present-slide") !== null;
    const isPresenting = pathname === "/present";
    setVisible(hasSession && !isPresenting);
  }, [pathname]);

  if (!visible) return null;

  return (
    <button
      onClick={() => router.push("/present")}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-brand-navy px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-brand-navy-dark hover:shadow-xl"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Slides
    </button>
  );
}
