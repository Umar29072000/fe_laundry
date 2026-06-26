import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { store } from './src/server/store';
import { sendSuccess, sendError } from './src/server/response';
import { sendOrderBillEmail } from './src/server/email';
// Local types for the mock server — decoupled from src/types.ts
interface StoreUser { id: string; storeName: string; ownerName: string; username: string; password: string; photoUrl?: string; }
type PaymentMethod = 'Tunai' | 'QRIS' | 'Transfer_Bank';
type OrderStatus = 'Pending' | 'Washing' | 'Ironing' | 'Ready' | 'Delivered';
interface Order { id: string; storeId: string; customerId: string; items: any[]; totalPrice: number; status: OrderStatus; paymentMethod: PaymentMethod; createdAt: string; completedAt?: string; }

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  const getStoreId = (req: Request) => (req.headers['x-store-id'] as string) || 'store_admin';

  // --- API ROUTES ---

  // Register
  app.post('/api/register', (req: Request, res: Response) => {
    const { storeName, ownerName, username, password } = req.body;
    if (!storeName || !ownerName || !username || !password) {
      return sendError(res, 'Semua field harus diisi');
    }

    const existing = store.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existing) {
      return sendError(res, 'Username sudah digunakan, pilih username lain', 400);
    }

    const newUser: StoreUser = {
      id: `store_${Date.now()}`,
      storeName,
      ownerName,
      username,
      password,
      photoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80'
    };

    store.users.push(newUser);

    // Seed default services for new store
    const seedServices = [
      { id: `s_${Date.now()}_1`, storeId: newUser.id, name: 'Cuci Setrika Komplit', price: 7000, unit: 'kg' as const },
      { id: `s_${Date.now()}_2`, storeId: newUser.id, name: 'Cuci Kering', price: 5000, unit: 'kg' as const },
      { id: `s_${Date.now()}_3`, storeId: newUser.id, name: 'Setrika Saja', price: 4000, unit: 'kg' as const },
      { id: `s_${Date.now()}_4`, storeId: newUser.id, name: 'Cuci Karpet', price: 15000, unit: 'pcs' as const }
    ];
    store.services.push(...seedServices);

    return sendSuccess(res, 'Registrasi toko berhasil', {
      token: `token_${newUser.id}`,
      user: {
        id: newUser.id,
        username: newUser.username,
        storeName: newUser.storeName,
        ownerName: newUser.ownerName,
        photoUrl: newUser.photoUrl
      }
    });
  });

  // Login
  app.post('/api/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    // Check in users store
    let user = store.users.find(u => u.username.toLowerCase() === username?.toLowerCase() && u.password === password);
    
    // Fallback default admin
    if (!user && username === 'admin' && password === 'admin123') {
      user = store.users[0];
    }

    if (user) {
      return sendSuccess(res, 'Login berhasil', { 
        token: `token_${user.id}`, 
        user: { 
          id: user.id,
          username: user.username, 
          storeName: user.storeName,
          ownerName: user.ownerName,
          photoUrl: user.photoUrl
        } 
      });
    }
    return sendError(res, 'Username atau password salah', 401);
  });

  // Profile
  app.get('/api/profile', (req: Request, res: Response) => {
    const storeId = getStoreId(req);
    const user = store.users.find(u => u.id === storeId) || store.users[0];
    if (!user) return sendError(res, 'Profil toko tidak ditemukan', 404);
    
    return sendSuccess(res, 'Berhasil mengambil profil toko', {
      id: user.id,
      storeName: user.storeName,
      ownerName: user.ownerName,
      username: user.username,
      photoUrl: user.photoUrl
    });
  });

  app.put('/api/profile', (req: Request, res: Response) => {
    const storeId = getStoreId(req);
    const { storeName, ownerName, photoUrl, password, currentPassword } = req.body;
    
    const user = store.users.find(u => u.id === storeId) || store.users[0];
    if (!user) return sendError(res, 'Profil toko tidak ditemukan', 404);

    if (password) {
      if (user.password && user.password !== currentPassword) {
        return sendError(res, 'Password lama tidak sesuai', 400);
      }
      user.password = password;
    }

    if (storeName) user.storeName = storeName;
    if (ownerName) user.ownerName = ownerName;
    if (photoUrl !== undefined) user.photoUrl = photoUrl;

    return sendSuccess(res, 'Profil toko berhasil diperbarui', {
      id: user.id,
      storeName: user.storeName,
      ownerName: user.ownerName,
      username: user.username,
      photoUrl: user.photoUrl
    });
  });

  // Reports
  app.get('/api/reports', (req: Request, res: Response) => {
    const storeId = getStoreId(req);
    const storeOrders = store.orders.filter((o: any) => o.storeId === storeId || (!o.storeId && storeId === 'store_admin'));
    const completedOrders = storeOrders.filter((o: any) => o.status === 'Delivered');

    const grouped: Record<string, { totalRevenue: number; orderCount: number }> = {};
    completedOrders.forEach((order: any) => {
      const pm = order.paymentMethod;
      if (!grouped[pm]) grouped[pm] = { totalRevenue: 0, orderCount: 0 };
      grouped[pm].totalRevenue += order.totalPrice;
      grouped[pm].orderCount += 1;
    });

    const report = Object.entries(grouped).map(([paymentMethod, stats]) => ({ paymentMethod, ...stats }));
    return sendSuccess(res, 'Berhasil mengambil data laporan', { report });
  });

  // Dashboard Stats
  app.get('/api/dashboard', (req: Request, res: Response) => {
    const storeId = getStoreId(req);
    const storeCustomers = store.customers.filter((c: any) => c.storeId === storeId || (!c.storeId && storeId === 'store_admin'));
    const storeOrders = store.orders.filter((o: any) => o.storeId === storeId || (!o.storeId && storeId === 'store_admin'));

    const totalCustomers = storeCustomers.length;
    const totalOrders = storeOrders.length;
    const pendingOrdersCount = storeOrders.filter((o: any) => o.status !== 'Delivered').length;
    const totalRevenue = storeOrders.filter((o: any) => o.status === 'Delivered').reduce((sum: number, order: any) => sum + order.totalPrice, 0);

    return sendSuccess(res, 'Berhasil mengambil data dashboard', {
      totalCustomers,
      totalOrders,
      pendingOrdersCount,
      totalRevenue,
    });
  });

  // Customers
  app.get('/api/customers', (req: Request, res: Response) => {
    const storeId = getStoreId(req);
    const storeCustomers = store.customers.filter((c: any) => c.storeId === storeId || (!c.storeId && storeId === 'store_admin'));
    return sendSuccess(res, 'Berhasil mengambil data pelanggan', { customers: storeCustomers });
  });
  app.post('/api/customers', (req: Request, res: Response) => {
    const storeId = getStoreId(req);
    const { name, email, phone, address } = req.body;
    if (!name || !email || !phone || !address) return sendError(res, 'Semua field harus diisi');
    const newCustomer = { id: `c${Date.now()}`, storeId, name, email, phone, address };
    store.customers.push(newCustomer);
    return sendSuccess(res, 'Berhasil menambahkan pelanggan', newCustomer);
  });
  app.delete('/api/customers/:id', (req: Request, res: Response) => {
    store.customers = store.customers.filter(c => c.id !== req.params.id);
    return sendSuccess(res, 'Berhasil menghapus pelanggan');
  });

  // Services
  app.get('/api/services', (req: Request, res: Response) => {
    const storeId = getStoreId(req);
    const storeServices = store.services.filter((s: any) => s.storeId === storeId || (!s.storeId && storeId === 'store_admin'));
    return sendSuccess(res, 'Berhasil mengambil data layanan', { services: storeServices });
  });
  app.post('/api/services', (req: Request, res: Response) => {
    const storeId = getStoreId(req);
    const { name, price, unit } = req.body;
    if (!name || !price || !unit) return sendError(res, 'Semua field harus diisi');
    const newService = { id: `s${Date.now()}`, storeId, name, price, unit };
    store.services.push(newService);
    return sendSuccess(res, 'Berhasil menambahkan layanan', newService);
  });
  app.delete('/api/services/:id', (req: Request, res: Response) => {
    store.services = store.services.filter(s => s.id !== req.params.id);
    return sendSuccess(res, 'Berhasil menghapus layanan');
  });

  // Orders
  app.get('/api/orders/track/:id', (req: Request, res: Response) => {
    const order = store.orders.find((o: any) => o.id === req.params.id);
    if (!order) return sendError(res, 'Pesanan tidak ditemukan', 404);

    const customer = store.customers.find((c: any) => c.id === order.customerId);
    const orderItems = (order.items || []).map((item: any) => {
      const svc = store.services.find((s: any) => s.id === item.serviceId);
      return { id: item.serviceId, quantity: item.quantity, subtotal: item.subtotal, service: svc || null };
    });
    return sendSuccess(res, 'Berhasil mengambil data tracking', {
      ...order,
      customer: customer ? { id: customer.id, name: customer.name, phone: customer.phone } : null,
      orderItems,
    });
  });

  app.get('/api/orders', (req: Request, res: Response) => {
    const storeId = getStoreId(req);
    const storeOrders = store.orders.filter((o: any) => o.storeId === storeId || (!o.storeId && storeId === 'store_admin'));

    const ordersWithDetails = storeOrders.map((order: any) => {
      const customer = store.customers.find((c: any) => c.id === order.customerId);
      const orderItems = (order.items || []).map((item: any) => {
        const svc = store.services.find((s: any) => s.id === item.serviceId);
        return { id: item.serviceId, quantity: item.quantity, subtotal: item.subtotal, service: svc || null };
      });
      return { ...order, customer: customer || null, orderItems };
    });
    ordersWithDetails.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sendSuccess(res, 'Berhasil mengambil data pesanan', { orders: ordersWithDetails });
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    const storeId = getStoreId(req);
    const { customerId, items, paymentMethod } = req.body;
    if (!customerId || !items || items.length === 0 || !paymentMethod) {
      return sendError(res, 'Data pesanan tidak valid');
    }

    let totalPrice = 0;
    const validatedItems = items.map((item: any) => {
      const service = store.services.find((s: any) => s.id === item.serviceId);
      if (!service) throw new Error('Layanan tidak ditemukan');
      const subtotal = service.price * item.quantity;
      totalPrice += subtotal;
      return { serviceId: item.serviceId, quantity: item.quantity, subtotal };
    });

    const newOrder: any = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      storeId,
      customerId,
      items: validatedItems,
      totalPrice,
      status: 'Pending',
      paymentMethod,
      createdAt: new Date().toISOString()
    };

    store.orders.push(newOrder);

    // Notifications
    const customer = store.customers.find((c: any) => c.id === customerId);
    if (customer && customer.email) {
      sendOrderBillEmail(customer.name, customer.email, newOrder, store.services);
    }

    // Build response with nested orderItems shape
    const orderItems = validatedItems.map((item: any) => {
      const svc = store.services.find((s: any) => s.id === item.serviceId);
      return { id: item.serviceId, quantity: item.quantity, subtotal: item.subtotal, service: svc || null };
    });
    return sendSuccess(res, 'Pesanan berhasil dibuat', { ...newOrder, customer: customer || null, orderItems });
  });

  app.put('/api/orders/:id/status', (req: Request, res: Response) => {
    const { status } = req.body;
    const order = store.orders.find((o: any) => o.id === req.params.id);
    if (!order) return sendError(res, 'Pesanan tidak ditemukan', 404);

    (order as any).status = status;
    if (status === 'Delivered') {
      (order as any).completedAt = new Date().toISOString();
    }
    return sendSuccess(res, 'Status pesanan berhasil diupdate', order);
  });


  // --- VITE MIDDLEWARE & STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
