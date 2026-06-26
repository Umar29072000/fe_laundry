import React, { useState, useEffect, useRef } from 'react';
import { Store, User, Camera, Lock, Save, Check, AlertCircle, Sparkles, Phone, MapPin, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../lib/api';
import { Tenant } from '../types';

export default function Profile() {
  const [tenant, setTenant] = useState<Tenant | null>(null);

  // Profile form
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Password form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Photo upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await apiFetch('/api/auth/profile');
      const data = await res.json();
      if (data.status === 'success' && data.data?.tenant) {
        const t: Tenant = data.data.tenant;
        setTenant(t);
        setStoreName(t.storeName || '');
        setOwnerName(t.ownerName || '');
        setPhone(t.phone || '');
        setAddress(t.address || '');
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    }
  };

  /** Upload photo via multipart/form-data */
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran foto maksimal 5MB.' });
      return;
    }

    // Show local preview
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploadLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await apiFetch('/api/auth/profile-picture', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.status === 'success' && data.data?.tenant) {
        const updated: Tenant = data.data.tenant;
        setTenant(updated);
        // Sync localStorage
        localStorage.setItem('tenant', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        setMessage({ type: 'success', text: 'Foto profil berhasil diperbarui!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal mengupload foto' });
        setPhotoPreview(null);
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat upload foto' });
      setPhotoPreview(null);
    } finally {
      setUploadLoading(false);
    }
  };

  /** Update profile info */
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ storeName, ownerName, phone, address }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        const updated: Tenant = data.data.tenant;
        setTenant(updated);
        localStorage.setItem('tenant', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        setMessage({ type: 'success', text: 'Profil toko berhasil diperbarui!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal memperbarui profil' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan koneksi ke server' });
    } finally {
      setLoading(false);
    }
  };

  /** Change password separately */
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok!' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password baru minimal 6 karakter.' });
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        setMessage({ type: 'success', text: 'Password berhasil diperbarui!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal mengganti password' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan koneksi ke server' });
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc = photoPreview || tenant?.profilePictureUrl;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pt-2">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles size={14} /> Pengaturan Toko
          </div>
          <h1 className="text-3xl font-display font-bold">Profil Usaha &amp; Keamanan</h1>
          <p className="text-blue-100 mt-1">Sesuaikan identitas toko laundry Anda</p>
        </div>
      </div>

      {/* Feedback Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-center gap-3 font-medium text-sm shadow-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <Check size={20} className="text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-red-500 shrink-0" />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Profile Info Form ── */}
      <form onSubmit={handleProfileSubmit} className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-100 space-y-6">
        <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2 pb-4 border-b border-slate-100">
          <Store className="text-blue-500" size={22} /> Informasi Toko
        </h2>

        {/* Photo Upload */}
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 p-1 shadow-md">
              <div className="w-full h-full bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center text-slate-400 font-bold text-2xl relative">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Store avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{storeName.charAt(0) || 'T'}</span>
                )}
                {uploadLoading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl shadow-lg transition-colors cursor-pointer"
              title="Ganti foto profil"
            >
              <Camera size={14} />
            </button>
          </div>

          <div className="flex-1 space-y-2">
            <p className="text-sm font-semibold text-slate-700">Foto Profil Toko</p>
            <p className="text-xs text-slate-500">Format JPG, PNG, WebP. Maks. 5MB.</p>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Upload size={16} />
              {uploadLoading ? 'Mengupload...' : 'Pilih Foto'}
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Store size={14} className="text-slate-400" /> Nama Toko Laundry
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <User size={14} className="text-slate-400" /> Nama Pemilik (Owner)
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
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Phone size={14} className="text-slate-400" /> Nomor Telepon
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-400" /> Alamat Toko
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save size={20} />
            <span>{loading ? 'Menyimpan...' : 'Simpan Profil'}</span>
          </button>
        </div>
      </form>

      {/* ── Change Password Form ── */}
      <form onSubmit={handlePasswordSubmit} className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-100 space-y-6">
        <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2 pb-4 border-b border-slate-100">
          <Lock className="text-purple-500" size={22} /> Ganti Password
        </h2>
        <p className="text-sm text-slate-500 -mt-2">Biarkan kosong jika tidak ingin mengubah password.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password Saat Ini</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Password lama"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || (!oldPassword && !newPassword)}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/25 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Lock size={20} />
            <span>{loading ? 'Menyimpan...' : 'Ganti Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
