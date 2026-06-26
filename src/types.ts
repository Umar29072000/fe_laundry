export interface StoreUser {
 id: string;
 storeName: string;
 ownerName: string;
 username: string;
 password?: string;
 photoUrl?: string;
}

export interface Customer {
 id: string;
 storeId?: string;
 name: string;
 email: string;
 phone: string;
 address: string;
}

export interface Service {
 id: string;
 storeId?: string;
 name: string;
 price: number;
 unit: 'kg' | 'pcs';
}

export type OrderStatus = 'Pending' | 'Washing' | 'Drying' | 'Ironing' | 'Folding' | 'Packing' | 'Completed' | 'Delivered';

export type PaymentMethod = 'Tunai' | 'QRIS' | 'Transfer Bank';

export interface OrderItem {
 serviceId: string;
 quantity: number;
 subtotal: number;
}

export interface Order {
 id: string;
 storeId?: string;
 customerId: string;
 items: OrderItem[];
 totalPrice: number;
 status: OrderStatus;
 paymentMethod: PaymentMethod;
 createdAt: string;
 completedAt?: string;
}

export interface ApiResponse<T = void> {
 success: boolean;
 message: string;
 data?: T;
}
