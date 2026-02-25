import { type ReactNode } from "react";

interface StatCardProps {
  value: string;
  label: string;
  icon?: ReactNode;
  accent?: boolean;
}

export function StatCard({ value, label, icon, accent }: StatCardProps) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        accent
          ? "border-brand-green/20 bg-brand-green/5 shadow-2xl shadow-brand-green/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      {icon && <div className="mb-3 text-white/40">{icon}</div>}
      <div
        className={`text-3xl font-bold tracking-tight ${
          accent ? "text-brand-green" : "text-white"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-sm text-white/50">{label}</div>
    </div>
  );
}
