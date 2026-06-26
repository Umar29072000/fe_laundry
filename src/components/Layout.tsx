import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, ShoppingCart, Menu, X, WashingMachine, Bell, PieChart, LogOut, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 const [userData, setUserData] = useState<any>({ storeName: 'FreshClean Laundry', ownerName: 'Admin', photoUrl: '' });
 const location = useLocation();
 const navigate = useNavigate();

 useEffect(() => {
   const loadUser = () => {
     try {
       const u = JSON.parse(localStorage.getItem('user') || '{}');
       if (u && (u.storeName || u.ownerName)) {
         setUserData(u);
       }
     } catch (e) {}
   };
   loadUser();
   window.addEventListener('storage', loadUser);
   return () => window.removeEventListener('storage', loadUser);
 }, [location.pathname]);

 const handleLogout = () => {
   localStorage.removeItem('auth_token');
   localStorage.removeItem('user');
   navigate('/login');
 };

 const navItems = [
   { name: 'Dashboard', path: '/', icon: LayoutDashboard },
   { name: 'Pelanggan', path: '/customers', icon: Users },
   { name: 'Layanan', path: '/services', icon: ShoppingBag },
   { name: 'Pesanan', path: '/orders', icon: ShoppingCart },
   { name: 'Laporan', path: '/reports', icon: PieChart },
 ];

 return (
   <div className="flex h-screen bg-gradient-to-br from-blue-50/50 via-slate-50 to-indigo-50/50 font-sans overflow-hidden text-slate-800 transition-colors duration-300">
     {/* Decorative subtle background blobs */}
     <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
       <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl" />
       <div className="absolute top-2/3 right-0 w-96 h-96 rounded-full bg-purple-200/40 blur-3xl" />
     </div>

     {/* Mobile sidebar overlay */}
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
       className={cn(
         "fixed inset-y-0 left-0 z-50 w-72 m-4 rounded-[2.5rem] bg-white/90 backdrop-blur-2xl border border-white flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-xl shadow-blue-500/5",
         isSidebarOpen ? "translate-x-0" : "-translate-x-[120%]"
       )}
     >
       <div className="p-8 flex items-center justify-between lg:justify-start">
         <div className="flex items-center space-x-3.5">
           <motion.div 
             whileHover={{ rotate: 180 }}
             transition={{ duration: 0.6 }}
             className="w-12 h-12 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0"
           >
             <WashingMachine size={24} strokeWidth={2} />
           </motion.div>
           <div>
             <span className="text-xl font-display font-bold text-slate-900 tracking-tight block truncate max-w-[150px]">
               {userData.storeName || 'Laundry'}
             </span>
             <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">MITRA UMKM</span>
           </div>
         </div>
         <button 
           className="lg:hidden text-slate-400 hover:text-slate-800"
           onClick={() => setIsSidebarOpen(false)}
         >
           <X size={24} />
         </button>
       </div>

       <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
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
                   className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/5 border border-blue-200/60 rounded-2xl"
                   transition={{ type: "spring", stiffness: 300, damping: 30 }}
                 />
               )}
               <div className={cn(
                 "relative flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all duration-200",
                 isActive ? "text-blue-600 font-bold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-semibold"
               )}>
                 <Icon size={20} className={cn("transition-colors duration-200", isActive ? "text-blue-600" : "text-slate-400")} />
                 <span className="text-sm">{item.name}</span>
               </div>
             </Link>
           );
         })}
       </nav>

       <div className="p-6 mt-auto">
         <motion.button 
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.98 }}
           onClick={handleLogout}
           className="w-full flex items-center justify-center space-x-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 p-3.5 rounded-2xl transition-all font-bold text-sm cursor-pointer"
         >
           <LogOut size={18} />
           <span>Keluar Toko</span>
         </motion.button>
       </div>
     </motion.aside>

     {/* Main Content */}
     <div className="flex-1 flex flex-col relative min-w-0 z-10">
       <header className="relative z-50 h-24 px-6 lg:px-10 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-4">
           <button 
             className="p-3 text-slate-600 bg-white shadow-sm rounded-2xl lg:hidden hover:bg-slate-50 border border-slate-200 transition-all"
             onClick={() => setIsSidebarOpen(true)}
           >
             <Menu size={24} />
           </button>
           
         </div>
         <div className="flex items-center space-x-4 ml-auto">
           <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="relative p-3 text-slate-600 hover:text-blue-600 bg-white shadow-sm rounded-2xl border border-slate-200 transition-all"
           >
             <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
             <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full"></div>
             <Bell size={20} />
           </motion.button>
           <Link to="/profile">
             <div className="flex items-center gap-3.5 bg-white p-2 pr-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-inner overflow-hidden shrink-0">
                 {userData.photoUrl ? (
                   <img src={userData.photoUrl} alt="avatar" className="w-full h-full object-cover" />
                 ) : (
                   <span>{userData.ownerName?.charAt(0) || 'A'}</span>
                 )}
               </div>
               <div className="hidden sm:block text-left">
                 <p className="text-sm font-bold text-slate-900 leading-tight truncate max-w-[120px]">{userData.ownerName || 'Owner'}</p>
                 <p className="text-xs text-slate-500 leading-tight truncate max-w-[120px]">{userData.storeName || 'Kasir Utama'}</p>
               </div>
             </div>
           </Link>
         </div>
       </header>

       <main className="flex-1 overflow-y-auto px-4 lg:px-10 pb-10 custom-scrollbar">
         <AnimatePresence mode="wait">
           <motion.div
             key={location.pathname}
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -15 }}
             transition={{ duration: 0.25 }}
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
