// File: src/components/dashboard/StatCard.tsx
import { Card } from "../ui/Card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../../lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  icon: any;
  variant?: 'default' | 'urgent';
}

export function StatCard({ label, value, change, icon: Icon, variant = 'default' }: StatCardProps) {
  const isPositive = change && change > 0;

  return (
    <Card className="p-5">
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm text-text-muted">{label}</span>
        <div className={cn(
          "p-2 rounded-lg",
          variant === 'urgent' 
            ? "bg-danger/10 text-danger" 
            : change !== undefined && change < 0 ? "bg-blue-500/10 text-blue-500" : "bg-primary/10 text-primary"
        )}>
          <Icon className="w-[18px] h-[18px]" />
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-white">
          {value}
          {label.includes('Sales') || label.includes('Savings') ? <span className="text-sm font-normal text-slate-500 ml-1">RWF</span> : null}
        </h3>
        {change !== undefined && (
          <p className={cn(
            "text-xs mt-1 font-medium",
            isPositive ? "text-primary" : "text-danger"
          )}>
            {isPositive ? '+' : ''}{change}% from last month
          </p>
        )}
        {variant === 'urgent' && (
          <p className="text-xs text-danger/80 mt-1 font-medium">Action needed now</p>
        )}
      </div>
    </Card>
  );
}
