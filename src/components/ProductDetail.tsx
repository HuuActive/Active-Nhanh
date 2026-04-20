import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Star, ShieldCheck, Zap, MessageCircle, Info, Package, HelpCircle, CheckCircle2, History, Send, Share2, Facebook, Link, Trash2, Reply, Phone, Mail, Loader2, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import SEO from './SEO';
import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';
import { useReviews, useAuth } from '../hooks/useFirebase';

interface ProductDetailProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductDetail({ product, isOpen, onClose, onAddToCart }: ProductDetailProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'guide' | 'terms'>('description');
  const { user, profile, isAdmin } = useAuth();
  const { reviews, hasMore: hasMoreReviews, loadMore: loadMoreReviews, addReview, addReply, deleteReview, addConsultationRequest } = useReviews(product?.id || '', true, 5);
  const [newReview, setNewReview] = useState({ userName: '', rating: 5, comment: '' });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  
  const [isConsulting, setIsConsulting] = useState(false);
  const [consultationForm, setConsultationForm] = useState({ contact: '' });
  const [consultationLoading, setConsultationLoading] = useState(false);
  const [consultationSuccess, setConsultationSuccess] = useState(false);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(product?.variants?.[0]?.id || null);
  
  if (!product) return null;

  const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const displayStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultationForm.contact) return;

    // Honeypot check
    const honeypot = (e.target as any).website_consult?.value;
    if (honeypot) return;

    // Rate limiting
    const lastConsultTime = localStorage.getItem('lastConsultTime');
    const now = Date.now();
    if (lastConsultTime && now - parseInt(lastConsultTime) < 60000) {
      alert('Bạn đã gửi yêu cầu gần đây. Vui lòng đợi một lát.');
      return;
    }
    
    setConsultationLoading(true);
    
    try {
      // ... existing logic ...
      await addConsultationRequest({
        productId: product.id,
        productName: product.name,
        contact: consultationForm.contact,
        userId: user?.uid || 'anonymous',
        userName: profile?.displayName || user?.displayName || 'Khách vãng lai'
      });

      // ... existing EmailJS logic ...
      const templateParams = {
        to_name: 'Admin ActiveNhanh',
        from_name: user?.displayName || 'Khách vãng lai',
        contact_info: consultationForm.contact,
        product_name: product.name,
        product_id: product.id,
        message: `Khách hàng đang quan tâm đến sản phẩm: ${product.name}. Vui lòng liên hệ tư vấn qua: ${consultationForm.contact}`
      };

      await emailjs.send(
        'service_gboj9t8',
        'template_gq2de5r',
        templateParams,
        '6QQm5z9DfRF_w7a27'
      );

      setConsultationSuccess(true);
      localStorage.setItem('lastConsultTime', now.toString());
      setTimeout(() => {
        setConsultationSuccess(false);
        setIsConsulting(false);
        setConsultationForm({ contact: '' });
      }, 3000);
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu tư vấn:', error);
      alert('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setConsultationLoading(false);
    }
  };

  const handleShare = async (platform: 'facebook' | 'link') => {
    const url = window.location.href;
    const title = `ActiveNhanh - ${product.name}`;
    
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('Đã sao chép liên kết vào bộ nhớ tạm!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
    setIsSharing(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.userName || !newReview.comment) return;

    // Honeypot check (hidden field that bots usually fill)
    const honeypot = (e.target as any).website?.value;
    if (honeypot) {
      console.log('Bot detected via honeypot');
      return;
    }

    // Rate limiting: Check local storage for last review time
    const lastReviewTime = localStorage.getItem('lastReviewTime');
    const now = Date.now();
    if (lastReviewTime && now - parseInt(lastReviewTime) < 30000) { // 30 seconds limit
      alert('Bạn đang gửi đánh giá quá nhanh. Vui lòng đợi một lát.');
      return;
    }
    
    // Enhanced Anti-Spam: Check for common spam keywords and patterns
    const spamKeywords = [
      'http', 'www', 'free', 'money', 'click here', 'casino', 'bet', 
      'crypto', 'bitcoin', 'viagra', 'earn', 'cheap', 'discount',
      'sex', 'porn', 'hack', 'crack', 'buy now', 'offer'
    ];
    
    const commentLower = newReview.comment.toLowerCase();
    const isSpam = spamKeywords.some(keyword => commentLower.includes(keyword));
    
    // Check for excessive repetitive characters (e.g., "aaaaaaa")
    const hasExcessiveRepetition = /(.)\1{5,}/.test(commentLower);
    
    // Check for minimum length
    const isTooShort = newReview.comment.trim().length < 5;

    if (isSpam || hasExcessiveRepetition) {
      alert('Bình luận của bạn chứa nội dung không phù hợp hoặc có dấu hiệu spam.');
      return;
    }

    if (isTooShort) {
      alert('Bình luận quá ngắn. Vui lòng chia sẻ thêm trải nghiệm của bạn.');
      return;
    }

    await addReview({
      productId: product.id,
      userName: profile?.displayName || user?.displayName || newReview.userName,
      userPhoto: profile?.photoURL || user?.photoURL || '',
      userId: user?.uid || 'anonymous',
      rating: newReview.rating,
      comment: newReview.comment
    });
    
    localStorage.setItem('lastReviewTime', now.toString());
    setNewReview({ userName: '', rating: 5, comment: '' });
    alert('Cảm ơn bạn! Đánh giá của bạn đã được gửi và đang chờ quản trị viên phê duyệt.');
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText) return;
    await addReply(reviewId, {
      userName: profile?.displayName || user?.displayName || 'Admin',
      userPhoto: profile?.photoURL || user?.photoURL || '',
      userId: user?.uid,
      comment: replyText,
      isAdmin: isAdmin
    });
    setReplyText('');
    setReplyingTo(null);
  };

  const productSchema = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": [product.image],
    "description": product.seoDescription || product.description,
    "brand": {
      "@type": "Brand",
      "name": "ActiveNhanh"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "VND",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviews
    }
  } : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {product && (
            <SEO 
              title={product.seoTitle || product.name}
              description={product.seoDescription || product.description.substring(0, 160)}
              keywords={product.seoKeywords}
              image={product.image}
              url={window.location.href}
              type="product"
              schema={productSchema}
            />
          )}
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
            className="relative w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-tiktok-black shadow-md backdrop-blur-sm transition-transform hover:scale-110"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="h-full max-h-[90vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left: Image */}
                <div className="p-6 lg:p-10">
                  <div className="relative aspect-square overflow-hidden rounded-3xl bg-brand-50 shadow-inner">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  {/* Trust Badges below image */}
                    <div className="mt-8 grid grid-cols-3 gap-4">
                      <div className="flex flex-col items-center gap-2 rounded-2xl bg-green-50 p-4 text-center border border-green-100/50">
                        <ShieldCheck className="h-6 w-6 text-green-600" />
                        <span className="text-[10px] font-bold uppercase text-green-700">Bảo hành 1:1</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 rounded-2xl bg-blue-50 p-4 text-center border border-blue-100/50">
                        <MessageCircle className="h-6 w-6 text-blue-600" />
                        <span className="text-[10px] font-bold uppercase text-blue-700">Hỗ trợ 24/7</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 rounded-2xl bg-brand-50 p-4 text-center border border-tiktok-magenta/10">
                        <Zap className="h-6 w-6 text-tiktok-magenta" />
                        <span className="text-[10px] font-bold uppercase text-tiktok-magenta">Kích hoạt ngay</span>
                      </div>
                    </div>
                </div>

                {/* Right: Info */}
                <div className="flex flex-col p-6 lg:p-10 lg:pl-0">
                  <div className="mb-6">
                    <span className="mb-4 inline-block rounded-full bg-brand-100 px-4 py-1 text-xs font-bold text-brand-500">
                      {product.category}
                    </span>
                    <h2 className="mb-4 font-sans text-[22px] lg:text-4xl font-black tracking-tight text-tiktok-black">
                      {product.name}
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 lg:h-4 lg:w-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-brand-200'}`} />
                        ))}
                      </div>
                      <span className="text-[12px] lg:text-sm font-bold text-brand-400">({reviews.length} đánh giá từ khách hàng)</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${displayStock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {displayStock > 0 ? 'Sẵn sàng kích hoạt ngay' : 'Hết hàng'}
                      </span>
                    </div>
                  </div>

                    <div className="mb-8 flex flex-wrap items-baseline gap-2 lg:gap-4">
                      <div className="flex items-baseline gap-1 lg:gap-2">
                        <span className="text-2xl lg:text-5xl font-black text-tiktok-magenta">{formatPrice(displayPrice)}</span>
                        {product.priceUnit && (
                          <span className="text-[10px] lg:text-sm font-bold text-brand-400 uppercase">/ {product.priceUnit}</span>
                        )}
                      </div>
                      <span className="text-sm lg:text-xl font-bold text-brand-300 line-through">
                        {formatPrice(displayOriginalPrice || Math.ceil((displayPrice * 1.8) / 10000) * 10000)}
                      </span>
                    </div>

                  {/* Variants Selection */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="mb-8 space-y-4">
                      <h3 className="flex items-center gap-2 text-[13px] lg:text-sm font-black uppercase tracking-wider text-tiktok-black">
                        <Tag className="h-4 w-4" /> Chọn phân loại
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariantId(v.id)}
                            className={`rounded-xl border-2 px-3 py-1.5 lg:px-4 lg:py-2 text-[12px] lg:text-sm font-bold transition-all ${
                              selectedVariantId === v.id
                                ? 'border-tiktok-magenta bg-tiktok-magenta/5 text-tiktok-magenta'
                                : 'border-brand-100 bg-white text-brand-500 hover:border-brand-200'
                            }`}
                          >
                            {v.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Features */}
                  <div className="mb-10 space-y-4">
                    <h3 className="flex items-center gap-2 text-[13px] lg:text-sm font-black uppercase tracking-wider text-tiktok-black">
                      <Info className="h-4 w-4" /> Đặc điểm nổi bật
                    </h3>
                    <div className="space-y-3">
                      {(product.shortFeatures || 'Dung lượng cao;Bảo hành uy tín;Kích hoạt chính chủ').split(';').map((feature, idx) => {
                        const displayFeature = feature.toLowerCase().includes('1tb') ? 'Tặng kèm 1TB lưu trữ Cloud Team mượt mà' : feature;
                        return (
                          <div key={idx} className="flex items-center gap-3 rounded-2xl bg-brand-50 p-3 lg:p-4 transition-colors hover:bg-brand-100">
                            <CheckCircle2 className="h-4 w-4 lg:h-5 lg:w-5 text-tiktok-cyan" />
                            <span className="text-[13px] lg:text-sm font-bold text-tiktok-black">{displayFeature}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-auto space-y-4">
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          if (displayStock > 0) {
                            const productToCart = selectedVariant 
                              ? { ...product, id: `${product.id}-${selectedVariant.id}`, name: `${product.name} (${selectedVariant.name})`, price: selectedVariant.price, originalPrice: selectedVariant.originalPrice, stock: selectedVariant.stock }
                              : product;
                            onAddToCart(productToCart);
                            onClose();
                          }
                        }}
                        disabled={displayStock <= 0}
                        className={`flex-1 flex items-center justify-center gap-2 lg:gap-3 rounded-2xl py-3.5 lg:py-5 text-[15px] lg:text-xl font-black text-white shadow-xl transition-all ${displayStock > 0 ? 'bg-tiktok-black hover:scale-[1.02] active:scale-95 cursor-pointer' : 'bg-brand-200 cursor-not-allowed'}`}
                      >
                        <ShoppingCart className="h-5 w-5 lg:h-6 lg:w-6" /> {displayStock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                      </button>
                      
                      <div className="relative">
                        <button
                          onClick={() => setIsSharing(!isSharing)}
                          className="flex h-full w-16 items-center justify-center rounded-2xl border-2 border-brand-100 bg-white text-tiktok-black transition-all hover:border-tiktok-cyan hover:text-tiktok-cyan"
                        >
                          <Share2 className="h-6 w-6" />
                        </button>
                        
                        <AnimatePresence>
                          {isSharing && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: 10 }}
                              className="absolute bottom-full right-0 mb-4 flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl border border-brand-100 min-w-[160px]"
                            >
                              <button
                                onClick={() => handleShare('facebook')}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-brand-600 transition-colors hover:bg-brand-50 hover:text-[#1877F2]"
                              >
                                <Facebook className="h-4 w-4" /> Facebook
                              </button>
                              <button
                                onClick={() => handleShare('link')}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-brand-600 transition-colors hover:bg-brand-50 hover:text-tiktok-cyan"
                              >
                                <Link className="h-4 w-4" /> Sao chép link
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Consultation Section */}
                    <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
                      {!isConsulting ? (
                        <button 
                          onClick={() => setIsConsulting(true)}
                          className="flex w-full items-center justify-center gap-2 text-sm font-bold text-brand-600 hover:text-tiktok-black transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" /> Bạn cần tư vấn thêm về sản phẩm này?
                        </button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-3"
                        >
                          {consultationSuccess ? (
                            <div className="flex items-center justify-center gap-2 py-2 text-sm font-bold text-green-600">
                              <CheckCircle2 className="h-5 w-5" /> Yêu cầu đã được gửi! Chúng tôi sẽ liên hệ sớm.
                            </div>
                          ) : (
                            <>
                              <p className="text-xs font-bold text-brand-500 text-center">Để lại SĐT hoặc Email, chúng tôi sẽ liên hệ tư vấn ngay!</p>
                              <form onSubmit={handleConsultationSubmit} className="flex gap-2">
                                {/* Honeypot field */}
                                <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} aria-hidden="true">
                                  <input type="text" name="website_consult" tabIndex={-1} autoComplete="off" />
                                </div>
                                <input
                                  type="text"
                                  required
                                  placeholder="SĐT hoặc Email của bạn..."
                                  value={consultationForm.contact}
                                  onChange={e => setConsultationForm({ contact: e.target.value })}
                                  className="flex-1 rounded-xl border border-brand-100 bg-white px-4 py-2 text-sm focus:border-tiktok-cyan focus:outline-none"
                                />
                                <button
                                  type="submit"
                                  disabled={consultationLoading}
                                  className="rounded-xl bg-tiktok-cyan px-4 py-2 text-xs font-black text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                                >
                                  {consultationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gửi'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsConsulting(false)}
                                  className="rounded-xl bg-brand-100 px-3 py-2 text-xs font-bold text-brand-400"
                                >
                                  Hủy
                                </button>
                              </form>
                            </>
                          )}
                        </motion.div>
                      )}
                    </div>

                    <p className="text-center text-xs font-bold text-brand-400">Hỗ trợ kích hoạt qua Email ngay sau khi thanh toán</p>
                  </div>
                </div>
              </div>

              {/* Tabs Section */}
              <div className="border-t border-brand-100 bg-brand-50/30">
                <div className="mx-auto max-w-4xl px-6">
                    <div className="flex border-b border-brand-100 overflow-x-auto no-scrollbar">
                      <button
                        onClick={() => setActiveTab('description')}
                        className={`relative flex-shrink-0 px-4 sm:px-8 py-4 sm:py-6 text-[10px] sm:text-sm font-black uppercase tracking-widest transition-colors ${activeTab === 'description' ? 'text-tiktok-black' : 'text-brand-400 hover:text-tiktok-black'}`}
                      >
                        Mô tả chi tiết
                        {activeTab === 'description' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 h-1 w-full bg-tiktok-magenta" />}
                      </button>
                      <button
                        onClick={() => setActiveTab('guide')}
                        className={`relative flex-shrink-0 px-4 sm:px-8 py-4 sm:py-6 text-[10px] sm:text-sm font-black uppercase tracking-widest transition-colors ${activeTab === 'guide' ? 'text-tiktok-black' : 'text-brand-400 hover:text-tiktok-black'}`}
                      >
                        Hướng dẫn
                        {activeTab === 'guide' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 h-1 w-full bg-tiktok-magenta" />}
                      </button>
                      <button
                        onClick={() => setActiveTab('terms')}
                        className={`relative flex-shrink-0 px-4 sm:px-8 py-4 sm:py-6 text-[10px] sm:text-sm font-black uppercase tracking-widest transition-colors ${activeTab === 'terms' ? 'text-tiktok-black' : 'text-brand-400 hover:text-tiktok-black'}`}
                      >
                        Quy định
                        {activeTab === 'terms' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 h-1 w-full bg-tiktok-magenta" />}
                      </button>
                    </div>

                  <div className="py-12">
                    {activeTab === 'description' && (
                      <div className="space-y-12">
                        <div className="rounded-3xl bg-white p-8 shadow-sm border border-brand-100">
                          <h3 className="mb-8 flex items-center gap-3 text-[18px] lg:text-xl font-black text-tiktok-black">
                            <Info className="h-6 w-6 text-tiktok-cyan" /> Thông tin chi tiết {product.name}
                          </h3>
                          <div className="markdown-body space-y-8 text-[13px] lg:text-base">
                            <section>
                              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{product.description}</ReactMarkdown>
                            </section>
                          </div>
                        </div>

                        {/* Why Choose Us & Warranty Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="rounded-3xl bg-white p-8 shadow-sm border border-brand-100">
                            <h4 className="mb-6 flex items-center gap-2 text-[15px] lg:text-base font-black text-tiktok-black">
                              <Zap className="h-5 w-5 text-yellow-500" /> Tại sao nên chọn chúng tôi?
                            </h4>
                            <ul className="space-y-4">
                              {[
                                'Chi phí tiết kiệm, tối ưu cho người dùng cá nhân',
                                'Hỗ trợ kích hoạt & Bàn giao ngay trong 5-15 phút',
                                'Đồng hành & Hỗ trợ kỹ thuật trọn đời gói dịch vụ'
                              ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-[13px] lg:text-sm font-medium text-brand-600">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" /> {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="rounded-3xl bg-white p-8 shadow-sm border border-brand-100">
                            <h4 className="mb-6 flex items-center gap-2 text-[15px] lg:text-base font-black text-tiktok-black">
                              <ShieldCheck className="h-5 w-5 text-tiktok-magenta" /> Cam kết bảo hành
                            </h4>
                            <p className="text-[13px] lg:text-sm leading-relaxed text-brand-600">
                              Cam kết duy trì quyền truy cập suốt thời hạn gói dịch vụ. Hoàn phí dịch vụ theo tỷ lệ thời gian chưa sử dụng nếu gặp sự cố từ nhà cung cấp gốc.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'guide' && (
                      <div className="rounded-3xl bg-white p-6 lg:p-8 shadow-sm border border-brand-100">
                        <h3 className="mb-8 flex items-center gap-3 text-[18px] lg:text-xl font-black text-tiktok-black">
                          <HelpCircle className="h-6 w-6 text-tiktok-cyan" /> Hướng dẫn sử dụng
                        </h3>
                        <div className="markdown-body text-[13px] lg:text-base">
                          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{product.usageGuide || 'Đang cập nhật hướng dẫn sử dụng cho sản phẩm này...'}</ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {activeTab === 'terms' && (
                      <div className="rounded-3xl bg-white p-6 lg:p-8 shadow-sm border border-brand-100">
                        <h3 className="mb-8 flex items-center gap-3 text-[18px] lg:text-xl font-black text-tiktok-black">
                          <ShieldCheck className="h-6 w-6 text-tiktok-magenta" /> Quy định sử dụng dịch vụ
                        </h3>
                        <div className="space-y-8 text-[13px] lg:text-sm leading-relaxed text-brand-600">
                          <section>
                            <h4 className="mb-3 font-black text-tiktok-black flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-500">1</span>
                              Bản chất dịch vụ
                            </h4>
                            <p>Active Nhanh cung cấp dịch vụ hỗ trợ kỹ thuật, bao gồm: thiết lập, cài đặt, cấu hình và thanh toán hộ các dịch vụ phần mềm/AI cho người dùng cuối.</p>
                            <p className="mt-2 font-medium text-tiktok-magenta">Phí khách hàng chi trả là phí dịch vụ kỹ thuật và hỗ trợ vận hành, không phải chi phí mua đứt giấy phép (License) thương mại từ nhà sản xuất.</p>
                          </section>

                          <section>
                            <h4 className="mb-3 font-black text-tiktok-black flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-500">2</span>
                              Quy định sử dụng tài khoản (Dành cho AI, CapCut, v.v.)
                            </h4>
                            <ul className="list-disc pl-5 space-y-2">
                              <li><strong>Giới hạn thiết bị:</strong> Mỗi gói dịch vụ chỉ được sử dụng trên số lượng thiết bị đã thỏa thuận (thường là 01 điện thoại và 01 máy tính).</li>
                              <li><strong>Bảo mật thông tin:</strong> Khách hàng tuyệt đối KHÔNG thay đổi thông tin tài khoản (Email, Mật khẩu, Gói cước) trừ khi có hướng dẫn cụ thể từ kỹ thuật viên.</li>
                              <li><strong>Hành vi bị cấm:</strong> Không chia sẻ thông tin truy cập cho bên thứ ba, không sử dụng tài khoản vào các mục đích vi phạm pháp luật hoặc vi phạm chính sách của nhà cung cấp gốc (OpenAI, CapCut, Microsoft...).</li>
                            </ul>
                          </section>

                          <section>
                            <h4 className="mb-3 font-black text-tiktok-black flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-500">3</span>
                              Quy định về Phần mềm (Windows, Office, v.v.)
                            </h4>
                            <p>Dịch vụ cài đặt và hỗ trợ kích hoạt được thực hiện nhằm mục đích giúp khách hàng trải nghiệm và sử dụng máy tính ổn định cho công việc cá nhân.</p>
                            <p className="mt-2">Active Nhanh không chịu trách nhiệm về các vấn đề bản quyền nếu khách hàng tự ý mang máy sử dụng cho các tổ chức, doanh nghiệp yêu cầu giấy phép kiểm toán khắt khe.</p>
                          </section>

                          <section className="rounded-3xl bg-brand-50/50 p-8 border border-brand-100">
                            <h4 className="mb-6 font-black text-tiktok-black flex items-center gap-2 text-lg">
                              <ShieldCheck className="h-6 w-6 text-tiktok-magenta" />
                              CHÍNH SÁCH BẢO HÀNH DỊCH VỤ SỐ
                            </h4>
                            <p className="mb-6 italic text-brand-500">Tại ActiveNhanh, chúng tôi cam kết không chỉ cung cấp giải pháp mà còn đồng hành cùng quý khách trong suốt quá trình sử dụng. Chính sách bảo hành được thiết lập để đảm bảo quyền lợi cao nhất cho khách hàng.</p>
                            
                            <div className="space-y-6">
                              <div>
                                <h5 className="font-black text-tiktok-black mb-2 flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-tiktok-magenta"></span>
                                  1. Thời hạn bảo hành
                                </h5>
                                <p>Tất cả các gói dịch vụ (CapCut, Office 365, ChatGPT, Google One...) được bảo hành đúng và đủ theo thời gian quý khách đã đăng ký (1 tháng, 6 tháng, 1 năm...).</p>
                              </div>

                              <div>
                                <h5 className="font-black text-tiktok-black mb-2 flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-tiktok-magenta"></span>
                                  2. Phạm vi và Hình thức bảo hành
                                </h5>
                                <ul className="list-disc pl-5 space-y-1">
                                  <li><strong>Lỗi được bảo hành:</strong> Tài khoản bị mất quyền truy cập Premium, lỗi tính năng từ phía hệ thống thiết lập, hoặc lỗi do chính sách thay đổi đột ngột từ nhà cung cấp gốc.</li>
                                  <li><strong>Hình thức hỗ trợ:</strong> Khắc phục lại quyền truy cập trên tài khoản cũ trong vòng 24h.</li>
                                  <li>Trong trường hợp không thể khắc phục trên tài khoản cũ, ActiveNhanh sẽ cung cấp tài khoản thay thế tương đương để đảm bảo công việc của quý khách không bị gián đoạn.</li>
                                  <li>Bảo hành theo chế độ <strong>Lỗi 1 đổi 1</strong> suốt thời hạn sử dụng.</li>
                                </ul>
                              </div>

                              <div>
                                <h5 className="font-black text-tiktok-black mb-2 flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-tiktok-magenta"></span>
                                  3. Chính sách hoàn tiền (Refund)
                                </h5>
                                <ul className="list-disc pl-5 space-y-1">
                                  <li>Nếu trong vòng 7 ngày kể từ khi bàn giao dịch vụ mà khách hàng không hài lòng hoặc có lỗi không thể khắc phục, chúng tôi cam kết hoàn tiền 100%.</li>
                                  <li>Sau 7 ngày, nếu phát sinh lỗi không thể khắc phục (trường hợp bất khả kháng), ActiveNhanh sẽ hoàn tiền theo tỷ lệ thời gian chưa sử dụng của gói dịch vụ.</li>
                                </ul>
                              </div>

                              <div>
                                <h5 className="font-black text-tiktok-black mb-2 flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-tiktok-magenta"></span>
                                  4. Các trường hợp từ chối bảo hành
                                </h5>
                                <ul className="list-disc pl-5 space-y-1">
                                  <li>Khách hàng tự ý thay đổi thông tin tài khoản (Email, Mật khẩu, Gói cước) khi chưa có sự hướng dẫn của kỹ thuật viên.</li>
                                  <li>Đăng nhập vượt quá số lượng thiết bị quy định dẫn đến tài khoản bị nhà cung cấp khóa (Ban).</li>
                                  <li>Sử dụng tài khoản vào các mục đích vi phạm pháp luật hoặc vi phạm nghiêm trọng chính sách cộng đồng của hãng (OpenAI, Microsoft, CapCut...).</li>
                                  <li>Quá thời hạn bảo hành đã cam kết trên đơn hàng/hóa đơn dịch vụ.</li>
                                </ul>
                              </div>

                              <div>
                                <h5 className="font-black text-tiktok-black mb-2 flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-tiktok-magenta"></span>
                                  5. Quy trình yêu cầu hỗ trợ
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                                  <div className="bg-white p-3 rounded-xl border border-brand-100">
                                    <p className="text-[10px] font-black text-brand-400 uppercase mb-1">Bước 1</p>
                                    <p className="font-bold text-tiktok-black">Liên hệ Hotline/Zalo kỹ thuật: 07 789 57 345</p>
                                  </div>
                                  <div className="bg-white p-3 rounded-xl border border-brand-100">
                                    <p className="text-[10px] font-black text-brand-400 uppercase mb-1">Bước 2</p>
                                    <p className="font-bold text-tiktok-black">Cung cấp thông tin tài khoản hoặc số điện thoại</p>
                                  </div>
                                  <div className="bg-white p-3 rounded-xl border border-brand-100">
                                    <p className="text-[10px] font-black text-brand-400 uppercase mb-1">Bước 3</p>
                                    <p className="font-bold text-tiktok-black">Xử lý trực tuyến hoặc gửi thông tin mới (15-30p)</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-brand-100 text-center">
                              <p className="font-black text-tiktok-magenta">"Uy tín là sự sống còn"</p>
                              <p className="text-xs text-brand-500">Chúng tôi luôn đặt trách nhiệm hỗ trợ sau bán hàng lên hàng đầu để quý khách yên tâm làm việc và sáng tạo.</p>
                            </div>
                          </section>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-brand-50 py-20">
                <div className="mx-auto max-w-4xl px-6">
                  <h3 className="mb-12 flex items-center gap-3 text-[18px] lg:text-2xl font-black text-tiktok-black">
                    <Star className="h-6 w-6 lg:h-8 lg:w-8 fill-yellow-400 text-yellow-400" /> Đánh giá từ khách hàng ({reviews.length})
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Review Form */}
                    <div className="lg:col-span-1">
                      <div className="rounded-3xl bg-white p-8 shadow-sm border border-brand-100">
                        <h4 className="mb-6 text-sm font-black uppercase tracking-wider text-tiktok-black">Viết đánh giá của bạn</h4>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                          {/* Honeypot field - hidden from users but visible to bots */}
                          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} aria-hidden="true">
                            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                          </div>
                          
                          <div>
                            <label className="mb-1 block text-[10px] font-bold uppercase text-brand-400">Tên của bạn</label>
                            <input
                              type="text"
                              required
                              value={newReview.userName}
                              onChange={e => setNewReview({...newReview, userName: e.target.value})}
                              className="w-full rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                              placeholder="Nhập tên của bạn"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-bold uppercase text-brand-400">Số sao</label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setNewReview({...newReview, rating: star})}
                                  className="transition-transform hover:scale-110"
                                >
                                  <Star className={`h-6 w-6 ${star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-brand-200'}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-bold uppercase text-brand-400">Nhận xét</label>
                            <textarea
                              required
                              rows={4}
                              value={newReview.comment}
                              onChange={e => setNewReview({...newReview, comment: e.target.value})}
                              className="w-full rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                            />
                          </div>
                          <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-tiktok-black py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                          >
                            <Send className="h-4 w-4" /> Gửi đánh giá
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Review List */}
                    <div className="lg:col-span-2">
                      {reviews.length > 0 ? (
                        <div className="space-y-6">
                          {reviews.map((review) => (
                            <motion.div
                              key={review.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="rounded-3xl bg-white p-8 shadow-sm border border-brand-100"
                            >
                              <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {review.userPhoto ? (
                                    <img src={review.userPhoto} alt="" className="h-10 w-10 rounded-full border border-brand-100" />
                                  ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-tiktok-magenta">
                                      {review.userName.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-sm font-black text-tiktok-black">{review.userName}</div>
                                    <div className="flex gap-0.5">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-brand-200'}`} />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-[10px] font-bold text-brand-300">
                                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                  </span>
                                  {isAdmin && (
                                    <button
                                      onClick={() => deleteReview(review.id)}
                                      className="text-brand-300 transition-colors hover:text-red-500"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm leading-relaxed text-brand-600">{review.comment}</p>

                              {/* Replies */}
                              {review.replies && review.replies.length > 0 && (
                                <div className="mt-6 space-y-4 border-l-2 border-brand-100 pl-6">
                                  {review.replies.map((reply: any, idx: number) => (
                                    <div key={idx} className="relative">
                                      <div className="mb-2 flex items-center gap-2">
                                        <span className={`text-xs font-black ${reply.isAdmin ? 'text-tiktok-cyan' : 'text-tiktok-black'}`}>
                                          {reply.userName} {reply.isAdmin && '(Quản trị viên)'}
                                        </span>
                                        <span className="text-[10px] font-bold text-brand-300">
                                          {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                      </div>
                                      <p className="text-sm text-brand-500">{reply.comment}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Reply Form */}
                              {user && (
                                <div className="mt-6">
                                  {replyingTo === review.id ? (
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Nhập câu trả lời..."
                                        className="flex-1 rounded-xl border border-brand-100 bg-brand-50 px-4 py-2 text-sm focus:border-tiktok-cyan focus:outline-none"
                                      />
                                      <button
                                        onClick={() => handleReply(review.id)}
                                        disabled={!replyText.trim()}
                                        className="rounded-xl bg-tiktok-cyan px-4 py-2 text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                                      >
                                        Gửi
                                      </button>
                                      <button
                                        onClick={() => setReplyingTo(null)}
                                        className="rounded-xl bg-brand-100 px-4 py-2 text-xs font-bold text-brand-500 transition-all hover:bg-brand-200"
                                      >
                                        Hủy
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setReplyingTo(review.id)}
                                      className="flex items-center gap-2 text-xs font-bold text-tiktok-cyan hover:underline"
                                    >
                                      <Reply className="h-3 w-3" /> Trả lời đánh giá
                                    </button>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          ))}
                          
                          {hasMoreReviews && (
                            <button
                              onClick={loadMoreReviews}
                              className="w-full rounded-3xl bg-white py-4 text-sm font-bold text-tiktok-cyan shadow-sm border border-brand-100 hover:bg-brand-50 transition-colors"
                            >
                              Xem thêm đánh giá
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-brand-200 p-12 text-center">
                          <History className="mb-4 h-12 w-12 text-brand-200" />
                          <p className="text-brand-400">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên!</p>
                        </div>
                      )}
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
