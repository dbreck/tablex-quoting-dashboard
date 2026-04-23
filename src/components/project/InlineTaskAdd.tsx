"use client";

import { useState, useRef } from "react";
import { useProjectTrackerStore } from "@/store/project-tracker-store";
import { Plus } from "lucide-react";

interface InlineTaskAddProps {
  deliverableId: string;
}

export function InlineTaskAdd({ deliverableId }: InlineTaskAddProps) {
  const { addTask } = useProjectTrackerStore();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!value.trim()) return;
    addTask({
      deliverableId,
      title: value.trim(),
      column: "backlog",
      priority: "medium",
      assignee: null,
      labels: [],
      subtasks: [],
      acceptanceCriteria: [],
    });
    setValue("");
    // Keep focus for rapid entry
    inputRef.current?.focus();
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 ml-6">
      <Plus className="h-3.5 w-3.5 text-gray-300 shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") {
            setValue("");
            inputRef.current?.blur();
          }
        }}
        placeholder="Add task..."
        className="flex-1 text-sm text-gray-500 placeholder:text-gray-300 bg-transparent border-none outline-none focus:text-gray-700"
      />
    </div>
  );
}
