import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Clock, CheckCircle2, AlertCircle, Package } from 'lucide-react';
import { useOrders, useAuth } from '../hooks/useFirebase';
import { formatPrice } from '../lib/utils';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MyOrdersModal({ isOpen, onClose }: MyOrdersModalProps) {
  const { user } = useAuth();
  const { orders, loading } = useOrders(!!user, user?.email || undefined);

  // No need to filter in memory anymore, but keeping it as a safeguard
  const myOrders = orders;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-brand-100 p-6">
              <h2 className="flex items-center gap-3 text-xl font-black text-tiktok-black">
                <ShoppingBag className="h-6 w-6 text-tiktok-cyan" /> Đơn hàng của tôi
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-brand-50 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="h-full max-h-[70vh] overflow-y-auto p-6">
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-tiktok-cyan border-t-transparent"></div>
                </div>
              ) : myOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="mb-4 h-16 w-16 text-brand-100" />
                  <p className="font-bold text-brand-400">Anh chưa có đơn hàng nào.</p>
                  <button 
                    onClick={onClose}
                    className="mt-4 text-sm font-black text-tiktok-cyan hover:underline"
                  >
                    Khám phá sản phẩm ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((order) => (
                    <div key={order.id} className="rounded-2xl border border-brand-100 p-4 transition-colors hover:bg-brand-50/50">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-tiktok-black">#{order.id.slice(-6).toUpperCase()}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 
                              order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {order.status === 'pending' ? 'Đang xử lý' : 
                               order.status === 'completed' ? 'Hoàn tất' : 'Đã hủy'}
                            </span>
                          </div>
                          <p className="mt-1 text-[10px] font-bold text-brand-400">
                            {new Date(order.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-tiktok-magenta">{formatPrice(order.total)}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 border-t border-brand-50 pt-3">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="font-bold text-brand-600">{item.name} <span className="text-brand-400">x{item.quantity}</span></span>
                            <span className="font-bold text-tiktok-black">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      {order.status === 'pending' && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl bg-yellow-50 p-3 text-[10px] font-bold text-yellow-700">
                          <Clock className="h-3 w-3" /> 
                          Đơn hàng đang được xử lý. Anh vui lòng đợi 5-15 phút nhé!
                        </div>
                      )}
                      
                      {order.status === 'completed' && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-[10px] font-bold text-green-700">
                          <CheckCircle2 className="h-3 w-3" /> 
                          Đơn hàng đã hoàn tất. Thông tin đã được gửi qua Email/Zalo.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="border-t border-brand-100 p-6 bg-brand-50/30">
              <p className="text-center text-[10px] font-bold text-brand-400">
                Nếu có bất kỳ thắc mắc nào, anh vui lòng liên hệ hỗ trợ 24/7 nhé!
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
