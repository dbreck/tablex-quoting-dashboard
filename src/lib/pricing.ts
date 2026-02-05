export interface WaterfallItem {
  name: string;
  value: number;
  type: "cost" | "markup" | "discount" | "total" | "profit";
}

export function buildWaterfallData(row: {
  topCost: number | null;
  baseCost: number | null;
  routeCost: number | null;
  assemblyCost: number | null;
  freightInCost: number | null;
  packagingCost: number | null;
  totalCost: number | null;
  gpm: number | null;
  listPrice: number | null;
  price_50_20: number | null;
  commission: number | null;
}): WaterfallItem[] {
  const items: WaterfallItem[] = [];

  items.push({ name: "Top Cost", value: row.topCost || 0, type: "cost" });
  items.push({ name: "Base Cost", value: row.baseCost || 0, type: "cost" });
  if (row.routeCost) {
    items.push({ name: "Routing", value: row.routeCost, type: "cost" });
  }
  items.push({ name: "Assembly", value: (row.assemblyCost || 0) - (row.topCost || 0) - (row.baseCost || 0) - (row.routeCost || 0), type: "cost" });
  if ((row.freightInCost || 0) > 0) {
    items.push({ name: "Freight In", value: row.freightInCost!, type: "cost" });
  }
  items.push({ name: "Packaging", value: row.packagingCost || 0, type: "cost" });

  const totalCost = row.totalCost || 0;
  const listPrice = row.listPrice || 0;
  const gpm = row.gpm || 0;
  const net5020 = row.price_50_20 || 0;
  const commission = row.commission || 0;

  items.push({ name: "Total Cost", value: totalCost, type: "total" });

  const markup = listPrice - totalCost;
  items.push({ name: `GPM (${(gpm * 100).toFixed(0)}%)`, value: markup, type: "markup" });
  items.push({ name: "List Price", value: listPrice, type: "total" });

  const discount = listPrice - net5020;
  items.push({ name: "50/20 Discount", value: -discount, type: "discount" });
  items.push({ name: "Net (50/20)", value: net5020, type: "total" });

  const commAmount = net5020 * commission;
  items.push({ name: "Commission", value: -commAmount, type: "discount" });
  items.push({ name: "Net Profit", value: net5020 - commAmount - totalCost, type: "profit" });

  return items;
}

export const discountTierLabels = [
  { key: "price_50_20", label: "50/20", factor: 0.40 },
  { key: "price_50_20_5", label: "50/20/5", factor: 0.38 },
  { key: "price_50_20_10", label: "50/20/10", factor: 0.36 },
  { key: "price_50_20_15", label: "50/20/15", factor: 0.34 },
  { key: "price_50_20_20", label: "50/20/20", factor: 0.32 },
];
