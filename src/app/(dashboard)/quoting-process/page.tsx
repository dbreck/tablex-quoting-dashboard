import { createClient } from "@/lib/supabase/server";
import QuotingProcessClient from "./QuotingProcessClient";
import type { QuoteQueueMetrics } from "./components/BottleneckAnalysisTab";

export default async function QuotingProcessPage() {
  const supabase = await createClient();

  // Fetch all three data sources in parallel
  const [profitResult, metricsResult, queueResult] = await Promise.all([
    supabase.from("profit_analysis").select("*"),
    supabase.from("quote_queue_metrics").select("data").limit(1).single(),
    supabase.from("quote_queue").select("*"),
  ]);

  if (profitResult.error) {
    console.error("Failed to fetch profit_analysis:", profitResult.error);
  }
  if (metricsResult.error) {
    console.error("Failed to fetch quote_queue_metrics:", metricsResult.error);
  }
  if (queueResult.error) {
    console.error("Failed to fetch quote_queue:", queueResult.error);
  }

  const profitData = (profitResult.data || []).map((r: Record<string, unknown>) => ({
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

  // On fetch error this falls back to {} (pre-existing behavior; the
  // Bottleneck tab would fail to render without its data either way), so the
  // cast documents the expected happy-path shape rather than proving it.
  const metrics = (metricsResult.data?.data || {}) as QuoteQueueMetrics;

  const queueData = (queueResult.data || []).map((r: Record<string, unknown>) => ({
    rowNum: (r.row_num as number) || 0,
    emailFrom: (r.email_from as string) || "",
    dateTime: (r.date_time as string) || "",
    dateNormalized: (r.date_normalized as string) || "",
    year: (r.year as number) || 0,
    quoteNumber: (r.quote_number as string) || "",
    dealerProject: (r.dealer_project as string) || "",
    special: (r.special as boolean) || false,
    staff: (r.staff as string) || "",
    status: (r.status as string) || "",
    statusNormalized: (r.status_normalized as string) || "",
  }));

  return (
    <QuotingProcessClient
      profitData={profitData}
      metrics={metrics}
      queueData={queueData}
    />
  );
}
