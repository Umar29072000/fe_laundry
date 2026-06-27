import { useEffect, useState } from 'react';
import { formatRupiah } from '../lib/utils';
import {
  Wallet, CreditCard, Landmark, TrendingUp, BarChart2,
  Sparkles, DollarSign, ShoppingCart, Users, Calendar,
  ArrowUp, ArrowDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../lib/api';
import { DetailedReport } from '../types';

type Period = 'all' | 'week' | 'month' | 'year';

const statusIndo: Record<string, { label: string; color: string; bg: string }> = {
  Pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-100' },
  Washing: { label: 'Dicuci', color: 'text-blue-700', bg: 'bg-blue-100' },
  Ironing: { label: 'Setrika', color: 'text-purple-700', bg: 'bg-purple-100' },
  Ready: { label: 'Siap Ambil', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  Delivered: { label: 'Selesai', color: 'text-slate-700', bg: 'bg-slate-100' },
};

export default function Reports() {
  const [report, setReport] = useState<DetailedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('month');

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = period !== 'all' ? `?period=${period}` : '';
      const res = await apiFetch(`/api/reports${params}`);
      const json = await res.json();

      if (json.status === 'success' && json.data?.report) {
        const raw = json.data.report;

        // Backend lama: mengembalikan array ReportItem[]
        if (Array.isArray(raw)) {
          const totalRevenue = raw.reduce((s: number, r: any) => s + (r.totalRevenue || 0), 0);
          const totalOrders = raw.reduce((s: number, r: any) => s + (r.orderCount || 0), 0);
          setReport({
            summary: {
              totalRevenue,
              totalOrders,
              avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
            },
            dailyRevenue: [],
            ordersByService: [],
            ordersByStatus: [],
            paymentBreakdown: raw,
          });
        } else {
          // Backend baru: mengembalikan DetailedReport object
          setReport(raw);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-16 text-slate-500 font-medium">
        Belum ada data laporan.
      </div>
    );
  }

  const { summary, dailyRevenue, ordersByService, ordersByStatus, paymentBreakdown } = report;
  const maxDailyRev = Math.max(...dailyRevenue.map((d) => d.revenue), 1);
  const maxServiceRev = Math.max(...ordersByService.map((s) => s.revenue), 1);
  const maxStatusCount = Math.max(...ordersByStatus.map((s) => s.count), 1);

  const periods: { key: Period; label: string }[] = [
    { key: 'all', label: 'Semua Waktu' },
    { key: 'year', label: '1 Tahun' },
    { key: 'month', label: '1 Bulan' },
    { key: 'week', label: '1 Minggu' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="space-y-8 pt-2 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-800 tracking-tight flex items-center gap-3">
            Laporan Keuangan
            <Sparkles className="text-indigo-600 h-7 w-7 sm:h-8 sm:w-8" />
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Rekapitulasi pendapatan toko laundry Anda
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex bg-white rounded-2xl border border-slate-200 p-1 shadow-sm">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === p.key
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemAnim} whileHover={{ y: -3 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
            <DollarSign size={22} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pendapatan</p>
            <h3 className="text-xl font-extrabold text-slate-900">{formatRupiah(summary.totalRevenue)}</h3>
          </div>
        </motion.div>

        <motion.div variants={itemAnim} whileHover={{ y: -3 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
            <ShoppingCart size={22} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pesanan Selesai</p>
            <h3 className="text-xl font-extrabold text-slate-900">{summary.totalOrders}</h3>
          </div>
        </motion.div>

        <motion.div variants={itemAnim} whileHover={{ y: -3 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-md">
            <Users size={22} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rata-rata per Pesanan</p>
            <h3 className="text-xl font-extrabold text-slate-900">{formatRupiah(summary.avgOrderValue)}</h3>
          </div>
        </motion.div>

        <motion.div variants={itemAnim} whileHover={{ y: -3 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
            <BarChart2 size={22} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Menu Layanan</p>
            <h3 className="text-xl font-extrabold text-slate-900">{ordersByService.length}</h3>
          </div>
        </motion.div>
      </motion.div>

      {/* Daily Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar size={18} className="text-indigo-600" />
            Grafik Pendapatan Harian
          </h2>
        </div>
        <div className="p-6">
          {dailyRevenue.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm">Belum ada data pendapatan di periode ini.</p>
          ) : (
            <div className="flex items-end gap-1 h-36 overflow-x-auto pb-1">
              {dailyRevenue.map((day, i) => {
                const height = (day.revenue / maxDailyRev) * 100;
                const dateLabel = new Date(day.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                return (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="relative group flex flex-col items-center"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap shadow-lg pointer-events-none">
                      {formatRupiah(day.revenue)}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                    </div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 4)}%` }}
                      transition={{ duration: 0.4, delay: i * 0.02 }}
                      className="w-7 sm:w-8 bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t-md cursor-pointer hover:from-blue-600 transition-all"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-[7px] text-slate-400 font-medium mt-1">{dateLabel}</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Service */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Pendapatan per Layanan</h2>
          </div>
          <div className="p-6 space-y-3">
            {ordersByService.length === 0 ? (
              <p className="text-center text-slate-400 py-4 text-sm">Belum ada data.</p>
            ) : (
              ordersByService.map((service, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  key={service.name}
                  className="flex items-center gap-3"
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-slate-700">{service.name}</span>
                      <span className="text-xs font-bold text-slate-500">
                        {service.quantity} pcs &middot; {formatRupiah(service.revenue)}
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(service.revenue / maxServiceRev) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.1 * idx }}
                        className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Orders by Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Distribusi Status Pesanan</h2>
          </div>
          <div className="p-6 space-y-3">
            {ordersByStatus.map((item, idx) => {
              const meta = statusIndo[item.status] || { label: item.status, color: 'text-slate-700', bg: 'bg-slate-100' };
              const pct = summary.totalOrders > 0 ? (item.count / summary.totalOrders) * 100 : 0;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  key={item.status}
                  className="flex items-center gap-3"
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${meta.color} ${meta.bg}`}>
                          {meta.label}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-500">
                        {item.count} pesanan ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.count / maxStatusCount) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.1 * idx }}
                        className={`h-full rounded-full ${
                          item.status === 'Pending' ? 'bg-amber-400' :
                          item.status === 'Washing' ? 'bg-blue-400' :
                          item.status === 'Ironing' ? 'bg-purple-400' :
                          item.status === 'Ready' ? 'bg-emerald-400' :
                          'bg-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Payment Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
          <h2 className="text-lg font-bold text-slate-800">Rincian per Metode Pembayaran</h2>
        </div>
        <div className="p-6">
          {paymentBreakdown.length === 0 ? (
            <p className="text-center text-slate-400 py-4 text-sm">Belum ada data.</p>
          ) : (
            <div className="space-y-3">
              {paymentBreakdown.map((item, idx) => {
                const pct = summary.totalRevenue > 0 ? (item.totalRevenue / summary.totalRevenue) * 100 : 0;
                const meta: Record<string, { label: string; icon: any; color: string; bg: string; bar: string }> = {
                  Tunai: { label: 'Tunai / Cash', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500' },
                  QRIS: { label: 'QRIS Scan', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', bar: 'bg-blue-500' },
                  Transfer_Bank: { label: 'Transfer Bank', icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', bar: 'bg-purple-500' },
                };
                const m = meta[item.paymentMethod] || { label: item.paymentMethod, icon: Wallet, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', bar: 'bg-slate-500' };
                const Icon = m.icon;

                return (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    key={item.paymentMethod}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition-all"
                  >
                    <div className={`p-3 rounded-xl border ${m.bg} ${m.color} shadow-sm shrink-0`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-800">{m.label}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.1 * idx }}
                            className={`h-full ${m.bar} rounded-full`}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-500 w-10 text-right">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-sm text-slate-900">{formatRupiah(item.totalRevenue)}</span>
                      <p className="text-[10px] text-slate-400">{item.orderCount} pesanan</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
