// File: src/pages/Forecast.tsx
import { TrendingUp, Info, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useStore } from "../store/useStore";
import { format, addDays } from "date-fns";

export default function Forecast() {
  const products = useStore(state => state.products);
  
  const topProducts = products.slice(0, 3).map(p => ({
    ...p,
    predictedDemand: Math.floor(Math.random() * 100) + 50,
    confidence: 85 + Math.floor(Math.random() * 10)
  }));

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
        <Card>
          <CardHeader title="Next Week's Winners" subtitle="High probability sales growth" icon={TrendingUp} />
          <CardContent className="space-y-6">
            {topProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{p.name}</h4>
                    <p className="text-xs text-text-muted">{p.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">+{p.predictedDemand}%</p>
                  <p className="text-[10px] text-text-muted uppercase">Expected Growth</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-warning/5 border-warning/10">
          <CardHeader title="Stockout Risk" subtitle="Act fast to prevent lost sales" icon={AlertTriangle} />
          <CardContent className="space-y-6">
            <div className="p-4 bg-warning/10 rounded-2xl border border-warning/20">
              <p className="text-sm text-white"><b>Inyange Milk</b> will likely run out by this Friday based on current sales speed. Your current stock is 4 units, but expected demand is 42 units.</p>
              <Button variant="outline" className="mt-4 border-warning text-warning hover:bg-warning/10 w-full gap-2">
                Order Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
              <Info className="w-5 h-5 text-primary shrink-0" />
              <p className="text-xs text-text-muted">Our AI considers Rwanda Public Holidays (Jul 4th) and historical patterns to give you these numbers.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Detailed 14-Day View" subtitle="Predicted units per day" icon={TrendingUp} />
        <div className="p-6 overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            {Array.from({ length: 14 }, (_, i) => {
              const date = addDays(new Date(), i);
              const height = 40 + Math.random() * 60;
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-10 bg-white/5 hover:bg-primary/20 transition-colors rounded-t-lg relative group h-32 flex items-end">
                    <div 
                      className="w-full bg-primary/40 group-hover:bg-primary rounded-t-lg transition-all" 
                      style={{ height: `${height}%` }}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-card px-2 py-1 rounded text-[10px] font-bold border border-white/10">
                      {Math.floor(height)}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-text-muted">{format(date, 'dd/MM')}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
