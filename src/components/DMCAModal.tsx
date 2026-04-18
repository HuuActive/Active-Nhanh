import { motion, AnimatePresence } from 'motion/react';
import { X, Shield } from 'lucide-react';

interface DMCAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DMCAModal({ isOpen, onClose }: DMCAModalProps) {
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
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full bg-brand-50 p-2 text-tiktok-black transition-transform hover:scale-110"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 lg:p-12">
              <div className="mb-6 flex h-12 w-12 lg:h-16 lg:w-16 items-center justify-center rounded-2xl bg-tiktok-cyan/10 text-tiktok-cyan">
                <Shield className="h-6 w-6 lg:h-8 lg:w-8" />
              </div>
              
              <h2 className="mb-6 text-[20px] lg:text-3xl font-black tracking-tight text-tiktok-black uppercase">Chính sách DMCA</h2>
              
              <div className="prose prose-sm max-h-[50vh] overflow-y-auto pr-4 text-brand-600 text-[13px] lg:text-sm">
                <p className="mb-4">
                  ActiveNhanh tôn trọng quyền sở hữu trí tuệ của người khác. Theo Đạo luật Bản quyền Thiên niên kỷ Kỹ thuật số (DMCA).
                </p>
                
                <h3 className="mb-2 font-black text-tiktok-black text-[14px] lg:text-base uppercase">1. Thông báo vi phạm</h3>
                <p className="mb-4">
                  Nếu anh bảo lưu bản quyền và tin rằng bất kỳ nội dung nào vi phạm, vui lòng gửi thông báo cho chúng tôi.
                </p>
                <ul className="mb-4 list-disc pl-5 space-y-2">
                  <li>Chữ ký vật lý hoặc điện tử của người được ủy quyền thay mặt chủ sở hữu bản quyền.</li>
                  <li>Xác định tác phẩm có bản quyền bị khiếu nại là đã bị vi phạm.</li>
                  <li>Xác định tài liệu bị khiếu nại là vi phạm và thông tin đủ để chúng tôi tìm thấy tài liệu đó.</li>
                  <li>Thông tin liên hệ của bạn (địa chỉ, số điện thoại, email).</li>
                  <li>Tuyên bố rằng bạn tin tưởng thiện chí rằng việc sử dụng tài liệu theo cách bị khiếu nại là không được phép.</li>
                </ul>

                <h3 className="mb-2 font-bold text-tiktok-black">2. Thông tin liên hệ DMCA</h3>
                <p className="mb-4">
                  Vui lòng gửi khiếu nại của bạn đến:
                  <br />
                  <strong>Email:</strong> activenhanh@gmail.com
                  <br />
                  <strong>Tiêu đề:</strong> Khiếu nại vi phạm bản quyền - DMCA
                </p>

                <p className="text-xs text-brand-400 italic">
                  Lưu ý: Bất kỳ ai cố ý gửi thông báo sai sự thật về vi phạm bản quyền có thể phải chịu trách nhiệm pháp lý về thiệt hại.
                </p>
              </div>

              <button 
                onClick={onClose}
                className="mt-8 w-full rounded-2xl bg-tiktok-black py-4 font-black text-white transition-all hover:scale-[1.02]"
              >
                Tôi đã hiểu
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
