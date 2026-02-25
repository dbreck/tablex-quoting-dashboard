"use client";

import { useRouter } from "next/navigation";

interface SlideProps {
  children: React.ReactNode;
  appLink?: string;
  linkLabel?: string;
}

export function Slide({ children, appLink, linkLabel = "See it live" }: SlideProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-12 backdrop-blur-xl">
        {children}
      </div>
      {appLink && (
        <button
          onClick={() => router.push(appLink)}
          className="rounded-full border border-brand-green/30 bg-brand-green/10 px-6 py-2.5 text-sm font-medium text-brand-green transition-all hover:border-brand-green/50 hover:bg-brand-green/20"
        >
          {linkLabel} &rarr;
        </button>
      )}
    </div>
  );
}
