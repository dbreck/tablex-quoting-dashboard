"use client";

import { useQuoteStore } from "@/store/quote-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Trash2, Package } from "lucide-react";

export function LineItemsTable() {
  const { draftQuote, updateLineItem, removeLineItem } = useQuoteStore();
  const lineItems = draftQuote?.lineItems ?? [];

  const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);

  function handleQtyChange(itemId: string, qty: number) {
    const item = lineItems.find((i) => i.id === itemId);
    if (!item) return;
    const newQty = Math.max(1, qty);
    updateLineItem(itemId, {
      quantity: newQty,
      totalPrice: item.netPrice * newQty,
    });
  }

  function handlePriceChange(itemId: string, price: number) {
    const item = lineItems.find((i) => i.id === itemId);
    if (!item) return;
    const newPrice = Math.max(0, price);
    updateLineItem(itemId, {
      netPrice: newPrice,
      totalPrice: newPrice * item.quantity,
    });
  }

  function handleNotesChange(itemId: string, notes: string) {
    updateLineItem(itemId, { notes });
  }

  if (lineItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No items in this quote yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Go back to the Products step to add items.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Line Items ({lineItems.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Description</th>
                <th className="w-24">Qty</th>
                <th className="w-32">Unit Price</th>
                <th>Total</th>
                <th className="w-40">Notes</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="font-mono text-xs">{item.sku}</td>
                  <td className="text-sm">{item.description}</td>
                  <td>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        handleQtyChange(item.id, parseInt(e.target.value) || 1)
                      }
                      className="w-20 h-8 text-sm"
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.netPrice}
                      onChange={(e) =>
                        handlePriceChange(
                          item.id,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-28 h-8 text-sm"
                    />
                  </td>
                  <td className="price font-semibold">
                    {formatCurrency(item.totalPrice)}
                  </td>
                  <td>
                    <Input
                      value={item.notes ?? ""}
                      onChange={(e) =>
                        handleNotesChange(item.id, e.target.value)
                      }
                      placeholder="Notes..."
                      className="h-8 text-sm"
                    />
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeLineItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subtotal */}
        <div className="flex justify-end px-4 py-3 border-t border-slate-100">
          <div className="text-right">
            <span className="text-sm text-slate-500 mr-4">Subtotal:</span>
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
