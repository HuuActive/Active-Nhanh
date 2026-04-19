import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Calendar, User, Eye, Share2, Facebook, Link as LinkIcon, 
  MessageSquare, Send, ShieldAlert, CheckCircle2, ChevronRight, Tags
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Post, PostComment } from '../types';
import { useAuth, usePostComments } from '../hooks/useFirebase';

interface PostDetailProps {
  post: Post;
  onBack: () => void;
}

export default function PostDetail({ post, onBack }: PostDetailProps) {
  const { user } = useAuth();
  const { comments, loading: commentsLoading, addComment } = usePostComments(post.id);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  const handleShare = (platform: 'facebook' | 'link') => {
    const url = window.location.href;
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else {
      navigator.clipboard.writeText(url);
      alert('Đã sao chép liên kết vào bộ nhớ tạm!');
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment({
        postId: post.id,
        userId: user.uid,
        userName: user.displayName || 'Khách hàng',
        userPhoto: user.photoURL || '',
        content: commentContent.trim()
      });
      setCommentContent('');
      alert('Bình luận của bạn đã được gửi và đang chờ kiểm duyệt để tránh spam!');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const approvedComments = comments.filter(c => c.status === 'approved');

  return (
    <div className="min-h-screen bg-white">
      {/* Article Header */}
      <div className="relative h-[50vh] md:h-[70vh] w-full overflow-hidden">
        <img
          src={post.thumbnail}
          alt={post.title}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
        
        <div className="absolute top-8 left-4 md:left-8">
          <button
            onClick={onBack}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-xl backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
          >
            <ArrowLeft className="h-6 w-6 text-tiktok-black" />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-20 -mt-32 relative z-10">
        <article className="rounded-[48px] bg-white p-6 md:p-16 shadow-2xl border border-brand-100">
          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-tiktok-cyan px-4 py-1.5 rounded-full text-tiktok-black text-xs font-black uppercase tracking-wider shadow-sm">
                {post.category}
              </span>
              <div className="flex items-center gap-4 text-xs font-bold text-brand-400">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {post.views} lượt xem</span>
              </div>
            </div>

            <h1 className="font-sans text-3xl md:text-6xl font-black tracking-tighter text-tiktok-black leading-[1.1] mb-8">
              {post.title}
            </h1>

            <div className="flex items-center justify-between py-6 border-y border-brand-50">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-brand-50 flex items-center justify-center font-bold text-lg text-brand-500 overflow-hidden">
                   {post.authorName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-tiktok-black">{post.authorName}</p>
                  <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Biên tập viên</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleShare('facebook')}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all shadow-sm"
                >
                  <Facebook className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => handleShare('link')}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-tiktok-cyan hover:bg-tiktok-cyan hover:text-tiktok-black transition-all shadow-sm"
                >
                  <LinkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <div className="markdown-body max-w-none mb-16 px-2">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{post.content}</ReactMarkdown>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 py-8 border-t border-brand-50">
              <div className="flex items-center gap-2 mb-4 text-xs font-black text-brand-400 uppercase tracking-widest">
                <Tags className="h-4 w-4" /> Từ khóa bài viết
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="px-4 py-2 rounded-xl bg-brand-50 text-xs font-bold text-brand-600 hover:bg-brand-100 transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <section className="mt-16 pt-16 border-t border-brand-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-tiktok-black flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-tiktok-magenta" />
                Bình luận ({approvedComments.length})
              </h3>
            </div>

            {user ? (
              <form onSubmit={handlePostComment} className="mb-12 bg-brand-50/50 rounded-3xl p-6 border border-brand-100">
                <div className="flex items-start gap-4">
                  <img src={user.photoURL || ''} alt="" className="h-10 w-10 rounded-full border border-white shadow-sm" />
                  <div className="flex-1">
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Chia sẻ suy nghĩ của bạn về bài viết này..."
                      className="w-full rounded-2xl border border-brand-100 bg-white p-4 text-sm focus:border-tiktok-cyan focus:outline-none min-h-[100px] resize-none"
                    />
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-brand-400 uppercase">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Đã đăng nhập
                      </div>
                      <button
                        type="submit"
                        disabled={!commentContent.trim() || isSubmitting}
                        className="flex items-center gap-2 bg-tiktok-black text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-tiktok-magenta transition-all disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" /> Gửi bình luận
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-12 rounded-[32px] bg-brand-50 p-8 text-center border-2 border-dashed border-brand-200">
                <ShieldAlert className="h-10 w-10 text-brand-300 mx-auto mb-4" />
                <h4 className="font-black text-tiktok-black mb-2">Đăng nhập để bình luận</h4>
                <p className="text-sm text-brand-500 mb-6">Bạn cần đăng nhập để tham gia thảo luận và tránh tin nhắn rác.</p>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('openLogin'))}
                  className="bg-tiktok-cyan text-tiktok-black px-8 py-3 rounded-2xl font-black text-sm active:scale-95 transition-transform"
                >
                  Đăng nhập ngay
                </button>
              </div>
            )}

            <div className="space-y-8">
              {approvedComments.map(comment => (
                <div key={comment.id} className="flex gap-4">
                  <img src={comment.userPhoto} alt="" className="h-10 w-10 rounded-full border border-brand-50 shadow-sm shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-black text-sm text-tiktok-black">{comment.userName}</span>
                      <span className="text-[10px] font-bold text-brand-400">{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="bg-brand-50 rounded-2xl rounded-tl-none p-4 text-sm text-brand-700">
                      {comment.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {approvedComments.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-brand-100 mx-auto mb-4" />
                  <p className="text-sm font-bold text-brand-300 uppercase tracking-widest">Chưa có bình luận nào</p>
                </div>
              )}
            </div>
          </section>
        </article>
        
        {/* Recommended Sidebar/Bottom would go here */}
      </div>
    </div>
  );
}
