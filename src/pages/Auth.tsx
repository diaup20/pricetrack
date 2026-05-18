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
  Chrome,
  Copy
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
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'register';
type AuthMethod = 'email' | 'phone';

export function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [method, setMethod] = useState<AuthMethod>('phone');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    if (!email && method === 'email') {
      setError('يرجى إدخال البريد الإلكتروني لإرسال رابط استعادة كلمة المرور');
      return;
    }
    setResetLoading(true);
    setError('');
    setSuccess('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني');
    } catch (err: any) {
      setError('خطأ في إرسال البريد. تأكد من صحة البريد الإلكتروني.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let loginId = email.trim();
      if (method === 'phone') {
        const cleanPhone = phone.trim().replace(/\D/g, '');
        if (cleanPhone.length < 9) {
          setError('يرجى إدخال رقم جوال يمني صحيح (مثال: 777000000)');
          setLoading(false);
          return;
        }
        loginId = `${cleanPhone}@yemen-auth.com`;
      }

      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, loginId, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, loginId, password);
        await updateProfile(userCredential.user, { 
          displayName: name.trim() || (method === 'phone' ? phone : email.split('@')[0]) 
        });
      }
      navigate('/profile');
    } catch (err: any) {
      console.error("Auth Fail Details:", err);
      const code = err.code || 'unknown';
      
      if (code === 'auth/operation-not-allowed') {
        setError(`⚠️ مشكلة في الإعدادات (Firebase Console):
        يجب تفعيل خيار "Email/Password" في مشروعك.
        
        1. اذهب إلى: Authentication -> Sign-in method
        2. اضغط على Add new provider
        3. اختر Email/Password وقم بتفعيله ثم حفظ.`);
      } else if (code === 'auth/network-request-failed') {
        setError(`⚠️ خطأ في الاتصال (Network Error):
        تأكد من إضافة النطاق الحالي في القائمة المسموحة بـ فيربيز.
        
        1. اذهب إلى: Authentication -> Settings -> Authorized domains
        2. أضف هذا النطاق: ${window.location.hostname}`);
      } else if (code === 'auth/unauthorized-domain') {
        setError(`⚠️ النطاق غير مسموح به (Unauthorized Domain):
        يجب إضافة النطاق (${window.location.hostname}) في إعدادات Authentication في فيربيز.`);
      } else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('بيانات الدخول غير صحيحة. تأكد من الرقم وكلمة المرور.');
      } else if (code === 'auth/email-already-in-use') {
        setError('هذا الرقم مسجل مسبقاً، جرب تسجيل الدخول.');
      } else {
        setError(`خطأ (${code}): يرجى تفعيل "Email/Password" في Firebase وإضافة النطاق المسموح به.`);
      }
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
          <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 mt-2 uppercase tracking-widest leading-loose px-4">
            {mode === 'login' ? 'سجل دخولك لتتبع بلاغاتك وحفظ مفضلاتك' : 'انضم إلينا لمتابعة أسعار السوق في اليمن'}
          </p>
        </div>

        {/* Auth Method Toggle - Simplified */}
        <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-2xl mb-8 relative">
          <button 
            type="button"
            onClick={() => {
              setMethod('phone');
              setError('');
            }}
            className={cn(
              "flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all z-10 flex items-center justify-center gap-2",
              method === 'phone' ? "text-neutral-900 dark:text-white" : "text-neutral-400"
            )}
          >
            <Phone size={14} />
            رقم الجوال
          </button>
          <button 
            type="button"
            onClick={() => {
              setMethod('email');
              setError('');
            }}
            className={cn(
              "flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all z-10 flex items-center justify-center gap-2",
              method === 'email' ? "text-neutral-900 dark:text-white" : "text-neutral-400"
            )}
          >
            <Mail size={14} />
            البريد
          </button>
          <motion.div 
            layoutId="method-pill"
            className="absolute top-1.5 bottom-1.5 left-1.5 right-[50%] bg-white dark:bg-neutral-800 rounded-xl shadow-sm"
            initial={false}
            animate={{ 
              left: method === 'phone' ? '6px' : '50%',
              right: method === 'phone' ? '50%' : '6px'
            }}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {mode === 'register' && (
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
          ) : (
            <div className="relative group">
              <div className="absolute inset-y-0 right-5 flex items-center text-neutral-400 group-focus-within:text-primary-500 transition-colors">
                <Phone size={18} />
              </div>
              <input 
                type="tel" 
                placeholder="رقم الجوال (مثال: 7xxxxxxxx)" 
                required
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-4 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          )}

          <div className="relative group">
            <div className="absolute inset-y-0 right-5 flex items-center text-neutral-400 group-focus-within:text-primary-500 transition-colors">
              <Lock size={18} />
            </div>
            <input 
              type="password" 
              placeholder="كلمة المرور" 
              required
              minLength={6}
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-4 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-5 rounded-[24px] shadow-sm"
              >
                <p className="text-[11px] font-black text-red-500 text-center tracking-widest leading-relaxed whitespace-pre-line mb-4">
                  {error}
                </p>
                {(error.includes('خطأ في الاتصال') || error.includes('Authorized Domains')) && (
                  <div className="mt-3 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-red-100 dark:border-red-500/10">
                    <p className="text-[9px] font-bold text-neutral-500 mb-2 text-center uppercase tracking-wider">النطاق الحالي (انسخه وأضفه في Firebase):</p>
                    <div className="flex items-center gap-2 bg-neutral-50 dark:bg-black/20 p-2 rounded-xl group relative">
                      <code className="flex-1 text-[10px] font-mono text-red-600 break-all px-2 py-1 select-all">
                        {window.location.hostname}
                      </code>
                      <button 
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.hostname);
                          alert('تم نسخ النطاق');
                        }}
                        className="bg-white dark:bg-neutral-800 p-2 rounded-lg shadow-sm active:scale-90 transition-transform"
                      >
                        <Copy size={14} className="text-neutral-400" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-4 rounded-2xl"
              >
                <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 text-center tracking-widest leading-relaxed">
                  {success}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between items-center px-1">
            {mode === 'login' && method === 'email' && (
              <button 
                type="button"
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="text-[10px] font-black text-neutral-400 hover:text-primary-600 transition-colors uppercase tracking-widest"
              >
                {resetLoading ? 'جاري الإرسال...' : 'نسيت كلمة المرور؟'}
              </button>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-5 rounded-[24px] font-black text-[13px] uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-2"
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

        {/* Toggle Mode */}
        <div className="mt-8 text-center bg-neutral-50 dark:bg-neutral-800/20 p-6 rounded-[32px] border border-neutral-100 dark:border-white/5">
          <p className="text-xs font-bold text-neutral-400 mb-2">
            {mode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
          </p>
          <button 
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
              setSuccess('');
            }}
            className="w-full py-4 rounded-2xl border-2 border-primary-600/10 text-primary-600 font-black text-xs uppercase tracking-widest hover:bg-primary-50 transition-all"
          >
            {mode === 'login' ? 'إنشاء حساب جديد الآن' : 'تسجيل الدخول لحسابك'}
          </button>
        </div>

        {/* Social Login Section - Moved Down */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
            <span className="text-[10px] font-black text-neutral-300 dark:text-neutral-700 uppercase tracking-widest">خيارات أخرى</span>
            <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
          </div>

          <button 
            onClick={() => loginWithGoogle()}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 text-neutral-900 dark:text-white py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all shadow-sm"
          >
            <Chrome size={16} className="text-red-500" />
            جوجل
          </button>
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
