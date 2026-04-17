import { Facebook, Twitter, Instagram, Youtube, Globe, Zap } from 'lucide-react';

interface FooterProps {
  onDMCAClick: () => void;
  onContactClick: () => void;
  onWarrantyClick: () => void;
  onPaymentGuideClick: () => void;
}

export default function Footer({ onDMCAClick, onContactClick, onWarrantyClick, onPaymentGuideClick }: FooterProps) {
  return (
    <footer className="border-t border-brand-100 bg-tiktok-black pt-16 pb-10 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <a href="/" className="mb-6 flex items-center gap-2 group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white transition-transform group-hover:scale-110">
                <Zap className="h-5 w-5 text-tiktok-black" />
              </div>
              <span className="font-sans text-xl font-extrabold tracking-tighter text-white">
                Active<span className="text-tiktok-magenta">Nhanh</span>
              </span>
            </a>
            <p className="mb-6 text-sm text-brand-400 leading-relaxed">
              ActiveNhanh là đơn vị cung cấp dịch vụ hỗ trợ kỹ thuật và tư vấn giải pháp phần mềm cho người dùng cuối. Chúng tôi không phải là đại lý ủy quyền trực tiếp của các hãng.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="rounded-full bg-white/10 p-2 text-white transition-all hover:bg-tiktok-cyan hover:text-tiktok-black">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-tiktok-cyan">Sản phẩm</h4>
            <ul className="space-y-4 text-sm text-brand-400">
              <li><a href="#" className="hover:text-white transition-colors">Google One</a></li>
              <li><a href="#" className="hover:text-white transition-colors">OneDrive</a></li>
              <li><a href="#" className="hover:text-white transition-colors">ChatGPT Plus</a></li>
              <li><a href="#" className="hover:text-white transition-colors">CapCut Pro</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-tiktok-cyan">Hỗ trợ</h4>
            <ul className="space-y-4 text-sm text-brand-400">
              <li><button onClick={onWarrantyClick} className="hover:text-white transition-colors">Chính sách bảo hành</button></li>
              <li><button onClick={onPaymentGuideClick} className="hover:text-white transition-colors">Hướng dẫn thanh toán</button></li>
              <li><a href="#" className="hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
              <li><button onClick={onContactClick} className="hover:text-white transition-colors">Liên hệ hỗ trợ</button></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-tiktok-cyan">Liên hệ</h4>
            <ul className="space-y-4 text-sm text-brand-400">
              <li className="flex items-center gap-2">
                <span className="font-bold text-white">Hotline:</span> 07 789 57 345
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-white">Email:</span> activenhanh@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-white">Zalo:</span> <a href="https://zalo.me/0778957345" target="_blank" rel="noopener noreferrer" className="hover:text-tiktok-cyan transition-colors">07 789 57 345</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between border-t border-white/10 pt-10 sm:flex-row">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <p className="text-xs text-brand-500">© 2026 ActiveNhanh. All rights reserved. Designed with ❤️ in Vietnam.</p>
            <a 
              href="//www.dmca.com/Protection/Status.aspx?ID=activenhanh-protection-id" 
              title="DMCA.com Protection Status" 
              className="dmca-badge transition-transform hover:scale-110"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img 
                src="https://images.dmca.com/Badges/dmca_protected_sml_120n.png?ID=activenhanh-protection-id" 
                alt="DMCA.com Protection Status" 
                referrerPolicy="no-referrer"
              />
            </a>
          </div>
          <div className="mt-4 flex items-center gap-6 sm:mt-0">
            <a href="#" className="text-xs text-brand-500 hover:text-white">Privacy Policy</a>
            <a href="#" className="text-xs text-brand-500 hover:text-white">Terms of Service</a>
            <button onClick={onDMCAClick} className="text-xs text-brand-500 hover:text-white">DMCA Policy</button>
            <div className="flex items-center gap-1 text-xs text-brand-500">
              <Globe className="h-3 w-3" />
              <span>Vietnam (VN)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

