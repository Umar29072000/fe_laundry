import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Search, Sparkles, X } from 'lucide-react';
import { Customer, ApiResponse } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../lib/api';

export default function Customers() {
 const [customers, setCustomers] = useState<Customer[]>([]);
 const [loading, setLoading] = useState(true);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
 const [submitLoading, setSubmitLoading] = useState(false);
 const [errorMsg, setErrorMsg] = useState('');
 const [searchQuery, setSearchQuery] = useState('');

 useEffect(() => {
 fetchCustomers();
 }, []);

 const fetchCustomers = async () => {
 try {
 setLoading(true);
 const res = await apiFetch('/api/customers');
 const data: ApiResponse<Customer[]> = await res.json();
 if (data.success && data.data) {
 setCustomers(data.data);
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
 const res = await apiFetch('/api/customers', {
 method: 'POST',
 body: JSON.stringify(formData),
 });
 const data: ApiResponse<Customer> = await res.json();
 if (data.success && data.data) {
 setCustomers([...customers, data.data]);
 setIsModalOpen(false);
 setFormData({ name: '', email: '', phone: '', address: '' });
 } else {
 setErrorMsg(data.message);
 }
 } catch (err) {
 setErrorMsg('Terjadi kesalahan jaringan');
 } finally {
 setSubmitLoading(false);
 }
 };

 const handleDelete = async (id: string) => {
 if (!confirm('Hapus pelanggan ini?')) return;
 try {
 const res = await apiFetch(`/api/customers/${id}`, { method: 'DELETE' });
 const data: ApiResponse = await res.json();
 if (data.success) {
 setCustomers(customers.filter(c => c.id !== id));
 } else {
 alert(data.message);
 }
 } catch (err) {
 alert('Terjadi kesalahan');
 }
 };

 const filteredCustomers = customers.filter(c => 
 c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
 c.phone.includes(searchQuery)
 );

 const container = {
 hidden: { opacity: 0 },
 show: {
 opacity: 1,
 transition: { staggerChildren: 0.05 }
 }
 };

 const itemAnim = {
 hidden: { opacity: 0, y: 10 },
 show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
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
 Pelanggan
 <Sparkles className="text-indigo-500 h-8 w-8 animate-bounce" />
 </h1>
 <p className="text-slate-600 mt-2 text-lg font-medium">Kelola direktori kontak pelanggan Anda.</p>
 </div>
 <motion.button 
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 onClick={() => setIsModalOpen(true)}
 className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:opacity-95 transition-all shadow-lg shadow-indigo-500/25 w-full sm:w-auto justify-center cursor-pointer"
 >
 <Plus size={20} strokeWidth={2.5} />
 Tambah Pelanggan
 </motion.button>
 </motion.div>

 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="bg-white border border-slate-100 rounded-[2rem] shadow-2xl overflow-hidden"
 >
 <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="relative w-full sm:w-96">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
 <input 
 type="text" 
 placeholder="Cari nama atau nomor telepon..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400 transition-all font-medium"
 />
 </div>
 </div>
 
 <div className="overflow-x-auto min-h-[400px]">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 text-slate-500 text-sm tracking-wider font-semibold border-b border-slate-100">
 <th className="px-8 py-5">Nama</th>
 <th className="px-8 py-5">Kontak</th>
 <th className="px-8 py-5">Alamat</th>
 <th className="px-8 py-5 text-right">Aksi</th>
 </tr>
 </thead>
 <motion.tbody 
 variants={container}
 initial="hidden"
 animate="show"
 className="text-sm text-slate-700"
 >
 {loading ? (
 <tr><td colSpan={4} className="p-12 text-center text-slate-500">
 <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
 </td></tr>
 ) : filteredCustomers.length === 0 ? (
 <tr><td colSpan={4} className="p-12 text-center text-slate-500 text-lg">Belum ada pelanggan ditemukan.</td></tr>
 ) : (
 filteredCustomers.map(customer => (
 <motion.tr 
 variants={itemAnim}
 key={customer.id} 
 className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
 >
 <td className="px-8 py-5">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 text-blue-600 flex items-center justify-center font-bold border border-blue-200">
 {customer.name.charAt(0).toUpperCase()}
 </div>
 <span className="font-bold text-slate-800 text-base">{customer.name}</span>
 </div>
 </td>
 <td className="px-8 py-5">
 <div className="font-mono text-slate-700">{customer.phone}</div>
 <div className="text-slate-400 mt-1">{customer.email}</div>
 </td>
 <td className="px-8 py-5">
 <div className="max-w-xs truncate">{customer.address}</div>
 </td>
 <td className="px-8 py-5 text-right">
 <motion.button 
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.9 }}
 onClick={() => handleDelete(customer.id)}
 className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
 >
 <Trash2 size={20} />
 </motion.button>
 </td>
 </motion.tr>
 ))
 )}
 </motion.tbody>
 </table>
 </div>
 </motion.div>

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
 className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition-colors p-2 hover:bg-slate-100 rounded-xl cursor-pointer"
 >
 <X size={24} />
 </button>
 
 <h2 className="text-2xl font-display font-bold text-slate-800 mb-6">Tambah Pelanggan Baru</h2>
 
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
 <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Nama Lengkap</label>
 <input 
 required
 type="text" 
 value={formData.name}
 onChange={(e) => setFormData({...formData, name: e.target.value})}
 className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 transition-all font-medium" 
 placeholder="Contoh: Budi Santoso"
 />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Email</label>
 <input 
 required
 type="email" 
 value={formData.email}
 onChange={(e) => setFormData({...formData, email: e.target.value})}
 className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 transition-all font-medium" 
 placeholder="budi@example.com"
 />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Nomor Telepon</label>
 <input 
 required
 type="tel" 
 value={formData.phone}
 onChange={(e) => setFormData({...formData, phone: e.target.value})}
 className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 transition-all font-medium" 
 placeholder="0812xxxx"
 />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Alamat</label>
 <textarea 
 required
 value={formData.address}
 onChange={(e) => setFormData({...formData, address: e.target.value})}
 className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none h-28 text-slate-800 transition-all resize-none font-medium" 
 placeholder="Alamat lengkap..."
 />
 </div>
 <div className="flex gap-4 justify-end mt-8 pt-6 border-t border-slate-100">
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
 className="px-6 py-3.5 text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl font-bold hover:opacity-95 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
 >
 {submitLoading ? 'Menyimpan...' : 'Simpan Pelanggan'}
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
