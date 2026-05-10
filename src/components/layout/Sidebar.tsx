// File: src/components/layout/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, TrendingUp, Users,
  ShieldAlert, BarChart3, Settings, LogOut,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { SuperAdminPanel, useAdminTrigger } from "../SuperAdmin";

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",     path: "/" },
  { icon: Package,         label: "Your Products", path: "/inventory" },
  { icon: TrendingUp,      label: "AI Forecast",   path: "/forecast" },
  { icon: Users,           label: "Suppliers",     path: "/suppliers" },
  { icon: ShieldAlert,     label: "Price Radar",   path: "/competitors" },
  { icon: BarChart3,       label: "Reports",       path: "/reports" },
];

export function Sidebar() {
  const location = useLocation();
  const { clickCount, handleLogoClick, showAdmin, setShowAdmin } = useAdminTrigger(20);

  return (
    <>
      <aside className="w-64 bg-sidebar border-r border-white/5 flex flex-col h-screen sticky top-0 hidden md:flex">
        <div className="p-6 h-full flex flex-col">

          {/* ── Logo (secret trigger) ── */}
          <div className="flex items-center gap-3 mb-10 pl-2">
            <button
              onClick={handleLogoClick}
              className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-background font-bold text-xl select-none focus:outline-none transition-transform active:scale-90"
              title=""
              style={{
                // Subtle red tint as clicks approach 20
                boxShadow: clickCount > 5
                  ? `0 0 ${clickCount * 2}px rgba(231,76,60,${clickCount / 40})`
                  : undefined,
              }}
            >
              S
            </button>
            <span className="text-xl font-bold tracking-tight text-white">
              StockSense <span className="text-primary">AI</span>
            </span>
          </div>

          {/* ── Click counter hint (only shows after 5+ clicks) ── */}
          {clickCount >= 5 && (
            <div
              className="mb-4 mx-2 px-3 py-1.5 rounded-lg text-[10px] font-bold text-center"
              style={{
                backgroundColor: "#e74c3c15",
                color: "#e74c3c",
                border: "1px solid #e74c3c30",
              }}
            >
              {20 - clickCount} more click{20 - clickCount !== 1 ? "s" : ""}…
            </div>
          )}

          {/* ── Nav ── */}
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
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isActive
                        ? "text-primary"
                        : "text-text-muted group-hover:text-primary"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Footer ── */}
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

      {/* ── Super Admin Panel (portal) ── */}
      {showAdmin && <SuperAdminPanel onClose={() => setShowAdmin(false)} />}
    </>
  );
}