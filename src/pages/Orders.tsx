import React, { useEffect, useState } from 'react';
import { Plus, Check, Printer, ShoppingCart, X, Trash2, Sparkles } from 'lucide-react';
import { Order, OrderStatus, Customer, Service, PaymentMethod } from '../types';
import { formatRupiah, cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../lib/api';
import { SkeletonTable } from '../components/Skeleton';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [orderItems, setOrderItems] = useState<{ serviceId: string; quantity: number }[]>([
    { serviceId: '', quantity: 1 },
  ]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [ordRes, custRes, servRes] = await Promise.all([
        apiFetch('/api/orders'),
        apiFetch('/api/customers'),
        apiFetch('/api/services'),
      ]);
      const [ordData, custData, servData] = await Promise.all([
        ordRes.json(),
        custRes.json(),
        servRes.json(),
      ]);

      if (ordData.status === 'success' && ordData.data?.orders) setOrders(ordData.data.orders);
      if (custData.status === 'success' && custData.data?.customers) setCustomers(custData.data.customers);
      if (servData.status === 'success' && servData.data?.services) setServices(servData.data.services);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await apiFetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        // Refresh orders to get the full updated object
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      } else {
        alert(data.message || 'Gagal mengupdate status');
      }
    } catch {
      alert('Gagal mengupdate status');
    }
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { serviceId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'serviceId' | 'quantity', value: string | number) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const calculateTotalPreview = () => {
    return orderItems.reduce((sum, item) => {
      const service = services.find((s) => s.id === item.serviceId);
      if (!service || !item.quantity) return sum;
      return sum + service.price * item.quantity;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || orderItems.some((item) => !item.serviceId || item.quantity <= 0)) {
      setErrorMsg('Mohon lengkapi semua data pesanan dengan benar');
      return;
    }
    setSubmitLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        customerId: selectedCustomerId,
        items: orderItems,
        paymentMethod,
      };
      const res = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        // Backend returns the full order object with customer + orderItems
        const newOrder: Order = data.data.order ?? data.data;
        // If customer isn't embedded in the response, attach from our local list
        if (!newOrder.customer) {
          const c = customers.find((c) => c.id === selectedCustomerId);
          if (c) (newOrder as any).customer = c;
        }
        setOrders([newOrder, ...orders]);
        setIsModalOpen(false);
        setSelectedCustomerId('');
        setOrderItems([{ serviceId: '', quantity: 1 }]);
      } else {
        setErrorMsg(data.message || 'Gagal membuat pesanan');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      Pending: 'bg-amber-100 text-amber-800 border-amber-300 shadow-sm',
      Washing: 'bg-blue-100 text-blue-800 border-blue-300 shadow-sm animate-pulse',
      Ironing: 'bg-indigo-100 text-indigo-800 border-indigo-300 shadow-sm animate-pulse',
      Ready: 'bg-teal-100 text-teal-800 border-teal-300 shadow-sm',
      Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const statusLabels: Record<OrderStatus, string> = {
    Pending: 'Menunggu',
    Washing: 'Dicuci',
    Ironing: 'Disetrika',
    Ready: 'Siap Ambil',
    Delivered: 'Selesai',
  };

  /** 5-step status pipeline: Pending → Washing → Ironing → Ready → Delivered */
  const nextStatusOptions: Record<OrderStatus, OrderStatus[]> = {
    Pending: ['Washing'],
    Washing: ['Ironing'],
    Ironing: ['Ready'],
    Ready: ['Delivered'],
    Delivered: [],
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="space-y-8 pt-2">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-800 tracking-tight flex items-center gap-3">
            Transaksi Pesanan
            <Sparkles className="text-blue-500 h-8 w-8 animate-bounce" />
          </h1>
          <p className="text-slate-600 mt-2 text-lg font-medium">
            Buat nota baru dan pantau status cucian pelanggan secara live.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:opacity-95 transition-all shadow-lg shadow-indigo-500/25 w-full sm:w-auto justify-center cursor-pointer"
        >
          <Plus size={20} strokeWidth={3} />
          Buat Pesanan Baru
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden"
      >
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 text-slate-700 text-sm tracking-wider font-bold border-b border-slate-200">
                <th className="px-8 py-5">NOTA ID</th>
                <th className="px-8 py-5">Tanggal</th>
                <th className="px-8 py-5">Pelanggan</th>
                <th className="px-8 py-5 text-right">Total Tagihan</th>
                <th className="px-8 py-5 text-center">Status Cucian</th>
                <th className="px-8 py-5 text-right">Update / Struk</th>
              </tr>
            </thead>
            <motion.tbody variants={container} initial="hidden" animate="show" className="text-sm text-slate-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <div className="p-4">
                      <SkeletonTable rows={4} />
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-slate-500 text-lg font-semibold">
                    Belum ada transaksi. Buat pesanan pertama!
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <motion.tr
                    variants={itemAnim}
                    key={order.id}
                    className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors group"
                  >
                    <td className="px-8 py-5 font-mono font-bold text-indigo-600">#{order.id}</td>
                    <td className="px-8 py-5 text-slate-600">
                      <div className="font-bold text-slate-800">{format(new Date(order.createdAt), 'dd MMM yyyy')}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{format(new Date(order.createdAt), 'HH:mm')} WIB</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-900 text-base">{order.customer?.name || 'Pelanggan'}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{order.customer?.phone}</div>
                    </td>
                    <td className="px-8 py-5 text-right font-extrabold text-slate-900 text-base">
                      {formatRupiah(order.totalPrice)}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span
                        className={cn(
                          'px-4 py-1.5 text-xs font-bold rounded-xl border inline-block',
                          getStatusColor(order.status)
                        )}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {nextStatusOptions[order.status]?.map((nextStat) => (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            key={nextStat}
                            onClick={() => handleUpdateStatus(order.id, nextStat)}
                            className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
                          >
                            → {statusLabels[nextStat] || nextStat}
                          </motion.button>
                        ))}
                        {order.status === 'Delivered' && (
                          <span className="text-xs text-emerald-700 flex items-center gap-1 justify-end font-extrabold px-3 py-1.5 bg-emerald-100 rounded-xl border border-emerald-300">
                            <Check size={14} /> Selesai
                          </span>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => window.open(`/receipt/${order.id}`, '_blank')}
                          className="p-2 text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-100 rounded-xl transition-colors border border-slate-200 cursor-pointer ml-1"
                          title="Cetak Struk"
                        >
                          <Printer size={18} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </table>
        </div>
      </motion.div>

      {/* Create Order Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl max-w-3xl w-full p-8 relative z-10 max-h-[90vh] flex flex-col"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition-colors p-2 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
                <ShoppingCart className="text-blue-600" />
                <span>Buat Pesanan Laundry Baru</span>
              </h2>

              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-bold"
                >
                  {errorMsg}
                </motion.div>
              )}

              <form id="order-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-2 py-1 space-y-6 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Pilih Pelanggan</label>
                    <select
                      required
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 transition-all font-medium"
                    >
                      <option value="" disabled>
                        -- Pilih Pelanggan --
                      </option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Metode Pembayaran</label>
                    <select
                      required
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 transition-all font-medium"
                    >
                      <option value="Tunai">💵 Tunai / Cash</option>
                      <option value="QRIS">📱 QRIS Scan</option>
                      <option value="Transfer_Bank">🏦 Transfer Bank</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-slate-700 ml-1">Daftar Item Cucian</label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-sm text-blue-600 font-bold hover:text-indigo-600 flex items-center gap-1 cursor-pointer bg-blue-50 px-3 py-1 rounded-xl"
                    >
                      <Plus size={16} /> Tambah Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    <AnimatePresence>
                      {orderItems.map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200"
                        >
                          <div className="flex-1">
                            <select
                              required
                              value={item.serviceId}
                              onChange={(e) => handleItemChange(idx, 'serviceId', e.target.value)}
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none text-slate-800 font-medium"
                            >
                              <option value="" disabled>
                                -- Pilih Paket Layanan --
                              </option>
                              {services.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} - {formatRupiah(s.price)}/{s.unit}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-24">
                            <input
                              type="number"
                              required
                              min={1}
                              step={1}
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none text-slate-800 text-center font-bold"
                            />
                          </div>
                          {orderItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-2.5 text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 rounded-xl transition-colors cursor-pointer"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
                  <span className="font-semibold text-blue-100 text-base">Perkiraan Total Tagihan:</span>
                  <span className="text-3xl font-display font-extrabold">{formatRupiah(calculateTotalPreview())}</span>
                </div>
              </form>

              <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  form="order-form"
                  disabled={submitLoading}
                  className="px-6 py-3.5 text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl font-bold hover:opacity-95 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
                >
                  {submitLoading ? 'Memproses...' : 'Simpan Transaksi Pesanan'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
