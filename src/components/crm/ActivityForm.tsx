"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { ActivityType } from "@/types/quote-builder";
import { Plus } from "lucide-react";

interface ActivityFormProps {
  onSubmit: (type: ActivityType, content: string) => void;
}

export function ActivityForm({ onSubmit }: ActivityFormProps) {
  const [type, setType] = useState<ActivityType>("note");
  const [content, setContent] = useState("");

  function handleSubmit() {
    if (!content.trim()) return;
    onSubmit(type, content.trim());
    setContent("");
    setType("note");
  }

  return (
    <div className="flex gap-2 items-start">
      <Select
        value={type}
        onValueChange={(val) => setType(val as ActivityType)}
      >
        <SelectTrigger className="w-[130px] shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="note">Note</SelectItem>
          <SelectItem value="call">Call</SelectItem>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="meeting">Meeting</SelectItem>
        </SelectContent>
      </Select>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a note or log activity..."
        className="flex min-h-[40px] flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent resize-none"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <Button
        onClick={handleSubmit}
        disabled={!content.trim()}
        size="default"
        className="shrink-0"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add
      </Button>
    </div>
  );
}
