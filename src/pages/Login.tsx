import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WashingMachine, Lock, Mail, ArrowRight, Sparkles, Shirt, Wind } from 'lucide-react';
import { motion } from 'motion/react';
import { apiFetch } from '../lib/api';

const floatingIcons = [
  { icon: '🧺', x: '10%', y: '15%', delay: 0, size: 40 },
  { icon: '👕', x: '85%', y: '20%', delay: 0.5, size: 35 },
  { icon: '🧦', x: '15%', y: '75%', delay: 1, size: 30 },
  { icon: '✨', x: '80%', y: '70%', delay: 1.5, size: 28 },
  { icon: '🧴', x: '90%', y: '10%', delay: 2, size: 32 },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.status === 'success') {
        sessionStorage.setItem('auth_token', data.token);
        sessionStorage.setItem('tenant', JSON.stringify(data.data.tenant));
        navigate('/');
      } else {
        setError(data.message || 'Login gagal. Periksa email dan password Anda.');
      }
    } catch {
      setError('Terjadi kesalahan koneksi ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950 flex flex-col lg:flex-row relative overflow-hidden">
      {/* Floating icons */}
      {floatingIcons.map((item, i) => (
        <motion.div
          key={i}
          className="absolute hidden md:block pointer-events-none z-0"
          style={{ left: item.x, top: item.y, fontSize: item.size }}
          animate={{ y: [0, -15, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, delay: item.delay, ease: 'easeInOut' }}
        >
          {item.icon}
        </motion.div>
      ))}

      {/* Left side - Illustration (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 flex-col justify-center items-center text-white relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <div className="w-24 h-24 bg-white/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 backdrop-blur-sm shadow-2xl">
            <WashingMachine size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold mb-4">Laundry Management</h1>
          <p className="text-blue-200 text-lg max-w-md mx-auto leading-relaxed">
            Sistem kasir & manajemen laundry UMKM Indonesia. Kelola pelanggan, pesanan, dan laporan keuangan dalam satu platform.
          </p>
          <div className="flex gap-3 justify-center mt-10">
            {['🧺 Cuci Bersih', '👕 Setrika Rapih', '✨ Wangi & Rapi'].map((item, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 text-sm font-semibold border border-white/20"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>
        {/* Decorative circles */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20 text-white mb-4">
              <WashingMachine size={32} />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-white">
              Masuk Kelola Laundry
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Sistem Kasir & Manajemen UMKM Laundry Indonesia
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/60 dark:border-slate-700/60">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
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
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-lg shadow-blue-500/25 text-sm font-bold text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Memeriksa...' : 'Masuk Sekarang'}
                <ArrowRight size={18} />
              </motion.button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-slate-100 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Belum mendaftarkan toko Anda?{' '}
                <Link to="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:text-indigo-600 transition-colors">
                  Daftar Mitra UMKM
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
