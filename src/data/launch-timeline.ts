// Launch Timeline — types + static config.
//
// The four workstreams (lanes), owner categories, and statuses are FIXED
// structure the user doesn't edit — they live here as static config. The
// individual milestones are user-editable and live in Supabase
// (`launch_milestones`), mirroring the "static seed + mutable data" split
// used by DELIVERABLES (static) vs the tracker tables (mutable).

export type LaneId = "web" | "lookbook" | "spec" | "video";
export type OwnerId = "tablex" | "clearph" | "dev" | "vendor";
export type StatusId = "todo" | "active" | "done" | "blocked";

export const LANE_IDS: LaneId[] = ["web", "lookbook", "spec", "video"];
export const OWNER_IDS: OwnerId[] = ["tablex", "clearph", "dev", "vendor"];
export const STATUS_IDS: StatusId[] = ["todo", "active", "done", "blocked"];

export interface LaunchMilestone {
  id: string;
  lane: LaneId;
  title: string;
  owner: OwnerId;
  start: string; // ISO YYYY-MM-DD
  end: string; // ISO YYYY-MM-DD (inclusive)
  status: StatusId;
  note: string; // "" when none
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface LaneConfig {
  id: LaneId;
  name: string;
  blurb: string;
  stripe: string; // hex — the lane's accent rail
}

// Owner colors are the data encoding (distinct from the app's brand-green
// accent). Earthy, brand-adjacent, all legible with white text.
export interface OwnerConfig {
  id: OwnerId;
  label: string;
  color: string; // hex
}

export interface StatusConfig {
  id: StatusId;
  label: string;
}

export const LAUNCH_LANES: LaneConfig[] = [
  { id: "web", name: "Website & Launch", blurb: "Build · content · Xero · cutover", stripe: "#465C8C" },
  { id: "lookbook", name: "Lookbook", blurb: "~80-pg book · print + digital", stripe: "#6E6B41" },
  { id: "spec", name: "Spec / Price Sheets", blurb: "Pricing data → design → PDF", stripe: "#8A5A2B" },
  { id: "video", name: "Launch Video — About TableX", blurb: "Pre-pro → shoot → post", stripe: "#1F6E8C" },
];

export const LAUNCH_OWNERS: Record<OwnerId, OwnerConfig> = {
  tablex: { id: "tablex", label: "TableX", color: "#1F6E8C" },
  clearph: { id: "clearph", label: "Clear pH", color: "#6E6B41" },
  dev: { id: "dev", label: "Danny · dev", color: "#465C8C" },
  vendor: { id: "vendor", label: "Vendor", color: "#8A5A2B" },
};

export const LAUNCH_STATUS: Record<StatusId, StatusConfig> = {
  todo: { id: "todo", label: "To do" },
  active: { id: "active", label: "In progress" },
  done: { id: "done", label: "Done" },
  blocked: { id: "blocked", label: "Blocked" },
};

export function isLaneId(v: string): v is LaneId {
  return (LANE_IDS as string[]).includes(v);
}
export function laneName(id: LaneId): string {
  return LAUNCH_LANES.find((l) => l.id === id)?.name ?? id;
}
