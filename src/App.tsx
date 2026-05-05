// File: src/App.tsx
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FirebaseProvider, useFirebase } from "./components/FirebaseProvider";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { ChatAssistant } from "./components/dashboard/ChatAssistant";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Forecast from "./pages/Forecast";
import Suppliers from "./pages/Suppliers";
import Competitors from "./pages/Competitors";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import { Eye, EyeOff, LogIn, UserPlus, KeyRound, ArrowLeft } from "lucide-react";

// ─── Auth Screen ──────────────────────────────────────────────────────────────

type AuthMode = "login" | "register" | "forgot";

function AuthScreen() {
  const { loginWithEmail, registerWithEmail, resetPassword, authError, clearError } = useFirebase();

  const [mode, setMode] = useState<AuthMode>("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // register-only fields
  const [ownerName, setOwnerName] = useState("");
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const switchMode = (m: AuthMode) => {
    clearError();
    setResetSent(false);
    setMode(m);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
      } else if (mode === "register") {
        await registerWithEmail(email, password, {
          email,
          ownerName,
          shopName,
          phone,
          location,
          currency: "RWF",
        });
      } else {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch {}
    setLoading(false);
  };

  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/60 transition-colors placeholder:text-text-muted";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-background font-black text-2xl shadow-lg shadow-primary/20">
            S
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            StockSense <span className="text-primary">AI</span>
          </span>
        </div>

        <div className="bg-card border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Back button */}
          {mode !== "login" && (
            <button
              onClick={() => switchMode("login")}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Login
            </button>
          )}

          <h2 className="text-xl font-bold text-white mb-1">
            {mode === "login" ? "Welcome back" : mode === "register" ? "Create account" : "Reset password"}
          </h2>
          <p className="text-sm text-text-muted mb-6">
            {mode === "login"
              ? "Sign in to your StockSense account"
              : mode === "register"
              ? "Set up your shop on StockSense AI"
              : "Enter your email to receive a reset link"}
          </p>

          {authError && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger">
              {authError}
            </div>
          )}

          {resetSent && (
            <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-xl text-sm text-success">
              Password reset email sent! Check your inbox.
            </div>
          )}

          <div className="space-y-4">
            {mode === "register" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Jean Pierre Habimana"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Shop Name</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. JP General Store"
                    className={inputCls}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wide">WhatsApp</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+250 788 000 000"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Kimironko, Kigali"
                      className={inputCls}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputCls}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "register" ? "Min. 6 characters" : "••••••••"}
                    className={`${inputCls} pr-11`}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors p-1"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <button
                  onClick={() => switchMode("forgot")}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-primary text-background font-bold py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : mode === "login" ? (
                <><LogIn className="w-4 h-4" /> Sign In</>
              ) : mode === "register" ? (
                <><UserPlus className="w-4 h-4" /> Create Account</>
              ) : (
                <><KeyRound className="w-4 h-4" /> Send Reset Link</>
              )}
            </button>
          </div>

          {mode === "login" && (
            <p className="text-center text-xs text-text-muted mt-6">
              No account?{" "}
              <button onClick={() => switchMode("register")} className="text-primary hover:underline font-medium">
                Register here
              </button>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          StockSense AI · Built for Rwanda 🇷🇼
        </p>
      </div>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/inventory": "Your Products",
  "/forecast": "AI Forecast",
  "/suppliers": "Suppliers",
  "/competitors": "Price Radar",
  "/reports": "Reports",
  "/settings": "Settings",
};

function AppLayout() {
  const { user, loading } = useFirebase();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="StockSense AI" />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/competitors" element={<Competitors />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <ChatAssistant />
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <FirebaseProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </FirebaseProvider>
  );
}