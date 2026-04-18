import { X, ShoppingBag, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../types';
import { formatPrice } from '../lib/utils';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueShopping: () => void;
  onCheckout: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

export default function Cart({ isOpen, onClose, onContinueShopping, onCheckout, items, onUpdateQuantity, onRemove }: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-tiktok-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-brand-100 p-4 lg:p-6">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <ShoppingBag className="h-5 w-5 lg:h-6 lg:w-6 text-tiktok-black" />
                  <div className="absolute -right-0.5 -top-0.5 h-2 w-2 lg:h-3 lg:w-3 rounded-full bg-tiktok-magenta"></div>
                </div>
                <h2 className="font-sans text-[15px] lg:text-xl font-black tracking-tight text-tiktok-black">Giỏ hàng của bạn</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-brand-400 transition-colors hover:bg-brand-50 hover:text-tiktok-black"
              >
                <X className="h-5 w-5 lg:h-6 lg:w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 relative">
                    <div className="absolute inset-0 bg-tiktok-cyan/20 blur-2xl rounded-full"></div>
                    <ShoppingBag className="h-16 w-16 text-brand-200 relative z-10" />
                  </div>
                  <h3 className="mb-2 font-sans text-lg font-bold text-tiktok-black">Giỏ hàng trống</h3>
                  <p className="text-sm font-medium text-brand-500">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
                  <button
                    onClick={onContinueShopping}
                    className="tiktok-button mt-8 px-10"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-4"
                    >
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-brand-50 border border-brand-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-sans font-extrabold text-tiktok-black line-clamp-1 text-[13px] lg:text-sm">{item.name}</h4>
                            <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-wider text-tiktok-cyan">{item.category}</p>
                          </div>
                          <button
                            onClick={() => onRemove(item.id)}
                            className="text-brand-300 transition-colors hover:text-tiktok-magenta"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-3 rounded-md border border-brand-100 p-1">
                            <button
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="rounded p-1 text-brand-400 transition-colors hover:bg-brand-50 hover:text-tiktok-black"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-[20px] text-center text-sm font-black text-tiktok-black">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="rounded p-1 text-brand-400 transition-colors hover:bg-brand-50 hover:text-tiktok-black"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="font-black text-tiktok-magenta text-[14px] lg:text-base">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-brand-100 p-6 bg-brand-50/50">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[13px] lg:text-sm font-bold text-brand-500">Tổng cộng</span>
                  <span className="text-[18px] lg:text-2xl font-black text-tiktok-black">{formatPrice(subtotal)}</span>
                </div>
                <p className="mb-6 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-brand-400">Thanh toán an toàn qua chuyển khoản hoặc ví điện tử.</p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={onCheckout}
                    className="tiktok-button w-full flex items-center justify-center gap-2 py-3 lg:py-4 text-[13px] lg:text-lg"
                  >
                    <CreditCard className="h-4 w-4 lg:h-5 lg:w-5" />
                    Thanh toán ngay
                  </button>
                  <button 
                    onClick={onContinueShopping}
                    className="w-full py-2 lg:py-3 text-[13px] lg:text-sm font-bold text-tiktok-black transition-colors hover:text-tiktok-cyan"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


