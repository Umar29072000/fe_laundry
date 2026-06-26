import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { WashingMachine, CheckCircle, Sparkles, MapPin } from 'lucide-react';
import { formatRupiah, cn } from '../lib/utils';
import { Order, Customer, Service } from '../types';
import { motion } from 'motion/react';
import { apiFetch } from '../lib/api';

type OrderTrackingData = Order & { customer: Customer; services: Service[] };

export default function TrackOrder() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await apiFetch(`/api/orders/track/${orderId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setOrder(data.data);
        } else {
          setError(data.message || 'Pesanan tidak ditemukan');
        }
      } catch (err) {
        setError('Terjadi kesalahan jaringan');
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-2xl border border-red-200 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-display font-bold">!</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-800 mb-3">Pesanan Tidak Ditemukan</h2>
          <p className="text-slate-500 font-medium">{error || 'Periksa kembali nomor NOTA pesanan Anda'}</p>
        </motion.div>
      </div>
    );
  }

  const statuses = ['Pending', 'Washing', 'Drying', 'Ironing', 'Folding', 'Packing', 'Completed', 'Delivered'];
  const statusIndo: Record<string, string> = {
    'Pending': 'Menunggu Diproses',
    'Washing': 'Sedang Dicuci Bersih',
    'Drying': 'Sedang Dikeringkan Mesin',
    'Ironing': 'Sedang Disetrika Rapih',
    'Folding': 'Sedang Dilipat Wangi',
    'Packing': 'Sedang Dikemas Rapi',
    'Completed': 'Siap Diambil Pelanggan',
    'Delivered': 'Selesai & Diserahkan'
  };

  const currentStatusIndex = statuses.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/70 via-purple-50/50 to-pink-50/70 font-sans pb-16 text-slate-800">
      {/* Top Colorful Gradient Banner */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 pb-28 pt-16 px-4 sm:px-6 lg:px-8 text-center text-white relative overflow-hidden shadow-lg"
      >
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 blur-3xl rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div 
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl text-indigo-600"
          >
            <WashingMachine className="w-10 h-10" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight mb-3">Live Tracking Laundry</h1>
          <p className="text-blue-100 text-lg font-medium">
            Nomor NOTA: <span className="font-mono bg-white/20 px-3.5 py-1 rounded-xl font-bold tracking-wider ml-1">{order.id}</span>
          </p>
        </div>
      </motion.div>

      <div className="max-w-3xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 -mt-14 relative z-20">
        
        {/* Status Tracker Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[2.5rem] shadow-2xl border border-white p-8 md:p-10"
        >
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <h2 className="text-2xl font-display font-bold text-slate-800 flex items-center gap-2.5">
              <MapPin className="text-blue-600" />
              <span>Status Pengerjaan Cucian</span>
            </h2>
            {order.status === 'Delivered' && (
              <span className="text-sm font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-300 px-4 py-1.5 rounded-xl">
                ✨ Selesai Diambil
              </span>
            )}
          </div>
          
          <div className="relative pl-3 pt-2">
            {/* Vertical line connecting steps */}
            <div className="absolute left-[30px] top-8 bottom-8 w-1 bg-slate-100 rounded-full" />
            
            <div className="space-y-8 relative">
              {statuses.map((status, idx) => {
                const isCompleted = idx < currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.08) }}
                    key={status} 
                    className="flex items-center group"
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center border-2 z-10 shrink-0 transition-all duration-300 font-bold",
                      isCompleted ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20" :
                      isCurrent ? "border-blue-600 bg-blue-600 text-white scale-110 shadow-lg shadow-blue-600/30 ring-4 ring-blue-100" :
                      "border-slate-200 bg-white text-slate-400"
                    )}>
                      {isCompleted ? <CheckCircle size={22} strokeWidth={2.5} /> : 
                      isCurrent ? <Sparkles size={22} className="animate-spin" /> : 
                      <span className="text-sm font-mono">{idx + 1}</span>}
                    </div>
                    <div className="ml-5 flex-1">
                      <h3 className={cn(
                        "text-base sm:text-lg font-bold transition-colors duration-300",
                        isCompleted ? "text-slate-800" : 
                        isCurrent ? "text-blue-600 text-lg sm:text-xl font-extrabold" : 
                        "text-slate-400"
                      )}>
                        {statusIndo[status]}
                      </h3>
                      {isCurrent && (
                        <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md inline-block mt-1">
                          🟢 Tahap Sekarang
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Order Details Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-10"
        >
          <h2 className="text-xl font-display font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">
            Rincian Item & Tagihan
          </h2>
          <div className="space-y-5">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
              <span className="text-slate-500 font-semibold text-sm">Nama Pelanggan</span>
              <span className="font-bold text-slate-900 text-lg">{order.customer?.name || 'Pelanggan'}</span>
            </div>
            
            <div className="space-y-3 pt-1">
              {order.items.map((item, i) => {
                const service = order.services?.find(s => s.id === item.serviceId);
                return (
                  <div key={i} className="flex justify-between items-center bg-white border border-slate-100 shadow-sm p-4 rounded-2xl hover:border-blue-200 transition-all">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-base">{service?.name || 'Paket Cucian'}</span>
                      <span className="text-slate-500 font-medium text-xs mt-0.5">{item.quantity} {service?.unit || 'x'}</span>
                    </div>
                    <span className="font-extrabold text-indigo-600 text-lg">{formatRupiah(item.subtotal)}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between pt-6 mt-2 border-t border-slate-100 items-center">
              <span className="text-slate-600 font-bold uppercase tracking-wider text-sm">Total Tagihan</span>
              <span className="text-3xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {formatRupiah(order.totalPrice)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
