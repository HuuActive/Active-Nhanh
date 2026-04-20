import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Eye, User, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Post } from '../types';

interface PostQuickViewModalProps {
  post: Post | null;
  onClose: () => void;
  onReadMore: (post: Post) => void;
}

export default function PostQuickViewModal({ post, onClose, onReadMore }: PostQuickViewModalProps) {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-tiktok-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white md:text-brand-400 hover:bg-tiktok-magenta hover:text-white transition-all shadow-lg"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left: Image (Visible on desktop) */}
          <div className="hidden md:block w-2/5 relative">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-tiktok-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <span className="inline-block bg-tiktok-cyan px-3 py-1 rounded-full text-tiktok-black text-[10px] font-black uppercase tracking-wider mb-4">
                {post.category}
              </span>
              <h3 className="text-xl font-black leading-tight line-clamp-3">
                {post.title}
              </h3>
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Mobile Header Image */}
            <div className="md:hidden h-48 relative shrink-0">
              <img
                src={post.thumbnail}
                alt={post.title}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-tiktok-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="bg-tiktok-cyan px-2 py-0.5 rounded-full text-tiktok-black text-[8px] font-black uppercase tracking-wider">
                  {post.category}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
              <div className="flex items-center gap-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-6">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> {post.views}</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-tiktok-black mb-6 leading-tight">
                {post.title}
              </h2>

              <div className="flex items-center gap-3 py-4 border-y border-brand-50 mb-8">
                <div className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center font-bold text-xs text-brand-400">
                  {post.authorName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-black text-tiktok-black">{post.authorName}</p>
                  <p className="text-[9px] font-bold text-brand-300 uppercase">Biên tập viên</p>
                </div>
              </div>

              <div className="markdown-body text-sm md:text-base text-brand-600 leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {post.content.length > 500 ? post.content.substring(0, 500) + '...' : post.content}
                </ReactMarkdown>
              </div>
              
              {post.content.length > 500 && (
                <div className="mt-6 pt-6 border-t border-brand-50">
                  <p className="text-sm font-bold text-tiktok-magenta italic">
                    Nội dung đang xem ở chế độ xem nhanh. Hãy nhấn vào nút bên dưới để đọc toàn bộ bài viết.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 md:p-8 bg-brand-50/50 border-t border-brand-100 flex items-center justify-between shrink-0">
              <button
                onClick={onClose}
                className="text-xs font-black text-brand-400 hover:text-brand-600 uppercase tracking-widest"
              >
                Đóng lại
              </button>
              <button
                onClick={() => onReadMore(post)}
                className="flex items-center gap-2 bg-tiktok-black text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-tiktok-magenta transition-all active:scale-95 shadow-lg"
              >
                Đọc toàn bộ <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
  );
}
