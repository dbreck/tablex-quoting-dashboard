"use client";

import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { staffInsight } from "@/data/cpq-gap-analysis";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HowItWorksTodayTab } from "./components/HowItWorksTodayTab";
import { SalesOrderFlowTab } from "./components/SalesOrderFlowTab";
import { PricingPipelineTab } from "./components/PricingPipelineTab";
import { BottleneckAnalysisTab } from "./components/BottleneckAnalysisTab";
import { WhatNeedsToChangeTab } from "./components/WhatNeedsToChangeTab";

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

interface ProfitRow {
  tag: string;
  qty: number | null;
  sku: string;
  series: string;
  topCost: number | null;
  routeCost: number | null;
  baseCost: number | null;
  nestFoldCost: number | null;
  asbGnLcCost1: number | null;
  asbGnLcCost2: number | null;
  assemblyCost: number | null;
  lfCost: number | null;
  freightInCost: number | null;
  packagingCost: number | null;
  totalCost: number | null;
  freightOutPct: number | null;
  gpm: number | null;
  commission: number | null;
  standardPrice: number | null;
  netProfit: number | null;
  listPrice: number | null;
  discountFactor: number | null;
  netPrice: number | null;
  newNetProfit: number | null;
  notes: string;
  price_50_20: number | null;
  price_50_20_5: number | null;
  price_50_20_10: number | null;
  price_50_20_15: number | null;
  price_50_20_20: number | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
interface QuotingProcessClientProps {
  profitData: ProfitRow[];
  metrics: any;
  queueData: QueueRow[];
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function QuotingProcessClient({
  profitData,
  metrics,
  queueData,
}: QuotingProcessClientProps) {
  return (
    <div>
      <Header
        title="Quoting Process"
        subtitle="Complete analysis of TableX's quoting workflow — from request to delivery"
      />

      {/* Staff Insight Callout */}
      <Card className="mb-6 border-amber-200 bg-amber-50">
        <CardContent className="p-5 flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-800">
              Insight: Root Cause of Slow Quoting is Fear of Mistakes
            </p>
            <p className="text-sm text-amber-700 mt-1">
              {staffInsight.implication}
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="how-it-works">
        <TabsList className="mb-6">
          <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
          <TabsTrigger value="sales-orders">Sales Orders</TabsTrigger>
          <TabsTrigger value="pricing-pipeline">Pricing Pipeline</TabsTrigger>
          <TabsTrigger value="bottleneck-analysis">Bottleneck Analysis</TabsTrigger>
          <TabsTrigger value="what-needs-to-change">What Needs to Change</TabsTrigger>
        </TabsList>

        <TabsContent value="how-it-works">
          <HowItWorksTodayTab />
        </TabsContent>

        <TabsContent value="sales-orders">
          <SalesOrderFlowTab />
        </TabsContent>

        <TabsContent value="pricing-pipeline">
          <PricingPipelineTab profitData={profitData} />
        </TabsContent>

        <TabsContent value="bottleneck-analysis">
          <BottleneckAnalysisTab metrics={metrics} queueData={queueData} />
        </TabsContent>

        <TabsContent value="what-needs-to-change">
          <WhatNeedsToChangeTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
