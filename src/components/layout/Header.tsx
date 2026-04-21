// File: src/components/layout/Header.tsx
import { useState } from "react";
import { Search, Bell, UserCircle, ChevronDown, ChevronUp, User, Settings as SettingsIcon, LogOut } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export function Header({ title }: { title: string }) {
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const notifications = [
    { id: 1, title: 'Low Stock Alert', message: 'Inyange Milk 1L is below 10 units.', time: '5m ago', unread: true },
    { id: 2, title: 'New Sales Goal', message: 'You reached 80% of your weekly goal!', time: '2h ago', unread: true },
    { id: 3, title: 'Price Change', message: 'Hangar Shop reduced Blue Band price.', time: '1d ago', unread: false },
  ];

  const userData = {
    name: 'Kigali Corner Store',
    owner: 'Jean Bosco',
    email: 'bosco@kigalishop.rw',
    location: 'Kimironko, Kigali'
  };

  return (
    <header className={cn(
      "bg-background sticky top-0 z-30 w-full transition-all duration-300 border-b border-white/5",
      isHeaderCollapsed ? "h-14" : "h-auto py-4"
    )}>
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          <div className={cn("transition-all", isHeaderCollapsed ? "opacity-0 invisible w-0" : "opacity-100 visible")}>
            <h1 className="text-xl md:text-2xl font-bold text-white">StockSense AI</h1>
            <p className="text-xs md:text-sm text-text-muted hidden sm:block">Inventory & Demand Management</p>
          </div>

          <div className="flex items-center gap-2 md:gap-6 flex-1 justify-end">
            <div className="relative hidden lg:block">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="bg-card border border-white/5 rounded-full pl-11 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 w-48 xl:w-64 text-text-primary transition-all"
              />
            </div>
            
            <div className="flex items-center gap-1 md:gap-3">
              {/* Notifications */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
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
                        className="absolute right-0 mt-2 w-[320px] md:w-[380px] bg-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                          <h3 className="font-bold text-white">Notifications</h3>
                          <button className="text-[10px] text-primary font-bold uppercase tracking-wider hover:underline">Mark all as read</button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                          {notifications.map(n => (
                            <div key={n.id} className={cn("p-4 border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors", n.unread && "bg-primary/5")}>
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-sm font-bold text-white">{n.title}</p>
                                <span className="text-[10px] text-text-muted">{n.time}</span>
                              </div>
                              <p className="text-xs text-text-muted line-clamp-2">{n.message}</p>
                            </div>
                          ))}
                        </div>
                        <button className="w-full py-3 text-xs font-bold text-text-muted hover:text-white transition-colors bg-white/[0.02]">
                          View Area Settings
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile */}
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 md:p-1.5 rounded-full hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20 overflow-hidden">
                    <UserCircle className="w-full h-full" />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-[10px] font-bold text-white leading-none mb-1">{userData.owner}</p>
                    <p className="text-[9px] text-text-muted leading-none">{userData.location}</p>
                  </div>
                  <ChevronDown className={cn("w-3 h-3 text-text-muted transition-transform", isProfileOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-4 bg-primary/5 border-b border-white/5">
                          <p className="text-sm font-bold text-white">{userData.name}</p>
                          <p className="text-xs text-text-muted truncate">{userData.email}</p>
                        </div>
                        <div className="p-2">
                          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <User className="w-4 h-4" />
                            My Profile
                          </button>
                          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <SettingsIcon className="w-4 h-4" />
                            Account Settings
                          </button>
                          <div className="h-px bg-white/5 my-1" />
                          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-xl transition-all font-medium">
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
                className="text-text-muted ml-2"
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
