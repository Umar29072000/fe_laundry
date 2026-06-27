import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShoppingBag, ShoppingCart, Menu, X,
  WashingMachine, Bell, PieChart, LogOut, Sun, Moon, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Tenant } from '../types';
import ToastContainer from './Toast';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [tenant, setTenant] = useState<Partial<Tenant>>({ storeName: 'Laundry Anda', ownerName: 'Admin' });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const loadTenant = () => {
      try {
        const t = JSON.parse(sessionStorage.getItem('tenant') || '{}');
        if (t && (t.storeName || t.ownerName)) setTenant(t);
      } catch {}
    };
    loadTenant();
    window.addEventListener('storage', loadTenant);
    return () => window.removeEventListener('storage', loadTenant);
  }, [location.pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('tenant');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Pelanggan', path: '/customers', icon: Users },
    { name: 'Layanan', path: '/services', icon: ShoppingBag },
    { name: 'Pesanan', path: '/orders', icon: ShoppingCart },
    { name: 'Laporan', path: '/reports', icon: PieChart },
  ];

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-72';

  return (
    <div className={cn(
      "flex h-screen font-sans overflow-hidden transition-colors duration-300",
      "bg-gradient-to-br from-blue-50/50 via-slate-50 to-indigo-50/50 text-slate-800",
      "dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950 dark:text-slate-100"
    )}>
      <ToastContainer />

      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-blue-200/30 dark:bg-blue-800/10 blur-3xl" />
        <div className="absolute top-2/3 right-0 w-96 h-96 rounded-full bg-purple-200/30 dark:bg-purple-800/10 blur-3xl" />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        layout
        className={cn(
          "fixed inset-y-0 left-0 z-50 m-4 rounded-[2.5rem] flex flex-col transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          "bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/60 dark:border-slate-700/60 shadow-xl shadow-blue-500/5",
          sidebarWidth,
          isSidebarOpen ? "translate-x-0" : "-translate-x-[120%]"
        )}
      >
        <div className={cn("p-6 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
          <div className={cn("flex items-center gap-3", isCollapsed && "flex-col")}>
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0"
            >
              <WashingMachine size={20} strokeWidth={2} />
            </motion.div>
            {!isCollapsed && (
              <div>
                <span className="text-lg font-display font-bold text-slate-900 dark:text-white tracking-tight block truncate max-w-[130px]">
                  {tenant.storeName || 'Laundry'}
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">MITRA UMKM</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button className="lg:hidden text-slate-400 hover:text-slate-800 dark:hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className="relative block"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/5 dark:from-blue-500/20 dark:via-indigo-500/20 border border-blue-200/60 dark:border-blue-700/60 rounded-2xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={cn(
                  "relative flex items-center rounded-2xl transition-all duration-200",
                  isCollapsed ? "justify-center p-3" : "space-x-3 px-4 py-3",
                  isActive
                    ? "text-blue-600 dark:text-blue-400 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50 font-semibold"
                )}>
                  <Icon size={20} className={cn("shrink-0", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500")} />
                  {!isCollapsed && <span className="text-sm">{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className={cn("p-4 mt-auto space-y-2", isCollapsed && "flex flex-col items-center")}>
          {/* Dark mode toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setDarkMode(!darkMode)}
            className={cn(
              "w-full flex items-center justify-center rounded-2xl transition-all font-bold text-sm cursor-pointer border p-3",
              "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white",
              isCollapsed ? "p-3" : "gap-2"
            )}
            title={darkMode ? "Mode Terang" : "Mode Gelap"}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {!isCollapsed && <span>{darkMode ? 'Terang' : 'Gelap'}</span>}
          </motion.button>

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center justify-center rounded-2xl transition-all font-bold text-sm cursor-pointer border p-3",
              "bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-800/60",
              isCollapsed ? "p-3" : "gap-2"
            )}
            title="Keluar"
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Keluar</span>}
          </motion.button>

          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full items-center justify-center p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            title={isCollapsed ? "Perlebar Menu" : "Minimalkan Menu"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col relative min-w-0 z-10">
        <header className="relative z-50 h-20 px-4 lg:px-8 flex items-center justify-between shrink-0">
          <button
            className="p-2.5 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 shadow-sm rounded-xl lg:hidden hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3 ml-auto">
            {/* Mobile dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="lg:hidden p-2.5 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2.5 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
              <Bell size={18} />
            </motion.button>

            <Link to="/profile">
              <div className="flex items-center gap-2.5 bg-white dark:bg-slate-800 p-1.5 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-inner overflow-hidden shrink-0">
                  {tenant.profilePictureUrl ? (
                    <img src={tenant.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{tenant.ownerName?.charAt(0) || 'A'}</span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[100px]">{tenant.ownerName || 'Owner'}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[100px]">{tenant.storeName || 'Kasir'}</p>
                </div>
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 lg:px-8 pb-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="max-w-7xl mx-auto h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
