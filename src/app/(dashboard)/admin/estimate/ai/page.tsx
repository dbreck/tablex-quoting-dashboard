import { redirect } from "next/navigation";

/** Old unlinked URL — the AI-assisted estimate is now the default view on /admin/estimate. */
export default function AiEstimateRedirect() {
  redirect("/admin/estimate");
}
