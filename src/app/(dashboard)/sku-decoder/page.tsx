"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { parseSku, exampleSkus, type ParsedSku } from "@/lib/sku-parser";
import { Search, Box, Ruler, Layers, Columns3, Settings2, Hash, Star } from "lucide-react";

const componentIcons: Record<string, React.ReactNode> = {
  Special: <Star className="h-5 w-5" />,
  Series: <Layers className="h-5 w-5" />,
  Shape: <Box className="h-5 w-5" />,
  Size: <Ruler className="h-5 w-5" />,
  Base: <Columns3 className="h-5 w-5" />,
  "Base 2": <Columns3 className="h-5 w-5" />,
  Posts: <Hash className="h-5 w-5" />,
  Option: <Settings2 className="h-5 w-5" />,
  Height: <Ruler className="h-5 w-5" />,
  Grommet: <Settings2 className="h-5 w-5" />,
};

function SkuDecoderContent() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedSku | null>(null);

  // Handle URL query param from catalog links
  useEffect(() => {
    const sku = searchParams.get("sku");
    if (sku) {
      setInput(sku);
      setParsed(parseSku(sku));
    }
  }, [searchParams]);

  function handleChange(value: string) {
    setInput(value);
    if (value.trim().length >= 4) {
      setParsed(parseSku(value));
    } else {
      setParsed(null);
    }
  }

  function handleExampleClick(sku: string) {
    setInput(sku);
    setParsed(parseSku(sku));
  }

  return (
    <div>
      <Header
        title="SKU Decoder"
        subtitle="Enter any TableX SKU to see a visual breakdown of all encoded components"
      />

      {/* Input */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              value={input}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Enter a SKU (e.g., 99SQ3030QD16-3P)"
              className="pl-12 h-14 text-lg font-mono tracking-wider"
            />
          </div>

          {/* Example SKUs */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 self-center mr-1">Try:</span>
            {exampleSkus.map((sku) => (
              <button
                key={sku}
                onClick={() => handleExampleClick(sku)}
                className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono text-slate-700 hover:bg-brand-green/10 hover:border-brand-green/30 hover:text-brand-green transition-colors cursor-pointer"
              >
                {sku}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {parsed && parsed.valid && (
        <div className="animate-fade-in space-y-6">
          {/* Color-coded SKU display */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Decoded SKU</p>
                <div className="flex items-center justify-center gap-1 flex-wrap">
                  {parsed.segments.map((seg, i) => (
                    <span key={i} className="relative group">
                      <span
                        className="inline-block px-2 py-2 rounded-lg text-2xl font-mono font-bold text-white"
                        style={{ backgroundColor: seg.color }}
                      >
                        {seg.value}
                      </span>
                      {i < parsed.segments.length - 1 && parsed.raw.includes("-") && (
                        <span className="text-2xl font-mono text-slate-300 mx-0.5">
                          {/* Separator between main and suffix parts */}
                        </span>
                      )}
                      {/* Tooltip */}
                      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-slate-900 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {seg.label}: {seg.decoded}
                      </span>
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                  {parsed.segments.map((seg, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="text-xs text-slate-600">{seg.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Component detail cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {parsed.isSpecial && (
              <Card hover className="animate-slide-up">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 text-orange-600">
                      {componentIcons.Special}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Prefix</p>
                      <CardTitle className="text-base">Special Order</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">Custom or non-standard configuration</p>
                  <Badge variant="outline" className="mt-2">SP</Badge>
                </CardContent>
              </Card>
            )}

            {parsed.series && (
              <Card hover className="animate-slide-up">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-green/10 text-brand-green">
                      {componentIcons.Series}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Series</p>
                      <CardTitle className="text-base">{parsed.series.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{parsed.series.description}</p>
                  <Badge variant="outline" className="mt-2">Code: {parsed.series.code}</Badge>
                </CardContent>
              </Card>
            )}

            {parsed.shape && (
              <Card hover className="animate-slide-up">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600">
                      {componentIcons.Shape}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Shape</p>
                      <CardTitle className="text-base">{parsed.shape.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="mt-1">Code: {parsed.shape.code}</Badge>
                </CardContent>
              </Card>
            )}

            {parsed.size && (
              <Card hover className="animate-slide-up">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 text-amber-600">
                      {componentIcons.Size}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Size</p>
                      <CardTitle className="text-base">
                        {parsed.size.depth && parsed.size.depth !== parsed.size.width
                          ? `${parsed.size.width} x ${parsed.size.depth}`
                          : parsed.size.width}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="mt-1">Raw: {parsed.size.raw}</Badge>
                </CardContent>
              </Card>
            )}

            {parsed.base && (
              <Card hover className="animate-slide-up">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-600">
                      {componentIcons.Base}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Base Type</p>
                      <CardTitle className="text-base">{parsed.base.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{parsed.base.description}</p>
                  {parsed.base.width && (
                    <Badge variant="outline" className="mt-2 mr-2">Width: {parsed.base.width}</Badge>
                  )}
                  <Badge variant="outline" className="mt-2">Code: {parsed.base.code}</Badge>
                </CardContent>
              </Card>
            )}

            {parsed.postConfig && (
              <Card hover className="animate-slide-up">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 text-purple-600">
                      {componentIcons.Posts}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Post Configuration</p>
                      <CardTitle className="text-base">{parsed.postConfig}-Post</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{parsed.postConfig} support posts</p>
                </CardContent>
              </Card>
            )}

            {parsed.options.map((opt) => (
              <Card key={opt.code} hover className="animate-slide-up">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-pink-100 text-pink-600">
                      {componentIcons.Option}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Option</p>
                      <CardTitle className="text-base">{opt.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{opt.description}</p>
                  <Badge variant="outline" className="mt-2">Code: {opt.code}</Badge>
                </CardContent>
              </Card>
            ))}

            {parsed.specialHeight && (
              <Card hover className="animate-slide-up">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-pink-100 text-pink-600">
                      {componentIcons.Height}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Special Height</p>
                      <CardTitle className="text-base">{parsed.specialHeight}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">Non-standard table height</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {parsed && !parsed.valid && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <p className="text-amber-800 font-medium">Could not parse this SKU. Please check the format.</p>
            <p className="text-sm text-amber-600 mt-1">
              Expected format: Series(2 digits) + Shape(2 letters) + Size(digits) + Base(letters+digits) + options
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SkuDecoderPage() {
  return (
    <Suspense fallback={<div className="animate-pulse p-8 text-slate-400">Loading...</div>}>
      <SkuDecoderContent />
    </Suspense>
  );
}
