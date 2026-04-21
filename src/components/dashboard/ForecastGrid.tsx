// File: src/components/dashboard/ForecastGrid.tsx
import { Card } from "../ui/Card";
import { TrendingUp, Calendar } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "../../lib/utils";

export function ForecastGrid() {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    const dayName = format(date, 'EEE');
    const demand = Math.floor(Math.random() * 50) + 10;
    const isHigh = demand > 40;
    const height = Math.min(95, Math.max(20, (demand / 60) * 100));
    
    return { dayName, demand, isHigh, height };
  });

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-white">7-Day Demand Forecast</h3>
          <span className="bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-primary/20">
            🤖 AI Predicted
          </span>
        </div>
        <button className="text-xs text-primary font-medium hover:underline">View Full Report</button>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className={cn(
              "text-xs text-text-muted mb-2 font-medium",
              day.isHigh && "text-primary/70 font-bold"
            )}>{day.dayName}</span>
            
            <div className="w-full bg-sidebar rounded-lg h-24 relative overflow-hidden">
              <div 
                className={cn(
                  "absolute bottom-0 w-full transition-all duration-1000",
                  day.isHigh ? "bg-orange-500 opacity-60" : "bg-primary opacity-40"
                )}
                style={{ height: `${day.height}%` }}
              />
            </div>
            
            <span className={cn(
              "mt-2 font-bold text-sm",
              day.isHigh ? "text-orange-400" : "text-white"
            )}>
              {day.demand} {day.isHigh ? "🔥" : ""}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
