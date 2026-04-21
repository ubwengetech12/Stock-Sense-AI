// File: src/components/ui/Badge.tsx
import * as React from "react";
import { cn } from "../../lib/utils";

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'primary';

export function Badge({ children, variant = 'info', className, ...props }: { children: React.ReactNode; variant?: BadgeVariant; className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  const styles = {
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    info: 'bg-text-muted/10 text-text-muted border-text-muted/20',
    primary: 'bg-primary/10 text-primary border-primary/20',
  };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", styles[variant], className)} {...props}>
      {children}
    </span>
  );
}
