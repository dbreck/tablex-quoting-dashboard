"use client";

import { useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ClipboardList, Users, Building2, Globe } from "lucide-react";

interface QueueRow {
  rowNum: number;
  emailFrom: string;
  dateTime: string;
  dateNormalized: string;
  year: number;
  quoteNumber: string;
  dealerProject: string;
  special: boolean;
  staff: string;
  status: string;
  statusNormalized: string;
}

export interface GfQuoteRequest {
  entryId: number;
  dateCreated: string;
  companyName: string;
  contactName: string;
  baseSeries: string;
  baseFinish: string;
  quantity: number;
}

const COLORS = ["#8dc63f", "#1a3c5c", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#10b981", "#6366f1", "#f97316", "#94a3b8"];

interface QueueClientProps {
  queueData: QueueRow[];
  gfRequests: GfQuoteRequest[];
}

export default function QueueClient({ queueData, gfRequests }: QueueClientProps) {
  // Monthly volume data
  const monthlyVolume = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of queueData) {
      if (!row.year || !row.dateNormalized) continue;
      const match = row.dateNormalized.match(/^(\d{2})-/);
      if (!match) continue;
      const key = `${row.year}-${match[1]}`;
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => {
        const [year, month] = key.split("-");
        const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthNum = parseInt(month);
        return {
          month: `${monthNames[monthNum]} '${year.slice(2)}`,
          year,
          monthNum,
          count,
        };
      });
  }, [queueData]);

  // Staff workload
  const staffData = useMemo(() => {
    const counts: Record<string, { total: number; special: number; standard: number }> = {};
    for (const row of queueData) {
      const staff = (row.staff || "").trim();
      if (!staff) continue;
      // Handle combined staff like "SQ/MM"
      const staffMembers = staff.split("/").map((s) => s.trim());
      for (const s of staffMembers) {
        if (!s) continue;
        if (!counts[s]) counts[s] = { total: 0, special: 0, standard: 0 };
        counts[s].total++;
        if (row.special) counts[s].special++;
        else counts[s].standard++;
      }
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 10)
      .map(([name, data]) => ({
        name,
        special: data.special,
        standard: data.standard,
        total: data.total,
      }));
  }, [queueData]);

  // Top dealers
  const dealerData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of queueData) {
      const dealer = (row.dealerProject || "").split("-")[0].trim();
      if (!dealer) continue;
      counts[dealer] = (counts[dealer] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
    const top10 = sorted.slice(0, 10);
    const otherCount = sorted.slice(10).reduce((sum, [, c]) => sum + c, 0);
    const result = top10.map(([name, count]) => ({ name: name.slice(0, 25), value: count }));
    if (otherCount > 0) {
      result.push({ name: "Other", value: otherCount });
    }
    return result;
  }, [queueData]);

  // GF monthly volume (for Inbound tab dual-line chart)
  const gfMonthlyVolume = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of gfRequests) {
      if (!r.dateCreated) continue;
      const match = r.dateCreated.match(/^(\d{4})-(\d{2})/);
      if (!match) continue;
      const key = `${match[1]}-${match[2]}`;
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [gfRequests]);

  // Combined inbound chart data (queue + GF by month)
  const inboundData = useMemo(() => {
    // Build a union of all month keys from both datasets
    const allKeys = new Set<string>();
    // Queue months
    for (const row of queueData) {
      if (!row.year || !row.dateNormalized) continue;
      const match = row.dateNormalized.match(/^(\d{2})-/);
      if (!match) continue;
      allKeys.add(`${row.year}-${match[1]}`);
    }
    // GF months
    for (const key of Object.keys(gfMonthlyVolume)) {
      allKeys.add(key);
    }

    // Queue monthly counts
    const queueCounts: Record<string, number> = {};
    for (const row of queueData) {
      if (!row.year || !row.dateNormalized) continue;
      const match = row.dateNormalized.match(/^(\d{2})-/);
      if (!match) continue;
      const key = `${row.year}-${match[1]}`;
      queueCounts[key] = (queueCounts[key] || 0) + 1;
    }

    const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return Array.from(allKeys)
      .sort()
      .map((key) => {
        const [year, month] = key.split("-");
        const monthNum = parseInt(month);
        return {
          month: `${monthNames[monthNum]} '${year.slice(2)}`,
          year,
          monthNum,
          queue: queueCounts[key] || 0,
          webForm: gfMonthlyVolume[key] || 0,
        };
      });
  }, [queueData, gfMonthlyVolume]);

  // Top base series from GF data
  const seriesData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of gfRequests) {
      const s = (r.baseSeries || "").trim();
      if (!s) continue;
      counts[s] = (counts[s] || 0) + 1;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 12)
      .map(([name, count]) => ({ name, count }));
  }, [gfRequests]);

  // Top base finishes from GF data
  const finishData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of gfRequests) {
      const f = (r.baseFinish || "").trim();
      if (!f) continue;
      counts[f] = (counts[f] || 0) + 1;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 12)
      .map(([name, count]) => ({ name, count }));
  }, [gfRequests]);

  // Top companies from GF data (for stat card)
  const gfTopCompany = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of gfRequests) {
      const c = (r.companyName || "").trim();
      if (!c) continue;
      counts[c] = (counts[c] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
    return sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : { name: "N/A", count: 0 };
  }, [gfRequests]);

  // Derive actual date range from data
  const dateRange = useMemo(() => {
    if (monthlyVolume.length === 0) return { first: "", last: "", months: 0 };
    const first = monthlyVolume[0].month;
    const last = monthlyVolume[monthlyVolume.length - 1].month;
    return { first, last, months: monthlyVolume.length };
  }, [monthlyVolume]);

  // Stats
  const totalQuotes = queueData.length;
  const webRequestCount = gfRequests.length;
  const webPct = totalQuotes > 0 ? ((webRequestCount / totalQuotes) * 100).toFixed(0) : "0";
  const busiestMonth = monthlyVolume.reduce(
    (max, m) => (m.count > max.count ? m : max),
    { month: "", count: 0 }
  );

  return (
    <div>
      <Header
        title="Quote Queue Analytics"
        subtitle="Volume trends, product demand, and dealer analysis from queue data + web form requests"
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-green/10">
                <ClipboardList className="h-5 w-5 text-brand-green" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Total Quotes</p>
                <p className="text-2xl font-bold text-slate-900">{formatNumber(totalQuotes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Web Requests</p>
                <p className="text-2xl font-bold text-slate-900">{formatNumber(webRequestCount)}</p>
                <p className="text-xs text-slate-400">{webPct}% via web form</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Busiest Month</p>
                <p className="text-2xl font-bold text-slate-900">{busiestMonth.month}</p>
                <p className="text-xs text-slate-400">{busiestMonth.count} quotes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Top Company</p>
                <p className="text-lg font-bold text-slate-900 truncate max-w-[160px]">{gfTopCompany.name}</p>
                <p className="text-xs text-slate-400">{gfTopCompany.count} web requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="volume">
        <TabsList className="mb-6">
          <TabsTrigger value="volume">Volume</TabsTrigger>
          <TabsTrigger value="inbound">Inbound</TabsTrigger>
          <TabsTrigger value="product-mix">Product Mix</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="dealers">Dealers</TabsTrigger>
        </TabsList>

        {/* Volume Tab */}
        <TabsContent value="volume">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Quote Volume</CardTitle>
              <CardDescription>{dateRange.first} – {dateRange.last} ({dateRange.months} months tracked)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyVolume}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8dc63f" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8dc63f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={(props: Record<string, unknown>) => {
                      const x = Number(props.x);
                      const y = Number(props.y);
                      const payload = props.payload as { value: string; index: number };
                      const item = monthlyVolume[payload.index];
                      const isJan = item?.monthNum === 1;
                      // Show label for Jan (year boundary) and every 3rd month
                      if (!isJan && payload.index % 3 !== 0) return <g />;
                      const label = isJan ? `Jan '${item.year.slice(2)}` : payload.value;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text
                            x={0} y={0} dy={12}
                            textAnchor="end"
                            transform="rotate(-45)"
                            fontSize={isJan ? 11 : 10}
                            fontWeight={isJan ? 700 : 400}
                            fill={isJan ? "#1a3c5c" : "#94a3b8"}
                          >
                            {label}
                          </text>
                        </g>
                      );
                    }}
                    interval={0}
                    height={60}
                  />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Quotes"
                    stroke="#8dc63f"
                    strokeWidth={2}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inbound Tab */}
        <TabsContent value="inbound">
          <Card>
            <CardHeader>
              <CardTitle>Inbound Quote Sources</CardTitle>
              <CardDescription>Internal queue processing vs web form requests by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={inboundData}>
                  <defs>
                    <linearGradient id="colorQueue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8dc63f" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8dc63f" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorWebForm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={(props: Record<string, unknown>) => {
                      const x = Number(props.x);
                      const y = Number(props.y);
                      const payload = props.payload as { value: string; index: number };
                      const item = inboundData[payload.index];
                      const isJan = item?.monthNum === 1;
                      if (!isJan && payload.index % 3 !== 0) return <g />;
                      const label = isJan ? `Jan '${item.year.slice(2)}` : payload.value;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text
                            x={0} y={0} dy={12}
                            textAnchor="end"
                            transform="rotate(-45)"
                            fontSize={isJan ? 11 : 10}
                            fontWeight={isJan ? 700 : 400}
                            fill={isJan ? "#1a3c5c" : "#94a3b8"}
                          >
                            {label}
                          </text>
                        </g>
                      );
                    }}
                    interval={0}
                    height={60}
                  />
                  <YAxis />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="queue"
                    name="Queue (Internal)"
                    stroke="#8dc63f"
                    strokeWidth={2}
                    fill="url(#colorQueue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="webForm"
                    name="Web Form"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorWebForm)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Mix Tab */}
        <TabsContent value="product-mix">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Base Series</CardTitle>
                <CardDescription>Most requested table series from {formatNumber(webRequestCount)} web form entries</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={seriesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                    <Bar dataKey="count" name="Requests" fill="#8dc63f" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Base Finishes</CardTitle>
                <CardDescription>Most requested powder coat finishes from web form entries</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={finishData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                    <Bar dataKey="count" name="Requests" fill="#1a3c5c" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Staff Workload</CardTitle>
              <CardDescription>Quotes per staff member — Special vs Standard split</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={staffData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={60} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Legend />
                  <Bar dataKey="standard" name="Standard" stackId="a" fill="#8dc63f" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="special" name="Special" stackId="a" fill="#1a3c5c" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dealers Tab */}
        <TabsContent value="dealers">
          <Card>
            <CardHeader>
              <CardTitle>Top Dealers by Volume</CardTitle>
              <CardDescription>Top 10 dealers/reps + aggregated others</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={dealerData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={160}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {dealerData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend list */}
                <div className="flex flex-col justify-center space-y-2">
                  {dealerData.map((dealer, i) => (
                    <div key={dealer.name} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-sm shrink-0"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-sm text-slate-700 flex-1 truncate">{dealer.name}</span>
                      <Badge variant="secondary">{dealer.value}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
