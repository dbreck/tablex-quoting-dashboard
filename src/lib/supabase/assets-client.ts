// Browser-side CRUD for project_assets. Authz is RLS-enforced.

import { createClient } from "@/lib/supabase/client";
import type { AssetGroup } from "@/data/assets";
import {
  rowToAssetGroup,
  assetGroupToInsertRow,
  assetGroupUpdatesToRow,
  type AssetGroupRow,
} from "@/lib/supabase/assets-converters";

// ─── Reads ───────────────────────────────────────────────────────────────────

export async function fetchAllAssetGroups(): Promise<AssetGroup[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("project_assets")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as AssetGroupRow[]).map(rowToAssetGroup);
}

// ─── Writes ──────────────────────────────────────────────────────────────────

export async function createAssetGroup(
  group: Omit<AssetGroup, "createdAt" | "updatedAt">,
): Promise<AssetGroup> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("project_assets")
    .insert(assetGroupToInsertRow(group))
    .select("*")
    .single();
  if (error) throw error;
  return rowToAssetGroup(data as AssetGroupRow);
}

export async function updateAssetGroup(
  id: string,
  patch: Partial<Omit<AssetGroup, "id" | "createdAt" | "updatedAt">>,
): Promise<void> {
  const supabase = createClient();
  const row = assetGroupUpdatesToRow(patch);
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("project_assets").update(row).eq("id", id);
  if (error) throw error;
}

export async function deleteAssetGroup(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("project_assets").delete().eq("id", id);
  if (error) throw error;
}
