// File: src/pages/Competitors.tsx
import { ShieldAlert, RefreshCw, TrendingDown, TrendingUp, Target } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { formatRWF } from "../lib/utils";

const MOCK_COMP_DATA = [
  { product: 'Inyange Milk 1L', ourPrice: 900, comp1: 950, comp2: 850, comp3: 900, status: 'losing' },
  { product: 'Ubunyobwa Bread', ourPrice: 700, comp1: 650, comp2: 700, comp3: 750, status: 'losing' },
  { product: 'Omo Powder 1kg', ourPrice: 3200, comp1: 3500, comp2: 3400, comp3: 3100, status: 'winning' },
  { product: 'Coca Cola 500ml', ourPrice: 600, comp1: 600, comp2: 600, comp3: 550, status: 'losing' },
];

export default function Competitors() {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-primary" />
            Price Radar
          </h2>
          <p className="text-text-muted">Monitor competitors and optimize your margins</p>
        </div>
        <Button variant="secondary" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Update Competitor Prices
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Market Price Comparison" icon={TrendingDown} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-text-muted tracking-widest">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Our Price</th>
                  <th className="px-6 py-4">Comp 1</th>
                  <th className="px-6 py-4">Comp 2</th>
                  <th className="px-6 py-4">Market Low</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {MOCK_COMP_DATA.map((row, i) => {
                  const minPrice = Math.min(row.comp1, row.comp2, row.comp3);
                  const isLosing = row.ourPrice > minPrice;
                  
                  return (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{row.product}</td>
                      <td className="px-6 py-4 font-bold text-primary">{formatRWF(row.ourPrice)}</td>
                      <td className="px-6 py-4 text-sm text-text-muted">{formatRWF(row.comp1)}</td>
                      <td className="px-6 py-4 text-sm text-text-muted">{formatRWF(row.comp2)}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${isLosing ? 'text-danger' : 'text-success'}`}>
                          {formatRWF(minPrice)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isLosing ? (
                          <Button size="sm" variant="danger" className="text-[10px] py-1 h-7">Match Low</Button>
                        ) : (
                          <span className="text-[10px] font-bold text-success">Winning</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader title="AI Price Strategy" icon={Target} />
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-background border border-white/5 rounded-xl">
                  <p className="text-xs font-bold text-primary mb-1 uppercase">Recommendation:</p>
                  <p className="text-sm text-white">Your price for <b>Inyange Milk</b> is 6% above market average. Consider a temporary drop to <span className="text-primary font-bold">850 RWF</span> to attract more foot traffic.</p>
                </div>
                <div className="p-4 bg-background border border-white/5 rounded-xl">
                  <p className="text-xs font-bold text-success mb-1 uppercase">Success:</p>
                  <p className="text-sm text-white">You are the cheapest provider for <b>Omo Powder</b> in Kimironko. Maintain current price of <span className="text-success font-bold">3,200 RWF</span>.</p>
                </div>
              </div>
              <Button className="w-full mt-4 gap-2">
                Generate Full Strategy
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
