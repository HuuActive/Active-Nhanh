import { ShoppingBag, Search, User, Menu, Zap, LogOut, Settings, ChevronDown, Package, Shield, X, Headphones, ShoppingCart } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useFirebase';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onAdminClick: () => void;
  onMyOrdersClick: () => void;
  onContactClick: () => void;
  onGuideClick: () => void;
  onLoginClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ 
  cartCount, 
  onCartClick, 
  onAdminClick, 
  onMyOrdersClick, 
  onContactClick,
  onGuideClick,
  onLoginClick,
  searchQuery,
  onSearchChange
}: HeaderProps) {
  const { user, isAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className={`sticky top-0 w-full border-b border-brand-100 bg-white/95 backdrop-blur-md transition-all ${isMobileMenuOpen ? 'z-[100]' : 'z-40'}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 hover:bg-brand-50 rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <a href="/" className="flex items-center gap-2 group">
              <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-tiktok-black transition-transform group-hover:scale-110">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                <div className="absolute -right-0.5 -top-0.5 h-full w-full rounded-lg border border-tiktok-cyan opacity-50"></div>
                <div className="absolute -bottom-0.5 -left-0.5 h-full w-full rounded-lg border border-tiktok-magenta opacity-50"></div>
              </div>
              <span className="font-sans text-lg sm:text-xl font-extrabold tracking-tighter text-tiktok-black">
                Active<span className="text-tiktok-magenta">Nhanh</span>
              </span>
            </a>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex lg:gap-8">
            {['Sản phẩm', 'Bảng giá', 'Hướng dẫn', 'Liên hệ'].map((item) => (
              <button
                key={item}
                onClick={() => {
                  if (item === 'Liên hệ') onContactClick();
                  else if (item === 'Hướng dẫn') onGuideClick();
                  else if (item === 'Sản phẩm') window.scrollTo({ top: 800, behavior: 'smooth' });
                }}
                className="text-sm font-semibold text-brand-600 transition-all hover:text-tiktok-black hover:underline decoration-tiktok-cyan decoration-2 underline-offset-4"
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative flex items-center" ref={searchRef}>
              <AnimatePresence>
                {isSearchExpanded && (
                  <motion.input
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: typeof window !== 'undefined' && window.innerWidth < 640 ? 140 : 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Tìm sản phẩm..."
                    className="absolute right-0 h-10 rounded-full border border-brand-100 bg-brand-50 pl-4 pr-10 text-sm focus:border-tiktok-cyan focus:outline-none"
                    autoFocus
                  />
                )}
              </AnimatePresence>
              <button 
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className="relative z-10 flex rounded-full p-2 text-brand-600 transition-colors hover:bg-brand-50 hover:text-tiktok-black"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={onCartClick}
              className="group relative rounded-full p-2 text-brand-600 transition-colors hover:bg-brand-50 hover:text-tiktok-black"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-tiktok-magenta text-[10px] font-bold text-white"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {user ? (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 p-1 pr-3 transition-all hover:border-tiktok-cyan"
                >
                  <img 
                    src={user.photoURL || ''} 
                    alt="" 
                    className="h-8 w-8 rounded-full border border-white shadow-sm"
                  />
                  <ChevronDown className={`h-4 w-4 text-brand-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-xl hidden lg:block z-[80]"
                    >
                      <div className="border-b border-brand-50 bg-brand-50/50 p-4">
                        <p className="text-sm font-black text-tiktok-black truncate">{user.displayName}</p>
                        <p className="text-xs font-medium text-brand-400 truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => { setIsUserMenuOpen(false); onMyOrdersClick(); }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-brand-600 transition-colors hover:bg-brand-50 hover:text-tiktok-black"
                        >
                          <Package className="h-4 w-4" /> Đơn hàng của tôi
                        </button>
                        
                        {isAdmin && (
                          <button 
                            onClick={() => { setIsUserMenuOpen(false); onAdminClick(); }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-brand-600 transition-colors hover:bg-brand-50 hover:text-tiktok-cyan"
                          >
                            <Shield className="h-4 w-4" /> Quản trị hệ thống
                          </button>
                        )}
                        
                        <div className="my-1 border-t border-brand-50" />
                        
                        <button 
                          onClick={() => { setIsUserMenuOpen(false); logout(); }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-tiktok-magenta transition-colors hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" /> Đăng xuất
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="flex items-center gap-2 rounded-full bg-tiktok-cyan px-5 py-2 text-xs font-black text-tiktok-black transition-transform active:scale-95 shadow-[0_3px_0_#00c2bb]"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Đăng nhập / Đăng ký</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay - Moved outside header wrapper for better portal-like behavior */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[999] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-tiktok-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="absolute inset-y-0 left-0 w-[280px] flex flex-col bg-white shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-brand-50 bg-tiktok-black text-white">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-tiktok-cyan" />
                    <span className="text-xl font-black italic uppercase">Menu</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {user ? (
                  <div className="flex items-center gap-3">
                    <img src={user.photoURL || ''} alt="" className="h-12 w-12 rounded-full border-2 border-tiktok-cyan" />
                    <div className="min-w-0">
                      <p className="font-black truncate text-sm">{user.displayName}</p>
                      <p className="text-[10px] font-bold text-brand-400 truncate opacity-70 uppercase tracking-widest">{isAdmin ? 'Quản trị viên' : 'Thành viên'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-xs text-white/60 mb-3 font-medium">Đăng nhập để xem đơn hàng và ưu đãi dành riêng cho bạn.</p>
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); onLoginClick(); }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-tiktok-cyan py-3 text-sm font-black text-tiktok-black transition-transform active:scale-95 shadow-[0_4px_0_#00c2bb]"
                    >
                      <User className="h-4 w-4" /> Đăng nhập / Đăng ký
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1 sm-scrollbar">
                <div className="text-[10px] font-black tracking-widest text-brand-400 mt-2 mb-2 px-2 uppercase">Điều hướng chính</div>
                {[
                  { name: 'Sản phẩm', icon: Package, action: () => {
                    const productsSection = document.getElementById('products');
                    if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth' });
                  }},
                  { name: 'Hướng dẫn', icon: Search, action: onGuideClick },
                  { name: 'Liên hệ', icon: Headphones, action: onContactClick }
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      item.action();
                    }}
                    className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-left font-bold text-tiktok-black transition-colors hover:bg-brand-50"
                  >
                    <item.icon className="h-5 w-5 text-brand-300" />
                    {item.name}
                  </button>
                ))}

                <div className="my-3 border-t border-brand-50" />
                <div className="text-[10px] font-black tracking-widest text-brand-400 mb-2 px-2 uppercase">Tài khoản & Dịch vụ</div>
                
                {user && (
                  <>
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); onMyOrdersClick(); }}
                      className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-left font-bold text-tiktok-black transition-colors hover:bg-brand-50"
                    >
                      <ShoppingCart className="h-5 w-5 text-brand-300" /> Đơn hàng của tôi
                    </button>
                    
                    {isAdmin && (
                      <button 
                        onClick={() => { setIsMobileMenuOpen(false); onAdminClick(); }}
                        className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-left font-bold text-tiktok-cyan transition-colors hover:bg-brand-50"
                      >
                        <Shield className="h-5 w-5" /> Quản trị hệ thống
                      </button>
                    )}
                    
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                      className="mt-2 flex items-center gap-4 rounded-xl px-4 py-3.5 text-left font-bold text-tiktok-magenta transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5" /> Đăng xuất
                    </button>
                  </>
                )}
              </div>
              
              <div className="p-6 bg-brand-50/50">
                 <div className="rounded-2xl bg-white border border-brand-100 p-4 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-400">Liên hệ hỗ trợ</p>
                    <p className="mt-1 font-black text-tiktok-black text-lg">07 789 57 345</p>
                    <div className="mt-3 flex gap-2">
                      <div className="h-1 w-full rounded-full bg-tiktok-cyan opacity-40" />
                      <div className="h-1 w-full rounded-full bg-tiktok-magenta opacity-40" />
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}


