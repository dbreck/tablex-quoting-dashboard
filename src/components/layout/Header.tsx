"use client";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}
