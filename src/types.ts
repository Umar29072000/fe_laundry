// ============================================================
// Tenant (replaces StoreUser — matches be_laundry backend)
// ============================================================
export interface Tenant {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Customer
// ============================================================
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  createdAt?: string;
}

// ============================================================
// Service
// ============================================================
export interface Service {
  id: string;
  name: string;
  price: number;
  unit: string;
  createdAt?: string;
}

// ============================================================
// Order
// ============================================================

/** 5-step pipeline from the real backend */
export type OrderStatus = 'Pending' | 'Washing' | 'Ironing' | 'Ready' | 'Delivered';

/** Underscore variant matches the backend enum exactly */
export type PaymentMethod = 'Tunai' | 'QRIS' | 'Transfer_Bank';

/** Nested item returned by GET /api/orders and GET /api/orders/track/:id */
export interface OrderItem {
  id: string;
  quantity: number;
  subtotal: number;
  service: {
    id: string;
    name: string;
    price: number;
    unit: string;
  };
}

export interface Order {
  id: string;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  completedAt: string | null;
  customer: Customer;
  orderItems: OrderItem[];
  tenant?: {
    storeName: string;
    phone: string;
  };
}

// ============================================================
// Dashboard stats
// ============================================================
export interface DashboardStats {
  totalCustomers: number;
  totalOrders: number;
  pendingOrdersCount: number;
  totalRevenue: number;
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  ordersByStatus: StatusCount[];
  recentOrders: RecentOrder[];
}

export interface RecentOrder {
  id: string;
  customerName: string;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

// ============================================================
// Financial Report (detailed)
// ============================================================
export interface ReportItem {
  paymentMethod: PaymentMethod;
  totalRevenue: number;
  orderCount: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface ServiceRevenue {
  name: string;
  quantity: number;
  revenue: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface ReportSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
}

export interface DetailedReport {
  summary: ReportSummary;
  dailyRevenue: DailyRevenue[];
  ordersByService: ServiceRevenue[];
  ordersByStatus: StatusCount[];
  paymentBreakdown: ReportItem[];
}
