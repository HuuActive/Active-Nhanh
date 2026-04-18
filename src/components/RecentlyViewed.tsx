import { motion } from 'motion/react';
import { History, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';

interface RecentlyViewedProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onView: (product: Product) => void;
}

export default function RecentlyViewed({ products, onAddToCart, onView }: RecentlyViewedProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-white border-t border-brand-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-tiktok-magenta">
              <History className="h-6 w-6" />
            </div>
            <h2 className="font-sans text-[18px] lg:text-2xl font-black text-tiktok-black">Sản phẩm vừa xem</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <motion.a
              key={product.id}
              href={product.slug ? `/san-pham/${product.slug}` : `/?product=${product.id}`}
              onClick={(e) => {
                e.preventDefault();
                onView(product);
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 rounded-2xl border border-brand-100 p-3 transition-all hover:border-tiktok-cyan hover:shadow-sm cursor-pointer"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-16 w-16 rounded-lg object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 overflow-hidden">
                <h3 className="truncate text-[13px] lg:text-sm font-bold text-tiktok-black">{product.name}</h3>
                <p className="text-[13px] lg:text-sm font-black text-tiktok-magenta">{formatPrice(product.price)}</p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  className="mt-1 text-[10px] font-bold uppercase tracking-wider text-tiktok-cyan hover:underline"
                >
                  Thêm vào giỏ
                </button>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
