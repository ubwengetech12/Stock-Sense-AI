// File: src/pages/Dashboard.tsx
import { ShieldAlert, Activity, ArrowUpRight, TrendingUp, DollarSign, Package } from "lucide-react";
import { StatCard } from "../components/dashboard/StatCard";
import { ForecastGrid } from "../components/dashboard/ForecastGrid";
import { AlertsList } from "../components/dashboard/AlertsList";
import { useStore } from "../store/useStore";
import { Card } from "../components/ui/Card";
import { motion, AnimatePresence } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "../lib/utils";

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
        time: formatDistanceToNow(new Date(s.date), { addSuffix: true })
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
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                item.type === 'sale' ? "bg-success/10 text-success" : 
                item.type === 'price' ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
              )}>
                {item.type === 'sale' ? <DollarSign className="w-5 h-5" /> : 
                 item.type === 'price' ? <TrendingUp className="w-5 h-5" /> : <Package className="w-5 h-5" />}
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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Your Products" 
          value={products.length.toString()} 
          icon={Package} 
          change={12}
        />
        <StatCard 
          label="Low Stock" 
          value={alerts.length > 0 ? alerts.length.toString() : "05"} 
          icon={ShieldAlert} 
          variant="urgent"
        />
        <StatCard 
          label="Total Sales" 
          value="2.4M" 
          icon={DollarSign} 
          change={12}
        />
        <StatCard 
          label="AI Savings" 
          value="84k" 
          icon={Package} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ForecastGrid />
        </div>
        <div className="lg:col-span-1">
          <LiveActivityFeed />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AlertsList />
        
        <Card className="p-6">
          <h3 className="font-bold text-white mb-4">Competitor Price Radar</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[10px] text-text-muted font-bold uppercase tracking-widest">
              <span>Product</span>
              <span>Their Price</span>
              <span>Action</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">Blue Band 500g</span>
                <span className="text-[10px] text-text-muted">Hangar Shop • 2km away</span>
              </div>
              <span className="text-danger font-bold">2,100 RWF</span>
              <span className="text-[10px] text-primary bg-primary/10 px-2 py-1 rounded font-bold">Match Price</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">Inyange Milk 1L</span>
                <span className="text-[10px] text-text-muted">Kimironko Mkt • 5km away</span>
              </div>
              <span className="text-primary font-bold">850 RWF</span>
              <span className="text-[10px] text-text-muted bg-white/5 px-2 py-1 rounded font-bold">Winning</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
