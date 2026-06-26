import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { formatRupiah } from '../lib/utils';
import { Order } from '../types';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { Printer, WashingMachine } from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function Receipt() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Public endpoint — no auth needed
        const res = await apiFetch(`/api/orders/track/${orderId}`);
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          setOrder(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  /** Map backend enum to readable label */
  const paymentLabel = (method: string) => {
    const labels: Record<string, string> = {
      Tunai: 'Tunai',
      QRIS: 'QRIS',
      Transfer_Bank: 'Transfer Bank',
    };
    return labels[method] || method;
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 sm:p-8 font-sans print:bg-white print:p-0">
      <div className="mb-6 print:hidden text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-display font-bold text-slate-800 mb-2 flex items-center justify-center gap-2"
        >
          <WashingMachine className="text-blue-600" />
          <span>Nota Struk Pembayaran</span>
        </motion.h1>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:opacity-95 transition-all shadow-lg shadow-indigo-500/25 mx-auto mt-3 cursor-pointer"
        >
          <Printer size={20} /> Cetak Struk Sekarang
        </motion.button>
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-white text-slate-900 p-8 rounded-none sm:rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[85mm] font-mono text-sm print:p-0 print:m-0 print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none relative overflow-hidden"
      >
        <div className="text-center mb-6 border-b-2 border-dashed border-slate-300 pb-5">
          <h1 className="font-extrabold text-2xl mb-1 tracking-tight text-slate-900">MITRA LAUNDRY</h1>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Digital Struk UMKM</p>
        </div>

        <div className="border-b-2 border-dashed border-slate-300 pb-4 mb-5 text-xs space-y-2 font-medium">
          <div className="flex justify-between">
            <span className="text-slate-500">NO NOTA:</span>
            <span className="font-bold text-slate-900">#{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tanggal:</span>
            <span>{format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Pelanggan:</span>
            <span className="font-bold text-slate-900">{order.customer?.name || 'Umum'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Pembayaran:</span>
            <span className="font-bold text-emerald-600">{paymentLabel(order.paymentMethod)}</span>
          </div>
        </div>

        <div className="mb-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-dashed border-slate-300">
                <th className="text-left font-bold pb-2 text-slate-500 uppercase">Paket</th>
                <th className="text-right font-bold pb-2 text-slate-500 uppercase">Qty</th>
                <th className="text-right font-bold pb-2 text-slate-500 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dashed divide-slate-100 font-medium">
              {order.orderItems?.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 text-slate-800">{item.service?.name || 'Paket Laundry'}</td>
                  <td className="text-right py-2 text-slate-600">
                    {item.quantity} {item.service?.unit || ''}
                  </td>
                  <td className="text-right py-2 font-bold text-slate-900">{formatRupiah(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t-2 border-dashed border-slate-300 pt-4 flex justify-between items-center mb-8">
          <span className="font-extrabold text-slate-700 tracking-wider text-xs">TOTAL TAGIHAN</span>
          <span className="text-xl font-extrabold text-slate-900">{formatRupiah(order.totalPrice)}</span>
        </div>

        <div className="text-center text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100 font-sans">
          <p className="font-bold text-slate-800">Terima kasih atas kepercayaan Anda!</p>
          <p className="text-[10px] leading-relaxed">Cucian yang tidak diambil melebihi 30 hari di luar tanggung jawab toko.</p>
        </div>
      </motion.div>
    </div>
  );
}
