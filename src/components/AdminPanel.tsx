import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Edit2, Trash2, Save, Loader2, Upload, Search, Info, Package, Shield, HelpCircle, Layout, Eye, Zap, ShoppingBag, CheckCircle, Clock, AlertCircle, User, Users, Tag, Star, FileText, MessageCircle, ShieldAlert, FileEdit, Eye as EyeIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { useProducts, useOrders, useUsers, useCategories, useReviews, usePosts, useAllPostComments, useAuth } from '../hooks/useFirebase';
import { Product, Category, Post, PostComment } from '../types';
import { formatPrice, createSlug } from '../lib/utils';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { products, loading: productsLoading, addProduct, editProduct, removeProduct } = useProducts();
  const { orders, loading: ordersLoading, updateOrderStatus } = useOrders(true);
  const { users, loading: usersLoading } = useUsers();
  const { categories, loading: categoriesLoading, addCategory, editCategory, removeCategory } = useCategories();
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const { reviews: allReviews, loading: reviewsLoading, hasMore: hasMoreReviews, loadMore: loadMoreReviews, approveReview, deleteReview: removeReview } = useReviews(undefined, showPendingOnly, 20);
  const { user } = useAuth();
  const { posts, loading: postsLoading, addPost, editPost, removePost } = usePosts();
  const { comments: postComments, loading: postCommentsLoading, approveComment: approvePostComment, markSpam: markPostCommentSpam, deleteComment: removePostComment } = useAllPostComments();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users' | 'categories' | 'reviews' | 'posts' | 'comments'>('products');
  const [formTab, setFormTab] = useState<'basic' | 'detail' | 'seo'>('basic');
  
  // Post management state
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [postEditorTab, setPostEditorTab] = useState<'write' | 'preview'>('write');
  const [postFormData, setPostFormData] = useState<Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'views'>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    thumbnail: 'https://picsum.photos/seed/tech/1200/630',
    category: 'Thủ thuật',
    authorId: '',
    authorName: '',
    tags: [],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });
  const [postTagInput, setPostTagInput] = useState('');
  
  // Orders filter/search state
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  
  // Category form state
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState<Omit<Category, 'id'>>({
    name: '',
    slug: '',
    order: 0
  });
  
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    originalPrice: 0,
    priceUnit: 'tháng',
    description: '',
    importantNote: '',
    deliveryProcess: '',
    features: '',
    warranty: '',
    faqs: '',
    usageGuide: '',
    shortFeatures: '',
    variants: [],
    category: 'Storage',
    image: 'https://picsum.photos/seed/digital/1000/1000',
    rating: 5,
    reviews: 0,
    stock: 0,
    slug: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) { // ~800KB limit to stay safe with 1MB Firestore limit
        alert('Hình ảnh quá lớn. Vui lòng chọn ảnh dưới 800KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateSEOScore = () => {
    let score = 0;
    if (formData.seoTitle && formData.seoTitle.length >= 30 && formData.seoTitle.length <= 60) score += 30;
    if (formData.seoDescription && formData.seoDescription.length >= 120 && formData.seoDescription.length <= 160) score += 40;
    if (formData.seoKeywords) score += 30;
    return score;
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      priceUnit: product.priceUnit || 'tháng',
      description: product.description || '',
      importantNote: product.importantNote || '',
      deliveryProcess: product.deliveryProcess || '',
      features: product.features || '',
      warranty: product.warranty || '',
      faqs: product.faqs || '',
      usageGuide: product.usageGuide || '',
      shortFeatures: product.shortFeatures || '',
      variants: product.variants || [],
      category: product.category,
      image: product.image,
      rating: product.rating,
      reviews: product.reviews,
      stock: product.stock || 0,
      slug: product.slug || '',
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
      seoKeywords: product.seoKeywords || ''
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    const searchLower = orderSearch.toLowerCase();
    const matchesSearch = 
      order.id.toLowerCase().includes(searchLower) ||
      order.customerInfo.fullName.toLowerCase().includes(searchLower) ||
      order.customerInfo.email.toLowerCase().includes(searchLower) ||
      order.customerInfo.phone.includes(orderSearch);
    return matchesStatus && matchesSearch;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue: orders.filter(o => o.status === 'completed').reduce((acc, o) => acc + o.total, 0)
  };

  const handleSave = async () => {
    // Construct description from parts
    const parts = [];
    if (formData.importantNote) parts.push(`### ⚠️ Lưu ý quan trọng\n${formData.importantNote}`);
    if (formData.deliveryProcess) parts.push(`### 📦 Quy trình nhận hàng\n${formData.deliveryProcess}`);
    if (formData.features) parts.push(`### ✨ Tính năng nổi bật\n${formData.features}`);
    if (formData.warranty) parts.push(`### 🛡️ Chính sách bảo hành\n${formData.warranty}`);
    if (formData.faqs) parts.push(`### ❓ Câu hỏi thường gặp\n${formData.faqs}`);
    
    const fullDesc = parts.join('\n\n');
    
    // Ensure slug is created
    const finalSlug = (formData.slug || createSlug(formData.name)) || Math.random().toString(36).substr(2, 9);
    
    const dataToSave = {
      ...formData,
      slug: finalSlug,
      description: fullDesc
    };

    if (editingId) {
      await editProduct(editingId, dataToSave);
      setEditingId(null);
    } else if (isAdding) {
      await addProduct(dataToSave);
      setIsAdding(false);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      originalPrice: 0,
      description: '',
      importantNote: '',
      deliveryProcess: '',
      features: '',
      warranty: '',
      faqs: '',
      usageGuide: '',
      shortFeatures: '',
      variants: [],
      category: 'Storage',
      image: 'https://picsum.photos/seed/digital/1000/1000',
      rating: 5,
      reviews: 0,
      stock: 0,
      slug: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: ''
    });
  };

  const resetPostForm = () => {
    setPostEditorTab('write');
    setPostFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      thumbnail: 'https://picsum.photos/seed/tech/1200/630',
      category: 'Thủ thuật',
      authorId: user?.uid || '',
      authorName: user?.displayName || 'Admin',
      tags: [],
      seoTitle: '',
      seoDescription: '',
      seoKeywords: ''
    });
    setPostTagInput('');
  };

  const handlePostImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        alert('Hình ảnh quá lớn. Vui lòng chọn ảnh dưới 800KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostFormData({ ...postFormData, thumbnail: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-tiktok-black/80 sm:p-4 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl"
      >
        <div className="flex flex-col border-b border-brand-100 p-4 sm:p-6 sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <h2 className="font-sans text-xl sm:text-2xl font-black text-tiktok-black flex items-center justify-between sm:block">
              Quản trị
              <button onClick={onClose} className="sm:hidden rounded-full p-2 hover:bg-brand-50">
                <X className="h-6 w-6" />
              </button>
            </h2>
            <div className="flex overflow-x-auto rounded-xl bg-brand-50 p-1 no-scrollbar -mx-2 sm:mx-0">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-white text-tiktok-black shadow-sm' : 'text-brand-400 hover:text-tiktok-black'}`}
              >
                <Package className="h-4 w-4" /> Sản phẩm
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-white text-tiktok-black shadow-sm' : 'text-brand-400 hover:text-tiktok-black'}`}
              >
                <ShoppingBag className="h-4 w-4" /> Đơn hàng
                {orders.filter(o => o.status === 'pending').length > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-tiktok-magenta text-[10px] text-white">
                    {orders.filter(o => o.status === 'pending').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${activeTab === 'posts' ? 'bg-white text-tiktok-black shadow-sm' : 'text-brand-400 hover:text-tiktok-black'}`}
              >
                <FileText className="h-4 w-4" /> Bài viết
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${activeTab === 'comments' ? 'bg-white text-tiktok-black shadow-sm' : 'text-brand-400 hover:text-tiktok-black'}`}
              >
                <MessageCircle className="h-4 w-4" /> Blog
                {postComments.filter(c => c.status === 'pending').length > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-tiktok-magenta text-[10px] text-white">
                    {postComments.filter(c => c.status === 'pending').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white text-tiktok-black shadow-sm' : 'text-brand-400 hover:text-tiktok-black'}`}
              >
                <Users className="h-4 w-4" /> Khách hàng
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-white text-tiktok-black shadow-sm' : 'text-brand-400 hover:text-tiktok-black'}`}
              >
                <Tag className="h-4 w-4" /> Danh mục
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${activeTab === 'reviews' ? 'bg-white text-tiktok-black shadow-sm' : 'text-brand-400 hover:text-tiktok-black'}`}
              >
                <Star className="h-4 w-4" /> Đánh giá
                {allReviews.filter(r => !r.isApproved).length > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-tiktok-magenta text-[10px] text-white">
                    {allReviews.filter(r => !r.isApproved).length}
                  </span>
                )}
              </button>
            </div>
          </div>
          <button onClick={onClose} className="hidden sm:block rounded-full p-2 hover:bg-brand-50">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="h-[calc(90vh-140px)] overflow-hidden">
          {activeTab === 'products' ? (
            <div className="grid h-full grid-cols-1 lg:grid-cols-2">
              {/* Product List */}
              <div className="overflow-y-auto border-r border-brand-100 p-6">
                <div className="mb-6 flex items-center justify-between gap-2">
                  <h3 className="font-bold text-brand-500">Danh sách ({products.length})</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => {
                        if (confirm('Bạn có chắc chắn muốn cập nhật ảnh mẫu cho tất cả sản phẩm?')) {
                          for (const p of products) {
                            let seed = 'digital';
                            const name = p.name.toLowerCase();
                            const category = p.category.toLowerCase();
                            
                            if (name.includes('google one') || name.includes('onedrive') || category === 'storage') seed = 'cloud';
                            else if (name.includes('chatgpt') || name.includes('claude') || category === 'ai') seed = 'robot';
                            else if (name.includes('canva') || name.includes('capcut') || name.includes('adobe') || category === 'creative') seed = 'design';
                            else if (name.includes('netflix') || name.includes('youtube') || name.includes('spotify') || category === 'entertainment') seed = 'entertainment';
                            
                            const newImage = `https://picsum.photos/seed/${seed}-${p.id.slice(0, 5)}/1000/1000`;
                            await editProduct(p.id, { image: newImage });
                          }
                          alert('Đã cập nhật xong ảnh mẫu!');
                        }
                      }}
                      className="flex items-center gap-2 rounded-full bg-brand-100 px-4 py-2 text-xs font-bold text-brand-600 hover:bg-brand-200"
                    >
                      <Layout className="h-4 w-4" /> Cập nhật ảnh mẫu
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm('Bạn có chắc chắn muốn tạo Slug cho tất cả sản phẩm chưa có?')) {
                          for (const p of products) {
                            if (!p.slug) {
                              await editProduct(p.id, { slug: createSlug(p.name) });
                            }
                          }
                          alert('Đã cập nhật xong Slug!');
                        }
                      }}
                      className="flex items-center gap-2 rounded-full bg-brand-100 px-4 py-2 text-xs font-bold text-brand-600 hover:bg-brand-200"
                    >
                      <Zap className="h-4 w-4" /> Cập nhật SEO/Slug
                    </button>
                    <button 
                      onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); }}
                      className="flex items-center gap-2 rounded-full bg-tiktok-cyan px-4 py-2 text-xs font-bold text-tiktok-black"
                    >
                      <Plus className="h-4 w-4" /> Thêm mới
                    </button>
                  </div>
                </div>

                {productsLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-tiktok-cyan" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((p) => (
                      <div key={p.id} className="flex items-center gap-4 rounded-xl border border-brand-100 p-3 transition-colors hover:bg-brand-50">
                        <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                        <div className="flex-1 overflow-hidden">
                          <h4 className="truncate font-bold text-tiktok-black">{p.name}</h4>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-black text-tiktok-magenta">{formatPrice(p.price)}</p>
                            {p.originalPrice && p.originalPrice > 0 && (
                              <p className="text-[10px] font-bold text-brand-400 line-through">{formatPrice(p.originalPrice)}</p>
                            )}
                            <span className="text-[10px] font-bold text-brand-400">• Kho: {p.stock || 0}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(p)} className="rounded-lg p-2 text-brand-400 hover:bg-white hover:text-tiktok-cyan">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => removeProduct(p.id)} className="rounded-lg p-2 text-brand-400 hover:bg-white hover:text-tiktok-magenta">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Editor Form */}
              <div className="overflow-y-auto p-6 bg-brand-50/30">
                {(editingId || isAdding) ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-tiktok-black">
                        {editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                      </h3>
                      <div className="flex gap-1 rounded-lg bg-white p-1 shadow-sm">
                        <button 
                          onClick={() => setFormTab('basic')}
                          className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${formTab === 'basic' ? 'bg-tiktok-black text-white' : 'text-brand-400 hover:text-tiktok-black'}`}
                        >
                          Cơ bản
                        </button>
                        <button 
                          onClick={() => setFormTab('detail')}
                          className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${formTab === 'detail' ? 'bg-tiktok-black text-white' : 'text-brand-400 hover:text-tiktok-black'}`}
                        >
                          Chi tiết
                        </button>
                        <button 
                          onClick={() => setFormTab('seo')}
                          className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${formTab === 'seo' ? 'bg-tiktok-black text-white' : 'text-brand-400 hover:text-tiktok-black'}`}
                        >
                          SEO
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {formTab === 'basic' && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase text-brand-400">Tên sản phẩm</label>
                            <input 
                              type="text" 
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="mb-1 block text-xs font-bold uppercase text-brand-400">Giá bán (Gốc)</label>
                              <input 
                                type="number" 
                                value={formData.originalPrice}
                                onChange={(e) => setFormData({...formData, originalPrice: Number(e.target.value)})}
                                className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                                placeholder="99000"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-bold uppercase text-brand-400">Giá khuyến mãi (Hiện tại)</label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number" 
                                  value={formData.price}
                                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                                  className="min-w-0 flex-1 rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                                  placeholder="49000"
                                />
                                <select
                                  value={formData.priceUnit}
                                  onChange={(e) => setFormData({...formData, priceUnit: e.target.value as any})}
                                  className="w-28 flex-shrink-0 rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm font-bold text-tiktok-black focus:border-tiktok-cyan focus:outline-none"
                                >
                                  <option value="ngày">/ ngày</option>
                                  <option value="tháng">/ tháng</option>
                                  <option value="năm">/ năm</option>
                                  <option value="vĩnh viễn">vĩnh viễn</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase text-brand-400">Số lượng trong kho</label>
                            <input 
                              type="number" 
                              value={formData.stock}
                              onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                              className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                              placeholder="Nhập số lượng sản phẩm hiện có..."
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase text-brand-400">Danh mục</label>
                            <div className="flex items-center gap-2">
                              <select 
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                className="min-w-0 flex-1 rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                              >
                                {categories.map(cat => (
                                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                                {categories.length === 0 && (
                                  <>
                                    <option value="Storage">Storage</option>
                                    <option value="AI">AI</option>
                                    <option value="Creative">Creative</option>
                                    <option value="Entertainment">Entertainment</option>
                                  </>
                                )}
                              </select>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab('categories');
                                  setIsAddingCategory(true);
                                }}
                                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-tiktok-cyan hover:bg-brand-100 transition-colors"
                                title="Thêm danh mục mới"
                              >
                                <Plus className="h-5 w-5" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase text-brand-400">Đặc điểm nổi bật (ngắn, cách nhau bởi dấu ;)</label>
                            <input 
                              type="text" 
                              value={formData.shortFeatures}
                              onChange={(e) => setFormData({...formData, shortFeatures: e.target.value})}
                              className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                              placeholder="Dung lượng 2TB;Bảo hành 1 năm;Nâng cấp chính chủ"
                            />
                          </div>

                          <div className="rounded-2xl border border-brand-100 bg-white p-4">
                            <div className="mb-4 flex items-center justify-between">
                              <label className="text-xs font-bold uppercase text-brand-400">Biến thể sản phẩm (Dung lượng, thời gian...)</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const newVariant = {
                                    id: Math.random().toString(36).substr(2, 9),
                                    name: '',
                                    price: formData.price,
                                    originalPrice: formData.originalPrice,
                                    stock: formData.stock
                                  };
                                  setFormData({ ...formData, variants: [...(formData.variants || []), newVariant] });
                                }}
                                className="flex items-center gap-1 text-[10px] font-bold text-tiktok-cyan hover:underline"
                              >
                                <Plus className="h-3 w-3" /> Thêm biến thể
                              </button>
                            </div>
                            
                            <div className="space-y-4">
                              {(formData.variants || []).map((variant, idx) => (
                                <div key={variant.id} className="relative rounded-2xl border border-brand-100 bg-brand-50/50 p-4 transition-all hover:border-tiktok-cyan/30">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newVariants = (formData.variants || []).filter((_, i) => i !== idx);
                                      setFormData({ ...formData, variants: newVariants });
                                    }}
                                    className="absolute right-3 top-3 rounded-full bg-white p-2 text-tiktok-magenta shadow-sm transition-transform hover:scale-110"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                      <label className="mb-1 block text-[10px] font-bold uppercase text-brand-400">Tên biến thể</label>
                                      <input
                                        type="text"
                                        placeholder="Ví dụ: 100GB, 1 Năm, Gói Pro..."
                                        value={variant.name}
                                        onChange={(e) => {
                                          const newVariants = [...(formData.variants || [])];
                                          newVariants[idx].name = e.target.value;
                                          setFormData({ ...formData, variants: newVariants });
                                        }}
                                        className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="mb-1 block text-[10px] font-bold uppercase text-brand-400">Giá khuyến mãi</label>
                                      <input
                                        type="number"
                                        placeholder="Giá bán"
                                        value={variant.price}
                                        onChange={(e) => {
                                          const newVariants = [...(formData.variants || [])];
                                          newVariants[idx].price = Number(e.target.value);
                                          setFormData({ ...formData, variants: newVariants });
                                        }}
                                        className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="mb-1 block text-[10px] font-bold uppercase text-brand-400">Giá gốc (Gạch ngang)</label>
                                      <input
                                        type="number"
                                        placeholder="Giá gốc"
                                        value={variant.originalPrice || 0}
                                        onChange={(e) => {
                                          const newVariants = [...(formData.variants || [])];
                                          newVariants[idx].originalPrice = Number(e.target.value);
                                          setFormData({ ...formData, variants: newVariants });
                                        }}
                                        className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="mb-1 block text-[10px] font-bold uppercase text-brand-400">Kho</label>
                                      <input
                                        type="number"
                                        placeholder="Số lượng"
                                        value={variant.stock}
                                        onChange={(e) => {
                                          const newVariants = [...(formData.variants || [])];
                                          newVariants[idx].stock = Number(e.target.value);
                                          setFormData({ ...formData, variants: newVariants });
                                        }}
                                        className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {(formData.variants || []).length === 0 && (
                                <div className="rounded-2xl border-2 border-dashed border-brand-100 py-8 text-center">
                                  <p className="text-[10px] italic text-brand-400 font-bold uppercase">Sản phẩm này chưa có biến thể nào</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase text-brand-400">Hình ảnh (Khuyên dùng 1000x1000px)</label>
                            <div className="flex gap-4">
                              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-brand-100 bg-white">
                                <img src={formData.image} alt="" className="h-full w-full object-cover" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <input 
                                  type="text" 
                                  value={formData.image}
                                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                                  className="w-full rounded-xl border border-brand-100 bg-white p-2 text-xs focus:border-tiktok-cyan focus:outline-none"
                                  placeholder="Dán link ảnh (1000x1000)..."
                                />
                                <div className="flex gap-2">
                                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-tiktok-black p-2 text-xs font-bold text-white transition-opacity hover:opacity-90">
                                    <Upload className="h-3 w-3" /> Tải lên từ thiết bị
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {formTab === 'detail' && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                          <div>
                            <label className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-brand-400">
                              <Info className="h-3 w-3" /> Lưu ý quan trọng
                            </label>
                            <textarea 
                              rows={3}
                              value={formData.importantNote}
                              onChange={(e) => setFormData({...formData, importantNote: e.target.value})}
                              className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                              placeholder="Nhập các lưu ý quan trọng..."
                            />
                          </div>
                          <div>
                            <label className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-brand-400">
                              <Package className="h-3 w-3" /> Quy trình nhận hàng
                            </label>
                            <textarea 
                              rows={3}
                              value={formData.deliveryProcess}
                              onChange={(e) => setFormData({...formData, deliveryProcess: e.target.value})}
                              className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                              placeholder="Mô tả quy trình nhận hàng..."
                            />
                          </div>
                          <div>
                            <label className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-brand-400">
                              <Zap className="h-3 w-3" /> Tính năng nổi bật
                            </label>
                            <textarea 
                              rows={3}
                              value={formData.features}
                              onChange={(e) => setFormData({...formData, features: e.target.value})}
                              className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                              placeholder="Liệt kê các tính năng nổi bật..."
                            />
                          </div>
                          <div>
                            <label className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-brand-400">
                              <Shield className="h-3 w-3" /> Chính sách bảo hành
                            </label>
                            <textarea 
                              rows={3}
                              value={formData.warranty}
                              onChange={(e) => setFormData({...formData, warranty: e.target.value})}
                              className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                              placeholder="Mô tả chính sách bảo hành..."
                            />
                          </div>
                          <div>
                            <label className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-brand-400">
                              <HelpCircle className="h-3 w-3" /> Câu hỏi thường gặp
                            </label>
                            <textarea 
                              rows={3}
                              value={formData.faqs}
                              onChange={(e) => setFormData({...formData, faqs: e.target.value})}
                              className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                              placeholder="Q: Dùng được mấy máy? A: 2 máy..."
                            />
                          </div>
                          <div>
                            <label className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-brand-400">
                              <Layout className="h-3 w-3" /> Hướng dẫn sử dụng
                            </label>
                            <textarea 
                              rows={5}
                              value={formData.usageGuide}
                              onChange={(e) => setFormData({...formData, usageGuide: e.target.value})}
                              className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                              placeholder="Các bước sử dụng sản phẩm..."
                            />
                          </div>
                        </motion.div>
                      )}

                      {formTab === 'seo' && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                          <div className="rounded-2xl bg-white p-4 shadow-sm border border-brand-100">
                            <div className="mb-4 flex items-center justify-between">
                              <h4 className="flex items-center gap-2 text-sm font-bold text-tiktok-black">
                                <Search className="h-4 w-4 text-tiktok-cyan" /> Phân tích SEO (Yoast Style)
                              </h4>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-24 overflow-hidden rounded-full bg-brand-100">
                                  <div 
                                    className={`h-full transition-all duration-500 ${calculateSEOScore() > 70 ? 'bg-green-500' : calculateSEOScore() > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${calculateSEOScore()}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-brand-500">{calculateSEOScore()}%</span>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-xs">
                                <div className={`h-2 w-2 rounded-full ${formData.seoTitle && formData.seoTitle.length >= 30 ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-brand-500">Tiêu đề SEO: {formData.seoTitle?.length || 0}/60 ký tự</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <div className={`h-2 w-2 rounded-full ${formData.seoDescription && formData.seoDescription.length >= 120 ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-brand-500">Mô tả SEO: {formData.seoDescription?.length || 0}/160 ký tự</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <div className={`h-2 w-2 rounded-full ${formData.seoKeywords ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-brand-500">Từ khóa tập trung: {formData.seoKeywords ? 'Đã thêm' : 'Chưa có'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="mb-1 block text-xs font-bold uppercase text-brand-400">Đường dẫn thân thiện (Slug)</label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="text" 
                                  value={formData.slug}
                                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                  className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                                  placeholder="Ví dụ: youtube-premium-1-nam"
                                />
                                <button
                                  type="button"
                                  onClick={() => setFormData({...formData, slug: createSlug(formData.name)})}
                                  className="flex h-11 px-4 items-center justify-center rounded-xl bg-brand-50 text-[10px] font-bold text-tiktok-cyan hover:bg-brand-100 transition-colors"
                                >
                                  Tạo tự động
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-bold uppercase text-brand-400">Tiêu đề SEO</label>
                              <input 
                                type="text" 
                                value={formData.seoTitle}
                                onChange={(e) => setFormData({...formData, seoTitle: e.target.value})}
                                className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                                placeholder="Tiêu đề hiển thị trên Google..."
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-bold uppercase text-brand-400">Mô tả SEO (Meta Description)</label>
                              <textarea 
                                rows={3}
                                value={formData.seoDescription}
                                onChange={(e) => setFormData({...formData, seoDescription: e.target.value})}
                                className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                                placeholder="Mô tả ngắn gọn thu hút người dùng click..."
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-bold uppercase text-brand-400">Từ khóa chính</label>
                              <input 
                                type="text" 
                                value={formData.seoKeywords}
                                onChange={(e) => setFormData({...formData, seoKeywords: e.target.value})}
                                className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                                placeholder="Ví dụ: tài khoản capcut pro, youtube premium giá rẻ..."
                              />
                            </div>
                          </div>

                          {/* Preview */}
                          <div className="rounded-2xl bg-white p-4 shadow-sm border border-brand-100">
                            <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-brand-400">
                              <Eye className="h-3 w-3" /> Xem trước kết quả tìm kiếm
                            </label>
                            <div className="space-y-1">
                              <div className="text-sm text-[#1a0dab] hover:underline cursor-pointer truncate">
                                {formData.seoTitle || formData.name || 'Tiêu đề sản phẩm'}
                              </div>
                              <div className="text-xs text-[#006621] truncate">
                                activenhanh.pro.vn › sản-phẩm › {formData.name.toLowerCase().replace(/ /g, '-')}
                              </div>
                              <div className="text-xs text-[#545454] line-clamp-2">
                                {formData.seoDescription || 'Chưa có mô tả SEO. Vui lòng bổ sung để tăng tỷ lệ click từ Google.'}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={handleSave}
                        className="tiktok-button flex-1 flex items-center justify-center gap-2"
                      >
                        <Save className="h-4 w-4" /> Lưu thay đổi
                      </button>
                      <button 
                        onClick={() => { setEditingId(null); setIsAdding(false); }}
                        className="flex-1 rounded-xl border border-brand-100 bg-white font-bold text-brand-500 hover:bg-brand-50"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full bg-white p-6 shadow-sm">
                      <Plus className="h-12 w-12 text-brand-100" />
                    </div>
                    <p className="text-sm font-medium text-brand-400">Chọn một sản phẩm để chỉnh sửa hoặc nhấn "Thêm mới"</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'orders' ? (
            <div className="h-full overflow-y-auto p-6 bg-brand-50/30">
              {ordersLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-tiktok-cyan" />
                </div>
              ) : (
                <div className="mx-auto max-w-5xl space-y-6">
                  {/* Order Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-3xl bg-white p-4 shadow-sm border border-brand-100">
                      <p className="text-[10px] font-black uppercase tracking-wider text-brand-400">Tổng đơn hàng</p>
                      <p className="text-2xl font-black text-tiktok-black">{orderStats.total}</p>
                    </div>
                    <div className="rounded-3xl bg-white p-4 shadow-sm border border-brand-100">
                      <p className="text-[10px] font-black uppercase tracking-wider text-brand-400">Chờ xử lý</p>
                      <p className="text-2xl font-black text-yellow-500">{orderStats.pending}</p>
                    </div>
                    <div className="rounded-3xl bg-white p-4 shadow-sm border border-brand-100">
                      <p className="text-[10px] font-black uppercase tracking-wider text-brand-400">Đã hoàn tất</p>
                      <p className="text-2xl font-black text-green-500">{orderStats.completed}</p>
                    </div>
                    <div className="rounded-3xl bg-white p-4 shadow-sm border border-brand-100">
                      <p className="text-[10px] font-black uppercase tracking-wider text-brand-400">Doanh thu</p>
                      <p className="text-xl font-black text-tiktok-magenta">{formatPrice(orderStats.revenue)}</p>
                    </div>
                  </div>

                  {/* Filters & Search */}
                  <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-brand-100 shadow-sm">
                    <div className="flex bg-brand-50 p-1 rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
                      {(['all', 'pending', 'completed', 'cancelled'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => setOrderStatusFilter(status)}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                            orderStatusFilter === status 
                              ? 'bg-white text-tiktok-black shadow-sm' 
                              : 'text-brand-400 hover:text-tiktok-black'
                          }`}
                        >
                          {status === 'all' ? 'Tất cả' : status === 'pending' ? 'Chờ xử lý' : status === 'completed' ? 'Hoàn tất' : 'Đã hủy'}
                        </button>
                      ))}
                    </div>
                    <div className="relative w-full lg:w-72">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
                      <input
                        type="text"
                        placeholder="Tìm theo ID, Tên, SĐT..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full rounded-2xl border border-brand-100 bg-brand-50 py-2.5 pl-10 pr-4 text-xs font-bold focus:border-tiktok-cyan focus:outline-none focus:ring-1 focus:ring-tiktok-cyan"
                      />
                    </div>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center text-center bg-white rounded-3xl border border-brand-100">
                      <ShoppingBag className="mb-4 h-12 w-12 text-brand-200" />
                      <p className="font-bold text-brand-400">Không tìm thấy đơn hàng nào phù hợp</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredOrders.map((order) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="mb-6 flex items-start justify-between">
                            <div>
                              <div className="mb-1 flex items-center gap-3">
                                <span className="text-sm font-black text-tiktok-black">#{order.id.slice(-6).toUpperCase()}</span>
                                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 
                                  order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                  {order.status === 'pending' ? 'Chờ xử lý' : 
                                   order.status === 'completed' ? 'Hoàn tất' : 'Đã hủy'}
                                </span>
                              </div>
                              <div className="text-xs font-bold text-brand-400">
                                {new Date(order.createdAt).toLocaleString('vi-VN')}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-black text-tiktok-magenta">{formatPrice(order.total)}</div>
                              <div className="text-xs font-bold text-brand-400">{order.items.length} sản phẩm</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-400">
                                <User className="h-3 w-3" /> Thông tin khách hàng
                              </h4>
                              <div className="space-y-2 rounded-2xl bg-brand-50 p-4">
                                <p className="text-sm font-bold text-tiktok-black">{order.customerInfo.fullName}</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-medium text-brand-500">{order.customerInfo.phone}</p>
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(order.customerInfo.phone);
                                      alert('Đã sao chép số điện thoại!');
                                    }}
                                    className="text-[10px] font-bold text-tiktok-cyan hover:underline"
                                  >
                                    Sao chép
                                  </button>
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-medium text-brand-500">{order.customerInfo.email}</p>
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(order.customerInfo.email);
                                      alert('Đã sao chép email!');
                                    }}
                                    className="text-[10px] font-bold text-tiktok-cyan hover:underline"
                                  >
                                    Sao chép
                                  </button>
                                </div>
                                <p className="text-xs font-medium text-brand-500">{order.customerInfo.address}</p>
                                {order.customerInfo.note && (
                                  <p className="mt-2 border-t border-brand-100 pt-2 text-xs italic text-brand-400">
                                    "{order.customerInfo.note}"
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-400">
                                <Package className="h-3 w-3" /> Chi tiết đơn hàng
                              </h4>
                              <div className="space-y-3">
                                {order.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span className="font-bold text-tiktok-black">{item.name} <span className="text-brand-400">x{item.quantity}</span></span>
                                    <span className="font-bold text-brand-500">{formatPrice(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="flex flex-col gap-2 pt-4 sm:flex-row">
                                {order.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => updateOrderStatus(order.id, 'completed')}
                                      className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 text-xs font-bold text-white transition-all hover:bg-green-600 sm:h-auto sm:py-2"
                                    >
                                      <CheckCircle className="h-4 w-4" /> Hoàn tất đơn
                                    </button>
                                    <button
                                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                      className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 text-xs font-bold text-red-500 transition-all hover:bg-red-100 sm:h-auto sm:py-2"
                                    >
                                      <X className="h-4 w-4" /> Hủy đơn
                                    </button>
                                  </>
                                )}
                                {order.status === 'completed' && (
                                  <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-50 py-3 text-xs font-bold text-green-600">
                                    <CheckCircle className="h-4 w-4" /> Đã giao hàng thành công
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === 'posts' ? (
            <div className="grid h-full lg:grid-cols-2">
              {/* Post List */}
              <div className="overflow-y-auto border-r border-brand-100 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-sans text-lg font-black text-tiktok-black">Quản lý bài viết</h3>
                  <button 
                    onClick={() => { setIsAddingPost(true); setEditingPostId(null); resetPostForm(); }}
                    className="flex items-center gap-2 rounded-full bg-tiktok-cyan px-4 py-2 text-xs font-bold text-tiktok-black"
                  >
                    <Plus className="h-4 w-4" /> Thêm bài mới
                  </button>
                </div>

                {postsLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-tiktok-cyan" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((p) => (
                      <div key={p.id} className="flex items-center gap-4 rounded-xl border border-brand-100 p-3 transition-colors hover:bg-brand-50">
                        <img src={p.thumbnail} alt="" className="h-12 w-12 rounded-lg object-cover" />
                        <div className="flex-1 overflow-hidden">
                          <h4 className="truncate font-bold text-tiktok-black">{p.title}</h4>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-brand-400">
                             <span>{p.category}</span>
                             <span>• {new Date(p.createdAt).toLocaleDateString('vi-VN')}</span>
                             <span>• Views: {p.views}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingPostId(p.id);
                              setIsAddingPost(false);
                              setPostFormData({
                                title: p.title,
                                slug: p.slug,
                                content: p.content,
                                excerpt: p.excerpt,
                                thumbnail: p.thumbnail,
                                category: p.category,
                                authorId: p.authorId,
                                authorName: p.authorName,
                                tags: p.tags || [],
                                seoTitle: p.seoTitle || '',
                                seoDescription: p.seoDescription || '',
                                seoKeywords: p.seoKeywords || ''
                              });
                            }} 
                            className="rounded-lg p-2 text-brand-400 hover:bg-white hover:text-tiktok-cyan"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => removePost(p.id)} className="rounded-lg p-2 text-brand-400 hover:bg-white hover:text-tiktok-magenta">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Editor */}
              <div className="overflow-y-auto p-6 bg-brand-50/30">
                {(editingPostId || isAddingPost) ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-tiktok-black">
                        {editingPostId ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-xs font-black uppercase text-brand-400">Tiêu đề bài viết</label>
                        <input
                          type="text"
                          value={postFormData.title}
                          onChange={(e) => {
                             const title = e.target.value;
                             setPostFormData({ 
                               ...postFormData, 
                               title, 
                               slug: editingPostId ? postFormData.slug : createSlug(title) 
                             });
                          }}
                          className="w-full rounded-xl border border-brand-100 p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                          placeholder="Ví dụ: 10 thủ thuật tối ưu Youtube Premium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-2 block text-xs font-black uppercase text-brand-400">Đường dẫn bài viết (Slug)</label>
                          <input
                            type="text"
                            value={postFormData.slug}
                            onChange={(e) => setPostFormData({ ...postFormData, slug: e.target.value })}
                            className="w-full rounded-xl border border-brand-100 p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-black uppercase text-brand-400">Chuyên mục</label>
                          <select
                            value={postFormData.category}
                            onChange={(e) => setPostFormData({ ...postFormData, category: e.target.value })}
                            className="w-full rounded-xl border border-brand-100 p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                          >
                            <option value="Thủ thuật">Thủ thuật</option>
                            <option value="Review">Review</option>
                            <option value="Tin tức">Tin tức</option>
                            <option value="Khuyến mãi">Khuyến mãi</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-black uppercase text-brand-400">Mô tả ngắn</label>
                        <textarea
                          value={postFormData.excerpt}
                          onChange={(e) => setPostFormData({ ...postFormData, excerpt: e.target.value })}
                          className="h-20 w-full rounded-xl border border-brand-100 p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                          placeholder="Mô tả tóm tắt nội dung bài viết..."
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-black uppercase text-brand-400">Ảnh bìa</label>
                        <div className="flex items-center gap-4">
                          <img src={postFormData.thumbnail} alt="" className="h-24 w-40 rounded-xl object-cover border border-brand-100" />
                          <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-brand-600 shadow-sm transition-all hover:bg-brand-50">
                            <Upload className="h-4 w-4" /> Tải ảnh lên
                            <input type="file" accept="image/*" className="hidden" onChange={handlePostImageUpload} />
                          </label>
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label className="block text-xs font-black uppercase text-brand-400">Nội dung (Markdown)</label>
                          <div className="flex rounded-lg bg-brand-100 p-1">
                            <button
                              onClick={() => setPostEditorTab('write')}
                              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-[10px] font-bold transition-all ${postEditorTab === 'write' ? 'bg-white shadow-sm' : 'text-brand-400'}`}
                            >
                              <FileEdit className="h-3 w-3" /> Soạn thảo
                            </button>
                            <button
                              onClick={() => setPostEditorTab('preview')}
                              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-[10px] font-bold transition-all ${postEditorTab === 'preview' ? 'bg-white shadow-sm' : 'text-brand-400'}`}
                            >
                              <EyeIcon className="h-3 w-3" /> Xem trước
                            </button>
                          </div>
                        </div>
                        
                        {postEditorTab === 'write' ? (
                          <textarea
                            value={postFormData.content}
                            onChange={(e) => setPostFormData({ ...postFormData, content: e.target.value })}
                            className="h-96 w-full rounded-xl border border-brand-100 p-4 text-sm font-mono focus:border-tiktok-cyan focus:outline-none"
                            placeholder="Hỗ trợ định dạng Markdown..."
                          />
                        ) : (
                          <div className="markdown-body h-96 w-full overflow-y-auto rounded-xl border border-brand-100 bg-white p-6">
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                              {postFormData.content || '*Chưa có nội dung...*'}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-brand-100">
                        <label className="mb-2 block text-xs font-black uppercase text-brand-400">SEO Metadata</label>
                        <div className="space-y-3">
                           <input
                            type="text"
                            placeholder="SEO Title"
                            value={postFormData.seoTitle}
                            onChange={(e) => setPostFormData({ ...postFormData, seoTitle: e.target.value })}
                            className="w-full rounded-xl border border-brand-100 p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                          />
                          <textarea
                            placeholder="SEO Description"
                            value={postFormData.seoDescription}
                            onChange={(e) => setPostFormData({ ...postFormData, seoDescription: e.target.value })}
                            className="h-20 w-full rounded-xl border border-brand-100 p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={async () => {
                            if (editingPostId) {
                              await editPost(editingPostId, postFormData);
                              setEditingPostId(null);
                            } else {
                              await addPost(postFormData);
                              setIsAddingPost(false);
                            }
                            resetPostForm();
                          }}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-tiktok-black py-3 font-bold text-white shadow-lg transition-all hover:bg-tiktok-magenta"
                        >
                          <Save className="h-4 w-4" /> Lưu bài viết
                        </button>
                        <button
                          onClick={() => { setEditingPostId(null); setIsAddingPost(false); resetPostForm(); }}
                          className="rounded-xl border border-brand-100 px-6 font-bold text-brand-400 hover:bg-white"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-6 rounded-full bg-white p-6 shadow-xl">
                      <FileText className="h-12 w-12 text-brand-100" />
                    </div>
                    <p className="font-bold text-brand-400">Chọn bài viết để chỉnh sửa hoặc viết bài mới</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'comments' ? (
            <div className="h-full overflow-y-auto p-6 bg-brand-50/30">
               {postCommentsLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-tiktok-cyan" />
                </div>
              ) : (
                <div className="mx-auto max-w-4xl space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-tiktok-black">Duyệt bình luận Blog ({postComments.length})</h3>
                  </div>

                  <div className="space-y-4">
                    {postComments.length === 0 ? (
                      <div className="flex h-64 flex-col items-center justify-center text-center bg-white rounded-3xl border border-brand-100">
                        <MessageCircle className="mb-4 h-12 w-12 text-brand-200" />
                        <p className="font-bold text-brand-400">Chưa có bình luận nào</p>
                      </div>
                    ) : (
                      postComments.map((comment) => (
                        <div key={comment.id} className={`rounded-3xl border p-6 bg-white shadow-sm transition-all ${comment.status === 'pending' ? 'border-yellow-200 ring-2 ring-yellow-50' : 'border-brand-100'}`}>
                           <div className="flex items-start justify-between">
                             <div className="flex gap-4">
                               <img src={comment.userPhoto} alt="" className="h-10 w-10 rounded-full border border-brand-50 shadow-sm" />
                               <div>
                                 <div className="flex items-center gap-2 mb-1">
                                   <span className="font-black text-tiktok-black">{comment.userName}</span>
                                   <span className="text-[10px] font-bold text-brand-400">{new Date(comment.createdAt).toLocaleString('vi-VN')}</span>
                                   {comment.status === 'pending' && <span className="bg-yellow-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">Chờ duyệt</span>}
                                   {comment.status === 'spam' && <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">Spam</span>}
                                 </div>
                                 <p className="text-sm text-brand-600 mb-4 bg-brand-50/50 p-3 rounded-xl italic">"{comment.content}"</p>
                                 <div className="text-[10px] text-brand-400 font-bold">
                                   Bài viết: <span className="text-tiktok-cyan uppercase">{posts.find(p => p.id === comment.postId)?.title || 'N/A'}</span>
                                 </div>
                               </div>
                             </div>
                             <div className="flex flex-col gap-2">
                               {comment.status === 'pending' && (
                                 <button 
                                   onClick={() => approvePostComment(comment.id)}
                                   className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all"
                                 >
                                   <CheckCircle className="h-3.5 w-3.5" /> Duyệt
                                 </button>
                               )}
                               <button 
                                 onClick={() => markPostCommentSpam(comment.id)}
                                 className="flex items-center justify-center gap-2 bg-red-50 text-red-500 px-4 py-2 rounded-xl text-xs font-black hover:bg-red-100 transition-all underline underline-offset-4"
                               >
                                 <ShieldAlert className="h-3.5 w-3.5" /> Spam
                               </button>
                               <button 
                                 onClick={() => removePostComment(comment.id)}
                                 className="flex items-center justify-center gap-2 text-brand-300 hover:text-tiktok-magenta transition-all"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </button>
                             </div>
                           </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'users' ? (
            <div className="h-full overflow-y-auto p-6 bg-brand-50/30">
              {usersLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-tiktok-cyan" />
                </div>
              ) : (
                <div className="mx-auto max-w-4xl">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-black text-tiktok-black">Danh sách khách hàng ({users.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.map((u) => (
                      <div key={u.id} className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 font-bold text-tiktok-magenta">
                          {u.displayName?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="truncate font-bold text-tiktok-black">{u.displayName || 'Khách hàng'}</p>
                          <p className="truncate text-xs text-brand-400">{u.email}</p>
                          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-tiktok-cyan/10 text-tiktok-cyan' : 'bg-brand-100 text-brand-500'}`}>
                            {u.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'reviews' ? (
            <div className="h-full overflow-y-auto p-6 bg-brand-50/30">
              {reviewsLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-tiktok-cyan" />
                </div>
              ) : (
                <div className="mx-auto max-w-4xl space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-tiktok-black">Quản lý đánh giá ({allReviews.length})</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowPendingOnly(!showPendingOnly)}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all border ${showPendingOnly ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-brand-500 border-brand-100 hover:bg-brand-50'}`}
                      >
                        <Clock className="h-4 w-4" /> {showPendingOnly ? 'Đang hiện Chờ duyệt' : 'Hiện tất cả'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {allReviews.length === 0 ? (
                      <div className="flex h-64 flex-col items-center justify-center text-center bg-white rounded-3xl border border-brand-100">
                        <Star className="mb-4 h-12 w-12 text-brand-200" />
                        <p className="font-bold text-brand-400">Chưa có đánh giá nào</p>
                      </div>
                    ) : (
                      allReviews.map((review) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`rounded-3xl border p-6 shadow-sm transition-all ${!review.isApproved ? 'border-yellow-200 bg-yellow-50/30' : 'border-brand-100 bg-white'}`}
                        >
                          <div className="mb-4 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-tiktok-magenta">
                                {review.userName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-tiktok-black">{review.userName}</span>
                                  {!review.isApproved && (
                                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-black uppercase text-yellow-600">Chờ duyệt</span>
                                  )}
                                </div>
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-brand-200'}`} />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-brand-300">
                              {new Date(review.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          
                          <div className="mb-4 rounded-2xl bg-brand-50/50 p-4">
                            <p className="text-xs font-bold text-brand-400 uppercase mb-1">Sản phẩm: {products.find(p => p.id === review.productId)?.name || 'N/A'}</p>
                            <p className="text-sm leading-relaxed text-brand-600">{review.comment}</p>
                          </div>

                          <div className="flex gap-2">
                            {!review.isApproved && (
                              <button
                                onClick={() => approveReview(review.id)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 py-2 text-xs font-bold text-white transition-all hover:bg-green-600"
                              >
                                <CheckCircle className="h-4 w-4" /> Phê duyệt
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
                                  removeReview(review.id);
                                }
                              }}
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 py-2 text-xs font-bold text-red-500 transition-all hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" /> Xóa
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                    
                    {hasMoreReviews && (
                      <button
                        onClick={loadMoreReviews}
                        className="w-full rounded-2xl bg-white py-4 text-sm font-bold text-tiktok-cyan shadow-sm border border-brand-100 hover:bg-brand-50 transition-colors"
                      >
                        Tải thêm đánh giá
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid h-full grid-cols-1 lg:grid-cols-2">
              {/* Category List */}
              <div className="overflow-y-auto border-r border-brand-100 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-bold text-brand-500">Danh mục ({categories.length})</h3>
                  <button 
                    onClick={() => { setIsAddingCategory(true); setEditingCategoryId(null); setCategoryFormData({ name: '', slug: '', order: categories.length }); }}
                    className="flex items-center gap-2 rounded-full bg-tiktok-cyan px-4 py-2 text-xs font-bold text-tiktok-black"
                  >
                    <Plus className="h-4 w-4" /> Thêm mới
                  </button>
                </div>

                {categoriesLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-tiktok-cyan" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between rounded-xl border border-brand-100 bg-white p-4 transition-colors hover:bg-brand-50">
                        <div>
                          <p className="font-bold text-tiktok-black">{cat.name}</p>
                          <p className="text-[10px] font-medium text-brand-400">Slug: {cat.slug} • Thứ tự: {cat.order}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingCategoryId(cat.id);
                              setIsAddingCategory(false);
                              setCategoryFormData({ name: cat.name, slug: cat.slug, order: cat.order });
                            }} 
                            className="rounded-lg p-2 text-brand-400 hover:bg-brand-100 hover:text-tiktok-cyan"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('Xóa danh mục này có thể ảnh hưởng đến việc hiển thị sản phẩm. Bạn chắc chắn chứ?')) {
                                removeCategory(cat.id);
                              }
                            }} 
                            className="rounded-lg p-2 text-brand-400 hover:bg-brand-100 hover:text-tiktok-magenta"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Editor */}
              <div className="overflow-y-auto p-6 bg-brand-50/30">
                {(isAddingCategory || editingCategoryId) ? (
                  <div className="space-y-6">
                    <h3 className="font-bold text-tiktok-black">
                      {editingCategoryId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase text-brand-400">Tên danh mục</label>
                        <input 
                          type="text" 
                          value={categoryFormData.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                            setCategoryFormData({ ...categoryFormData, name, slug });
                          }}
                          className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                          placeholder="Ví dụ: Giải trí, Học tập..."
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase text-brand-400">Slug (URL)</label>
                        <input 
                          type="text" 
                          value={categoryFormData.slug}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                          className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase text-brand-400">Thứ tự hiển thị</label>
                        <input 
                          type="number" 
                          value={categoryFormData.order}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, order: Number(e.target.value) })}
                          className="w-full rounded-xl border border-brand-100 bg-white p-3 text-sm focus:border-tiktok-cyan focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button 
                          onClick={async () => {
                            if (!categoryFormData.name) return alert('Vui lòng nhập tên danh mục');
                            if (editingCategoryId) {
                              await editCategory(editingCategoryId, categoryFormData);
                              setEditingCategoryId(null);
                            } else {
                              await addCategory(categoryFormData);
                              setIsAddingCategory(false);
                            }
                            setCategoryFormData({ name: '', slug: '', order: 0 });
                          }}
                          className="tiktok-button flex-1 flex items-center justify-center gap-2"
                        >
                          <Save className="h-4 w-4" /> Lưu danh mục
                        </button>
                        <button 
                          onClick={() => { setIsAddingCategory(false); setEditingCategoryId(null); }}
                          className="flex-1 rounded-xl border border-brand-100 bg-white font-bold text-brand-500 hover:bg-brand-50"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full bg-white p-6 shadow-sm">
                      <Tag className="h-12 w-12 text-brand-100" />
                    </div>
                    <p className="text-sm font-medium text-brand-400">Chọn một danh mục để chỉnh sửa hoặc nhấn "Thêm mới"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
