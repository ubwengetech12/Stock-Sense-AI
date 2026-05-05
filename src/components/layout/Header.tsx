// File: src/components/layout/Header.tsx
import { useState } from "react";
import { Search, Bell, ChevronDown, ChevronUp, User, Settings as SettingsIcon, LogOut } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useFirebase } from "../FirebaseProvider";
import { useNavigate } from "react-router-dom";

export function Header({ title }: { title: string }) {
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { profile, logout } = useFirebase();
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: "Low Stock Alert", message: "Inyange Milk 1L is below 10 units.", time: "5m ago", unread: true },
    { id: 2, title: "New Sales Goal", message: "You reached 80% of your weekly goal!", time: "2h ago", unread: true },
    { id: 3, title: "Price Change", message: "Hangar Shop reduced Blue Band price.", time: "1d ago", unread: false },
  ];

  // Derive initials from real profile name
  const initials = profile?.ownerName
    ? profile.ownerName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const displayName = profile?.ownerName || "User";
  const displayShop = profile?.shopName || "My Shop";
  const displayLocation = profile?.location || "Kigali, Rwanda";
  const displayEmail = profile?.email || "";

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
  };

  return (
    <header
      className={cn(
        "bg-background sticky top-0 z-30 w-full transition-all duration-300 border-b border-white/5",
        isHeaderCollapsed ? "h-14" : "h-auto py-4"
      )}
    >
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Title — hidden when collapsed */}
          <div
            className={cn(
              "transition-all shrink-0",
              isHeaderCollapsed ? "opacity-0 invisible w-0 overflow-hidden" : "opacity-100 visible"
            )}
          >
            <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">StockSense AI</h1>
            <p className="text-xs md:text-sm text-text-muted hidden sm:block">
              Inventory &amp; Demand Management
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end min-w-0">
            {/* Search — desktop only */}
            <div className="relative hidden lg:block">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search products..."
                className="bg-card border border-white/5 rounded-full pl-11 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 w-48 xl:w-64 text-text-primary transition-all"
              />
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileOpen(false); }}
                  className="relative text-text-muted hover:text-white"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-background" />
                </Button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-[300px] md:w-[360px] bg-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                          <h3 className="font-bold text-white">Notifications</h3>
                          <button className="text-[10px] text-primary font-bold uppercase tracking-wider hover:underline">
                            Mark all as read
                          </button>
                        </div>
                        <div className="max-h-[360px] overflow-y-auto">
                          {notifications.map((n) => (
                            <div
                              key={n.id}
                              className={cn(
                                "p-4 border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors",
                                n.unread && "bg-primary/5"
                              )}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-sm font-bold text-white">{n.title}</p>
                                <span className="text-[10px] text-text-muted shrink-0 ml-2">{n.time}</span>
                              </div>
                              <p className="text-xs text-text-muted line-clamp-2">{n.message}</p>
                            </div>
                          ))}
                        </div>
                        <button className="w-full py-3 text-xs font-bold text-text-muted hover:text-white transition-colors bg-white/[0.02]">
                          View All Notifications
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationsOpen(false); }}
                  className="flex items-center gap-2 p-1 md:p-1.5 rounded-full hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                >
                  {/* Avatar with initials */}
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 font-bold text-sm shrink-0">
                    {initials}
                  </div>
                  <div className="text-left hidden md:block max-w-[120px]">
                    <p className="text-[11px] font-bold text-white leading-none mb-0.5 truncate">{displayName}</p>
                    <p className="text-[9px] text-text-muted leading-none truncate">{displayLocation}</p>
                  </div>
                  <ChevronDown
                    className={cn("w-3 h-3 text-text-muted transition-transform shrink-0", isProfileOpen && "rotate-180")}
                  />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-60 bg-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                      >
                        {/* Profile header */}
                        <div className="p-4 bg-primary/5 border-b border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 font-bold">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-white truncate">{displayShop}</p>
                              <p className="text-xs text-text-muted truncate">{displayEmail}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu */}
                        <div className="p-2">
                          <button
                            onClick={() => { setIsProfileOpen(false); navigate("/settings"); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all"
                          >
                            <User className="w-4 h-4" />
                            My Profile
                          </button>
                          <button
                            onClick={() => { setIsProfileOpen(false); navigate("/settings"); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all"
                          >
                            <SettingsIcon className="w-4 h-4" />
                            Account Settings
                          </button>
                          <div className="h-px bg-white/5 my-1" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-danger hover:bg-danger/10 rounded-xl transition-all font-medium"
                          >
                            <LogOut className="w-4 h-4" />
                            Log Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Fold Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                className="text-text-muted ml-1 hidden md:flex"
              >
                {isHeaderCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}