import { Plus, Star, ShoppingCart, Share2, Facebook, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onView?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onView }: ProductCardProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleView = () => {
    if (onView) onView(product);
  };

  const handleShare = async (e: React.MouseEvent, platform: 'facebook' | 'link') => {
    e.stopPropagation();
    const url = `${window.location.origin}?product=${product.id}`;
    
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="tiktok-card group relative flex flex-col overflow-hidden"
    >
      <div 
        className="relative aspect-square overflow-hidden rounded-lg bg-brand-50 cursor-pointer"
        onClick={handleView}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 left-2">
          <span className="rounded-full bg-tiktok-black/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
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
      </div>

      <div className="flex flex-1 flex-col pt-3 md:pt-4">
        <div className="mb-1 flex items-start gap-1 justify-between">
          <h3 
            className="font-sans text-[13px] md:text-lg font-extrabold tracking-tight text-tiktok-black line-clamp-2 md:line-clamp-1 cursor-pointer hover:text-tiktok-cyan transition-colors"
            onClick={handleView}
          >
            {product.name}
          </h3>
          <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
            <Star className="h-2 w-2 md:h-3 md:w-3 fill-tiktok-cyan text-tiktok-cyan" />
            <span className="text-[10px] md:text-xs font-bold text-tiktok-black">{product.rating}</span>
          </div>
        </div>
        <div className="mb-1 flex items-center gap-2">
          <span className={`text-[8px] md:text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {product.stock > 0 ? 'Sẵn sàng' : 'Hết hàng'}
          </span>
        </div>
        <p className="mb-2 md:mb-4 line-clamp-2 text-[12px] md:text-sm font-medium text-brand-500 italic">
          {product.shortFeatures ? product.shortFeatures.replace(/;/g, ' • ') : product.description}
        </p>
        
        <div className="mt-auto flex flex-col pt-1 md:pt-2">
          <div className="flex items-end justify-between gap-1 mb-1.5 md:mb-3">
            <div className="flex flex-col">
              <span className="text-[9px] md:text-xs font-bold text-brand-400 line-through">
                {formatPrice(product.originalPrice || Math.ceil((product.price * 1.8) / 10000) * 10000)}
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-[14px] md:text-xl font-black text-tiktok-magenta leading-none">{formatPrice(product.price)}</span>
                {product.priceUnit && (
                  <span className="text-[8px] md:text-[10px] font-bold text-brand-400 uppercase">/ {product.priceUnit}</span>
                )}
              </div>
            </div>
            
            {/* Desktop only cart button */}
            <motion.button
              onClick={() => product.stock > 0 && onAddToCart(product)}
              disabled={product.stock <= 0}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`hidden md:flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ${product.stock > 0 ? 'bg-tiktok-black cursor-pointer' : 'bg-brand-200 cursor-not-allowed'}`}
              style={product.stock > 0 ? { boxShadow: '3px 3px 0px #00F2EA' } : {}}
            >
              <Plus className="h-6 w-6" />
            </motion.button>
          </div>

          {/* Mobile only cart button - Small & Compact */}
          <motion.button
            onClick={() => product.stock > 0 && onAddToCart(product)}
            disabled={product.stock <= 0}
            whileTap={{ scale: 0.98 }}
            className={`flex md:hidden w-full items-center justify-center gap-1 rounded-lg py-1.5 px-2 font-bold uppercase tracking-tight text-[11px] transition-all ${
              product.stock > 0 
                ? 'bg-tiktok-black text-white shadow-[2px_2px_0px_#00F2EA] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]' 
                : 'bg-brand-100 text-brand-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="h-3 w-3" />
            thêm vào giỏ
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

