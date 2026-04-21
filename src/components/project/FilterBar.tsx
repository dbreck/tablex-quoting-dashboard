"use client";

import { useProjectTrackerStore, useTeam } from "@/store/project-tracker-store";
import { COLUMNS } from "@/data/project-tracker";
import { WORKSTREAMS } from "@/data/project-phase2";
import { Search, X } from "lucide-react";

export function FilterBar() {
  const { filters, setFilter, resetFilters } = useProjectTrackerStore();
  const team = useTeam();
  const hasFilters = filters.assignee !== "all" || filters.workstream !== "all" || filters.priority !== "all" || filters.search !== "";

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green bg-white"
        />
      </div>

      {/* Assignee */}
      <select
        value={filters.assignee}
        onChange={(e) => setFilter("assignee", e.target.value as any)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/50"
      >
        <option value="all">All Members</option>
        {team.map((m) => (
          <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
        ))}
      </select>

      {/* Workstream */}
      <select
        value={filters.workstream}
        onChange={(e) => setFilter("workstream", e.target.value as any)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/50"
      >
        <option value="all">All Workstreams</option>
        {WORKSTREAMS.map((ws) => (
          <option key={ws.id} value={ws.id}>{ws.name}</option>
        ))}
      </select>

      {/* Priority */}
      <select
        value={filters.priority}
        onChange={(e) => setFilter("priority", e.target.value as any)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/50"
      >
        <option value="all">All Priorities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  );
}
