import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WashingMachine, Lock, Mail, User, Store, Phone, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { apiFetch } from '../lib/api';

export default function Register() {
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ storeName, ownerName, email, password, phone, address }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('tenant', JSON.stringify(data.data.tenant));
        navigate('/');
      } else {
        setError(data.message || 'Registrasi gagal');
      }
    } catch {
      setError('Terjadi kesalahan koneksi ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative colorful blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-300/30 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-purple-300/30 blur-3xl animate-pulse delay-700" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-pink-300/30 blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10"
      >
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20 text-white mb-6">
          <WashingMachine size={32} />
        </div>
        <h2 className="text-center text-3xl font-display font-bold text-slate-800">
          Daftar Mitra Laundry
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Kelola bisnis laundry UMKM Anda dengan mudah &amp; praktis
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10"
      >
        <div className="bg-white/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            {/* Store Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Nama Toko Laundry
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Store size={18} />
                </div>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Contoh: Berkah Laundry Bersih"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Nama Pemilik
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Email
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi@email.com"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Nomor Telepon
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Alamat Toko
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute top-3.5 left-0 pl-4 flex items-start pointer-events-none text-slate-400">
                  <MapPin size={18} />
                </div>
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Merdeka No. 1, Kota..."
                  rows={2}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-lg shadow-blue-500/25 text-sm font-bold text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? 'Mendaftarkan Toko...' : 'Daftar Sekarang'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Sudah punya akun toko?{' '}
              <Link to="/login" className="font-bold text-blue-600 hover:text-indigo-600 transition-colors">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
