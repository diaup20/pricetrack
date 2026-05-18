import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ChevronLeft, 
  ArrowRight,
  Github,
  Chrome
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  auth, 
  loginWithGoogle
} from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'register';
type AuthMethod = 'email' | 'phone';

export function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [method, setMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (method === 'email') {
        if (mode === 'login') {
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCredential.user, { displayName: name });
        }
      } else {
        // Phone Auth would go here
        setError('تسجيل الدخول عبر الهاتف سيتوفر قريباً. يرجى استخدام البريد الإلكتروني حالياً.');
        setLoading(false);
        return;
      }
      navigate('/profile');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') setError('المستخدم غير موجود');
      else if (err.code === 'auth/wrong-password') setError('كلمة المرور خاطئة');
      else if (err.code === 'auth/email-already-in-use') setError('البريد الإلكتروني مستخدم بالفعل');
      else setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col min-h-[calc(100vh-180px)] justify-center py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-primary-600 text-white rounded-[28px] flex items-center justify-center mx-auto shadow-2xl shadow-primary-500/20 mb-6 rotate-3"
          >
            <User size={32} />
          </motion.div>
          <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tighter">
            {mode === 'login' ? 'مرحباً بك مجدداً' : 'إنشاء حساب جديد'}
          </h1>
          <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 mt-2 uppercase tracking-widest">
            {mode === 'login' ? 'سجل دخولك لتتبع بلاغاتك وحفظ مفضلاتك' : 'انضم إلينا لمتابعة أسعار السوق في اليمن'}
          </p>
        </div>

        {/* Auth Method Toggle */}
        <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-2xl mb-8 relative">
          <button 
            onClick={() => setMethod('email')}
            className={cn(
              "flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all z-10 flex items-center justify-center gap-2",
              method === 'email' ? "text-neutral-900 dark:text-white" : "text-neutral-400"
            )}
          >
            <Mail size={14} />
            البريد الإلكتروني
          </button>
          <button 
            onClick={() => setMethod('phone')}
            className={cn(
              "flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all z-10 flex items-center justify-center gap-2",
              method === 'phone' ? "text-neutral-900 dark:text-white" : "text-neutral-400"
            )}
          >
            <Phone size={14} />
            رقم الجوال
          </button>
          <motion.div 
            layoutId="method-pill"
            className="absolute top-1.5 bottom-1.5 left-1.5 right-[50%] bg-white dark:bg-neutral-800 rounded-xl shadow-sm"
            initial={false}
            animate={{ 
              left: method === 'email' ? '6px' : '50%',
              right: method === 'email' ? '50%' : '6px'
            }}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {mode === 'register' && method === 'email' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative group"
              >
                <div className="absolute inset-y-0 right-5 flex items-center text-neutral-400 group-focus-within:text-primary-500 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="الاسم الكامل" 
                  required
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-4 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {method === 'email' ? (
            <>
              <div className="relative group">
                <div className="absolute inset-y-0 right-5 flex items-center text-neutral-400 group-focus-within:text-primary-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  placeholder="البريد الإلكتروني" 
                  required
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-4 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 right-5 flex items-center text-neutral-400 group-focus-within:text-primary-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  placeholder="كلمة المرور" 
                  required
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-4 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="relative group">
              <div className="absolute inset-y-0 right-5 flex items-center text-neutral-400 group-focus-within:text-primary-500 transition-colors">
                <Phone size={18} />
              </div>
              <input 
                type="tel" 
                placeholder="رقم الجوال (بدون مقدمة)" 
                required
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-4 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          )}

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-black text-red-500 text-center uppercase tracking-widest"
            >
              {error}
            </motion.p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-5 rounded-[24px] font-black text-[13px] uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'دخول' : 'إنشاء الحساب'}</span>
                <ArrowRight size={18} className="rotate-180" />
              </>
            )}
          </button>
        </form>

        {/* Social Login Divider */}
        <div className="flex items-center gap-4 my-10">
          <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
          <span className="text-[10px] font-black text-neutral-300 dark:text-neutral-700 uppercase tracking-widest">أو عبر</span>
          <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
        </div>

        {/* Google Login */}
        <button 
          onClick={() => loginWithGoogle()}
          className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 text-neutral-900 dark:text-white py-5 rounded-[24px] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all shadow-sm"
        >
          <Chrome size={18} className="text-red-500" />
          تسجيل الدخول عبر جوجل
        </button>

        {/* Toggle Mode */}
        <div className="mt-10 text-center">
          <p className="text-xs font-bold text-neutral-400">
            {mode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
            <button 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="mr-2 text-primary-600 font-black hover:underline"
            >
              {mode === 'login' ? 'سجل الآن' : 'سجل دخولك'}
            </button>
          </p>
        </div>

        {/* Back link */}
        <button 
          onClick={() => navigate(-1)}
          className="mt-8 text-[10px] font-black text-neutral-300 dark:text-neutral-700 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1 uppercase tracking-widest"
        >
          <ChevronLeft size={14} className="rotate-180" />
          العودة للخلف
        </button>
      </div>
    </Layout>
  );
}
