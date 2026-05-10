// File: src/pages/Dashboard.tsx
import { ShieldAlert, Activity, ArrowUpRight, TrendingUp, DollarSign, Package } from "lucide-react";
import { StatCard } from "../components/dashboard/StatCard";
import { ForecastGrid } from "../components/dashboard/ForecastGrid";
import { AlertsList } from "../components/dashboard/AlertsList";
import { AIInsightsPanel } from "../components/dashboard/AIInsightsPanel";
import { useStore } from "../store/useStore";
import { Card } from "../components/ui/Card";
import { formatDistanceToNow } from "date-fns";
import { cn } from "../lib/utils";
import { Activity as ActivityIcon, DollarSign as DS, Package as Pkg } from "lucide-react";

function LiveActivityFeed() {
  const sales = useStore(state => state.sales);
  const products = useStore(state => state.products);

  const displayActivities = [...sales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(s => {
      const product = products.find(p => p.id === s.productId);
      return {
        id: s.id,
        type: 'sale' as const,
        title: `Sale: ${s.quantity}x ${product?.name || 'Product'}`,
        amount: `${s.totalAmount.toLocaleString()} RWF`,
        time: formatDistanceToNow(new Date(s.date), { addSuffix: true }),
      };
    });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="font-bold text-white text-lg">Live Activity Feed</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Live</span>
        </div>
      </div>

      <div className="space-y-4">
        {displayActivities.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">Waiting for live data... 📡</p>
        ) : (
          displayActivities.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-all group">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-success/10 text-success">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{item.title}</p>
                <p className="text-[10px] text-text-muted">{item.time} • {item.amount}</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
            </div>
          ))
        )}
      </div>

      <button className="w-full mt-6 py-2 text-xs font-bold text-text-muted hover:text-white transition-colors bg-white/5 rounded-lg border border-white/5 uppercase tracking-widest">
        Full Transaction History
      </button>
    </Card>
  );
}

export default function Dashboard() {
  const products = useStore(state => state.products);
  const alerts = useStore(state => state.alerts);
  const sales = useStore(state => state.sales);

  // Real monthly revenue from sales
  const now = Date.now();
  const MS_30 = 30 * 24 * 60 * 60 * 1000;
  const monthlyRev = sales
    .filter(s => now - new Date(s.date).getTime() <= MS_30)
    .reduce((acc, s) => acc + s.totalAmount, 0);

  const formatShort = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
    return String(n);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Your Products"
          value={products.length.toString()}
          icon={Package}
          change={12}
        />
        <StatCard
          label="Low Stock"
          value={alerts.length > 0 ? alerts.length.toString() : "0"}
          icon={ShieldAlert}
          variant="urgent"
        />
        <StatCard
          label="Monthly Sales"
          value={formatShort(monthlyRev)}
          icon={DollarSign}
          change={12}
        />
        <StatCard
          label="AI Savings"
          value="84k"
          icon={Package}
        />
      </div>

      {/* Forecast + Live feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ForecastGrid />
        </div>
        <div className="lg:col-span-1">
          <LiveActivityFeed />
        </div>
      </div>

      {/* Alerts + AI Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AlertsList />
        <AIInsightsPanel />
      </div>
    </div>
  );
}