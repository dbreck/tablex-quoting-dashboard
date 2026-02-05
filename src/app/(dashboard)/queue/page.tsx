"use client";

import { useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import queueData from "@/data/quote-queue.json";
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
import { ClipboardList, Users, Building2, Clock } from "lucide-react";

type QueueRow = (typeof queueData)[number];

const COLORS = ["#8dc63f", "#1a3c5c", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#10b981", "#6366f1", "#f97316", "#94a3b8"];

export default function QueuePage() {
  // Monthly volume data
  const monthlyVolume = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of queueData as QueueRow[]) {
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
        return {
          month: `${monthNames[parseInt(month)]} ${year.slice(2)}`,
          count,
        };
      });
  }, []);

  // Staff workload
  const staffData = useMemo(() => {
    const counts: Record<string, { total: number; special: number; standard: number }> = {};
    for (const row of queueData as QueueRow[]) {
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
  }, []);

  // Top dealers
  const dealerData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of queueData as QueueRow[]) {
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
  }, []);

  // Stats
  const totalQuotes = queueData.length;
  const specialCount = (queueData as QueueRow[]).filter((r) => r.special).length;
  const busiestMonth = monthlyVolume.reduce(
    (max, m) => (m.count > max.count ? m : max),
    { month: "", count: 0 }
  );
  const topDealer = dealerData[0]?.name || "N/A";

  return (
    <div>
      <Header
        title="Quote Queue Analytics"
        subtitle="Volume trends, staff workload, and dealer analysis from 3,595 quote requests"
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
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Special Quotes</p>
                <p className="text-2xl font-bold text-slate-900">{formatNumber(specialCount)}</p>
                <p className="text-xs text-slate-400">{((specialCount / totalQuotes) * 100).toFixed(0)}% of total</p>
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
                <p className="text-xs text-slate-500 uppercase tracking-wider">Top Dealer</p>
                <p className="text-lg font-bold text-slate-900 truncate max-w-[160px]">{topDealer}</p>
                <p className="text-xs text-slate-400">{dealerData[0]?.value || 0} quotes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="volume">
        <TabsList className="mb-6">
          <TabsTrigger value="volume">Volume</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="dealers">Dealers</TabsTrigger>
        </TabsList>

        {/* Volume Tab */}
        <TabsContent value="volume">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Quote Volume</CardTitle>
              <CardDescription>Feb 2023 to present — {monthlyVolume.length} months tracked</CardDescription>
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
                    tick={{ fontSize: 10 }}
                    interval={2}
                    angle={-45}
                    textAnchor="end"
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
