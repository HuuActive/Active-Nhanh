import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, Mail, MapPin, MessageSquare, Facebook, Send, Clock, Globe } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
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
            className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full bg-brand-50 p-2 text-tiktok-black transition-transform hover:scale-110"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left: Info */}
              <div className="bg-tiktok-black p-6 lg:p-12 text-white">
                <h2 className="mb-6 lg:mb-8 text-[20px] lg:text-3xl font-black tracking-tight">Liên hệ với chúng tôi</h2>
                <p className="mb-8 lg:mb-12 text-[13px] lg:text-base text-brand-300">
                  Anh cần hỗ trợ kỹ thuật hay tư vấn dịch vụ? Đội ngũ ActiveNhanh luôn sẵn sàng phục vụ 24/7.
                </p>

                <div className="space-y-6 lg:space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-white/10 text-tiktok-cyan">
                      <Phone className="h-4 w-4 lg:h-5 lg:w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-brand-400">Hotline / Zalo</p>
                      <p className="text-[15px] lg:text-lg font-black">07 789 57 345</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-white/10 text-tiktok-magenta">
                      <Mail className="h-4 w-4 lg:h-5 lg:w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-brand-400">Email</p>
                      <p className="text-[15px] lg:text-lg font-black">activenhanh@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-white/10 text-tiktok-cyan">
                      <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-brand-400">Giờ làm việc</p>
                      <p className="text-[15px] lg:text-lg font-black">08:00 - 23:00 (Hàng ngày)</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex gap-4">
                  <a href="#" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-tiktok-cyan hover:text-tiktok-black">
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a href="#" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-tiktok-magenta">
                    <Send className="h-6 w-6" />
                  </a>
                  <a href="#" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-tiktok-cyan hover:text-tiktok-black">
                    <Globe className="h-6 w-6" />
                  </a>
                </div>
              </div>

              {/* Right: Map & Form */}
              <div className="p-8 lg:p-12">
                <div className="mb-8 overflow-hidden rounded-2xl border border-brand-100 shadow-sm">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.5201952559787!2d106.66744561458903!3d10.771412792324945!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ed930d31911%3A0x14329e530359f40!2zVMOyYSBuaMOgIFZpZXR0ZWwgQ29tcGxleA!5e0!3m2!1svi!2svn!4v1647334567890!5m2!1svi!2svn" 
                    width="100%" 
                    height="200" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy"
                  />
                </div>

                <form className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-brand-400">Lời nhắn của anh</label>
                    <textarea 
                      rows={4}
                      className="w-full rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm focus:border-tiktok-cyan focus:outline-none"
                      placeholder="Anh cần hỗ trợ gì ạ?"
                    />
                  </div>
                  <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-tiktok-black py-4 font-black text-white transition-all hover:scale-[1.02]">
                    <MessageSquare className="h-5 w-5" /> Gửi tin nhắn ngay
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
