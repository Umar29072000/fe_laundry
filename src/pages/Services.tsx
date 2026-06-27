import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Tag, X, Sparkles } from 'lucide-react';
import { Service } from '../types';
import { formatRupiah } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../lib/api';
import SkeletonCard from '../components/Skeleton';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', unit: 'kg' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const cardGradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-emerald-500 to-teal-500',
    'from-indigo-500 to-violet-500',
    'from-rose-500 to-red-500',
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/services');
      const data = await res.json();
      if (data.status === 'success' && data.data?.services) {
        setServices(data.data.services);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        unit: formData.unit,
      };
      const res = await apiFetch('/api/services', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        // Backend may return data.data.service or data.data directly
        const newService: Service = data.data.service ?? data.data;
        setServices([...services, newService]);
        setIsModalOpen(false);
        setFormData({ name: '', price: '', unit: 'kg' });
      } else {
        setErrorMsg(data.message || 'Gagal menambahkan layanan');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus paket layanan ini?')) return;
    try {
      const res = await apiFetch(`/api/services/${id}`, { method: 'DELETE' });
      // 204 No Content
      if (res.status === 204 || res.ok) {
        setServices(services.filter((s) => s.id !== id));
      } else {
        const data = await res.json();
        alert(data.message || 'Gagal menghapus layanan');
      }
    } catch {
      alert('Terjadi kesalahan');
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemAnim = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
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
            Paket Layanan
            <Sparkles className="text-purple-500 h-8 w-8 animate-bounce" />
          </h1>
          <p className="text-slate-600 mt-2 text-lg font-medium">Atur jenis cucian dan tarif laundry UMKM Anda.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-2xl font-bold hover:opacity-95 transition-all shadow-lg shadow-pink-500/25 w-full sm:w-auto justify-center cursor-pointer"
        >
          <Plus size={20} strokeWidth={3} />
          Tambah Paket Layanan
        </motion.button>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {loading ? (
          <div className="col-span-full">
            <SkeletonCard count={3} />
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
            <Tag size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg font-medium">Belum ada paket layanan tersedia.</p>
            <p className="text-slate-400 text-sm mt-1">Tambahkan paket layanan pertama Anda.</p>
          </div>
        ) : (
          services.map((service, idx) => {
            const grad = cardGradients[idx % cardGradients.length];
            return (
              <motion.div
                variants={itemAnim}
                whileHover={{ y: -6, scale: 1.02 }}
                key={service.id}
                className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-100 rounded-full blur-3xl group-hover:bg-pink-100 transition-colors pointer-events-none" />

                <div className="z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${grad} flex items-center justify-center text-white shadow-md`}>
                      <Tag size={22} />
                    </div>
                    <span className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl uppercase tracking-wider">
                      / {service.unit}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-slate-800 tracking-tight mb-2">{service.name}</h3>
                  <p className={`text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${grad}`}>
                    {formatRupiah(service.price)}
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end z-10">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(service.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                    <span>Hapus Paket</span>
                  </motion.button>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Add Service Modal */}
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
              className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 relative z-10"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition-colors p-2 hover:bg-slate-100 rounded-xl"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Tag className="text-purple-600" />
                <span>Tambah Paket Baru</span>
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

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Nama Paket Layanan</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 transition-all"
                    placeholder="Contoh: Cuci Setrika Express"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Tarif Harga (Rp)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 transition-all"
                    placeholder="7000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Satuan Hitungan</label>
                  <select
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 transition-all"
                  >
                    <option value="kg">Per Kilogram (kg)</option>
                    <option value="pcs">Per Satuan Potong (pcs)</option>
                    <option value="item">Per Item (item)</option>
                  </select>
                </div>
                <div className="flex gap-3 justify-end mt-8">
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
                    disabled={submitLoading}
                    className="px-6 py-3.5 text-white bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-2xl font-bold hover:opacity-95 disabled:opacity-50 transition-all shadow-lg shadow-pink-500/25 cursor-pointer"
                  >
                    {submitLoading ? 'Menyimpan...' : 'Simpan Paket'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
