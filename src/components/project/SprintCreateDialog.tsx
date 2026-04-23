"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSprintStore } from "@/store/sprint-store";
import { SPRINT_LENGTH_DAYS, inferSprintStatus, type Sprint } from "@/data/sprint";

interface SprintCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStartDate?: string;
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function SprintCreateDialog({
  open,
  onOpenChange,
  defaultStartDate,
}: SprintCreateDialogProps) {
  const addSprint = useSprintStore((s) => s.addSprint);
  const sprintCount = useSprintStore((s) => s.sprints.length);

  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState(defaultStartDate ?? todayISO());

  const endDate = startDate ? addDays(startDate, SPRINT_LENGTH_DAYS - 1) : "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate) return;
    const today = todayISO();
    const sprint: Sprint = {
      id: `sprint-${nanoid(6)}`,
      name: name.trim() || `Sprint ${sprintCount + 1}`,
      goal: goal.trim() || undefined,
      startDate,
      endDate,
      status: inferSprintStatus({ startDate, endDate }, today),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addSprint(sprint);
    setName("");
    setGoal("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New sprint</DialogTitle>
          <DialogDescription>
            Two-week iteration. End date is computed automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Sprint ${sprintCount + 1}`}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Goal (optional)
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="One-line objective"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                End date
              </label>
              <input
                type="date"
                value={endDate}
                disabled
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create sprint</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
