import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, User, Phone, Mail, MapPin, FileText, ShieldCheck, Zap, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { CartItem } from '../types';
import { formatPrice } from '../lib/utils';
import { useOrders, useAuth } from '../hooks/useFirebase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  total: number;
}

export default function CheckoutModal({ isOpen, onClose, cartItems, total }: CheckoutModalProps) {
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createOrder } = useOrders();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    note: ''
  });

  useEffect(() => {
    if (user && isOpen) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.displayName || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user, isOpen]);

  // Bank Info
  const bankInfo = {
    bankName: 'Vietcombank',
    accountNumber: '1040564989',
    accountName: 'DIEU HUU'
  };

  // Generate QR Code URL using VietQR
  const generateQR = () => {
    const bankId = 'VCB'; // Vietcombank
    const description = cartItems.map(item => `${item.name}`).join(', ').substring(0, 50);
    const encodedDesc = encodeURIComponent(description);
    return `https://img.vietqr.io/image/${bankId}-${bankInfo.accountNumber}-compact.png?amount=${total}&addInfo=${encodedDesc}&accountName=${encodeURIComponent(bankInfo.accountName)}`;
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    try {
      await createOrder({
        customerInfo: formData,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: total
      });

      // Send real email notification via EmailJS
      const orderDetails = cartItems.map(item => `- ${item.name} (SL: ${item.quantity})`).join('\n');
      const templateParams = {
        to_name: 'Admin ActiveNhanh',
        from_name: formData.fullName,
        contact_info: `SĐT: ${formData.phone} | Email: ${formData.email}`,
        product_name: 'Đơn hàng mới',
        product_id: 'ORDER',
        message: `Có đơn hàng mới từ ${formData.fullName}.\n\nChi tiết đơn hàng:\n${orderDetails}\n\nTổng cộng: ${total.toLocaleString('vi-VN')}đ\nĐịa chỉ: ${formData.address}\nGhi chú: ${formData.note || 'Không có'}`
      };

      await emailjs.send(
        'service_gboj9t8',
        'template_gq2de5r',
        templateParams,
        '6QQm5z9DfRF_w7a27'
      );
      
      setStep('success');
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-tiktok-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full bg-brand-50 p-2 text-tiktok-black transition-transform hover:scale-110"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="h-full max-h-[90vh] overflow-y-auto">
              {step === 'success' ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </div>
                  <h2 className="mb-4 text-3xl font-black text-tiktok-black">Đặt hàng thành công!</h2>
                  <p className="mb-8 max-w-md text-brand-500">
                    Cảm ơn anh đã tin tưởng ActiveNhanh. Đơn hàng của anh đang được xử lý. 
                    Thông tin tài khoản sẽ được gửi qua Email/Zalo trong vòng 5-15 phút.
                  </p>
                  <button
                    onClick={onClose}
                    className="rounded-2xl bg-tiktok-black px-10 py-4 font-black text-white transition-all hover:scale-105"
                  >
                    Quay lại trang chủ
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  {/* Left: Form */}
                  <div className="lg:col-span-2 p-6 lg:p-10">
                    <div className="mb-8 flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${step === 'info' ? 'bg-tiktok-black text-white' : 'bg-green-500 text-white'}`}>
                        {step === 'info' ? '1' : <CheckCircle2 className="h-6 w-6" />}
                      </div>
                      <div className="h-px w-12 bg-brand-100" />
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${step === 'payment' ? 'bg-tiktok-black text-white' : 'bg-brand-100 text-brand-400'}`}>
                        2
                      </div>
                      <h2 className="ml-4 text-2xl font-black text-tiktok-black">
                        {step === 'info' ? 'Thông tin nhận hàng' : 'Thanh toán'}
                      </h2>
                    </div>

                    {step === 'info' ? (
                      <form onSubmit={handleSubmitInfo} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-brand-400">
                              <User className="h-3 w-3" /> Họ và tên
                            </label>
                            <input
                              required
                              type="text"
                              value={formData.fullName}
                              onChange={e => setFormData({...formData, fullName: e.target.value})}
                              className="w-full rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm focus:border-tiktok-cyan focus:outline-none"
                              placeholder="Nguyễn Văn A"
                            />
                          </div>
                          <div>
                            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-brand-400">
                              <Phone className="h-3 w-3" /> Số điện thoại
                            </label>
                            <input
                              required
                              type="tel"
                              value={formData.phone}
                              onChange={e => setFormData({...formData, phone: e.target.value})}
                              className="w-full rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm focus:border-tiktok-cyan focus:outline-none"
                              placeholder="07 789 57 345"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-brand-400">
                            <Mail className="h-3 w-3" /> Email
                          </label>
                          <input
                            required
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm focus:border-tiktok-cyan focus:outline-none"
                            placeholder="example@gmail.com"
                          />
                        </div>
                        <div>
                          <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-brand-400">
                            <MapPin className="h-3 w-3" /> Địa chỉ nhận hàng
                          </label>
                          <input
                            required
                            type="text"
                            value={formData.address}
                            onChange={e => setFormData({...formData, address: e.target.value})}
                            className="w-full rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm focus:border-tiktok-cyan focus:outline-none"
                            placeholder="Số nhà, tên đường, phường/xã..."
                          />
                        </div>
                        <div>
                          <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-brand-400">
                            <FileText className="h-3 w-3" /> Ghi chú (nếu có)
                          </label>
                          <textarea
                            rows={3}
                            value={formData.note}
                            onChange={e => setFormData({...formData, note: e.target.value})}
                            className="w-full rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm focus:border-tiktok-cyan focus:outline-none"
                            placeholder="Ví dụ: Giao vào giờ hành chính..."
                          />
                        </div>
                        <button
                          type="submit"
                          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-tiktok-black py-5 text-lg font-black text-white shadow-lg transition-all hover:scale-[1.01]"
                        >
                          Tiếp tục thanh toán <ChevronRight className="h-5 w-5" />
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-8">
                        <div className="rounded-3xl border-2 border-tiktok-cyan/20 bg-tiktok-cyan/5 p-8">
                          <div className="mb-6 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                              <CreditCard className="h-6 w-6 text-tiktok-cyan" />
                            </div>
                            <div>
                              <h3 className="font-black text-tiktok-black">Chuyển khoản {bankInfo.bankName}</h3>
                              <p className="text-xs font-bold text-brand-400">Quét mã QR để thanh toán tự động</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                              <div className="flex justify-between border-b border-brand-50 pb-3">
                                <span className="text-xs font-bold text-brand-400 uppercase">Ngân hàng</span>
                                <span className="text-sm font-black text-tiktok-black">{bankInfo.bankName}</span>
                              </div>
                              <div className="flex justify-between border-b border-brand-50 pb-3">
                                <span className="text-xs font-bold text-brand-400 uppercase">Số tài khoản</span>
                                <span className="text-sm font-black text-tiktok-cyan">{bankInfo.accountNumber}</span>
                              </div>
                              <div className="flex justify-between border-b border-brand-50 pb-3">
                                <span className="text-xs font-bold text-brand-400 uppercase">Chủ tài khoản</span>
                                <span className="text-sm font-black text-tiktok-black">{bankInfo.accountName}</span>
                              </div>
                              <div className="flex justify-between pt-2">
                                <span className="text-xs font-bold text-brand-400 uppercase">Số tiền</span>
                                <span className="text-xl font-black text-tiktok-magenta">{formatPrice(total)}</span>
                              </div>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                              <div className="relative overflow-hidden rounded-3xl border-4 border-white bg-white p-2 shadow-xl">
                                <img 
                                  src={generateQR()} 
                                  alt="VietQR Code" 
                                  className="h-48 w-48 object-contain"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                  <img src="https://vietqr.net/portal-v2/img/logo-vietqr.png" alt="" className="w-20" />
                                </div>
                              </div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-400">Quét để thanh toán nhanh</p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-brand-50 p-4 text-xs font-bold text-brand-500">
                          * Sau khi chuyển khoản, vui lòng nhấn nút <span className="text-tiktok-black">"Xác nhận đặt hàng"</span> bên cạnh để hoàn tất đơn hàng.
                        </div>

                        <div className="flex gap-4">
                          <button
                            onClick={() => setStep('info')}
                            className="flex-1 rounded-2xl border-2 border-brand-100 py-4 font-black text-brand-400 transition-all hover:border-tiktok-black hover:text-tiktok-black"
                          >
                            Quay lại
                          </button>
                          <button
                            onClick={handleConfirmOrder}
                            disabled={isSubmitting}
                            className="flex-[2] rounded-2xl bg-tiktok-black py-4 font-black text-white shadow-lg transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" /> Đang xử lý...
                              </>
                            ) : (
                              'Xác nhận đặt hàng'
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Summary */}
                  <div className="bg-brand-50/50 p-6 lg:p-10 border-l border-brand-100">
                    <h3 className="mb-6 text-lg font-black text-tiktok-black">Đơn hàng của bạn</h3>
                    <div className="mb-8 space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-brand-100 bg-white">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex flex-1 flex-col justify-center">
                            <h4 className="text-sm font-black text-tiktok-black line-clamp-1">{item.name}</h4>
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-brand-400">Số lượng: {item.quantity}</span>
                              <span className="text-tiktok-magenta">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 border-t border-brand-100 pt-6">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-brand-400">Tạm tính</span>
                        <span className="text-tiktok-black">{formatPrice(total)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-brand-400">Phí dịch vụ</span>
                        <span className="text-green-500">Miễn phí</span>
                      </div>
                      <div className="flex justify-between pt-4">
                        <span className="text-lg font-black text-tiktok-black">Tổng cộng</span>
                        <span className="text-2xl font-black text-tiktok-magenta">{formatPrice(total)}</span>
                      </div>
                    </div>

                    <div className="mt-10 space-y-4">
                      <div className="flex items-center gap-3 text-xs font-bold text-brand-500">
                        <Zap className="h-4 w-4 text-tiktok-cyan" /> Kích hoạt ngay trong vòng 5-15 phút
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-brand-500">
                        <ShieldCheck className="h-4 w-4 text-tiktok-magenta" /> Bảo hành 1 đổi 1 suốt thời gian sử dụng
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
