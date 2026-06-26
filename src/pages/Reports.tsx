import { useEffect, useState } from 'react';
import { formatRupiah } from '../lib/utils';
import { Wallet, CreditCard, Landmark, TrendingUp, BarChart2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { apiFetch } from '../lib/api';
import { ReportItem } from '../types';

export default function Reports() {
  const [reportItems, setReportItems] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await apiFetch('/api/reports');
        const data = await res.json();
        if (data.status === 'success' && data.data?.report) {
          setReportItems(data.data.report);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Compute totals from the report array
  const totalRevenue = reportItems.reduce((sum, r) => sum + r.totalRevenue, 0);
  const totalOrderCount = reportItems.reduce((sum, r) => sum + r.orderCount, 0);

  const summaryCards = [
    {
      title: 'Total Pendapatan Bersih',
      value: formatRupiah(totalRevenue),
      icon: TrendingUp,
      color: 'from-blue-600 to-indigo-600',
      shadow: 'shadow-blue-500/20',
    },
    {
      title: 'Total Pesanan Selesai',
      value: totalOrderCount,
      icon: BarChart2,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
    },
  ];

  /** Map backend paymentMethod values to display labels + styling */
  const paymentMeta: Record<string, { label: string; icon: typeof Wallet; color: string; bg: string; bar: string }> = {
    Tunai: { label: 'Tunai / Cash', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500' },
    QRIS: { label: 'QRIS Scan', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', bar: 'bg-blue-500' },
    Transfer_Bank: { label: 'Transfer Bank', icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', bar: 'bg-purple-500' },
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="space-y-10 pt-2">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-800 tracking-tight flex items-center gap-3">
            Laporan Keuangan
            <Sparkles className="text-indigo-600 h-8 w-8 animate-bounce" />
          </h1>
          <p className="text-slate-600 mt-2 text-lg font-medium">Rekapitulasi pendapatan toko laundry dari pesanan selesai.</p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              variants={itemAnim}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl ${card.shadow} flex items-center gap-6 relative overflow-hidden group`}
            >
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-slate-100 rounded-full blur-2xl group-hover:bg-blue-50 transition-colors" />

              <div className={`p-5 rounded-2xl text-white bg-gradient-to-br ${card.color} shadow-lg z-10 shrink-0`}>
                <Icon size={32} strokeWidth={2.5} />
              </div>
              <div className="z-10">
                <p className="text-slate-500 font-semibold mb-1">{card.title}</p>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{card.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Payment Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
          <h2 className="text-2xl font-bold text-slate-800">Rincian Pendapatan per Metode Pembayaran</h2>
          <p className="text-slate-600 mt-1 text-sm font-medium">Distribusi omzet laundry Anda berdasarkan jalur bayar pelanggan</p>
        </div>
        <div className="p-8">
          {reportItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium">Belum ada data pendapatan.</div>
          ) : (
            <div className="space-y-4">
              {reportItems.map((item, idx) => {
                const meta = paymentMeta[item.paymentMethod] || {
                  label: item.paymentMethod,
                  icon: Wallet,
                  color: 'text-slate-600',
                  bg: 'bg-slate-50 border-slate-200',
                  bar: 'bg-slate-500',
                };
                const Icon = meta.icon;
                const percentage = totalRevenue > 0 ? (item.totalRevenue / totalRevenue) * 100 : 0;

                return (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    key={item.paymentMethod}
                    className="flex items-center gap-5 p-5 rounded-2xl border border-slate-100 hover:bg-slate-50/80 transition-all"
                  >
                    <div className={`p-4 rounded-2xl border ${meta.bg} ${meta.color} shadow-sm shrink-0`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base sm:text-lg text-slate-800">{meta.label}</h4>
                      <p className="text-xs text-slate-500 font-medium">{item.orderCount} pesanan</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                            className={`h-full ${meta.bar}`}
                          />
                        </div>
                        <p className="text-sm font-bold text-slate-500 w-14 text-right">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="text-right pl-2">
                      <span className="font-extrabold text-lg sm:text-xl text-slate-900">{formatRupiah(item.totalRevenue)}</span>
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
