// File: src/pages/Forecast.tsx
import { useMemo } from "react";
import { TrendingUp, Info, AlertTriangle, ArrowRight, Package } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { useStore } from "../store/useStore";
import { calculateForecast } from "../lib/forecast";
import { format, addDays } from "date-fns";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";

export default function Forecast() {
  const { products, sales, suppliers } = useStore();
  const navigate = useNavigate();

  // Dynamic stockout risk: for each low-stock product, compute real forecast demand
  const stockoutRisks = useMemo(() => {
    return products
      .filter((p) => p.currentStock <= p.minStock)
      .map((p) => {
        const forecast = calculateForecast(p, sales, 7);
        const totalDemand = forecast.reduce((acc, f) => acc + f.predictedUnits, 0);
        const avgDaily = totalDemand / 7;
        const daysLeft = avgDaily > 0 ? Math.floor(p.currentStock / avgDaily) : 99;
        const runOutDate = addDays(new Date(), daysLeft);
        const urgency = daysLeft <= 2 ? "critical" : daysLeft <= 5 ? "warning" : "watch";
        const supplier = suppliers.find((s) => s.id === p.supplierId);
        return { product: p, totalDemand: Math.round(totalDemand), daysLeft, runOutDate, urgency, supplier };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [products, sales, suppliers]);

  // Top demand winners (products with most predicted demand next week)
  const topProducts = useMemo(() => {
    return [...products]
      .map((p) => {
        const forecast = calculateForecast(p, sales, 7);
        const total = forecast.reduce((acc, f) => acc + f.predictedUnits, 0);
        const confidence = forecast[0]?.confidence ?? 80;
        return { ...p, predictedTotal: total, confidence };
      })
      .sort((a, b) => b.predictedTotal - a.predictedTotal)
      .slice(0, 3);
  }, [products, sales]);

  // 14-day bar chart data
  const chartDays = useMemo(() => {
    const allProducts = products.slice(0, 5);
    return Array.from({ length: 14 }, (_, i) => {
      const date = addDays(new Date(), i);
      const totalDemand = allProducts.reduce((acc, p) => {
        const f = calculateForecast(p, sales, 14);
        return acc + (f[i]?.predictedUnits ?? 0);
      }, 0);
      const maxExpected = allProducts.length * 20;
      const height = Math.min(95, Math.max(15, (totalDemand / maxExpected) * 100));
      return { date, totalDemand, height };
    });
  }, [products, sales]);

  const maxDemand = Math.max(...chartDays.map((d) => d.totalDemand), 1);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <TrendingUp className="w-7 h-7 text-primary" />
          Demand Forecasting
        </h2>
        <p className="text-text-muted">AI-driven predictions for your upcoming sales cycle</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Next week winners */}
        <Card>
          <CardHeader title="Next Week's Top Movers" subtitle="Predicted highest demand products" icon={TrendingUp} />
          <CardContent className="space-y-4">
            {topProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-lg shrink-0">
                    {p.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-white truncate">{p.name}</h4>
                    <p className="text-xs text-text-muted">{p.category} · {p.confidence}% confidence</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-xl font-bold text-primary">{p.predictedTotal}</p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wide">units / week</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-center text-text-muted py-8 text-sm">No products found. Add products first.</p>
            )}
          </CardContent>
        </Card>

        {/* Stockout Risk */}
        <Card className={cn(
          "border",
          stockoutRisks.length > 0 ? "bg-warning/5 border-warning/10" : "border-white/5"
        )}>
          <CardHeader
            title="Stockout Risk"
            subtitle="Act fast to prevent lost sales"
            icon={AlertTriangle}
          />
          <CardContent className="space-y-4">
            {stockoutRisks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-success" />
                </div>
                <p className="text-sm font-medium text-white">All stock levels are healthy!</p>
                <p className="text-xs text-text-muted">No products are at risk of running out.</p>
              </div>
            ) : (
              stockoutRisks.map(({ product, totalDemand, daysLeft, runOutDate, urgency, supplier }) => (
                <div
                  key={product.id}
                  className={cn(
                    "p-4 rounded-2xl border",
                    urgency === "critical"
                      ? "bg-danger/10 border-danger/20"
                      : urgency === "warning"
                      ? "bg-warning/10 border-warning/20"
                      : "bg-white/5 border-white/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-bold text-white">{product.name}</p>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                        urgency === "critical"
                          ? "bg-danger/20 text-danger"
                          : urgency === "warning"
                          ? "bg-warning/20 text-warning"
                          : "bg-primary/20 text-primary"
                      )}
                    >
                      {urgency === "critical" ? "⚠ CRITICAL" : urgency === "warning" ? "⚡ WARNING" : "👁 WATCH"}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mb-3">
                    {daysLeft <= 0
                      ? "Already out of stock!"
                      : `Will run out ${daysLeft === 1 ? "tomorrow" : `in ~${daysLeft} days`} (${format(runOutDate, "EEE, MMM d")}). `}
                    Stock: <span className="font-bold text-white">{product.currentStock} {product.unit}</span> · Expected demand: <span className="font-bold text-white">{totalDemand} units</span>
                    {supplier && <span> · Supplier: <span className="text-primary">{supplier.name}</span></span>}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => navigate("/suppliers")}
                    className={cn(
                      "w-full gap-2 text-xs h-9",
                      urgency === "critical"
                        ? "bg-danger text-white hover:opacity-90"
                        : "border border-warning text-warning bg-transparent hover:bg-warning/10"
                    )}
                  >
                    Order Now
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}

            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl mt-2">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-text-muted">
                AI considers Rwanda public holidays, weekend boosts, and your last 7 days of sales speed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 14-day chart */}
      <Card>
        <CardHeader title="Detailed 14-Day View" subtitle="Total predicted units across all products per day" icon={TrendingUp} />
        <div className="p-6 overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-2">
            {chartDays.map((day, i) => {
              const heightPct = Math.max(10, (day.totalDemand / maxDemand) * 100);
              const isHigh = day.totalDemand > maxDemand * 0.7;
              return (
                <div key={i} className="flex flex-col items-center gap-2 group cursor-default">
                  <div className="relative h-32 w-10 flex items-end">
                    <div className="w-full bg-white/5 rounded-t-lg h-full absolute bottom-0" />
                    <div
                      className={cn(
                        "w-full rounded-t-lg transition-all duration-700 absolute bottom-0",
                        isHigh ? "bg-orange-500/60 group-hover:bg-orange-400" : "bg-primary/40 group-hover:bg-primary"
                      )}
                      style={{ height: `${heightPct}%` }}
                    />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-card px-2 py-1 rounded text-[10px] font-bold border border-white/10 whitespace-nowrap z-10">
                      {day.totalDemand} units
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-text-muted">{format(day.date, "dd/MM")}</span>
                  <span className="text-[9px] text-text-muted/60">{format(day.date, "EEE")}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}