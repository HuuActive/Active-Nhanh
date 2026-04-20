import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Shield, Camera, Save, Loader2, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useFirebase';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, profile, updateProfile, resetPassword } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(profile?.displayName || user.displayName || '');
      setPhotoURL(profile?.photoURL || user.photoURL || '');
    }
  }, [user, profile, isOpen]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      await updateProfile({ displayName, photoURL });
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật thông tin.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    try {
      await resetPassword(user.email);
      setMessage({ type: 'success', text: 'Chúng tôi đã gửi link đặt lại mật khẩu vào email của bạn.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể gửi email đặt lại mật khẩu.' });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit
        setMessage({ type: 'error', text: 'Ảnh đại diện quá lớn. Vui lòng chọn ảnh dưới 500KB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl"
          >
            <div className="bg-tiktok-black p-6 text-white text-center relative">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="mx-auto mb-4 relative w-24 h-24">
                {photoURL ? (
                  <img src={photoURL} alt="" className="w-full h-full rounded-full object-cover border-4 border-white/20" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full rounded-full bg-brand-800 flex items-center justify-center border-4 border-white/20">
                    <User className="h-10 w-10 text-brand-400" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 p-1.5 bg-tiktok-cyan rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                  <Camera className="h-4 w-4 text-tiktok-black" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <h3 className="text-xl font-black">Thông tin cá nhân</h3>
              <p className="text-xs text-brand-400 mt-1">Quản lý và cập nhật thông tin của bạn</p>
            </div>

            <div className="p-8">
              {message && (
                <div className={`mb-6 flex items-center gap-3 rounded-2xl p-4 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                  {message.text}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase text-brand-400">Tên hiển thị</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-300" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full rounded-2xl border border-brand-100 bg-brand-50/50 py-3 pl-12 pr-4 text-sm focus:border-tiktok-cyan focus:outline-none transition-all"
                      placeholder="Họ và tên của bạn"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase text-brand-400">Email của bạn</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-300" />
                    <input
                      type="email"
                      readOnly
                      value={user?.email || ''}
                      className="w-full rounded-2xl border border-brand-100 bg-brand-50 py-3 pl-12 pr-4 text-sm text-brand-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase text-brand-400">Trạng thái tài khoản</label>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Shield className="h-4 w-4 text-tiktok-cyan" />
                    <span className="text-tiktok-black">{user?.emailVerified ? 'Đã xác thực email' : 'Chưa xác thực email'}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-tiktok-black py-4 font-black transition-all hover:bg-tiktok-magenta hover:shadow-xl active:scale-95 text-white disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    Lưu thay đổi
                  </button>
                </div>
              </form>

              <div className="mt-8 pt-8 border-t border-brand-50">
                <button
                  onClick={handleResetPassword}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-brand-100 py-3 text-sm font-bold text-brand-600 transition-all hover:border-tiktok-cyan hover:text-tiktok-black"
                >
                  <Key className="h-4 w-4" /> Đặt lại mật khẩu
                </button>
                <p className="mt-3 text-[10px] text-center text-brand-400 font-medium">Link đặt lại mật khẩu sẽ được gửi về email của bạn để đảm bảo bảo mật.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
