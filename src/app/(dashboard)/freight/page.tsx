"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { freightZones, stateNames, getZoneForState, type FreightZone } from "@/data/freight-zones";
import { Truck, MapPin } from "lucide-react";

const thresholds = [
  { key: "under3k" as const, label: "< $3,000" },
  { key: "over3k" as const, label: "> $3,000" },
  { key: "over5k" as const, label: "> $5,000" },
  { key: "over7_5k" as const, label: "> $7,500" },
  { key: "over10k" as const, label: "> $10,000" },
];

export default function FreightPage() {
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const allStates = useMemo(() => {
    const states: { abbr: string; zone: FreightZone }[] = [];
    for (const zone of freightZones) {
      for (const st of zone.states) {
        states.push({ abbr: st, zone });
      }
    }
    return states.sort((a, b) => a.abbr.localeCompare(b.abbr));
  }, []);

  const hoveredZoneInfo = hoveredState ? getZoneForState(hoveredState) : null;

  return (
    <div>
      <Header
        title="Freight Zone Map"
        subtitle="Shipping zones by state with pricing matrix based on order totals"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone Legend + State List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand-green" />
                Zone Legend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {freightZones.map((zone) => (
                <button
                  key={zone.zone}
                  onClick={() => setSelectedZone(selectedZone === zone.zone ? null : zone.zone)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                    selectedZone === zone.zone
                      ? "ring-2 ring-brand-green bg-brand-green/5"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-md shrink-0"
                    style={{ backgroundColor: zone.color }}
                  />
                  <div className="text-left flex-1">
                    <p className="text-sm font-semibold text-slate-900">Zone {zone.zone}</p>
                    <p className="text-xs text-slate-500">{zone.states.join(", ")}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">{zone.states.length}</Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Hovered state info */}
          {hoveredState && hoveredZoneInfo && (
            <Card className="animate-fade-in border-brand-green/30">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider">State Info</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">
                  {stateNames[hoveredState]} ({hoveredState})
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: hoveredZoneInfo.color }}
                  />
                  <span className="text-sm text-slate-600">Zone {hoveredZoneInfo.zone}</span>
                </div>
                <div className="mt-3 space-y-1">
                  {thresholds.map((t) => (
                    <div key={t.key} className="flex justify-between text-xs">
                      <span className="text-slate-500">{t.label}</span>
                      <span className={`font-medium ${
                        hoveredZoneInfo.pricing[t.key] === "FREE"
                          ? "text-brand-green"
                          : hoveredZoneInfo.pricing[t.key] === "Quote"
                          ? "text-brand-navy font-semibold"
                          : "text-slate-900"
                      }`}>
                        {hoveredZoneInfo.pricing[t.key]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Map + Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {/* State Grid (visual map alternative) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-brand-green" />
                States by Zone
              </CardTitle>
              <CardDescription>Hover over a state to see pricing details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {allStates.map(({ abbr, zone }) => (
                  <button
                    key={abbr}
                    onMouseEnter={() => setHoveredState(abbr)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => setSelectedZone(selectedZone === zone.zone ? null : zone.zone)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg text-white text-xs font-bold transition-all cursor-pointer ${
                      selectedZone !== null && selectedZone !== zone.zone
                        ? "opacity-30"
                        : "opacity-100"
                    } ${
                      hoveredState === abbr ? "ring-2 ring-white shadow-lg scale-110" : ""
                    }`}
                    style={{ backgroundColor: zone.color }}
                    title={`${stateNames[abbr]} — Zone ${zone.zone}`}
                  >
                    {abbr}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Freight Pricing Matrix</CardTitle>
              <CardDescription>Shipping costs by zone and order total threshold</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Zone</th>
                      <th>States</th>
                      {thresholds.map((t) => (
                        <th key={t.key} className="text-center">{t.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {freightZones.map((zone) => (
                      <tr
                        key={zone.zone}
                        className={`transition-colors ${
                          selectedZone === zone.zone ? "!bg-brand-green/5" : ""
                        }`}
                      >
                        <td>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: zone.color }}
                            />
                            <span className="font-semibold">Zone {zone.zone}</span>
                          </div>
                        </td>
                        <td className="text-xs text-slate-500 max-w-[200px]">
                          {zone.states.join(", ")}
                        </td>
                        {thresholds.map((t) => {
                          const val = zone.pricing[t.key];
                          return (
                            <td key={t.key} className="text-center">
                              {val === "FREE" ? (
                                <Badge variant="success">FREE</Badge>
                              ) : val === "Quote" ? (
                                <Badge variant="secondary" className="bg-brand-navy/10 text-brand-navy">
                                  Must Quote
                                </Badge>
                              ) : (
                                <span className="price text-slate-900">{val}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
