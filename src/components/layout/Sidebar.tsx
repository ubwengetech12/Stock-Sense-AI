// File: src/components/layout/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, TrendingUp, Users, ShieldAlert, BarChart3, Settings, LogOut } from "lucide-react";
import { cn } from "../../lib/utils";

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Package, label: "Your Products", path: "/inventory" },
  { icon: TrendingUp, label: "AI Forecast", path: "/forecast" },
  { icon: Users, label: "Suppliers", path: "/suppliers" },
  { icon: ShieldAlert, label: "Price Radar", path: "/competitors" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar border-r border-white/5 flex flex-col h-screen sticky top-0 hidden md:flex">
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-10 pl-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-background font-bold text-xl">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-white">StockSense <span className="text-primary">AI</span></span>
        </div>

        <nav className="space-y-2 flex-1">
          {MENU_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-text-muted hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-text-muted group-hover:text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mb-6">
            <p className="text-xs text-primary/80 mb-2">Need help?</p>
            <p className="text-sm font-medium text-white">Ask the AI Assistant</p>
          </div>
          
          <div className="space-y-1">
            <Link
              to="/settings"
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-xl text-text-muted hover:text-white transition-all text-sm",
                location.pathname === "/settings" && "text-white"
              )}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-danger/70 hover:text-danger transition-all text-sm">
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
