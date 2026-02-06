"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuoteStore } from "@/store/quote-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  FileText,
  Clock,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";

const statusBadge: Record<string, "secondary" | "info" | "success" | "error"> = {
  draft: "secondary",
  sent: "info",
  accepted: "success",
  rejected: "error",
};

export default function QuoteDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { quotes, loadFromSupabase } = useQuoteStore();

  useEffect(() => {
    setMounted(true);
    loadFromSupabase();
  }, [loadFromSupabase]);

  if (!mounted) {
    return (
      <div>
        <Header title="Quote Builder" subtitle="Create and manage quotes" />
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Compute stats
  const now = new Date();
  const thisMonth = quotes.filter((q) => {
    const d = new Date(q.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const pendingQuotes = quotes.filter((q) => q.status === "draft" || q.status === "sent");
  const totalValue = quotes.reduce((sum, q) => sum + q.total, 0);
  const avgSize = quotes.length > 0 ? totalValue / quotes.length : 0;

  const recentQuotes = [...quotes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <div>
      <Header title="Quote Builder" subtitle="Create and manage quotes" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Quotes This Month
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {thisMonth.length}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-green/10">
                <FileText className="h-6 w-6 text-brand-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Pending Quotes
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {pendingQuotes.length}
                </p>
                <p className="text-xs text-slate-400 mt-1">Draft + Sent</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Total Value
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {formatCurrency(totalValue)}
                </p>
                <p className="text-xs text-slate-400 mt-1">All quotes</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="stat-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Avg Quote Size
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {formatCurrency(avgSize)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {quotes.length} quote{quotes.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Quote CTA + Recent Quotes */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Recent Quotes</h2>
        <Link href="/quote/new">
          <Button size="lg">
            <Plus className="h-5 w-5 mr-2" />
            New Quote
          </Button>
        </Link>
      </div>

      {quotes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-600">No quotes yet</p>
            <p className="text-sm text-slate-400 mt-1 mb-6">
              Create your first quote to get started.
            </p>
            <Link href="/quote/new">
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                New Quote
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Quote #</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentQuotes.map((quote) => (
                    <tr key={quote.id}>
                      <td className="font-mono text-sm">{quote.quoteNumber}</td>
                      <td>
                        <div>
                          <p className="font-medium text-sm">{quote.customer.name}</p>
                          <p className="text-xs text-slate-500">{quote.customer.company}</p>
                        </div>
                      </td>
                      <td className="text-sm text-slate-600">
                        {formatDate(quote.createdAt)}
                      </td>
                      <td className="price font-semibold">
                        {formatCurrency(quote.total)}
                      </td>
                      <td>
                        <Badge variant={statusBadge[quote.status]}>
                          {quote.status}
                        </Badge>
                      </td>
                      <td>
                        <Link href={`/quote/${quote.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                            <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
