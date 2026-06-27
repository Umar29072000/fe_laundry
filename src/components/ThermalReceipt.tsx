import { format } from 'date-fns';
import { formatRupiah } from '../lib/utils';
import { Order } from '../types';

interface ThermalReceiptProps {
  order: Order;
}

export default function ThermalReceipt({ order }: ThermalReceiptProps) {
  const statusIndo: Record<string, string> = {
    Pending: 'Menunggu Diproses',
    Washing: 'Sedang Dicuci',
    Ironing: 'Sedang Disetrika',
    Ready: 'Siap Diambil',
    Delivered: 'Selesai',
  };

  const paymentLabel: Record<string, string> = {
    Tunai: 'Tunai',
    QRIS: 'QRIS',
    Transfer_Bank: 'Transfer Bank',
  };

  const trackingUrl = `${window.location.origin}/track/${order.id}`;

  return (
    <div className="receipt-thermal">
      {/* Header */}
      <div className="receipt-header">
        <div className="receipt-logo">🧺</div>
        <h1 className="receipt-store-name">{order.tenant?.storeName || 'MITRA LAUNDRY'}</h1>
        <p className="receipt-subtitle">Struk Pembayaran Digital</p>
      </div>

      {/* Divider */}
      <div className="receipt-divider" />

      {/* Order Info */}
      <div className="receipt-info">
        <div className="receipt-info-row">
          <span className="receipt-label">No. Nota</span>
          <span className="receipt-value">#{order.id}</span>
        </div>
        <div className="receipt-info-row">
          <span className="receipt-label">Tanggal</span>
          <span className="receipt-value">{format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}</span>
        </div>
        <div className="receipt-info-row">
          <span className="receipt-label">Pelanggan</span>
          <span className="receipt-value">{order.customer?.name || '-'}</span>
        </div>
        <div className="receipt-info-row">
          <span className="receipt-label">Status</span>
          <span className={`receipt-status status-${order.status.toLowerCase()}`}>
            {statusIndo[order.status] || order.status}
          </span>
        </div>
        <div className="receipt-info-row">
          <span className="receipt-label">Pembayaran</span>
          <span className="receipt-value">{paymentLabel[order.paymentMethod] || order.paymentMethod}</span>
        </div>
        {order.customer?.phone && (
          <div className="receipt-info-row">
            <span className="receipt-label">No. HP</span>
            <span className="receipt-value">{order.customer.phone}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="receipt-divider" />

      {/* Items Table */}
      <div className="receipt-items">
        <div className="receipt-items-header">
          <span className="receipt-col-item">Layanan</span>
          <span className="receipt-col-qty">Qty</span>
          <span className="receipt-col-price">Subtotal</span>
        </div>
        {order.orderItems?.map((item) => (
          <div key={item.id} className="receipt-item-row">
            <span className="receipt-col-item">{item.service?.name || 'Paket'}</span>
            <span className="receipt-col-qty">{item.quantity} {item.service?.unit || ''}</span>
            <span className="receipt-col-price">{formatRupiah(item.subtotal)}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="receipt-divider" />

      {/* Total */}
      <div className="receipt-total">
        <span className="receipt-total-label">TOTAL TAGIHAN</span>
        <span className="receipt-total-value">{formatRupiah(order.totalPrice)}</span>
      </div>

      {/* Divider */}
      <div className="receipt-divider" />

      {/* Tracking */}
      <div className="receipt-tracking">
        <p className="receipt-tracking-title">📍 Lacak Pesanan</p>
        <div className="receipt-qr-wrapper">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(trackingUrl)}`}
            alt="QR Code Tracking"
            className="receipt-qr"
            crossOrigin="anonymous"
          />
        </div>
        <p className="receipt-tracking-url">{trackingUrl}</p>
      </div>

      {/* Footer */}
      <div className="receipt-divider" />
      <div className="receipt-footer">
        <p className="receipt-footer-thanks">Terima kasih atas kepercayaan Anda ❤️</p>
        <p className="receipt-footer-disclaimer">
          Cucian yang tidak diambil melebihi 30 hari<br />
          di luar tanggung jawab toko.
        </p>
        {order.tenant?.phone && (
          <p className="receipt-footer-phone">
            📞 {order.tenant.phone}
          </p>
        )}
        <p className="receipt-footer-copy">
          © {new Date().getFullYear()} {order.tenant?.storeName || 'MITRA LAUNDRY'}
        </p>
      </div>
    </div>
  );
}
