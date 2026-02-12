"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Globe,
  Database,
  FileText,
  Users,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Layers,
  Package,
  Palette,
  ClipboardList,
  Shield,
  Plug,
  Mail,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  siteOverview,
  contentInventory,
  navigationStructure,
  productSeries,
  accessories,
  applications,
  finishCategories,
  gravityForms,
  wpUserRoles,
  keyPages,
  team,
  companyInfo,
  formEntryTotals,
  contentTotals,
} from "@/data/wp-site-audit";

// ── Chart colors ────────────────────────────────────────────────────

const CHART_COLORS = ["#8dc63f", "#1a3c5c", "#f59e0b", "#6366f1", "#ec4899", "#10b981"];

const ROLE_COLORS: Record<string, string> = {
  Administrator: "#1a3c5c",
  Editor: "#8dc63f",
  Subscriber: "#f59e0b",
  "SEO Manager": "#6366f1",
  "SEO Editor": "#ec4899",
};

// ── Derived chart data ──────────────────────────────────────────────

const contentBarData = [
  { name: "Pages", count: contentInventory.pages },
  { name: "Posts", count: contentInventory.posts },
  { name: "Media", count: contentInventory.media },
  { name: "Divi Layouts", count: contentInventory.diviLayouts },
];

const userRolePieData = wpUserRoles
  .filter((r) => r.count > 0)
  .map((r) => ({
    name: r.role,
    value: r.count,
    color: ROLE_COLORS[r.role] || "#94a3b8",
  }));

const formBarData = gravityForms.map((f) => ({
  name: f.title,
  entries: f.entries,
}));

const pluginCategoryMap: Record<string, string> = {
  builder: "Page Builder",
  forms: "Forms",
  seo: "SEO",
  fields: "Custom Fields",
  security: "Security",
  performance: "Performance",
  utility: "Utility",
};

// ── Main component ──────────────────────────────────────────────────

export default function WpSiteAuditClient() {
  return (
    <div>
      <Header
        title="WordPress Site Audit"
        subtitle="tablex.com Current State Analysis"
      />

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="navigation">Navigation & Content</TabsTrigger>
          <TabsTrigger value="forms">Forms & Data</TabsTrigger>
          <TabsTrigger value="team">Team & Users</TabsTrigger>
          <TabsTrigger value="findings">Key Findings</TabsTrigger>
          <TabsTrigger value="mindmap">Mind Map</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="navigation">
          <NavigationTab />
        </TabsContent>
        <TabsContent value="forms">
          <FormsTab />
        </TabsContent>
        <TabsContent value="team">
          <TeamTab />
        </TabsContent>
        <TabsContent value="findings">
          <FindingsTab />
        </TabsContent>
        <TabsContent value="mindmap">
          <MindMapTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Tab 1: Overview
// ═══════════════════════════════════════════════════════════════════

function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Site Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  WordPress
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {siteOverview.wordpress}
                </p>
                <div className="flex gap-1.5 mt-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {siteOverview.theme}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    PHP {siteOverview.phpVersion}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-green/10">
                <Globe className="h-6 w-6 text-brand-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Total Content
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {contentTotals.totalPages + contentTotals.totalPosts}
                </p>
                <div className="flex gap-1.5 mt-2">
                  <Badge variant="info" className="text-[10px]">
                    {contentTotals.totalPages} pages
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {contentTotals.totalPosts} posts
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Media Library
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {contentTotals.totalMedia.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Images, PDFs, and documents
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100">
                <Database className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Form Entries
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {formEntryTotals.total.toLocaleString()}
                </p>
                <div className="flex gap-1.5 mt-2">
                  <Badge variant="success" className="text-[10px]">
                    {contentTotals.totalGravityForms} forms
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100">
                <ClipboardList className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Inventory Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content Inventory</CardTitle>
          <CardDescription>
            Breakdown of all content types on tablex.com
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={contentBarData}
              margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
            >
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => [
                  `${value?.toLocaleString()}`,
                  "Items",
                ]}
              />
              <Bar dataKey="count" fill="#1a3c5c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Plugin List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plug className="h-5 w-5 text-slate-400" />
            Active Plugins
          </CardTitle>
          <CardDescription>
            {siteOverview.plugins.length} plugins powering tablex.com
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-t border-slate-100 pt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 uppercase tracking-wider">
                  <th className="text-left pb-2">Plugin</th>
                  <th className="text-left pb-2 hidden sm:table-cell">
                    Category
                  </th>
                  <th className="text-left pb-2">Critical</th>
                </tr>
              </thead>
              <tbody>
                {siteOverview.plugins.map((plugin) => (
                  <tr
                    key={plugin.slug}
                    className="border-t border-slate-50"
                  >
                    <td className="py-2.5 pr-3">
                      <span className="text-slate-900 font-medium">
                        {plugin.name}
                      </span>
                      {plugin.version && (
                        <span className="text-slate-400 text-xs ml-2">
                          v{plugin.version}
                        </span>
                      )}
                      <span className="block sm:hidden text-xs text-slate-500 mt-0.5">
                        {pluginCategoryMap[plugin.category]}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 hidden sm:table-cell">
                      <Badge variant="outline" className="text-[10px]">
                        {pluginCategoryMap[plugin.category]}
                      </Badge>
                    </td>
                    <td className="py-2.5">
                      {plugin.critical ? (
                        <Badge variant="error" className="text-[10px]">
                          CRITICAL
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Optional
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Tab 2: Navigation & Content
// ═══════════════════════════════════════════════════════════════════

function NavigationTab() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (label: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {/* Navigation Structure */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Site Navigation Structure
        </h3>
        <div className="space-y-3">
          {navigationStructure.map((nav) => {
            const hasChildren = nav.children && nav.children.length > 0;
            const isExpanded = expanded.has(nav.label);
            return (
              <Card key={nav.label}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggle(nav.label)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                        <span className="font-semibold text-slate-900">
                          {nav.label}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {nav.children!.length} items
                        </Badge>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <div className="border-t border-slate-100 pt-3">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {nav.children!.map((child) => (
                              <div
                                key={child.label}
                                className="flex items-center gap-2 text-sm text-slate-600 py-1"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-green shrink-0" />
                                {child.label}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-3 p-4">
                    <Navigation className="h-4 w-4 text-brand-green" />
                    <span className="font-semibold text-slate-900">
                      {nav.label}
                    </span>
                    <Badge variant="success" className="text-[10px]">
                      CTA
                    </Badge>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Product Series Grid */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Product Series ({productSeries.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {productSeries.map((series) => (
            <Card key={series.slug} hover>
              <CardContent className="p-4 text-center">
                <p className="font-semibold text-slate-900 text-sm">
                  {series.name}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  /{series.slug}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Accessories */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Accessories ({accessories.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {accessories.map((acc) => (
            <Card key={acc.slug} hover>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-400 shrink-0" />
                  <p className="text-sm font-medium text-slate-900">
                    {acc.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Applications */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Applications ({applications.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {applications.map((app) => (
            <Card key={app.slug} hover>
              <CardContent className="p-5">
                <p className="font-semibold text-slate-900 text-sm">
                  {app.name}
                </p>
                {app.description && (
                  <p className="text-xs text-slate-500 mt-1">
                    {app.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Finish Categories */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Finish Categories ({finishCategories.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {finishCategories.map((finish) => (
            <Card key={finish.slug} hover>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="h-4 w-4 text-slate-400" />
                  <p className="font-semibold text-slate-900 text-sm">
                    {finish.name}
                  </p>
                </div>
                {finish.count && (
                  <Badge variant="default" className="text-[10px] mb-2">
                    {finish.count} options
                  </Badge>
                )}
                {finish.description && (
                  <p className="text-xs text-slate-500">{finish.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Key Pages */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Key Pages ({keyPages.length})
        </h3>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {keyPages.map((page) => (
                <div
                  key={page.slug}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {page.title}
                    </p>
                    <p className="text-xs text-slate-500">{page.purpose}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    /{page.slug}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Tab 3: Forms & Data
// ═══════════════════════════════════════════════════════════════════

function FormsTab() {
  const [expandedForm, setExpandedForm] = useState<Set<number>>(new Set());

  const toggleForm = (id: number) => {
    setExpandedForm((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {/* Form Entry Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 stagger">
        {gravityForms.map((form) => (
          <Card key={form.id} hover className="stat-card animate-slide-up">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                {form.title}
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {form.entries.toLocaleString()}
              </p>
              <div className="flex gap-1.5 mt-2">
                <Badge variant="secondary" className="text-[10px]">
                  Form #{form.id}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {form.fields.length} fields
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Entry Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Form Entries by Volume</CardTitle>
          <CardDescription>
            {formEntryTotals.total.toLocaleString()} total entries across{" "}
            {gravityForms.length} Gravity Forms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={formBarData}
              margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
            >
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => [
                  `${value?.toLocaleString()}`,
                  "Entries",
                ]}
              />
              <Bar dataKey="entries" fill="#8dc63f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quote Request Highlight */}
      <Card className="border-brand-green/30 bg-brand-green/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-5 w-5 text-brand-green" />
            Quote Request Form (Form #5)
          </CardTitle>
          <CardDescription>
            Primary lead generation form with {formEntryTotals.quoteRequest.toLocaleString()} entries — maps directly to CPQ quote workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {gravityForms
              .find((f) => f.id === 5)!
              .fields.map((field) => (
                <div
                  key={field.name}
                  className="flex items-center gap-2 text-xs py-1"
                >
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      field.required ? "bg-brand-green" : "bg-slate-300"
                    )}
                  />
                  <span className="text-slate-700">{field.name}</span>
                  {field.required && (
                    <Badge variant="success" className="text-[8px] px-1.5">
                      REQ
                    </Badge>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* All Forms Detail */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          All Gravity Forms
        </h3>
        <div className="space-y-3">
          {gravityForms.map((form) => {
            const isExpanded = expandedForm.has(form.id);
            return (
              <Card key={form.id}>
                <button
                  onClick={() => toggleForm(form.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                    <span className="font-semibold text-slate-900">
                      {form.title}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      Form #{form.id}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="info" className="text-[10px]">
                      {form.entries.toLocaleString()} entries
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {form.fields.length} fields
                    </Badge>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="border-t border-slate-100 pt-3">
                      {form.notes && (
                        <p className="text-xs text-slate-500 mb-3 italic">
                          {form.notes}
                        </p>
                      )}
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-slate-400 uppercase tracking-wider">
                            <th className="text-left pb-2">Field</th>
                            <th className="text-left pb-2">Type</th>
                            <th className="text-left pb-2">Required</th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.fields.map((field) => (
                            <tr
                              key={field.name}
                              className="border-t border-slate-50"
                            >
                              <td className="py-2 pr-3 text-slate-900">
                                {field.name}
                              </td>
                              <td className="py-2 pr-3">
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {field.type}
                                </Badge>
                              </td>
                              <td className="py-2">
                                {field.required ? (
                                  <Badge
                                    variant="success"
                                    className="text-[10px]"
                                  >
                                    Required
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    Optional
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Tab 4: Team & Users
// ═══════════════════════════════════════════════════════════════════

function TeamTab() {
  return (
    <div className="space-y-8">
      {/* User Role Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">User Role Distribution</CardTitle>
            <CardDescription>
              {contentTotals.totalWpUsers} total WordPress users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={userRolePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  dataKey="value"
                  stroke="none"
                >
                  {userRolePieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} users`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {userRolePieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-slate-600">
                    {d.name} ({d.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">WordPress User Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wpUserRoles.map((role) => {
                const pct =
                  contentTotals.totalWpUsers > 0
                    ? (role.count / contentTotals.totalWpUsers) * 100
                    : 0;
                return (
                  <div key={role.role}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900">
                        {role.role}
                      </span>
                      <span className="text-sm text-slate-500">
                        {role.count} users
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.max(pct, 1)}%`,
                          backgroundColor:
                            ROLE_COLORS[role.role] || "#94a3b8",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          TableX Team ({team.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {team.map((member) => (
            <Card key={member.name} hover>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-navy/10 text-brand-navy">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      {member.name}
                    </p>
                    <p className="text-xs text-slate-500">{member.role}</p>
                  </div>
                </div>
                {member.email && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                    <Mail className="h-3 w-3" />
                    {member.email}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Company Info */}
      <Card className="border-brand-navy/20 bg-brand-navy/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-navy" />
            {companyInfo.name} — Company Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Founded
              </p>
              <p className="text-sm text-slate-900 font-medium mt-1">
                {companyInfo.founded}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Tagline
              </p>
              <p className="text-sm text-slate-900 font-medium mt-1">
                {companyInfo.tagline}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Warranty
              </p>
              <p className="text-sm text-slate-900 font-medium mt-1">
                {companyInfo.warranty}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Manufacturing
              </p>
              <p className="text-sm text-slate-900 font-medium mt-1">
                {companyInfo.manufacturing}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-brand-navy/10">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Brand Colors
            </p>
            <div className="flex gap-3">
              {companyInfo.brandColors.map((color) => (
                <div key={color.hex} className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-md border border-slate-200"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <p className="text-xs font-medium text-slate-900">
                      {color.name}
                    </p>
                    <p className="text-[10px] text-slate-500">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Tab 5: Key Findings
// ═══════════════════════════════════════════════════════════════════

const findings = [
  {
    title: "No CPQ System",
    description:
      "Quote requests are submitted via Gravity Forms and processed manually. There is no configure-price-quote workflow, no live pricing, and no automated quote PDF generation.",
    severity: "error" as const,
    category: "Quoting",
  },
  {
    title: "PDF-Only Pricing",
    description:
      "All pricing is distributed as static PDF price lists. Dealers must download PDFs and manually look up prices — there is no dynamic pricing engine or searchable price database on the site.",
    severity: "error" as const,
    category: "Pricing",
  },
  {
    title: "Hardcoded Rep Directory",
    description:
      'The "Find Your Rep" page uses a static layout with hardcoded rep information. There is no CRM integration, no territory mapping, and no dynamic dealer/rep locator.',
    severity: "warning" as const,
    category: "Sales",
  },
  {
    title: "Membership System Abandoned",
    description:
      "41 subscriber accounts exist but the membership/dealer portal functionality appears abandoned. No gated content or dealer-specific features are active.",
    severity: "warning" as const,
    category: "Users",
  },
  {
    title: "Divi Builder Dependency",
    description:
      "The entire site is built on Divi with 40+ saved layouts. Migration to a modern framework will require rebuilding all templates and page layouts from scratch.",
    severity: "warning" as const,
    category: "Tech",
  },
  {
    title: "High-Volume Contact Form",
    description:
      "The Contact form has nearly 15,000 entries — a significant lead database that should be migrated to the new CRM system during the rebuild.",
    severity: "info" as const,
    category: "Data",
  },
  {
    title: "Quote Form Has CPQ Field Blueprint",
    description:
      "The Quote Request form (Form #5) already captures Product Series, Table Shape, Size, Base Type, Laminate, Edge, Paint, Power/Data, and Quantity — these map directly to CPQ configuration fields.",
    severity: "success" as const,
    category: "Quoting",
  },
  {
    title: "Spiff Program Tracking",
    description:
      "The Spiff Participation form tracks dealer incentives with 120 entries. This data will need to flow into the new dealer management system.",
    severity: "info" as const,
    category: "Sales",
  },
  {
    title: "17 Product Series to Configure",
    description:
      "The full product catalog spans 17 table series, 8 accessories, 6 applications, and 4 finish categories. Each series will need complete configuration rules in the new CPQ.",
    severity: "warning" as const,
    category: "Products",
  },
  {
    title: "No Inventory or Order Tracking",
    description:
      "The current site has no inventory management, order status tracking, or shipping integration. These are all net-new capabilities for the rebuild.",
    severity: "error" as const,
    category: "Operations",
  },
];

const severityBadge: Record<string, "error" | "warning" | "info" | "success"> = {
  error: "error",
  warning: "warning",
  info: "info",
  success: "success",
};

function FindingsTab() {
  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Critical Gaps
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {findings.filter((f) => f.severity === "error").length}
                </p>
                <p className="text-xs text-red-500 mt-2">
                  Must address in rebuild
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Warnings
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {findings.filter((f) => f.severity === "warning").length}
                </p>
                <p className="text-xs text-amber-500 mt-2">
                  Plan for migration
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100">
                <Layers className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Opportunities
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {findings.filter((f) => f.severity === "success").length}
                </p>
                <p className="text-xs text-emerald-500 mt-2">
                  Existing assets to leverage
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100">
                <Layers className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Informational
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {findings.filter((f) => f.severity === "info").length}
                </p>
                <p className="text-xs text-blue-500 mt-2">
                  Data migration notes
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Findings List */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          All Findings ({findings.length})
        </h3>
        <div className="space-y-3">
          {findings.map((finding, i) => (
            <Card key={i} hover>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">
                      #{i + 1}
                    </span>
                    <p className="font-semibold text-slate-900">
                      {finding.title}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Badge
                      variant={severityBadge[finding.severity]}
                      className="text-[10px]"
                    >
                      {finding.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {finding.category}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-600">{finding.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Rebuild Summary Callout */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-800">
              Rebuild Scope Summary
            </p>
            <p className="text-sm text-amber-700 mt-2">
              The current WordPress site serves primarily as a marketing
              brochure with basic lead capture. The rebuild needs to add
              CPQ quoting, dynamic pricing, dealer management, inventory
              tracking, and order processing — all net-new capabilities not
              present in the current system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Tab 6: Mind Map
// ═══════════════════════════════════════════════════════════════════

const mindMapBranches = [
  {
    id: "products",
    label: "Products",
    count: productSeries.length,
    color: "green" as const,
    icon: Package,
    items: productSeries.map((s) => s.name),
  },
  {
    id: "accessories",
    label: "Accessories",
    count: accessories.length,
    color: "sky" as const,
    icon: Plug,
    items: accessories.map((a) => a.name),
  },
  {
    id: "applications",
    label: "Applications",
    count: applications.length,
    color: "violet" as const,
    icon: Layers,
    items: applications.map((a) => a.name),
  },
  {
    id: "finishes",
    label: "Finishes",
    count: finishCategories.length,
    color: "amber" as const,
    icon: Palette,
    items: finishCategories.map((f) => f.name),
  },
  {
    id: "resources",
    label: "Resources",
    count:
      navigationStructure.find((n) => n.label === "Resources")?.children
        ?.length ?? 0,
    color: "slate" as const,
    icon: FileText,
    items:
      navigationStructure
        .find((n) => n.label === "Resources")
        ?.children?.map((c) => c.label) ?? [],
  },
  {
    id: "forms",
    label: "Forms",
    count: gravityForms.length,
    color: "emerald" as const,
    icon: ClipboardList,
    items: gravityForms.map(
      (f) => `${f.title} (${f.entries.toLocaleString()})`
    ),
  },
  {
    id: "team",
    label: "Team",
    count: team.length,
    color: "indigo" as const,
    icon: Users,
    items: team.map((t) => `${t.name} — ${t.role}`),
  },
  {
    id: "tech",
    label: "Tech Stack",
    count: siteOverview.plugins.length,
    color: "rose" as const,
    icon: Database,
    items: siteOverview.plugins.map((p) => p.name),
  },
];

const branchColors: Record<
  string,
  { bg: string; bgLight: string; text: string; border: string; dot: string }
> = {
  green: {
    bg: "bg-green-500",
    bgLight: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-400",
  },
  sky: {
    bg: "bg-sky-500",
    bgLight: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-400",
  },
  violet: {
    bg: "bg-violet-500",
    bgLight: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-400",
  },
  amber: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  slate: {
    bg: "bg-slate-500",
    bgLight: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  emerald: {
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  indigo: {
    bg: "bg-indigo-500",
    bgLight: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    dot: "bg-indigo-400",
  },
  rose: {
    bg: "bg-rose-500",
    bgLight: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-400",
  },
};

function MindMapTab() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Click branches to expand · {expanded.size} of{" "}
          {mindMapBranches.length} open
        </p>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setExpanded(new Set(mindMapBranches.map((b) => b.id)))
            }
            className="text-xs text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={() => setExpanded(new Set())}
            className="text-xs text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8 overflow-x-auto">
          <div className="min-w-[1100px] flex flex-col items-center py-4">
            {/* Root node */}
            <div className="flex flex-col items-center px-8 py-4 bg-brand-navy rounded-2xl text-white shadow-lg shadow-brand-navy/20">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="h-5 w-5 text-brand-green" />
                <span className="text-lg font-bold tracking-tight">
                  tablex.com
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                  WP {siteOverview.wordpress}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                  {siteOverview.theme}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                  PHP {siteOverview.phpVersion}
                </span>
              </div>
              <div className="flex gap-3 mt-2 text-[10px] text-white/50">
                <span>
                  {contentTotals.totalPages + contentTotals.totalPosts} content
                  items
                </span>
                <span>·</span>
                <span>
                  {contentTotals.totalMedia.toLocaleString()} media
                </span>
                <span>·</span>
                <span>
                  {formEntryTotals.total.toLocaleString()} form entries
                </span>
              </div>
            </div>

            {/* Root → branches connector */}
            <div className="w-px h-10 bg-slate-300" />

            {/* Branch row */}
            <div className="relative w-full">
              {/* Horizontal spanning line */}
              <div
                className="absolute top-0 h-px bg-slate-300"
                style={{
                  left: `${100 / (mindMapBranches.length * 2)}%`,
                  right: `${100 / (mindMapBranches.length * 2)}%`,
                }}
              />

              <div className="flex">
                {mindMapBranches.map((branch) => {
                  const c = branchColors[branch.color];
                  const isOpen = expanded.has(branch.id);
                  const Icon = branch.icon;

                  return (
                    <div
                      key={branch.id}
                      className="flex flex-col items-center"
                      style={{
                        width: `${100 / mindMapBranches.length}%`,
                      }}
                    >
                      {/* Vertical connector */}
                      <div className="w-px h-6 bg-slate-300" />

                      {/* Branch node */}
                      <button
                        onClick={() => toggle(branch.id)}
                        className={cn(
                          "flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer",
                          isOpen
                            ? `${c.bgLight} ${c.border} shadow-sm`
                            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            isOpen ? c.text : "text-slate-400"
                          )}
                        />
                        <span
                          className={cn(
                            "text-[11px] font-semibold whitespace-nowrap",
                            isOpen ? c.text : "text-slate-700"
                          )}
                        >
                          {branch.label}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-medium",
                            isOpen
                              ? `${c.bg} text-white`
                              : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {branch.count}
                        </span>
                      </button>

                      {/* Expanded children */}
                      {isOpen && (
                        <>
                          <div className={cn("w-px h-3", c.dot)} />
                          <div
                            className={cn(
                              "rounded-lg border p-2 space-y-0.5 max-h-[260px] overflow-y-auto",
                              c.border,
                              c.bgLight
                            )}
                          >
                            {branch.items.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1.5"
                              >
                                <div
                                  className={cn(
                                    "w-1 h-1 rounded-full shrink-0",
                                    c.dot
                                  )}
                                />
                                <span
                                  className={cn(
                                    "text-[10px] whitespace-nowrap",
                                    c.text
                                  )}
                                >
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Get a Quote CTA */}
            <div className="mt-10 flex flex-col items-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">
                Standalone CTA
              </p>
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-green/10 border-2 border-brand-green/30">
                <Navigation className="h-4 w-4 text-brand-green" />
                <span className="text-sm font-bold text-brand-green">
                  Get a Quote
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card hover>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">
              {navigationStructure.length}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">
              Top-Level Sections
            </p>
          </CardContent>
        </Card>
        <Card hover>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">
              {navigationStructure.reduce(
                (sum, n) => sum + (n.children?.length ?? 0),
                0
              )}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">
              Nav Items
            </p>
          </CardContent>
        </Card>
        <Card hover>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">
              {siteOverview.plugins.length}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">
              Plugins
            </p>
          </CardContent>
        </Card>
        <Card hover>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{team.length}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">
              Team Members
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
