import { createClient } from "@/lib/supabase/server";
import HowQuotingClient from "./HowQuotingClient";

export default async function HowQuotingWorksPage() {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("profit_analysis")
    .select("*");

  if (error) {
    console.error("Failed to fetch profit_analysis:", error);
  }

  const profitData = (rows || []).map((r: Record<string, unknown>) => ({
    tag: (r.tag as string) || "",
    qty: r.qty as number | null,
    sku: r.sku as string,
    series: (r.series as string) || "",
    topCost: r.top_cost as number | null,
    routeCost: r.route_cost as number | null,
    baseCost: r.base_cost as number | null,
    nestFoldCost: r.nest_fold_cost as number | null,
    asbGnLcCost1: r.asb_gn_lc_cost1 as number | null,
    asbGnLcCost2: r.asb_gn_lc_cost2 as number | null,
    assemblyCost: r.assembly_cost as number | null,
    lfCost: r.lf_cost as number | null,
    freightInCost: r.freight_in_cost as number | null,
    packagingCost: r.packaging_cost as number | null,
    totalCost: r.total_cost as number | null,
    freightOutPct: r.freight_out_pct as number | null,
    gpm: r.gpm as number | null,
    commission: r.commission as number | null,
    standardPrice: r.standard_price as number | null,
    netProfit: r.net_profit as number | null,
    listPrice: r.list_price as number | null,
    discountFactor: r.discount_factor as number | null,
    netPrice: r.net_price as number | null,
    newNetProfit: r.new_net_profit as number | null,
    notes: (r.notes as string) || "",
    price_50_20: r.price_50_20 as number | null,
    price_50_20_5: r.price_50_20_5 as number | null,
    price_50_20_10: r.price_50_20_10 as number | null,
    price_50_20_15: r.price_50_20_15 as number | null,
    price_50_20_20: r.price_50_20_20 as number | null,
  }));

  return <HowQuotingClient profitData={profitData} />;
}
