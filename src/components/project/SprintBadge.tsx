"use client";

import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSprint } from "@/store/sprint-store";

const sprintChipStyle: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  upcoming: "bg-blue-50 text-blue-700 border-blue-200",
  complete: "bg-gray-50 text-gray-500 border-gray-200",
};

interface SprintBadgeProps {
  sprintId: string | null | undefined;
  className?: string;
}

export function SprintBadge({ sprintId, className }: SprintBadgeProps) {
  const sprint = useSprint(sprintId);
  if (!sprintId || !sprint) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0",
        sprintChipStyle[sprint.status] ?? sprintChipStyle.upcoming,
        className,
      )}
      title={`${sprint.name}${sprint.goal ? ` — ${sprint.goal}` : ""}`}
    >
      <Zap className="h-2.5 w-2.5" />
      {sprint.name}
    </span>
  );
}
