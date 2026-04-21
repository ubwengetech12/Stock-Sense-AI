// File: src/components/dashboard/AlertsList.tsx
import { Card } from "../ui/Card";
import { ShieldAlert } from "lucide-react";
import { useStore } from "../../store/useStore";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";

export function AlertsList() {
  const alerts = useStore(state => state.alerts);

  const displayAlerts = alerts.length > 0 ? alerts : [
    { id: '1', productName: 'Inyange Milk 1L', urgency: 'critical', currentStock: 4, minStock: 20 },
    { id: '2', productName: 'Ubunyobwa Bread', urgency: 'low', currentStock: 8, minStock: 30 },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-bold text-white mb-4">Critical Stock Alerts</h3>
      <div className="space-y-4">
        {displayAlerts.map((alert) => (
          <div 
            key={alert.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-xl border",
              alert.urgency === 'critical' 
                ? "bg-danger/5 border-danger/20" 
                : "bg-warning/5 border-warning/20"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                alert.urgency === 'critical' ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"
              )}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{alert.productName}</p>
                <p className="text-xs text-text-muted">{alert.currentStock} left • Min: {alert.minStock}</p>
              </div>
            </div>
            <Button size="sm" className={cn(
              "text-xs font-bold px-4 py-2 h-auto",
              alert.urgency === 'critical' ? "bg-primary text-background" : "bg-primary/10 text-primary border-none"
            )}>
              {alert.urgency === 'critical' ? 'WhatsApp Order' : 'View PO'}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
