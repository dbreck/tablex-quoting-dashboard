import { createClient } from "@/lib/supabase/server";
import CatalogClient from "./CatalogClient";

export default async function CatalogPage() {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("product_catalog")
    .select("*");

  if (error) {
    console.error("Failed to fetch product_catalog:", error);
  }

  const catalogData = (rows || []).map((r: Record<string, unknown>) => ({
    sku: r.sku as string,
    series: r.series as string,
    shapeName: r.shape_name as string,
    size: r.size as string,
    totalCost: r.total_cost as number | null,
    listPrice: r.list_price as number | null,
    price_50_20: r.price_50_20 as number | null,
    price_50_20_5: r.price_50_20_5 as number | null,
    price_50_20_10: r.price_50_20_10 as number | null,
    price_50_20_15: r.price_50_20_15 as number | null,
    price_50_20_20: r.price_50_20_20 as number | null,
    gpm: r.gpm as number | null,
    notes: (r.notes as string) || "",
  }));

  return <CatalogClient catalogData={catalogData} />;
}
