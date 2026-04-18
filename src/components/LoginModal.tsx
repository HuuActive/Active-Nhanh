import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, LogIn, Github, Loader2, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useFirebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot-password';

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        onClose();
      } else if (mode === 'register') {
        if (!name) throw new Error('Vui lòng nhập họ tên');
        await registerWithEmail(email, password, name);
        onClose();
      } else if (mode === 'forgot-password') {
        await resetPassword(email);
        setMessage('Liên kết khôi phục mật khẩu đã được gửi vào email của bạn.');
        setTimeout(() => setMode('login'), 3000);
      }
    } catch (err: any) {
      let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      if (err.code === 'auth/user-not-found') errorMessage = 'Không tìm thấy tài khoản này.';
      if (err.code === 'auth/wrong-password') errorMessage = 'Mật khẩu không chính xác.';
      if (err.code === 'auth/email-already-in-use') errorMessage = 'Email này đã được sử dụng.';
      if (err.code === 'auth/weak-password') errorMessage = 'Mật khẩu quá yếu (tối thiểu 6 ký tự).';
      if (err.code === 'auth/invalid-email') errorMessage = 'Email không hợp lệ.';
      
      setError(err.message || errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError('Đăng nhập Google thất bại.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
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
        {/* Header Decoration */}
        <div className="bg-tiktok-black p-8 text-white relative">
          <div className="absolute right-0 top-0 h-full w-32 opacity-20">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-tiktok-cyan blur-2xl"></div>
          </div>
          
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <LogIn className="h-6 w-6 text-tiktok-cyan" />
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tight">
              {mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Đăng ký' : 'Quên mật khẩu'}
            </h2>
          </div>
          <p className="text-sm text-brand-300 font-medium">
            {mode === 'login' ? 'Chào mừng bạn quay trở lại với ActiveNhanh' : mode === 'register' ? 'Bắt đầu trải nghiệm các dịch vụ Premium' : 'Nhận mã đặt lại mật khẩu của bạn'}
          </p>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {error && (
                <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {error}
                </div>
              )}

              {message && (
                <div className="flex items-center gap-3 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-600 border border-green-100">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {message}
                </div>
              )}

              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-brand-400 ml-2">Họ và tên</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-300" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full rounded-2xl border border-brand-100 bg-brand-50 py-4 pl-12 pr-4 text-sm font-bold focus:border-tiktok-cyan focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-brand-400 ml-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-300" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full rounded-2xl border border-brand-100 bg-brand-50 py-4 pl-12 pr-4 text-sm font-bold focus:border-tiktok-cyan focus:outline-none transition-all"
                  />
                </div>
              </div>

              {mode !== 'forgot-password' && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center ml-2 mr-2">
                    <label className="text-xs font-black uppercase tracking-widest text-brand-400">Mật khẩu</label>
                    {mode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => setMode('forgot-password')}
                        className="text-[10px] font-bold text-tiktok-magenta hover:underline"
                      >
                        Quên mật khẩu?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-300" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-brand-100 bg-brand-50 py-4 pl-12 pr-4 text-sm font-bold focus:border-tiktok-cyan focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full tiktok-button py-4 text-base font-black flex items-center justify-center gap-2 group shadow-[0_4px_0_#00c2bb]"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Tạo tài khoản' : 'Gửi yêu cầu'}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          {mode !== 'forgot-password' && (
            <>
              <div className="relative my-8 text-center text-[10px] font-black uppercase tracking-widest text-brand-400">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-brand-100"></div>
                </div>
                <span className="relative bg-white px-4">Hoặc tiếp tục với</span>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-brand-100 bg-white py-4 text-sm font-bold text-tiktok-black transition-all hover:bg-brand-50 hover:border-brand-200 active:scale-95"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5" alt="Google" />
                Đăng nhập bằng Google
              </button>
            </>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
                setMessage(null);
              }}
              className="text-sm font-bold text-brand-500 hover:text-tiktok-black transition-colors"
            >
              {mode === 'login' 
                ? <>Chưa có tài khoản? <span className="text-tiktok-cyan underline underline-offset-4">Đăng ký ngay</span></> 
                : mode === 'register'
                ? <>Đã có tài khoản? <span className="text-tiktok-cyan underline underline-offset-4">Đăng nhập</span></>
                : <span className="text-tiktok-cyan underline underline-offset-4">Quay lại đăng nhập</span>
              }
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
