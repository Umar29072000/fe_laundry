import { useEffect, useState } from 'react';
import { Users, ShoppingBag, ShoppingCart, TrendingUp, Sparkles, Clock } from 'lucide-react';
import { formatRupiah } from '../lib/utils';
import { DashboardStats } from '../types';
import { motion } from 'motion/react';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/dashboard');

      // Handle 401 — token expired or missing
      if (response.status === 401) {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('tenant');
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.status === 'success' && data.data) {
        setStats(data.data);
      } else {
        setError(data.message || 'Gagal memuat data dashboard');
      }
    } catch {
      setError('Terjadi kesalahan jaringan. Periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-bold">
        {error}
      </div>
    );

  if (!stats) return null;

  const cards = [
    {
      title: 'Total Pelanggan',
      value: stats.totalCustomers,
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/20',
      glow: 'bg-blue-100 group-hover:bg-indigo-100',
    },
    {
      title: 'Total Pesanan',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'from-purple-500 to-pink-600',
      shadow: 'shadow-purple-500/20',
      glow: 'bg-purple-100 group-hover:bg-pink-100',
    },
    {
      title: 'Pesanan Aktif',
      value: stats.pendingOrdersCount,
      icon: Clock,
      color: 'from-amber-400 to-orange-500',
      shadow: 'shadow-orange-500/20',
      glow: 'bg-orange-100 group-hover:bg-amber-100',
    },
    {
      title: 'Total Pendapatan',
      value: formatRupiah(stats.totalRevenue),
      icon: TrendingUp,
      color: 'from-emerald-400 to-teal-500',
      shadow: 'shadow-emerald-500/20',
      glow: 'bg-emerald-100 group-hover:bg-teal-100',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.15 },
    },
  };

  const itemAnim = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="space-y-8 pt-2">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
      >
        <div>
          <h1 className="flex items-center gap-3 text-4xl font-display font-bold text-slate-800 tracking-tight">
            Dashboard
            <Sparkles className="h-8 w-8 text-blue-500 animate-bounce" />
          </h1>
          <p className="mt-2 text-lg font-medium text-slate-600">
            Ringkasan performa bisnis laundry UMKM hari ini.
          </p>
        </div>
      </motion.div>

      {/* Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              variants={itemAnim}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 ${card.shadow} flex flex-col justify-between relative overflow-hidden group transition-all duration-300 cursor-pointer`}
            >
              {/* Glow */}
              <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl transition-colors pointer-events-none ${card.glow}`} />

              <div className="z-10">
                <div className="mb-6">
                  <motion.div
                    whileHover={{ rotate: 8, scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-lg`}
                  >
                    <Icon size={28} strokeWidth={2} />
                  </motion.div>
                </div>

                <p className="text-sm font-semibold text-slate-500 mb-2">{card.title}</p>

                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-3xl font-extrabold tracking-tight text-slate-900"
                >
                  {card.value}
                </motion.h3>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}