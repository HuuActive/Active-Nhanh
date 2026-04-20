import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Eye, ChevronRight, Search, Calendar, User, Maximize2 } from 'lucide-react';
import { Post } from '../types';
import SEO from './SEO';
import PostQuickViewModal from './PostQuickViewModal';

interface NewsPageProps {
  posts: Post[];
  onViewPost: (post: Post) => void;
  loading: boolean;
}

export default function NewsPage({ posts, onViewPost, loading }: NewsPageProps) {
  const [quickViewPost, setQuickViewPost] = useState<Post | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-tiktok-cyan border-t-transparent" />
      </div>
    );
  }

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-[#f5f5f0] pb-20">
      <SEO 
        title="Tin Công Nghệ & Thủ Thuật"
        description="Cập nhật tin tức công nghệ mới nhất, thủ thuật phần mềm, hướng dẫn nâng cấp tài khoản số Premium uy tín tại ActiveNhanh."
        url={window.location.href}
      />
      {/* Editorial Hero */}
      <section className="bg-tiktok-black pt-20 pb-40 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#00f2ea_0%,transparent_70%)]" />
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-black uppercase tracking-[0.3em] text-tiktok-cyan mb-4 block">Tech Insights</span>
            <h1 className="font-sans text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-6">
              TIN CÔNG<br /><span className="text-tiktok-magenta">NGHỆ</span>
            </h1>
            <p className="max-w-2xl mx-auto text-brand-200 text-sm md:text-lg font-medium opacity-80 decoration-tiktok-cyan/30 underline underline-offset-8">
              Cập nhật kiến thức, thủ thuật và xu hướng công nghệ mới nhất cùng ActiveNhanh.
            </p>
          </motion.div>

          {featuredPost && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => onViewPost(featuredPost)}
              className="group relative h-[400px] md:h-[600px] w-full cursor-pointer overflow-hidden rounded-[40px] shadow-2xl"
            >
              <img
                src={featuredPost.thumbnail}
                alt={featuredPost.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-tiktok-black via-tiktok-black/50 to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-tiktok-cyan px-3 py-1 rounded-full text-tiktok-black text-[10px] font-black uppercase tracking-wider">
                    {featuredPost.category}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-white/70">
                    <Clock className="h-3 w-3" /> {new Date(featuredPost.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4 line-clamp-2 md:max-w-3xl leading-tight">
                  {featuredPost.title}
                </h2>
                <p className="text-white/70 text-sm md:text-base line-clamp-2 md:max-w-2xl mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-xs">
                      {featuredPost.authorName.charAt(0)}
                    </div>
                    <span className="text-sm font-bold">{featuredPost.authorName}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickViewPost(featuredPost);
                    }}
                    className="ml-auto hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-2.5 rounded-xl text-xs font-black transition-all border border-white/20"
                  >
                    <Maximize2 className="h-4 w-4" /> Xem nhanh
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Posts Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {remainingPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (idx % 3) }}
              onClick={() => onViewPost(post)}
              className="group flex flex-col bg-white rounded-[32px] overflow-hidden shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-brand-100"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-tiktok-black text-[10px] font-black uppercase tracking-wider shadow-sm">
                    {post.category}
                  </span>
                </div>
                {/* Quick View Button on Hover */}
                <div className="absolute inset-0 bg-tiktok-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-active:scale-95 duration-300">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickViewPost(post);
                    }}
                    className="bg-white text-tiktok-black px-6 py-2.5 rounded-full font-black text-xs shadow-2xl pointer-events-auto hover:bg-tiktok-cyan transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 flex items-center gap-2"
                  >
                    <Maximize2 className="h-4 w-4" /> Xem nhanh
                  </div>
                </div>
              </div>
              
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-3 text-[10px] font-bold text-brand-400">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.views}</span>
                </div>
                
                <h3 className="text-xl font-black text-tiktok-black mb-3 line-clamp-2 group-hover:text-tiktok-cyan transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-brand-500 text-sm line-clamp-3 mb-6">
                  {post.excerpt}
                </p>
                
                <div className="mt-auto pt-4 border-t border-brand-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-brand-50 flex items-center justify-center text-[10px] font-bold text-brand-500">
                      {post.authorName.charAt(0)}
                    </div>
                    <span className="text-[11px] font-bold text-brand-600">{post.authorName}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-tiktok-cyan group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {posts.length === 0 && !loading && (
          <div className="bg-white rounded-[40px] py-32 text-center shadow-xl border border-brand-100">
            <div className="mx-auto w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-brand-200" />
            </div>
            <h3 className="text-2xl font-black text-tiktok-black mb-2">Chưa có bài viết nào</h3>
            <p className="text-brand-400">Blog đang trong quá trình chuẩn bị nội dung. Quay lại sau nhé!</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {quickViewPost && (
          <PostQuickViewModal 
            post={quickViewPost}
            onClose={() => setQuickViewPost(null)}
            onReadMore={(post) => {
              setQuickViewPost(null);
              onViewPost(post);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
