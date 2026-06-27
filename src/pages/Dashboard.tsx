import { useEffect, useState } from 'react';
import {
  Users, ShoppingCart, Clock, TrendingUp, Sparkles,
  Wallet, CreditCard, Landmark, DollarSign, Calendar,
  ArrowRight, WashingMachine,
} from 'lucide-react';
import { formatRupiah } from '../lib/utils';
import { DashboardStats } from '../types';
import { motion } from 'motion/react';
import { apiFetch } from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';

const statusIndo: Record<string, { label: string; color: string; bg: string }> = {
  Pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-100' },
  Washing: { label: 'Dicuci', color: 'text-blue-700', bg: 'bg-blue-100' },
  Ironing: { label: 'Setrika', color: 'text-purple-700', bg: 'bg-purple-100' },
  Ready: { label: 'Siap Ambil', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  Delivered: { label: 'Selesai', color: 'text-slate-700', bg: 'bg-slate-100' },
};

const paymentIcons: Record<string, any> = {
  Tunai: Wallet,
  QRIS: CreditCard,
  Transfer_Bank: Landmark,
};

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

  const revenueCards = [
    {
      title: 'Pendapatan Hari Ini',
      value: formatRupiah(stats.todayRevenue),
      icon: DollarSign,
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/20',
    },
    {
      title: 'Pendapatan Minggu Ini',
      value: formatRupiah(stats.weeklyRevenue),
      icon: Calendar,
      color: 'from-purple-500 to-pink-600',
      shadow: 'shadow-purple-500/20',
    },
    {
      title: 'Pendapatan Bulan Ini',
      value: formatRupiah(stats.monthlyRevenue),
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
    },
    {
      title: 'Total Keseluruhan',
      value: formatRupiah(stats.totalRevenue),
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/20',
    },
  ];

  const summaryCards = [
    {
      title: 'Total Pelanggan',
      value: stats.totalCustomers,
      icon: Users,
      color: 'from-sky-500 to-cyan-600',
      shadow: 'shadow-sky-500/20',
      link: '/customers',
    },
    {
      title: 'Total Pesanan',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-500/20',
      link: '/orders',
    },
    {
      title: 'Pesanan Aktif',
      value: stats.pendingOrdersCount,
      icon: Clock,
      color: 'from-amber-400 to-orange-500',
      shadow: 'shadow-orange-500/20',
      link: '/orders',
    },
    {
      title: 'Buka Laporan',
      value: 'Detail →',
      icon: Sparkles,
      color: 'from-emerald-400 to-teal-500',
      shadow: 'shadow-emerald-500/20',
      link: '/reports',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const itemAnim = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="space-y-8 pt-2 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="flex items-center gap-3 text-3xl sm:text-4xl font-display font-bold text-slate-800 tracking-tight">
            Dashboard
            <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-blue-500" />
          </h1>
          <p className="mt-1 text-base font-medium text-slate-500">
            Ringkasan bisnis laundry Anda hari ini.
          </p>
        </div>
        <Link
          to="/reports"
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
        >
          Lihat Laporan Lengkap <ArrowRight size={14} />
        </Link>
      </motion.div>

      {/* Revenue Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              variants={itemAnim}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`bg-white p-5 rounded-2xl shadow-lg border border-slate-100 ${card.shadow} flex items-center gap-4 relative overflow-hidden group transition-all`}
            >
              <div className="absolute -right-8 -top-8 w-28 h-28 bg-slate-50 rounded-full blur-2xl group-hover:bg-blue-50/50 transition-colors pointer-events-none" />
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md z-10 shrink-0`}>
                <Icon size={20} strokeWidth={2.5} />
              </div>
              <div className="z-10">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">{card.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              variants={itemAnim}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => navigate(card.link)}
              className={`bg-white p-5 rounded-2xl shadow-lg border border-slate-100 ${card.shadow} flex items-center gap-4 relative overflow-hidden group transition-all cursor-pointer`}
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md z-10 shrink-0`}>
                <Icon size={20} strokeWidth={2.5} />
              </div>
              <div className="z-10">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {typeof card.value === 'number' ? card.value : card.value}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Status Distribution + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <WashingMachine size={16} className="text-indigo-600" />
              Status Pesanan
            </h2>
            <Link to="/orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              Lihat Semua →
            </Link>
          </div>
          <div className="p-5 space-y-3">
            {stats.ordersByStatus.map((item) => {
              const meta = statusIndo[item.status] || { label: item.status, color: 'text-slate-600', bg: 'bg-slate-100' };
              const maxCount = Math.max(...stats.ordersByStatus.map((s) => s.count), 1);
              return (
                <div key={item.status} className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${meta.color} ${meta.bg} w-20 text-center shrink-0`}>
                    {meta.label}
                  </span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / maxCount) * 100}%` }}
                      transition={{ duration: 0.6 }}
                      className={`h-full rounded-full ${
                        item.status === 'Pending' ? 'bg-amber-400' :
                        item.status === 'Washing' ? 'bg-blue-400' :
                        item.status === 'Ironing' ? 'bg-purple-400' :
                        item.status === 'Ready' ? 'bg-emerald-400' :
                        'bg-slate-400'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600 w-8 text-right">{item.count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ShoppingCart size={16} className="text-indigo-600" />
              Pesanan Terbaru
            </h2>
            <Link to="/orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              Lihat Semua →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {stats.recentOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Belum ada pesanan.</div>
            ) : (
              stats.recentOrders.map((order, idx) => {
                const PaymentIcon = paymentIcons[order.paymentMethod] || Wallet;
                const statusMeta = statusIndo[order.status] || { label: order.status, color: 'text-slate-600', bg: 'bg-slate-100' };
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * idx }}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-800">{order.id}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusMeta.color} ${statusMeta.bg}`}>
                          {statusMeta.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{order.customerName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-slate-900">{formatRupiah(order.totalPrice)}</p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <PaymentIcon size={10} className="text-slate-400" />
                        <span className="text-[10px] text-slate-400">{format(new Date(order.createdAt), 'dd/MM')}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}