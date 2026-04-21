// File: src/components/ui/Card.tsx
import * as React from "react";
import { cn } from "../../lib/utils";

export function Card({ className, children, ...props }: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-card border border-white/5 rounded-2xl overflow-hidden shadow-xl", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, action }: { title: string; subtitle?: string; icon?: any; action?: React.ReactNode }) {
  return (
    <div className="p-6 flex items-start justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2.5 bg-primary/10 rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-text-primary leading-tight">{title}</h3>
          {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("px-6 pb-6", className)}>{children}</div>;
}
