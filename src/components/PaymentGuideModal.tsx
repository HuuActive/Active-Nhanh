import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, CheckCircle2, ArrowRight, ShieldCheck, Headphones, Smartphone, Banknote, Zap, AlertCircle } from 'lucide-react';

interface PaymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentGuideModal({ isOpen, onClose }: PaymentGuideModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-tiktok-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] bg-brand-50 shadow-2xl"
          >
            <div className="flex h-[85vh] flex-col">
              {/* Header */}
              <div className="relative flex items-center justify-between border-b border-brand-100 bg-white px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tiktok-cyan/10 text-tiktok-cyan">
                    <CreditCard className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-tiktok-black">HƯỚNG DẪN THANH TOÁN</h2>
                    <p className="text-xs font-bold text-brand-400 uppercase tracking-widest">& Nhận dịch vụ ActiveNhanh</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full bg-brand-50 p-2 text-brand-400 transition-colors hover:bg-brand-100 hover:text-tiktok-black"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="mx-auto max-w-3xl space-y-10">
                  {/* Intro */}
                  <div className="rounded-3xl bg-white p-8 shadow-sm border border-brand-100">
                    <p className="text-center font-medium leading-relaxed text-brand-600">
                      Chào mừng quý khách đến với ActiveNhanh. Để quý khách có thể trải nghiệm các giải pháp số một cách nhanh chóng và an toàn nhất, chúng tôi áp dụng quy trình thanh toán đơn giản theo các bước sau:
                    </p>
                  </div>

                  {/* Steps */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Step 1 */}
                    <div className="rounded-3xl bg-white p-6 shadow-sm border border-brand-100">
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-tiktok-magenta text-white font-black">1</div>
                      <h3 className="mb-2 font-black text-tiktok-black">Lựa chọn Gói dịch vụ</h3>
                      <p className="text-sm text-brand-500">Quý khách lựa chọn các gói dịch vụ (Office 365, CapCut Pro, ChatGPT Plus,...) phù hợp với nhu cầu tại danh mục sản phẩm của website.</p>
                    </div>

                    {/* Step 2 */}
                    <div className="rounded-3xl bg-white p-6 shadow-sm border border-brand-100">
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-tiktok-magenta text-white font-black">2</div>
                      <h3 className="mb-2 font-black text-tiktok-black">Xác nhận thông tin</h3>
                      <p className="text-sm text-brand-500">Sau khi chọn gói, quý khách vui lòng cung cấp thông tin (Email hoặc Số điện thoại) để đội ngũ kỹ thuật liên hệ hỗ trợ thiết lập và kích hoạt.</p>
                    </div>
                  </div>

                  {/* Step 3: Payment Details */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tiktok-magenta text-white font-black">3</div>
                      <h3 className="text-lg font-black text-tiktok-black">Thanh toán chuyển khoản</h3>
                    </div>
                    <div className="rounded-3xl bg-tiktok-black p-8 text-white shadow-xl">
                      <div className="mb-6 flex items-center gap-2 text-tiktok-cyan">
                        <Banknote className="h-5 w-5" />
                        <span className="text-sm font-black uppercase tracking-wider">Thông tin tài khoản chính thức</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between border-b border-white/10 pb-4">
                          <span className="text-brand-400">Ngân hàng</span>
                          <span className="font-black text-tiktok-cyan">Vietcombank</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-4">
                          <span className="text-brand-400">Số tài khoản</span>
                          <span className="text-xl font-black tracking-wider">1040564989</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-4">
                          <span className="text-brand-400">Chủ tài khoản</span>
                          <span className="font-black uppercase">Dieu Huu</span>
                        </div>
                        <div className="flex justify-between pt-2">
                          <span className="text-brand-400">Nội dung</span>
                          <span className="font-bold text-tiktok-magenta">[Số điện thoại] hoặc [Tên dịch vụ]</span>
                        </div>
                      </div>
                      <div className="mt-8 rounded-2xl bg-white/5 p-4 text-center text-xs text-brand-400">
                        (Vui lòng chụp lại màn hình giao dịch để quá trình kích hoạt diễn ra nhanh nhất)
                      </div>
                    </div>
                  </section>

                  {/* Step 4: Activation */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tiktok-magenta text-white font-black">4</div>
                      <h3 className="text-lg font-black text-tiktok-black">Kích hoạt & Bàn giao</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-3xl bg-white p-6 shadow-sm border border-brand-100">
                        <Zap className="mb-3 h-6 w-6 text-tiktok-cyan" />
                        <h4 className="mb-2 text-sm font-black text-tiktok-black">Thiết lập & Kích hoạt</h4>
                        <p className="text-xs text-brand-500">Nâng cấp trực tiếp trên Email của khách hoặc cung cấp quyền truy cập theo gói.</p>
                      </div>
                      <div className="rounded-3xl bg-white p-6 shadow-sm border border-brand-100">
                        <Smartphone className="mb-3 h-6 w-6 text-tiktok-magenta" />
                        <h4 className="mb-2 text-sm font-black text-tiktok-black">Hướng dẫn sử dụng</h4>
                        <p className="text-xs text-brand-500">Gửi tài liệu hoặc hỗ trợ qua Ultraview/Teamview nếu cần cài đặt trực tiếp.</p>
                      </div>
                      <div className="rounded-3xl bg-white p-6 shadow-sm border border-brand-100">
                        <ShieldCheck className="mb-3 h-6 w-6 text-green-500" />
                        <h4 className="mb-2 text-sm font-black text-tiktok-black">Xác nhận bảo hành</h4>
                        <p className="text-xs text-brand-500">Kích hoạt chế độ bảo hành trách nhiệm suốt thời gian sử dụng dịch vụ.</p>
                      </div>
                    </div>
                  </section>

                  {/* Important Notes */}
                  <section className="rounded-3xl bg-brand-100 p-8">
                    <h3 className="mb-6 flex items-center gap-2 font-black text-tiktok-black">
                      <AlertCircle className="h-5 w-5 text-tiktok-magenta" /> Lưu ý quan trọng
                    </h3>
                    <div className="space-y-4 text-sm leading-relaxed text-brand-600">
                      <div className="flex gap-3">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-tiktok-cyan" />
                        <p><strong>Hợp thức hóa giao dịch:</strong> Phí thanh toán là Phí dịch vụ hỗ trợ kỹ thuật và thiết lập phần mềm.</p>
                      </div>
                      <div className="flex gap-3">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-tiktok-cyan" />
                        <p><strong>An toàn tuyệt đối:</strong> ActiveNhanh cam kết không bao giờ yêu cầu khách hàng cung cấp mật khẩu cá nhân. Mọi thao tác nâng cấp đều dựa trên các giải pháp an toàn nhất.</p>
                      </div>
                    </div>
                  </section>

                  {/* Support CTA */}
                  <div className="rounded-3xl bg-tiktok-cyan p-8 text-center text-tiktok-black shadow-lg shadow-tiktok-cyan/20">
                    <Headphones className="mx-auto mb-4 h-10 w-10" />
                    <h3 className="mb-2 text-xl font-black">Hỗ trợ 24/7</h3>
                    <p className="mb-4 font-medium">Nếu gặp bất kỳ khó khăn nào trong quá trình thanh toán, quý khách vui lòng liên hệ:</p>
                    <div className="inline-flex items-center gap-4 rounded-full bg-tiktok-black px-8 py-3 text-white">
                      <span className="font-black">Hotline/Zalo: 07 789 57 345</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
