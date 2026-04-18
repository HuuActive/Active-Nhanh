import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Clock, CheckCircle2, AlertCircle, Headphones, Star } from 'lucide-react';

interface WarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WarrantyModal({ isOpen, onClose }: WarrantyModalProps) {
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
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-2xl bg-tiktok-magenta/10 text-tiktok-magenta">
                    <ShieldCheck className="h-5 w-5 lg:h-7 lg:w-7" />
                  </div>
                  <div>
                    <h2 className="text-[18px] lg:text-xl font-black tracking-tight text-tiktok-black uppercase">CHÍNH SÁCH BẢO HÀNH</h2>
                    <p className="text-[9px] lg:text-xs font-bold text-brand-400 uppercase tracking-widest">Dịch vụ số ActiveNhanh</p>
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
                  <div className="rounded-3xl bg-white p-6 lg:p-8 shadow-sm border border-brand-100 text-center">
                    <p className="text-[15px] lg:text-lg font-medium leading-relaxed text-brand-600 italic">
                      "Tại ActiveNhanh, chúng tôi cam kết không chỉ cung cấp giải pháp mà còn đồng hành cùng quý khách trong suốt quá trình sử dụng."
                    </p>
                  </div>

                  {/* 1. Thời hạn */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-tiktok-cyan text-tiktok-black font-black text-[12px] lg:text-sm">1</div>
                      <h3 className="text-[16px] lg:text-lg font-black text-tiktok-black uppercase">Thời hạn bảo hành</h3>
                    </div>
                    <div className="rounded-3xl bg-white p-6 shadow-sm border border-brand-100">
                      <p className="text-[13px] lg:text-base text-brand-600 leading-relaxed">
                        Tất cả các gói dịch vụ (CapCut, Office 365, ChatGPT, Google One...) được bảo hành đúng và đủ theo thời gian quý khách đã đăng ký.
                      </p>
                    </div>
                  </section>

                  {/* 2. Phạm vi */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-tiktok-cyan text-tiktok-black font-black text-[12px] lg:text-sm">2</div>
                      <h3 className="text-[16px] lg:text-lg font-black text-tiktok-black uppercase">Phạm vi bảo hành</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-3xl bg-white p-5 lg:p-6 shadow-sm border border-brand-100">
                        <h4 className="font-black text-tiktok-magenta mb-3 flex items-center gap-2 text-[14px] lg:text-base">
                          <AlertCircle className="h-4 w-4" /> Lỗi được bảo hành
                        </h4>
                        <ul className="space-y-2 text-[12px] lg:text-sm text-brand-600">
                          <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> Tài khoản bị mất quyền Premium</li>
                          <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> Lỗi tính năng từ hệ thống</li>
                        </ul>
                      </div>
                      <div className="rounded-3xl bg-white p-5 lg:p-6 shadow-sm border border-brand-100">
                        <h4 className="font-black text-tiktok-cyan mb-3 flex items-center gap-2 text-[14px] lg:text-base">
                          <Clock className="h-4 w-4" /> Hình thức hỗ trợ
                        </h4>
                        <ul className="space-y-2 text-[12px] lg:text-sm text-brand-600">
                          <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> Khắc phục trong vòng 24h</li>
                          <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> <strong>Lỗi 1 đổi 1</strong> trọn đời gói</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* 3. Hoàn tiền */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tiktok-cyan text-tiktok-black font-black text-sm">3</div>
                      <h3 className="text-lg font-black text-tiktok-black">Chính sách hoàn tiền (Refund)</h3>
                    </div>
                    <div className="rounded-3xl bg-tiktok-magenta/5 p-8 border border-tiktok-magenta/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-xs font-black text-tiktok-magenta uppercase mb-2">Trong 7 ngày đầu</p>
                          <p className="text-sm font-bold text-brand-700">Hoàn tiền 100% nếu khách hàng không hài lòng hoặc có lỗi không thể khắc phục.</p>
                        </div>
                        <div>
                          <p className="text-xs font-black text-tiktok-magenta uppercase mb-2">Sau 7 ngày</p>
                          <p className="text-sm font-bold text-brand-700">Hoàn tiền theo tỷ lệ thời gian chưa sử dụng nếu phát sinh lỗi bất khả kháng.</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 4. Từ chối */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tiktok-cyan text-tiktok-black font-black text-sm">4</div>
                      <h3 className="text-lg font-black text-tiktok-black">Các trường hợp từ chối bảo hành</h3>
                    </div>
                    <div className="rounded-3xl bg-white p-6 shadow-sm border border-brand-100">
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-brand-600">
                        <li className="flex gap-3 p-3 rounded-2xl bg-red-50/50">
                          <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <span>Tự ý thay đổi thông tin tài khoản khi chưa có hướng dẫn</span>
                        </li>
                        <li className="flex gap-3 p-3 rounded-2xl bg-red-50/50">
                          <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <span>Đăng nhập vượt quá số lượng thiết bị quy định</span>
                        </li>
                        <li className="flex gap-3 p-3 rounded-2xl bg-red-50/50">
                          <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <span>Vi phạm pháp luật hoặc chính sách cộng đồng của hãng</span>
                        </li>
                        <li className="flex gap-3 p-3 rounded-2xl bg-red-50/50">
                          <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <span>Quá thời hạn bảo hành đã cam kết</span>
                        </li>
                      </ul>
                    </div>
                  </section>

                  {/* 5. Quy trình */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tiktok-cyan text-tiktok-black font-black text-sm">5</div>
                      <h3 className="text-lg font-black text-tiktok-black">Quy trình yêu cầu hỗ trợ</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { step: 'Bước 1', title: 'Liên hệ Hotline/Zalo', desc: '07 789 57 345' },
                        { step: 'Bước 2', title: 'Cung cấp thông tin', desc: 'Tài khoản hoặc SĐT mua hàng' },
                        { step: 'Bước 3', title: 'Tiếp nhận & Xử lý', desc: 'Xử lý trong 15-30 phút' }
                      ].map((s, i) => (
                        <div key={i} className="rounded-3xl bg-white p-6 shadow-sm border border-brand-100 text-center">
                          <p className="text-[10px] font-black text-tiktok-magenta uppercase mb-1">{s.step}</p>
                          <p className="text-sm font-black text-tiktok-black mb-1">{s.title}</p>
                          <p className="text-xs text-brand-500">{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Footer */}
                  <div className="pt-10 pb-6 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-tiktok-magenta px-6 py-2 text-white shadow-lg shadow-tiktok-magenta/20">
                      <Star className="h-4 w-4 fill-white" />
                      <span className="text-sm font-black uppercase tracking-wider">Uy tín là sự sống còn</span>
                    </div>
                    <p className="mt-4 text-xs text-brand-400">ActiveNhanh - Đồng hành cùng trải nghiệm số của bạn</p>
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
