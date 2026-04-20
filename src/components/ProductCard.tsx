import { Plus, Star, ShoppingCart, Share2, Facebook, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onView?: (product: Product) => void;
  layout?: 'grid' | 'wide';
}

export default function ProductCard({ product, onAddToCart, onView, layout = 'grid' }: ProductCardProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleView = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (onView) onView(product);
  };

  const handleShare = async (e: React.MouseEvent, platform: 'facebook' | 'link') => {
    e.stopPropagation();
    const url = product.slug 
      ? `${window.location.origin}/san-pham/${product.slug}`
      : `${window.location.origin}?product=${product.id}`;
    
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('Đã sao chép liên kết sản phẩm!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
    setIsSharing(false);
  };

  const productUrl = product.slug ? `/san-pham/${product.slug}` : `/?product=${product.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`tiktok-card group relative flex overflow-hidden transition-all duration-500 ${layout === 'wide' ? 'flex-col md:flex-row md:items-center gap-4 md:gap-8 p-3 md:p-8 min-h-[160px]' : 'flex-col p-3 md:p-4'}`}
    >
      <a 
        href={productUrl}
        className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-50 to-brand-100/50 cursor-pointer block border border-brand-100/50 shrink-0 transition-all ${layout === 'wide' ? 'w-full aspect-square md:w-[400px] md:h-[250px]' : 'aspect-square w-full'}`}
        onClick={handleView}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-tiktok-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 left-3">
          <span className="rounded-full bg-tiktok-black/80 px-3 py-1.5 text-[10px] md:text-xs font-black uppercase tracking-wider text-white backdrop-blur-md">
            {product.category}
          </span>
        </div>

        {/* Quick Share */}
        <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSharing(!isSharing);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-tiktok-black shadow-lg backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
            >
              <Share2 className="h-4 w-4" />
            </button>
            
            <AnimatePresence>
              {isSharing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  className="absolute right-0 top-full mt-2 flex flex-col gap-1 rounded-xl bg-white p-1 shadow-2xl border border-brand-100 min-w-[120px] z-20"
                >
                  <button
                    onClick={(e) => handleShare(e, 'facebook')}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[11px] font-bold text-brand-600 hover:bg-brand-50 hover:text-[#1877F2]"
                  >
                    <Facebook className="h-4 w-4" /> Facebook
                  </button>
                  <button
                    onClick={(e) => handleShare(e, 'link')}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[11px] font-bold text-brand-600 hover:bg-brand-50 hover:text-tiktok-cyan"
                  >
                    <Link className="h-4 w-4" /> Sao chép link
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </a>

      <div className={`flex flex-1 flex-col min-w-0 ${layout === 'wide' ? 'md:justify-center md:self-stretch py-2' : 'pt-3 md:pt-4'}`}>
        <div className={`flex flex-col gap-2 ${layout === 'wide' ? 'mt-3 md:mt-0' : ''}`}>
          <div className="flex items-start gap-2 justify-between">
            <a
              href={productUrl}
              className={`font-sans font-extrabold tracking-tight text-tiktok-black hover:text-tiktok-cyan transition-colors cursor-pointer ${layout === 'wide' ? 'text-[15px] md:text-4xl' : 'text-[13px] md:text-lg line-clamp-2 md:line-clamp-1'}`}
              onClick={handleView}
            >
              <h4 className="line-clamp-2">{product.name}</h4>
            </a>
            <div className="flex items-center gap-1 shrink-0 pt-1">
              <Star className={`fill-tiktok-cyan text-tiktok-cyan ${layout === 'wide' ? 'h-4 w-4 md:h-8 md:w-8' : 'h-2 w-2 md:h-3 md:w-3'}`} />
              <span className={`font-bold text-tiktok-black ${layout === 'wide' ? 'text-xs md:text-2xl' : 'text-[10px] md:text-xs'}`}>{product.rating}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`font-black uppercase px-2 py-1 rounded-md ${product.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} ${layout === 'wide' ? 'text-[8px] md:text-sm' : 'text-[7px] md:text-[10px]'}`}>
              {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
            </span>
          </div>

          <p className={`font-medium text-brand-400 italic ${layout === 'wide' ? 'text-xs md:text-2xl leading-relaxed line-clamp-2' : 'text-[10px] md:text-sm line-clamp-2'}`}>
            {product.shortFeatures ? product.shortFeatures.replace(/;/g, ' • ') : product.description}
          </p>
        </div>
        
        <div className={`flex flex-col ${layout === 'wide' ? 'mt-6 md:mt-8' : 'mt-auto pt-1 md:pt-2'}`}>
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className={`font-bold text-brand-400 line-through ${layout === 'wide' ? 'text-[10px] md:text-3xl' : 'text-[9px] md:text-xs'}`}>
                {formatPrice(product.originalPrice || Math.ceil((product.price * 1.8) / 10000) * 10000)}
              </span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className={`font-black text-tiktok-magenta leading-none ${layout === 'wide' ? 'text-xl md:text-7xl' : 'text-[13px] md:text-xl'}`}>
                  {formatPrice(product.price)}
                </span>
                {product.priceUnit && (
                  <span className={`font-extrabold text-brand-400 uppercase ${layout === 'wide' ? 'text-[10px] md:text-3xl' : 'text-[7px] md:text-[10px]'}`}>/ {product.priceUnit}</span>
                )}
              </div>
            </div>
            
            <motion.button
              onClick={() => product.stock > 0 && onAddToCart(product)}
              disabled={product.stock <= 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`${layout === 'wide' ? 'flex flex-row items-center gap-2 md:gap-4 px-4 md:px-12 h-10 md:h-24' : 'hidden md:flex h-11 md:h-11 w-11 md:w-11'} shrink-0 items-center justify-center rounded-xl md:rounded-[2rem] text-white font-black uppercase tracking-widest ${product.stock > 0 ? 'bg-tiktok-black cursor-pointer shadow-[3px_3px_0px_#00F2EA] md:shadow-[8px_8px_0px_#00F2EA]' : 'bg-brand-200 cursor-not-allowed'}`}
            >
              <ShoppingCart className="h-5 w-5 md:h-10 md:w-10" />
              {layout === 'wide' && <span className="text-[10px] md:text-4xl">MUA NGAY</span>}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

