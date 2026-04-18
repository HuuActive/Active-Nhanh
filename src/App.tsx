/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, ShieldCheck, BadgeDollarSign, ChevronDown, Loader2, Star, CheckCircle2, 
  Users, Headphones, ArrowRight, Filter, LayoutGrid, Gamepad2, Briefcase, 
  GraduationCap, Camera, Monitor, Cloud, Cpu, Gift, Package 
} from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductFilters from './components/ProductFilters';
import Cart from './components/Cart';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import RecentlyViewed from './components/RecentlyViewed';
import ProductDetail from './components/ProductDetail';
import CheckoutModal from './components/CheckoutModal';
import MyOrdersModal from './components/MyOrdersModal';
import ContactModal from './components/ContactModal';
import DMCAModal from './components/DMCAModal';
import WarrantyModal from './components/WarrantyModal';
import PaymentGuideModal from './components/PaymentGuideModal';
import GuideModal from './components/GuideModal';
import LoginModal from './components/LoginModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useProducts, useAuth, useCategories, useReviews } from './hooks/useFirebase';
import { useRecentlyViewed } from './hooks/useRecentlyViewed';
import { Product, CartItem, Category } from './types';

const faqs = [
  {
    question: 'Tài khoản có được bảo hành không?',
    answer: 'Chúng tôi cam kết duy trì quyền truy cập suốt thời hạn gói dịch vụ. Hoàn phí theo tỷ lệ thời gian nếu gặp sự cố từ phía nhà cung cấp gốc.'
  },
  {
    question: 'Thời gian nhận tài khoản là bao lâu?',
    answer: 'Thông thường bạn sẽ nhận được thông tin tài khoản ngay lập tức sau khi thanh toán thành công. Một số dịch vụ đặc thù có thể mất từ 5-15 phút.'
  },
  {
    question: 'Tôi có thể sử dụng trên nhiều thiết bị không?',
    answer: 'Tùy vào gói dịch vụ bạn chọn. Ví dụ Google One, Youtube Premium nâng cấp chính chủ nên bạn có thể dùng trên mọi thiết bị bạn đăng nhập.'
  },
  {
    question: 'Làm sao để thanh toán?',
    answer: 'Chúng tôi hỗ trợ thanh toán qua chuyển khoản ngân hàng (Vietcombank) và các ví điện tử phổ biến như MoMo, ZaloPay.'
  }
];

const testimonials = [
  { name: 'Minh Tuấn', role: 'Designer', content: 'Dịch vụ rất nhanh, mình vừa ck xong là có mail ngay. Rất uy tín!', rating: 5 },
  { name: 'Lan Anh', role: 'Sinh viên', content: 'Giá rẻ hơn mua trực tiếp nhiều mà dùng vẫn ổn định. Sẽ ủng hộ dài dài.', rating: 5 },
  { name: 'Hoàng Nam', role: 'Freelancer', content: 'Support nhiệt tình, hướng dẫn mình cài đặt từ A-Z. Rất hài lòng.', rating: 5 },
  { name: 'Thu Hà', role: 'Kế toán', content: 'Lúc đầu cũng hơi lo vì giá rẻ quá, nhưng dùng thử Youtube Premium thấy mượt lắm, không bị out bao giờ. Vote 5 sao!', rating: 5 },
  { name: 'Quốc Bảo', role: 'Content Creator', content: 'Mua Canva Pro ở đây tiết kiệm được khối tiền. Admin hỗ trợ nhanh, nhắn tin cái là rep liền. Ưng cái bụng.', rating: 5 },
  { name: 'Thùy Linh', role: 'Nhiếp ảnh gia', content: 'Đã mua Google One 2TB ở shop được 6 tháng, vẫn dùng ngon lành. Nâng cấp trên chính mail của mình nên rất yên tâm.', rating: 5 },
  { name: 'Anh Tuấn', role: 'Kinh doanh', content: 'Dịch vụ chuyên nghiệp, thanh toán xong có hướng dẫn chi tiết qua mail luôn. Rất phù hợp cho mình.', rating: 5 },
  { name: 'Ngọc Diệp', role: 'Marketing', content: 'Biết shop muộn quá, trước toàn mua giá gốc xót hết cả ví. Từ nay sẽ là khách ruột của ActiveNhanh.', rating: 5 }
];

const stats = [
  { icon: Users, label: 'Khách hàng', value: '10,000+' },
  { icon: Zap, label: 'Dịch vụ', value: '50+' },
  { icon: Headphones, label: 'Hỗ trợ', value: '24/7' },
  { icon: Star, label: 'Hài lòng', value: '99%' }
];

const categoryIcons: Record<string, any> = {
  'All': LayoutGrid,
  'Giải trí': Gamepad2,
  'Làm việc': Briefcase,
  'Học tập': GraduationCap,
  'Edit Ảnh - Video': Camera,
  'Windows, Office': Monitor,
  'Google Drive': Cloud,
  'Vũ trụ AI': Cpu,
  'Quà tặng': Gift,
};

export default function App() {
  const { products, loading: productsLoading } = useProducts();
  const { categories: dbCategories } = useCategories();
  const { reviews: generalReviews } = useReviews('general');
  const { isAdmin } = useAuth();
  const { recentlyViewed, addToRecentlyViewed } = useRecentlyViewed();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isDMCAOpen, setIsDMCAOpen] = useState(false);
  const [isWarrantyOpen, setIsWarrantyOpen] = useState(false);
  const [isPaymentGuideOpen, setIsPaymentGuideOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number | null]>([0, null]);
  const [minRating, setMinRating] = useState(0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => {
        const step = window.innerWidth < 768 ? 1 : 3;
        const total = generalReviews.length > 0 ? generalReviews.length : testimonials.length;
        return prev + step >= total ? 0 : prev + step;
      });
    }, 6000);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearInterval(timer);
    };
  }, [generalReviews.length]);

  const displayTestimonials = generalReviews.length > 0 ? generalReviews.map(r => ({
    name: r.userName,
    role: 'Khách hàng',
    content: r.comment,
    rating: r.rating
  })) : testimonials;

  const categories = dbCategories.length > 0 
    ? ['All', ...dbCategories.map(c => c.name)]
    : ['All', ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && (priceRange[1] === null || product.price <= priceRange[1]);
    const matchesRating = product.rating >= minRating;
    return matchesCategory && matchesSearch && matchesPrice && matchesRating;
  });

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleContinueShopping = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      const element = document.getElementById('products');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    addToRecentlyViewed(product);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white font-sans">
        <Header 
          cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} 
          onCartClick={() => setIsCartOpen(true)}
          onAdminClick={() => setIsAdminOpen(true)}
          onMyOrdersClick={() => setIsMyOrdersOpen(true)}
          onContactClick={() => setIsContactOpen(true)}
          onGuideClick={() => setIsGuideOpen(true)}
          onLoginClick={() => setIsLoginOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <main>
          <Hero />

          {/* Products Section */}
          <section id="products" className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 lg:mb-12 flex flex-col items-center text-center gap-4">
                <h2 className="font-sans text-4xl font-black tracking-tight text-tiktok-black sm:text-5xl">Sản phẩm nổi bật</h2>
                <p className="max-w-2xl text-brand-500 font-medium px-4">Khám phá danh mục các dịch vụ số cao cấp được tin dùng nhất hiện nay.</p>
                
                <div className="mt-6 lg:mt-12 w-full max-w-full overflow-hidden">
                  <div className="flex w-full items-center gap-2 overflow-x-auto pb-4 no-scrollbar lg:justify-center lg:pb-0">
                    <div className="flex shrink-0 items-center gap-2 lg:gap-3 px-4 lg:px-0">
                    {categories.map((category) => {
                      const Icon = categoryIcons[category] || Package;
                      const isActive = selectedCategory === category;
                      
                      return (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`group flex shrink-0 items-center gap-2 rounded-xl lg:rounded-2xl px-3.5 py-2 lg:px-5 lg:py-3 text-[11px] lg:text-sm font-bold transition-all duration-300 ${
                              isActive
                                ? 'bg-tiktok-black text-white shadow-lg lg:shadow-xl scale-105 z-10'
                                : 'bg-brand-50/80 border border-transparent text-brand-500 hover:bg-white hover:border-brand-200 hover:text-tiktok-black hover:shadow-sm'
                            }`}
                          >
                            <Icon className={`h-3.5 w-3.5 lg:h-4 lg:w-4 transition-transform duration-300 ${isActive ? 'text-tiktok-cyan' : 'text-brand-300 group-hover:text-tiktok-cyan'}`} />
                            {category === 'All' ? 'Tất cả' : category}
                          </button>
                      );
                    })}
                  </div>

                      <div className="hidden lg:block h-6 w-px bg-brand-100 mx-3" />
                      
                      <div className="pr-4 lg:pr-0">
                        <button
                          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                          className={`flex shrink-0 items-center gap-2 rounded-xl lg:rounded-2xl border px-4 py-2 lg:px-5 lg:py-3 text-[11px] lg:text-sm font-bold transition-all ${
                            isFiltersOpen || priceRange[1] !== null || minRating > 0
                              ? 'border-tiktok-cyan bg-tiktok-cyan/5 text-tiktok-black'
                              : 'border-brand-100 bg-white text-brand-500 hover:border-brand-200 hover:shadow-sm'
                          }`}
                        >
                          <Filter className={`h-3.5 w-3.5 lg:h-4 lg:w-4 ${isFiltersOpen ? 'text-tiktok-cyan' : 'text-brand-300'}`} /> 
                          <span className="whitespace-nowrap">Bộ lọc</span>
                          {(priceRange[1] !== null || minRating > 0) && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-tiktok-magenta text-[10px] text-white">
                              !
                            </span>
                          )}
                        </button>
                      </div>
                  </div>
                </div>
              </div>

              <ProductFilters
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                minRating={minRating}
                onMinRatingChange={setMinRating}
                onClear={() => {
                  setPriceRange([0, null]);
                  setMinRating(0);
                }}
                isOpen={isFiltersOpen}
                onClose={() => setIsFiltersOpen(false)}
              />

              {productsLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-tiktok-cyan" />
                </div>
              ) : (
                <motion.div 
                  layout
                  className="grid grid-cols-2 gap-3 md:gap-8 sm:grid-cols-2 lg:grid-cols-4"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <motion.div
                          layout
                          key={product.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ProductCard
                            product={product}
                            onAddToCart={addToCart}
                            onView={handleViewProduct}
                          />
                        </motion.div>
                      ))
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-20 text-center"
                      >
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
                          <Filter className="h-10 w-10 text-brand-200" />
                        </div>
                        <h3 className="text-xl font-bold text-tiktok-black">Không tìm thấy sản phẩm</h3>
                        <p className="mt-2 text-brand-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                        <button 
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('All');
                            setPriceRange([0, null]);
                            setMinRating(0);
                          }}
                          className="mt-6 font-bold text-tiktok-cyan hover:underline"
                        >
                          Xóa tất cả bộ lọc
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </section>

          <RecentlyViewed 
            products={recentlyViewed} 
            onAddToCart={addToCart} 
            onView={handleViewProduct}
          />

          {/* Features Section */}
          <section className="py-16 bg-brand-50/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {[
                  { icon: Zap, title: 'Hỗ trợ kích hoạt', desc: 'Bàn giao dịch vụ ngay trong 5-15 phút sau khi thanh toán.', color: 'text-tiktok-cyan' },
                  { icon: ShieldCheck, title: 'Cam kết sử dụng', desc: 'Duy trì quyền truy cập & bảo hành suốt thời hạn gói dịch vụ.', color: 'text-tiktok-magenta' },
                  { icon: BadgeDollarSign, title: 'Chi phí tối ưu', desc: 'Giải pháp tiết kiệm, tối ưu cho cá nhân và hộ kinh doanh.', color: 'text-tiktok-cyan' }
                ].map((feature, i) => (
                  <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-sm border border-brand-100 transition-all hover:shadow-md">
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 ${feature.color}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 font-bold text-tiktok-black">{feature.title}</h3>
                    <p className="text-sm text-brand-500">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Statistics Section */}
          <section className="py-16 bg-tiktok-black text-white overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-96 h-96 bg-tiktok-cyan rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-tiktok-magenta rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>
            </div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    <div className="mb-4 p-3 rounded-2xl bg-white/5 border border-white/10">
                      <stat.icon className="h-6 w-6 text-tiktok-cyan" />
                    </div>
                    <div className="text-4xl font-black mb-1">{stat.value}</div>
                    <div className="text-sm font-bold text-brand-400 uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How it works Section */}
          <section className="py-16 lg:py-24 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="font-sans text-4xl font-black tracking-tight text-tiktok-black mb-4">Quy trình mua hàng</h2>
                <p className="text-brand-500 font-medium">Chỉ với 4 bước đơn giản để sở hữu dịch vụ cao cấp.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-brand-100 -translate-y-1/2 z-0"></div>
                {[
                  { step: '01', title: 'Chọn sản phẩm', desc: 'Duyệt danh mục và chọn gói dịch vụ phù hợp.' },
                  { step: '02', title: 'Thanh toán', desc: 'Chuyển khoản qua ngân hàng hoặc ví điện tử.' },
                  { step: '03', title: 'Nhận tài khoản', desc: 'Thông tin được gửi ngay qua Email/Zalo.' },
                  { step: '04', title: 'Sử dụng', desc: 'Bắt đầu trải nghiệm và nhận hỗ trợ 24/7.' }
                ].map((item, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center text-center bg-white p-4">
                    <div className="w-12 h-12 rounded-full bg-tiktok-black text-white flex items-center justify-center font-black mb-6 ring-8 ring-white">
                      {item.step}
                    </div>
                    <h3 className="font-bold text-tiktok-black mb-2">{item.title}</h3>
                    <p className="text-sm text-brand-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-16 lg:py-24 bg-brand-50/50 overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="font-sans text-4xl font-black tracking-tight text-tiktok-black mb-4">Khách hàng nói gì</h2>
                <p className="text-brand-500 font-medium">Sự hài lòng của bạn là động lực phát triển của chúng tôi.</p>
              </div>

              <div className="relative">
                <div className="overflow-hidden px-1">
                  <motion.div 
                    className="flex gap-8"
                    animate={{ x: `-${(testimonialIndex / (isMobile ? 1 : 3)) * 100}%` }}
                    transition={{ 
                      duration: 0.8,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    {displayTestimonials.map((t, i) => (
                      <div 
                        key={i} 
                        className="w-full md:w-[calc(33.333%-21.33px)] flex-shrink-0 bg-white p-8 rounded-3xl border border-brand-100 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex gap-1 mb-4">
                          {[...Array(t.rating)].map((_, j) => (
                            <Star key={j} className="h-4 w-4 fill-tiktok-magenta text-tiktok-magenta" />
                          ))}
                        </div>
                        <p className="text-brand-600 italic mb-6">"{t.content}"</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center font-bold text-tiktok-black">
                            {t.name[0]}
                          </div>
                          <div>
                            <div className="font-bold text-tiktok-black text-sm">{t.name}</div>
                            <div className="text-xs text-brand-400">{t.role}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Pagination Dots */}
                <div className="mt-12 flex justify-center gap-2">
                  {[...Array(Math.ceil(displayTestimonials.length / (isMobile ? 1 : 3)))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTestimonialIndex(i * (isMobile ? 1 : 3))}
                      className={`h-2 rounded-full transition-all ${
                        Math.floor(testimonialIndex / (isMobile ? 1 : 3)) === i 
                          ? 'w-8 bg-tiktok-black' 
                          : 'w-2 bg-brand-200 hover:bg-brand-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 lg:py-24 bg-white">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2 className="font-sans text-4xl font-black tracking-tight text-tiktok-black mb-4">Câu hỏi thường gặp</h2>
                <p className="text-brand-500 font-medium">Giải đáp các thắc mắc phổ biến của khách hàng.</p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-brand-50"
                    >
                      <span className="font-bold text-tiktok-black">{faq.question}</span>
                      <ChevronDown className={`h-5 w-5 text-brand-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="border-t border-brand-100 p-6 text-sm leading-relaxed text-brand-500">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-[40px] bg-tiktok-black p-8 md:p-20 text-white text-center">
                <div className="absolute left-0 top-0 h-full w-full opacity-20">
                  <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-tiktok-cyan blur-[100px]"></div>
                  <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-tiktok-magenta blur-[100px]"></div>
                </div>
                <div className="relative z-10">
                  <h2 className="mb-6 font-sans text-4xl font-black tracking-tight sm:text-6xl">Sẵn sàng nâng cấp trải nghiệm?</h2>
                  <p className="mb-10 text-brand-300 text-lg max-w-2xl mx-auto">Hàng ngàn khách hàng đã tin dùng và hài lòng với dịch vụ của chúng tôi. Còn bạn thì sao?</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                      className="tiktok-button px-12 py-4 text-lg bg-white text-tiktok-black flex items-center gap-2" 
                      style={{ boxShadow: '4px 4px 0px #00F2EA' }}
                    >
                      Bắt đầu ngay <ArrowRight className="h-5 w-5" />
                    </button>
                    <button className="px-12 py-4 text-lg font-bold border border-white/20 rounded-full hover:bg-white/10 transition-colors">
                      Liên hệ hỗ trợ
                    </button>
                  </div>
                  <div className="mt-12 flex items-center justify-center gap-8 opacity-50 grayscale">
                    <div className="flex items-center gap-2 font-black text-xl italic">VISA</div>
                    <div className="flex items-center gap-2 font-black text-xl italic">MasterCard</div>
                    <div className="flex items-center gap-2 font-black text-xl italic">MOMO</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer 
          onDMCAClick={() => setIsDMCAOpen(true)}
          onContactClick={() => setIsContactOpen(true)}
          onWarrantyClick={() => setIsWarrantyOpen(true)}
          onPaymentGuideClick={() => setIsPaymentGuideOpen(true)}
        />

        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onContinueShopping={handleContinueShopping}
          onCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
        />

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cartItems}
          total={cartTotal}
        />

        {isAdmin && (
          <AdminPanel 
            isOpen={isAdminOpen} 
            onClose={() => setIsAdminOpen(false)} 
          />
        )}

        <MyOrdersModal
          isOpen={isMyOrdersOpen}
          onClose={() => setIsMyOrdersOpen(false)}
        />

        <ContactModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
        />

        <DMCAModal
          isOpen={isDMCAOpen}
          onClose={() => setIsDMCAOpen(false)}
        />

        <WarrantyModal
          isOpen={isWarrantyOpen}
          onClose={() => setIsWarrantyOpen(false)}
        />

        <PaymentGuideModal
          isOpen={isPaymentGuideOpen}
          onClose={() => setIsPaymentGuideOpen(false)}
        />

        <GuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />

        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
        />

        <ProductDetail
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      </div>
    </ErrorBoundary>
  );
}



