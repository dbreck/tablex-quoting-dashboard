import FinancialsClient from "./FinancialsClient";
import { loadFinancials } from "./_lib/queries";

// Reads live warehouse rows per request (admin-only; RLS gates the fin_* tables).
export const dynamic = "force-dynamic";

export default async function AdminFinancialsPage() {
  const data = await loadFinancials();
  return <FinancialsClient data={data} />;
}
