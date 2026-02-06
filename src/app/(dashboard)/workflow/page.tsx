import { createClient } from "@/lib/supabase/server";
import WorkflowClient from "./WorkflowClient";

export default async function WorkflowPage() {
  const supabase = await createClient();

  // Fetch metrics from quote_queue_metrics table (JSONB in `data` column)
  const { data: metricsRows, error: metricsError } = await supabase
    .from("quote_queue_metrics")
    .select("data")
    .limit(1)
    .single();

  if (metricsError) {
    console.error("Failed to fetch quote_queue_metrics:", metricsError);
  }

  const metrics = metricsRows?.data || {};

  // Fetch queue data
  const { data: queueRows, error: queueError } = await supabase
    .from("quote_queue")
    .select("*");

  if (queueError) {
    console.error("Failed to fetch quote_queue:", queueError);
  }

  const queueData = (queueRows || []).map((r: Record<string, unknown>) => ({
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

  return <WorkflowClient metrics={metrics} queueData={queueData} />;
}
