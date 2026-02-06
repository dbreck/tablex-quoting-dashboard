"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DISCOUNT_TIER_LABELS, type Quote } from "@/types/quote-builder";
import { FileText } from "lucide-react";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "success" | "warning" | "error"> = {
  draft: "secondary",
  sent: "info" as "default",
  accepted: "success",
  rejected: "error",
};

interface OrgDetailQuotesProps {
  quotes: Quote[];
}

export function OrgDetailQuotes({ quotes }: OrgDetailQuotesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4.5 w-4.5" />
          Quotes ({quotes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No quotes for this organization.
          </p>
        ) : (
          <div className="space-y-2">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-slate-900">
                      {quote.quoteNumber}
                    </p>
                    <Badge variant={STATUS_VARIANTS[quote.status] ?? "secondary"}>
                      {quote.status}
                    </Badge>
                  </div>
                  {quote.projectName && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {quote.projectName}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-slate-900">
                    {formatCurrency(quote.total)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(quote.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
