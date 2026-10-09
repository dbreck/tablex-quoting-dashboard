"use client";

import { useMemo, type ReactNode } from "react";
import { FIN_MILESTONES } from "@/lib/fin/types";
import {
  count,
  daysBetween,
  impactMetrics,
  impactWindows,
  money,
  shortDate,
  type FinancialsData,
  type ImpactMetrics,
  type ImpactWindow,
} from "../_lib/aggregate";
import { Banner, Panel } from "../_lib/charts";
import { cn } from "@/lib/utils";

interface MetricDef {
  id: string;
  label: string;
  /** Only meaningful once the tablex.com portal is live. */
  siteOnly: boolean;
  value: (m: ImpactMetrics) => string;
  detail?: (m: ImpactMetrics) => ReactNode;
}

const METRICS: MetricDef[] = [
  {
    id: "web",
    label: "Web quote requests",
    siteOnly: false,
    value: (m) => count(m.webRequests),
    detail: (m) => `Gravity Forms ${count(m.webBySource.gf)} · tablex.com ${count(m.webBySource.qr)}`,
  },
  {
    id: "signups",
    label: "Account signups",
    siteOnly: true,
    value: (m) => count(m.signups),
    detail: (m) => (m.signupsByRole.length === 0 ? "No signups" : m.signupsByRole.map((r) => `${r.role} ${count(r.n)}`).join(" · ")),
  },
  { id: "portal", label: "Portal quotes created", siteOnly: true, value: (m) => count(m.portalQuotes), detail: () => "Dealer and rep portal quotes" },
  { id: "self", label: "Self-quotes created", siteOnly: true, value: (m) => count(m.selfQuotes), detail: () => "Public list-price quotes from the cart" },
  { id: "accepted", label: "Quotes accepted", siteOnly: true, value: (m) => count(m.accepted), detail: () => "By accepted date" },
  { id: "net", label: "Accepted net $", siteOnly: true, value: (m) => money(m.acceptedNetCents), detail: () => "Net subtotal of accepted quotes" },
  { id: "orgs", label: "Distinct orgs quoting", siteOnly: true, value: (m) => count(m.orgsQuoting), detail: () => "Orgs with a quote created in the window" },
];

const EARLY_READ_DAYS = 90;

export default function WebsiteImpactView({ data }: { data: FinancialsData }) {
  const { asOf, webRequests, signups, siteQuotes } = data;
  const windows = useMemo(() => impactWindows(asOf), [asOf]);
  const metrics = useMemo(
    () => windows.map((w) => impactMetrics(w, { webRequests, signups, siteQuotes })),
    [windows, webRequests, signups, siteQuotes],
  );
  const sinceLaunch = daysBetween(FIN_MILESTONES.siteLaunch, asOf);
  const noSiteData = webRequests.length === 0 && signups.length === 0 && siteQuotes.length === 0;

  return (
    <div className="space-y-6">
      {sinceLaunch < EARLY_READ_DAYS && (
        <Banner>
          Early read — fewer than {EARLY_READ_DAYS} days since launch ({sinceLaunch} days since {shortDate(FIN_MILESTONES.siteLaunch)}). Small
          counts swing hard; treat differences as direction, not trend.
        </Banner>
      )}
      {noSiteData && <Banner tone="sky">No site snapshot yet — run scripts/fin/site-snapshot.ts. Every count below reads 0 until it runs.</Banner>}

      <Panel
        title="Since launch vs the same span in prior years"
        caption={
          <>
            Windows run from the announcement day ({shortDate(FIN_MILESTONES.announcement)}) to {shortDate(asOf)}, and the same calendar
            span one and two years earlier. Portal metrics read n/a where the window predates the {shortDate(FIN_MILESTONES.siteLaunch)}{" "}
            launch. Invoice revenue cannot be compared here: Xero invoice detail stops at{" "}
            {shortDate(FIN_MILESTONES.xeroDetailCutoff)}, so post-launch revenue is only visible as monthly P&amp;L totals on the Overview.
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 pr-4 font-medium">Metric</th>
                {windows.map((w) => (
                  <WindowHead key={w.id} w={w} />
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {METRICS.map((def) => (
                <tr key={def.id}>
                  <td className="py-3 pr-4 align-top font-medium text-gray-700">{def.label}</td>
                  {windows.map((w, i) => {
                    const na = def.siteOnly && !w.siteLive;
                    const m = metrics[i];
                    return (
                      <td key={w.id} className={cn("py-3 pr-4 align-top", w.id === "y2" && "opacity-50")}>
                        <p className={cn("text-lg font-bold tabular-nums", na ? "text-gray-300" : "text-gray-900")}>
                          {na ? "n/a" : def.value(m)}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {na ? "Portal not live" : def.detail?.(m)}
                          {!na && <span className="text-gray-400"> · {w.days} days</span>}
                        </p>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function WindowHead({ w }: { w: ImpactWindow }) {
  return (
    <th className={cn("py-2 pr-4 font-medium", w.id === "y2" && "opacity-50")}>
      <span className={cn(w.id === "since" && "text-gray-900")}>{w.label}</span>
      <span className="block text-[11px] font-normal text-gray-400">
        {shortDate(w.start)} – {shortDate(w.end)} · {w.days} days
      </span>
    </th>
  );
}
