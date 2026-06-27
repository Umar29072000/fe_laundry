# 🧺 LaundryKu — Frontend Aplikasi Kasir & Manajemen Laundry Modern

<div align="center">

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Recharts](https://img.shields.io/badge/Recharts-FF6C37?style=for-the-badge&logo=recharts&logoColor=white)](https://recharts.org/)
[![Motion](https://img.shields.io/badge/Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://motion.dev/)

</div>

---

**LaundryKu** adalah aplikasi kasir (POS) dan manajemen operasional laundry modern berbasis web. Dibangun dengan React + TypeScript + Tailwind CSS, dirancang khusus untuk membantu pemilik toko laundry mengelola bisnis mereka secara efisien.

🌐 **Live Demo:** [https://app.liveonline.codes](https://app.liveonline.codes)

---

## ✨ Fitur Unggulan

### 📊 Dashboard Interaktif
- Kartu pendapatan (hari ini, minggu ini, bulan ini, total)
- Kartu ringkasan interaktif (klik navigasi ke halaman terkait)
- Grafik status pesanan dengan progress bar animasi
- Daftar pesanan terbaru dengan metode pembayaran

### 👥 Manajemen Pelanggan
- Pencatatan data pelanggan (nama, telepon, email, alamat)
- Pencarian pelanggan real-time
- Hapus pelanggan

### 🛠️ Manajemen Layanan
- Kelola paket layanan laundry (nama, harga, satuan)
- Tampilan grid card yang rapi

### 🛍️ Transaksi Kasir (Pesanan)
- Buat pesanan baru dengan multi-layanan
- Kalkulasi otomatis total harga
- Pilihan metode pembayaran (Tunai, QRIS, Transfer Bank)
- Update status pesanan (Pending → Washing → Ironing → Ready → Delivered)
- Cetak struk thermal (58mm/80mm)
- Kirim struk via WhatsApp
- Kirim email invoice ke pelanggan

### 📍 Tracking Pesanan Publik
- Halaman tracking tanpa login untuk pelanggan
- Progress status real-time dengan animasi
- Rincian tagihan

### 📈 Laporan Keuangan Detail
- Filter periode (Semua, 1 Tahun, 1 Bulan, 1 Minggu)
- Grafik pendapatan harian (AreaChart interaktif dengan tooltip)
- Breakdown per layanan (bar chart)
- Distribusi status pesanan
- Breakdown metode pembayaran

### 🎨 Pengalaman Pengguna Premium
- **Sidebar collapsible** — minimize/maximize navigasi
- **Toast notifications** — notifikasi sukses/error snackbar
- **Skeleton loading** — shimmer animation saat load data
- **Empty state** — tampilan menarik saat belum ada data
- **Transisi halaman** — animasi smooth antar halaman
- **Favicon kustom** — icon mesin cuci gradient
- **Responsive design** — optimal di desktop & mobile

---

## 💻 Kecocokan Browser

| Google Chrome | Mozilla Firefox | Safari | Microsoft Edge | Opera |
| :---: | :---: | :---: | :---: | :---: |
| ✅ Optimal | ✅ Optimal | ✅ Optimal | ✅ Optimal | ✅ Optimal |

---

## 🛠️ Instalasi Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)

### Langkah-langkah

1. **Clone repositori**
   ```bash
   git clone https://github.com/Umar29072000/fe_laundry.git
   cd fe_laundry
   ```

2. **Install dependensi**
   ```bash
   npm install
   ```

3. **Buat file `.env`**
   ```env
   VITE_API_URL=https://api-backend-anda.com
   ```

4. **Jalankan development server**
   ```bash
   npm run dev
   ```

5. **Buka browser** → [http://localhost:5173](http://localhost:5173)

---

## 📁 Struktur Folder

```text
fe-laundry/
├── public/
│   ├── favicon.svg           # Favicon mesin cuci
│   ├── og-image.png          # Gambar Open Graph (social share)
│   ├── robots.txt            # Konfigurasi crawler Google
│   └── sitemap.xml           # Sitemap untuk SEO
├── src/
│   ├── components/
│   │   ├── Layout.tsx         # Layout utama (sidebar collapsible, dark mode)
│   │   ├── Toast.tsx          # Notifikasi snackbar global
│   │   ├── EmptyState.tsx     # Komponen tampilan kosong
│   │   ├── Skeleton.tsx       # Skeleton loading (card, table, line)
│   │   └── ThermalReceipt.tsx # Template cetak struk thermal
│   ├── lib/
│   │   ├── api.ts             # API fetch helper (with auth)
│   │   └── utils.ts           # Utility (formatRupiah, cn)
│   ├── pages/
│   │   ├── Login.tsx          # Halaman login dengan ilustrasi
│   │   ├── Register.tsx       # Halaman registrasi
│   │   ├── Dashboard.tsx      # Dashboard utama interaktif
│   │   ├── Customers.tsx      # Manajemen pelanggan
│   │   ├── Services.tsx       # Manajemen layanan
│   │   ├── Orders.tsx         # Manajemen pesanan
│   │   ├── Reports.tsx        # Laporan keuangan dengan grafik
│   │   ├── Receipt.tsx        # Cetak struk / kirim WA
│   │   ├── TrackOrder.tsx     # Tracking publik untuk pelanggan
│   │   └── Profile.tsx        # Profil toko & upload foto
│   ├── types.ts               # Definisi tipe TypeScript
│   ├── main.tsx               # Entry point React
│   └── index.css              # Global styles + Tailwind
├── index.html                 # HTML utama (SEO, OG tags)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ⚙️ Skrip NPM

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan development server (port 5173) |
| `npm run build` | Build produksi ke folder `dist` |
| `npm run lint` | Validasi tipe TypeScript |
| `npm run preview` | Preview hasil build lokal |

---

## 🚀 Deploy ke Vercel

1. Push repositori ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Set environment variable:
   - `VITE_API_URL` → URL backend kamu
4. Deploy! 🎉

---

## 📄 Lisensi

Project ini dikembangkan untuk keperluan UMKM Laundry Indonesia.

---

*Dibuat dengan ❤️ untuk UMKM Laundry Indonesia*
