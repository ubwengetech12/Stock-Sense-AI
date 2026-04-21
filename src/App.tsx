// File: src/App.tsx
import * as React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Forecast from "./pages/Forecast";
import Suppliers from "./pages/Suppliers";
import Competitors from "./pages/Competitors";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import { ChatAssistant } from "./components/dashboard/ChatAssistant";
import { useState, useEffect } from "react";
import { useStore } from "./store/useStore";
import { LayoutDashboard, Package, TrendingUp, BarChart3, Users, Target, Settings, MessageSquare } from "lucide-react";
import { cn } from "./lib/utils";

// Mobile Navigation for smaller screens
function MobileNav() {
  const location = useLocation();
  const navItems = [
    { path: "/", label: "Home", icon: LayoutDashboard },
    { path: "/inventory", label: "Stock", icon: Package },
    { path: "/forecast", label: "Predict", icon: TrendingUp },
    { path: "/reports", label: "Stats", icon: BarChart3 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-card/80 border-t border-white/10 flex items-center justify-around px-2 z-40 backdrop-blur-2xl pb-4">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <Link 
            key={item.path} 
            to={item.path}
            className={`flex flex-col items-center gap-1.5 px-4 py-1 rounded-2xl transition-all ${isActive ? 'text-primary bg-primary/10' : 'text-text-muted'}`}
          >
            <Icon className={cn("w-5 h-5", isActive && "animate-bounce")} />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  );
}

function ScrollProgress() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScroll(scrolled);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed right-1 top-0 bottom-0 w-1 pt-16 pb-16 z-50 pointer-events-none hidden lg:block">
      <div className="h-full w-full bg-white/[0.03] rounded-full relative overflow-hidden">
        <div 
          className="w-full bg-primary shadow-[0_0_15px_rgba(0,212,170,0.5)] transition-all duration-75"
          style={{ height: `${scroll}%` }}
        />
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[100] animate-in fade-in duration-500">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
      <h2 className="text-xl font-bold text-white tracking-widest">STOCKSENSE AI</h2>
      <p className="text-text-muted text-sm mt-1 animate-pulse">Initializing your warehouse assistant...</p>
    </div>
  );
}

import { FirebaseProvider, useFirebase } from "./components/FirebaseProvider";
import { LogIn } from "lucide-react";
import { Button } from "./components/ui/Button";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, login } = useFirebase();

  if (!user) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mb-8 animate-bounce">
          <Package className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">StockSense <span className="text-primary">AI</span></h1>
        <p className="text-text-muted max-w-sm mb-10 leading-relaxed">
          The ultimate intelligent warehouse companion for Rwandan shop owners. 
          Connect to your dashboard to start tracking.
        </p>
        <Button onClick={login} size="lg" className="px-10 h-14 rounded-2xl gap-3 text-lg">
          <LogIn className="w-6 h-6" />
          Login with Google
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  const { initialize, updateAlerts, generateForecasts } = useStore();

  useEffect(() => {
    const unsub = initialize();
    
    // Initial data refresh
    updateAlerts();
    generateForecasts();

    return () => unsub();
  }, [initialize]);

  return (
    <FirebaseProvider>
      <AuthGuard>
        <Router>
          <div className="flex min-h-screen bg-background text-text-primary selection:bg-primary/30 selection:text-primary overflow-x-hidden">
            <Sidebar />
            
            <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
              <Header title="StockSense AI" />
              
              <div className="p-4 md:p-8 flex-1 max-w-[1600px] mx-auto w-full">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/forecast" element={<Forecast />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/competitors" element={<Competitors />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </div>
            </main>

            <MobileNav />
            <ChatAssistant />
            <ScrollProgress />
          </div>
        </Router>
      </AuthGuard>
    </FirebaseProvider>
  );
}
