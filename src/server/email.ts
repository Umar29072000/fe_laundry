import nodemailer from 'nodemailer';

// You can configure these in your .env file
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
 host: SMTP_HOST || 'smtp.ethereal.email',
 port: SMTP_PORT,
 auth: {
 user: SMTP_USER || 'testUser',
 pass: SMTP_PASS || 'testPass',
 },
});

export const sendOrderBillEmail = async (customerName: string, customerEmail: string, order: any, services: any[]) => {
 const appUrl = process.env.APP_URL || 'http://localhost:3000';
 const trackUrl = `${appUrl}/track/${order.id}`;

 const itemsHtml = order.items.map((item: any) => {
 const service = services.find(s => s.id === item.serviceId);
 return `<li>${service?.name || 'Layanan'} (x${item.quantity}) - Rp ${item.subtotal}</li>`;
 }).join('');

 const html = `
 <div style="font-family: sans-serif; padding: 20px;">
 <h2>Terima Kasih, ${customerName}!</h2>
 <p>Pesanan laundry Anda telah kami terima. Berikut adalah rincian pesanan Anda:</p>
 
 <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
 <p><strong>ID Pesanan:</strong> ${order.id}</p>
 <p><strong>Tanggal:</strong> ${new Date(order.createdAt).toLocaleString('id-ID')}</p>
 
 <h3>Rincian Layanan:</h3>
 <ul>
 ${itemsHtml}
 </ul>
 
 <h3><strong>Total Tagihan: Rp ${order.totalPrice}</strong></h3>
 </div>
 
 <div style="margin: 30px 0; padding: 20px; text-align: center; background-color: #e0f2fe; border-radius: 8px;">
 <h3 style="margin-top: 0; color: #0369a1;">Pantau Status Laundry Anda</h3>
 <p style="color: #0c4a6e; margin-bottom: 20px;">Anda dapat melihat proses laundry Anda secara real-time melalui link berikut:</p>
 <a href="${trackUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Lacak Pesanan</a>
 <p style="margin-top: 20px; font-size: 0.85em; color: #64748b;">Atau salin link ini: <br/> <a href="${trackUrl}">${trackUrl}</a></p>
 </div>
 
 <p>Kami akan segera memproses pesanan Anda. Terima kasih telah mempercayakan laundry Anda kepada kami.</p>
 <p>Salam hangat,<br/>Clean Laundry Team</p>
 </div>
 `;

 const mailOptions = {
 from: '"Clean Laundry" <noreply@cleanlaundry.com>',
 to: customerEmail,
 subject: `Tagihan & Lacak Laundry Anda - ${order.id}`,
 html,
 };

 if (!SMTP_USER) {
 console.log(`\n=================================================`);
 console.log(`📧 [SIMULASI EMAIL] Mengirim email ke: ${customerEmail}`);
 console.log(`Subject: ${mailOptions.subject}`);
 console.log(`Link Tracking: ${trackUrl}`);
 console.log(`Silakan konfigurasikan SMTP di .env untuk mengirim email sungguhan.`);
 console.log(`=================================================\n`);
 return;
 }

 try {
 await transporter.sendMail(mailOptions);
 console.log(`Email berhasil dikirim ke ${customerEmail}`);
 } catch (error) {
 console.error('Gagal mengirim email:', error);
 }
};

