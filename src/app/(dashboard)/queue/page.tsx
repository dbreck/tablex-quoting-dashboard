import { createClient } from "@/lib/supabase/server";
import QueueClient from "./QueueClient";

export default async function QueuePage() {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("quote_queue")
    .select("*");

  if (error) {
    console.error("Failed to fetch quote_queue:", error);
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

  return <QueueClient queueData={queueData} />;
}
