import React, { useState, useEffect } from 'react';
import { Store, User, Camera, Lock, Save, Check, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { apiFetch } from '../lib/api';

export default function Profile() {
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [username, setUsername] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const presetPhotos = [
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await apiFetch('/api/profile');
      const data = await res.json();
      if (data.success && data.data) {
        setStoreName(data.data.storeName || '');
        setOwnerName(data.data.ownerName || '');
        setUsername(data.data.username || '');
        setPhotoUrl(data.data.photoUrl || '');
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok!' });
      return;
    }

    setLoading(true);

    try {
      const body: any = {
        storeName,
        ownerName,
        photoUrl
      };

      if (newPassword) {
        body.password = newPassword;
        body.currentPassword = currentPassword;
      }

      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profil & pengaturan toko berhasil diperbarui!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Update local storage user
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...storedUser,
          storeName: data.data.storeName,
          ownerName: data.data.ownerName,
          photoUrl: data.data.photoUrl
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal memperbarui profil' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan koneksi ke server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles size={14} /> Pengaturan Toko
          </div>
          <h1 className="text-3xl font-display font-bold">Profil Usaha & Keamanan</h1>
          <p className="text-blue-100 mt-1">Sesuaikan identitas toko laundry Anda</p>
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl flex items-center gap-3 font-medium text-sm shadow-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? <Check size={20} className="text-emerald-500 shrink-0" /> : <AlertCircle size={20} className="text-red-500 shrink-0" />}
          <span>{message.text}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-100 space-y-6">
          <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2 pb-4 border-b border-slate-100">
            <Store className="text-blue-500" size={22} /> Informasi Toko
          </h2>

          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 p-1 shadow-md">
                <div className="w-full h-full bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center text-slate-400 font-bold text-2xl">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Store avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{storeName.charAt(0) || 'T'}</span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg">
                <Camera size={14} />
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                Pilih Foto Profil Toko (Atau masukkan URL Foto)
              </label>
              <div className="flex flex-wrap gap-2">
                {presetPhotos.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPhotoUrl(url)}
                    className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all ${
                      photoUrl === url ? 'border-blue-600 scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Preset ${index}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://contoh.com/foto.jpg"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Nama Toko Laundry
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Nama Pemilik (Owner)
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Username Login
              </label>
              <input
                type="text"
                disabled
                value={username}
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 cursor-not-allowed font-mono"
              />
              <span className="text-xs text-slate-400 mt-1 block">*Username tidak dapat diubah</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-100 space-y-6">
          <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2 pb-4 border-b border-slate-100">
            <Lock className="text-purple-500" size={22} /> Ganti Password
          </h2>
          <p className="text-sm text-slate-500 -mt-2">Biarkan kosong jika Anda tidak ingin mengubah password akun.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Password Saat Ini
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan password lama"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Password Baru
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save size={20} />
            <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
