import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Order } from '../types';
import { motion } from 'motion/react';
import { Printer, Share2, Download, QrCode, ChevronDown } from 'lucide-react';
import { apiFetch } from '../lib/api';
import ThermalReceipt from '../components/ThermalReceipt';

export default function Receipt() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await apiFetch(`/api/orders/track/${orderId}`);
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          setOrder(data.data.order || data.data);
        } else {
          setError(data.message || 'Pesanan tidak ditemukan');
        }
      } catch {
        setError('Terjadi kesalahan koneksi jaringan');
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWA = () => {
    if (!order) return;
    const storeName = order.tenant?.storeName || 'MITRA LAUNDRY';
    const trackingUrl = `${window.location.origin}/track/${order.id}`;
    const items = order.orderItems?.map(
      (i) => `• ${i.service?.name || 'Paket'}: ${i.quantity} ${i.service?.unit || ''} - Rp ${i.subtotal.toLocaleString('id-ID')}`
    ).join('\n') || '';
    const message = `🧺 *NOTA LAUNDRY - ${storeName}*\n\n` +
      `ID Pesanan: #${order.id}\n` +
      `Pelanggan: ${order.customer?.name || '-'}\n` +
      `Total: Rp ${order.totalPrice.toLocaleString('id-ID')}\n\n` +
      `📋 *Rincian:*\n${items}\n\n` +
      `📍 *Lacak pesanan:*\n${trackingUrl}\n\n` +
      `Terima kasih telah mempercayakan cucian Anda kepada kami! ❤️`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleDownload = () => {
    if (!receiptRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Nota Laundry - ${order?.id}</title>
          <link rel="stylesheet" href="${window.location.origin}${import.meta.env.BASE_URL}src/index.css" />
          <style>
            body { margin: 0; padding: 0; background: white; display: flex; justify-content: center; }
            @page { margin: 0; size: 80mm auto; }
          </style>
        </head>
        <body>
          ${receiptRef.current.innerHTML}
          <script>window.onload = function() { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-red-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-3">Gagal Memuat Struk</h2>
          <p className="text-slate-500 font-medium">{error || 'Struk tidak ditemukan'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center p-4 sm:p-8 font-sans">
      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg mb-6 space-y-3 print:hidden"
      >
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-800 flex items-center justify-center gap-2">
          🧺 Nota Pembayaran
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <Printer size={16} /> Cetak
          </button>
          <button
            onClick={handleShareWA}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-green-500/20 cursor-pointer"
          >
            <Share2 size={16} /> Bagikan WA
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-700 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-slate-500/20 cursor-pointer"
          >
            <Download size={16} /> Download PDF
          </button>
        </div>
      </motion.div>

      {/* Receipt Preview Toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setShowPreview(!showPreview)}
        className="print:hidden flex items-center gap-1 text-xs text-slate-500 mb-4 hover:text-slate-700 transition-colors cursor-pointer"
      >
        <QrCode size={14} />
        {showPreview ? 'Sembunyikan' : 'Lihat'} QR & Detail Lengkap
        <ChevronDown size={14} className={`transition-transform ${showPreview ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Receipt Card */}
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div ref={receiptRef}>
          <ThermalReceipt order={order} />
        </div>
      </motion.div>

      {/* Additional QR & Info (toggle) */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-5 bg-white rounded-2xl shadow-lg border border-slate-200 w-full max-w-sm print:hidden"
        >
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <QrCode size={16} className="text-blue-600" />
            Scan untuk Lacak Pesanan
          </h3>
          <div className="flex justify-center mb-3">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/track/${order.id}`)}`}
              alt="QR Code"
              className="rounded-lg shadow-sm"
              crossOrigin="anonymous"
            />
          </div>
          <p className="text-center text-xs text-blue-600 font-mono break-all">
            {window.location.origin}/track/{order.id}
          </p>
          <p className="text-center text-[10px] text-slate-400 mt-2">
            Scan QR code di atas untuk melacak status pesanan
          </p>
        </motion.div>
      )}
    </div>
  );
}
