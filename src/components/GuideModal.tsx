import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Monitor, Cloud, Palette, Cpu, GraduationCap, Gift, ChevronRight, CheckCircle2 } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const guides = [
  {
    id: 1,
    title: 'Nhóm Làm việc & Văn phòng',
    subtitle: '(Window, Office)',
    icon: Monitor,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    items: [
      { label: 'Hướng dẫn', text: 'Cách nhập Key kích hoạt Windows và kiểm tra bản quyền chính chủ.' },
      { label: 'Cài đặt', text: 'Các bước đăng nhập Email để kích hoạt trọn bộ Microsoft Office 365, 2016, 2019, 2021, 2024.' },
      { label: 'Hỗ trợ', text: 'Cách xử lý lỗi văng bản quyền bằng bộ công cụ sửa lỗi của Microsoft.' }
    ]
  },
  {
    id: 2,
    title: 'Nhóm Lưu trữ',
    subtitle: '(Google Drive, OneDrive)',
    icon: Cloud,
    color: 'text-tiktok-cyan',
    bgColor: 'bg-tiktok-cyan/10',
    items: [
      { label: 'Nâng cấp', text: 'Cách xác nhận Email để nhận dung lượng 100GB - 30TB cho Google Drive.' },
      { label: 'Bảo mật', text: 'Hướng dẫn thiết lập bảo mật 2 lớp cho tài khoản lưu trữ dữ liệu quan trọng.' },
      { label: 'Mẹo', text: 'Cách giải phóng bộ nhớ Gmail nhanh chóng sau khi nâng cấp.' }
    ]
  },
  {
    id: 3,
    title: 'Nhóm Sáng tạo',
    subtitle: '(CapCut Pro, Canva Pro, Adobe...)',
    icon: Palette,
    color: 'text-tiktok-magenta',
    bgColor: 'bg-tiktok-magenta/10',
    items: [
      { label: 'Sử dụng', text: 'Cách đăng nhập và đồng bộ dự án trên cả điện thoại và máy tính.' },
      { label: 'Tính năng', text: 'Hướng dẫn dùng AI xóa vật thể, tách nền và xuất video chất lượng cao không logo.' },
      { label: 'Lưu ý', text: 'Quy định về số lượng thiết bị đăng nhập đồng thời để tài khoản hoạt động ổn định.' }
    ]
  },
  {
    id: 4,
    title: 'Nhóm Trí tuệ nhân tạo',
    subtitle: '(ChatGPT Plus, Claude 3, Gemini...)',
    icon: Cpu,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    items: [
      { label: 'Truy cập', text: 'Hướng dẫn đăng nhập và sử dụng App AI chính thức tại Việt Nam.' },
      { label: 'Ứng dụng', text: 'Tổng hợp các mẫu câu lệnh (Prompt) giúp viết nội dung, dịch thuật và lập trình nhanh.' },
      { label: 'Khắc phục', text: 'Cách xử lý khi gặp lỗi đường truyền hoặc tài khoản bị giới hạn lượt chat.' }
    ]
  },
  {
    id: 5,
    title: 'Nhóm Học tập & Giải trí',
    subtitle: '(Duolingo, ELSA, Grammarly Pro...)',
    icon: GraduationCap,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    items: [
      { label: 'Học tập', text: 'Hướng dẫn thiết lập lộ trình học tiếng Anh hiệu quả trên ELSA/Duolingo.' },
      { label: 'Tiện ích', text: 'Cách tải nhạc và video ngoại tuyến (Offline) để xem khi không có mạng.' }
    ]
  },
  {
    id: 6,
    title: 'Nhóm Quà tặng',
    subtitle: '(Voucher & Sharing)',
    icon: Gift,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    items: [
      { label: 'Nhận quà', text: 'Hướng dẫn cách nhập mã Voucher hoặc nhận các gói dùng thử miễn phí từ ActiveNhanh.' },
      { label: 'Chia sẻ', text: 'Cách gửi tặng gói dịch vụ cho bạn bè, người thân qua hệ thống của chúng tôi.' }
    ]
  }
];

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
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
            className="relative w-full max-w-5xl overflow-hidden rounded-[2.5rem] bg-brand-50 shadow-2xl"
          >
            <div className="flex h-[85vh] flex-col">
              {/* Header */}
              <div className="relative flex items-center justify-between border-b border-brand-100 bg-white px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-2xl bg-tiktok-black text-white">
                    <BookOpen className="h-5 w-5 lg:h-7 lg:w-7" />
                  </div>
                  <div>
                    <h2 className="text-[15px] lg:text-xl font-black tracking-tight text-tiktok-black uppercase">Hệ thống hướng dẫn</h2>
                    <p className="text-[9px] lg:text-xs font-bold text-tiktok-magenta uppercase tracking-widest">Knowledge Base</p>
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {guides.map((guide) => (
                    <motion.div
                      key={guide.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: guide.id * 0.05 }}
                      className="group flex flex-col rounded-[2rem] bg-white p-6 shadow-sm border border-brand-100 transition-all hover:shadow-xl hover:border-tiktok-cyan/30"
                    >
                      <div className="mb-6 flex items-center gap-4">
                        <div className={`flex h-12 w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-2xl ${guide.bgColor} ${guide.color} transition-transform group-hover:scale-110`}>
                          <guide.icon className="h-6 w-6 lg:h-8 lg:w-8" />
                        </div>
                        <div>
                          <h3 className="font-black text-tiktok-black leading-tight text-[15px] lg:text-base">{guide.title}</h3>
                          <p className="text-[9px] lg:text-[10px] font-bold text-brand-400 uppercase tracking-wider mt-1">{guide.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4 text-[13px] lg:text-sm">
                        {guide.items.map((item, idx) => (
                          <div key={idx} className="relative pl-4">
                            <div className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-tiktok-cyan" />
                            <p className="text-[11px] lg:text-xs font-bold text-tiktok-black mb-1 uppercase tracking-tight">{item.label}</p>
                            <p className="text-[11px] lg:text-xs leading-relaxed text-brand-500">{item.text}</p>
                          </div>
                        ))}
                      </div>

                      <button className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-brand-50 py-3 text-[10px] font-black uppercase tracking-widest text-brand-600 transition-all hover:bg-tiktok-black hover:text-white">
                        Xem chi tiết <ChevronRight className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Footer Note */}
                <div className="mt-12 rounded-[2rem] bg-tiktok-black p-8 text-center text-white">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10 mb-4">
                    <CheckCircle2 className="h-6 w-6 text-tiktok-cyan" />
                  </div>
                  <h4 className="mb-2 text-lg font-black italic">Anh cần hỗ trợ trực tiếp?</h4>
                  <p className="text-sm text-brand-400 mb-6">Đội ngũ kỹ thuật của ActiveNhanh luôn sẵn sàng hỗ trợ anh qua Ultraview hoặc Teamview.</p>
                  <button 
                    onClick={() => window.open('https://zalo.me/0778957345', '_blank')}
                    className="inline-flex items-center gap-2 rounded-full bg-tiktok-cyan px-8 py-3 text-xs font-black uppercase tracking-widest text-tiktok-black transition-transform hover:scale-105"
                  >
                    Liên hệ Zalo Kỹ thuật
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
