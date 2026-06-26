/**
 * In-memory mock store for the local dev server.
 * Uses its own local types — completely decoupled from src/types.ts
 * (which now reflects the real be_laundry backend shapes).
 */

// ── Local types for mock server only ──────────────────────────
interface MockStoreUser {
  id: string;
  storeName: string;
  ownerName: string;
  username: string;
  password: string;
  photoUrl?: string;
}

interface MockCustomer {
  id: string;
  storeId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface MockService {
  id: string;
  storeId: string;
  name: string;
  price: number;
  unit: string;
}

interface MockOrderItem {
  serviceId: string;
  quantity: number;
  subtotal: number;
}

interface MockOrder {
  id: string;
  storeId: string;
  customerId: string;
  items: MockOrderItem[];
  totalPrice: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  completedAt?: string;
}

// ── Exported store ────────────────────────────────────────────
export const store: {
  users: MockStoreUser[];
  customers: MockCustomer[];
  services: MockService[];
  orders: MockOrder[];
} = {
  users: [
    {
      id: 'store_admin',
      storeName: 'FreshClean Laundry',
      ownerName: 'Admin Utama',
      username: 'admin',
      password: 'admin123',
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
  ],
  customers: [
    { id: 'c1', storeId: 'store_admin', name: 'Budi Santoso', email: 'budi@example.com', phone: '08123456789', address: 'Jl. Merdeka No 1' },
    { id: 'c2', storeId: 'store_admin', name: 'Siti Aminah', email: 'siti@example.com', phone: '08987654321', address: 'Jl. Sudirman No 42' },
  ],
  services: [
    { id: 's1', storeId: 'store_admin', name: 'Cuci Setrika Komplit', price: 7000, unit: 'kg' },
    { id: 's2', storeId: 'store_admin', name: 'Cuci Kering', price: 5000, unit: 'kg' },
    { id: 's3', storeId: 'store_admin', name: 'Setrika Saja', price: 4000, unit: 'kg' },
    { id: 's4', storeId: 'store_admin', name: 'Cuci Karpet', price: 15000, unit: 'pcs' },
  ],
  orders: [
    {
      id: 'ORD-1001',
      storeId: 'store_admin',
      customerId: 'c1',
      items: [{ serviceId: 's1', quantity: 3, subtotal: 21000 }],
      totalPrice: 21000,
      status: 'Pending',
      paymentMethod: 'Tunai',
      createdAt: new Date().toISOString(),
    },
  ],
};
