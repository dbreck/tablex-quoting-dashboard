import { createClient } from "@/lib/supabase/server";
import QueueClient from "./QueueClient";
import gfRaw from "@/data/gf-quote-requests.json";
import type { GfQuoteRequest } from "./QueueClient";

export default async function QueuePage() {
  const supabase = await createClient();

  // Supabase caps at 1,000 rows per request — paginate to get all 3,595
  let rows: Record<string, unknown>[] = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("quote_queue")
      .select("*")
      .range(from, from + pageSize - 1);

    if (error) {
      console.error("Failed to fetch quote_queue:", error);
      break;
    }
    if (!data || data.length === 0) break;
    rows = rows.concat(data as Record<string, unknown>[]);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  const queueData = (rows || []).map((r: Record<string, unknown>) => ({
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

  const gfRequests: GfQuoteRequest[] = (gfRaw as Record<string, unknown>[]).map((r) => ({
    entryId: (r.entryId as number) || 0,
    dateCreated: (r.dateCreated as string) || "",
    companyName: (r.companyName as string) || "",
    contactName: (r.contactName as string) || "",
    baseSeries: (r.baseSeries as string) || "",
    baseFinish: (r.baseFinish as string) || "",
    quantity: (r.quantity as number) || 0,
  }));

  return <QueueClient queueData={queueData} gfRequests={gfRequests} />;
}
