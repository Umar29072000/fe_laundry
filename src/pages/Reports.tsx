import { useEffect, useState } from 'react';
import { formatRupiah } from '../lib/utils';
import { PieChart, Wallet, CreditCard, Landmark, TrendingUp, BarChart2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { apiFetch } from '../lib/api';

export default function Reports() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await apiFetch('/api/reports');
        const data = await res.json();
        if (data.success) {
          setReport(data.data);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!report) {
    return <div className="text-center py-12 text-slate-500 font-semibold">Gagal memuat laporan keuangan.</div>;
  }

  const cards = [
    { title: 'Total Pendapatan Bersih', value: formatRupiah(report.totalRevenue), icon: TrendingUp, color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/20', text: 'text-blue-600' },
    { title: 'Total Pesanan Selesai', value: report.completedOrdersCount, icon: PieChart, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20', text: 'text-emerald-600' },
  ];

  const paymentBreakdown = [
    { method: 'Tunai / Cash', value: report.revenueTunai, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500' },
    { method: 'QRIS Scan', value: report.revenueQris, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', bar: 'bg-blue-500' },
    { method: 'Transfer Bank', value: report.revenueTransfer, icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', bar: 'bg-purple-500' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-10 pt-2">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-800 tracking-tight flex items-center gap-3">
            Laporan Keuangan
            <Sparkles className="text-indigo-600 h-8 w-8 animate-bounce" />
          </h1>
          <p className="text-slate-600 mt-2 text-lg font-medium">Rekapitulasi pendapatan toko laundry dari pesanan selesai.</p>
        </div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {cards.map((card, index) => {
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
          <div className="space-y-4">
            {paymentBreakdown.map((item, idx) => {
              const Icon = item.icon;
              const percentage = report.totalRevenue > 0 ? (item.value / report.totalRevenue) * 100 : 0;
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  key={idx} 
                  className="flex items-center gap-5 p-5 rounded-2xl border border-slate-100 hover:bg-slate-50/80 transition-all"
                >
                  <div className={`p-4 rounded-2xl border ${item.bg} ${item.color} shadow-sm shrink-0`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base sm:text-lg text-slate-800">{item.method}</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                          className={`h-full ${item.bar}`}
                        />
                      </div>
                      <p className="text-sm font-bold text-slate-500 w-14 text-right">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="text-right pl-2">
                    <span className="font-extrabold text-lg sm:text-xl text-slate-900">{formatRupiah(item.value)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
