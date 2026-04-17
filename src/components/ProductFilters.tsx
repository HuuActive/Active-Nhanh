import { Star, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductFiltersProps {
  priceRange: [number, number | null];
  onPriceRangeChange: (range: [number, number | null]) => void;
  minRating: number;
  onMinRatingChange: (rating: number) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const PRICE_PRESETS: { label: string; range: [number, number | null] }[] = [
  { label: 'Tất cả giá', range: [0, null] },
  { label: 'Dưới 100k', range: [0, 100000] },
  { label: '100k - 500k', range: [100000, 500000] },
  { label: '500k - 1tr', range: [500000, 1000000] },
  { label: 'Trên 1tr', range: [1000000, null] },
];

export default function ProductFilters({
  priceRange,
  onPriceRangeChange,
  minRating,
  onMinRatingChange,
  onClear,
  isOpen,
  onClose,
}: ProductFiltersProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8 overflow-hidden rounded-3xl bg-brand-50/50 p-6 border border-brand-100"
        >
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-1 flex-col gap-6 md:flex-row md:gap-12">
              {/* Price Range Filter */}
              <div>
                <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-brand-400">Khoảng giá</h4>
                <div className="flex flex-wrap gap-2">
                  {PRICE_PRESETS.map((preset) => {
                    const isActive = priceRange[0] === preset.range[0] && priceRange[1] === preset.range[1];
                    return (
                      <button
                        key={preset.label}
                        onClick={() => onPriceRangeChange(preset.range)}
                        className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-tiktok-cyan text-tiktok-black shadow-md'
                            : 'bg-white text-brand-500 hover:text-tiktok-black'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-brand-400">Đánh giá tối thiểu</h4>
                <div className="flex gap-2">
                  {[0, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => onMinRatingChange(star)}
                      className={`flex items-center gap-1 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                        minRating === star
                          ? 'bg-tiktok-magenta text-white shadow-md'
                          : 'bg-white text-brand-500 hover:text-tiktok-black'
                      }`}
                    >
                      {star === 0 ? 'Tất cả' : (
                        <>
                          {star} <Star className={`h-3 w-3 ${minRating === star ? 'fill-white' : 'fill-yellow-400 text-yellow-400'}`} />
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClear}
                className="text-xs font-bold text-brand-400 transition-colors hover:text-tiktok-magenta"
              >
                Xóa bộ lọc
              </button>
              <button
                onClick={onClose}
                className="rounded-full bg-tiktok-black p-2 text-white shadow-xl transition-transform hover:scale-110"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
