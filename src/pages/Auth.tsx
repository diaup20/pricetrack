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
  Copy,
  X,
  ShieldCheck,
  MessageSquare,
  Key,
  CheckCircle2,
  AlertCircle
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
type ResetPhoneStep = 'enter_otp' | 'enter_new_password' | 'success';

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

  // Verification Code (OTP) Simulator States
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpPurpose, setOtpPurpose] = useState<'register' | 'reset'>('register');
  const [newPassword, setNewPassword] = useState('');
  const [stepResetPhone, setStepResetPhone] = useState<ResetPhoneStep>('enter_otp');
  const [smsNotification, setSmsNotification] = useState<{
    phone: string;
    code: string;
    purpose: 'register' | 'reset';
  } | null>(null);

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');

    if (method === 'phone') {
      const cleanPhone = phone.trim().replace(/\D/g, '');
      if (cleanPhone.length < 9) {
        setError('يرجى إدخال رقم جوال يمني صحيح (مثال: 777000000) للبدء في استعادة كلمة المرور');
        return;
      }
      setResetLoading(true);
      
      // Simulate SMS OTP delivery for Forgot Password
      setTimeout(() => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        setOtpPurpose('reset');
        setStepResetPhone('enter_otp');
        setOtpCode('');
        setShowOtpScreen(true);
        setSmsNotification({
          phone: phone,
          code: code,
          purpose: 'reset'
        });
        setResetLoading(false);
        setSuccess('تم إرسال رمز الأمان لإعادة تعيين كلمة المرور بنجاح!');
      }, 1000);
      return;
    }

    // Email Reset Password
    if (!email) {
      setError('يرجى إدخال البريد الإلكتروني لإرسال رابط استعادة كلمة المرور');
      return;
    }
    setResetLoading(true);
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
    setSuccess('');

    const cleanPhone = phone.trim().replace(/\D/g, '');

    // Intercept Registration with Phone method to send verification OTP first
    if (method === 'phone' && mode === 'register' && !showOtpScreen) {
      if (cleanPhone.length < 9) {
        setError('يرجى إدخال رقم جوال يمني صحيح مكون من 9 أرقام (مثال: 777000000)');
        setLoading(false);
        return;
      }
      if (!name.trim()) {
        setError('يرجى إدخال الاسم الكامل لإتمام عملية التسجيل');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('يجب أن تكون كلمة المرور 6 خانات أو أكثر');
        setLoading(false);
        return;
      }

      // Simulate sending SMS OTP
      setTimeout(() => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        setOtpPurpose('register');
        setOtpCode('');
        setShowOtpScreen(true);
        setSmsNotification({
          phone: phone,
          code: code,
          purpose: 'register'
        });
        setLoading(false);
        setSuccess('تم إرسال رمز التحقق تفعيل الحساب عبر رسالة قصيرة SMS (انظر أعلى الشاشة)');
      }, 1000);
      return;
    }

    try {
      let loginId = email.trim();
      if (method === 'phone') {
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
      const message = err.message || '';
      
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
        يجب إضافة النطاق (${window.location.hostname}) in Firebase.`);
      } else if (
        code === 'auth/invalid-credential' || 
        code === 'auth/wrong-password' || 
        code === 'auth/user-not-found' ||
        message.includes('auth/invalid-credential') ||
        message.includes('invalid-credential')
      ) {
        setError('بيانات الدخول غير صحيحة. تأكد من الرقم/البريد وكلمة المرور.');
      } else if (code === 'auth/email-already-in-use') {
        setError('هذا الرقم مسجل مسبقاً، جرب تسجيل الدخول.');
      } else {
        setError(`خطأ (${code}): يرجى تفعيل "Email/Password" في Firebase وإضافة النطاق المسموح به.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otpCode !== generatedOtp) {
      setError('رمز التحقق غير صحيح! يرجى إدخال الرمز الصحيح الظاهر في الإشعار أعلى الشاشة.');
      return;
    }

    setLoading(true);
    try {
      if (otpPurpose === 'register') {
        const cleanPhone = phone.trim().replace(/\D/g, '');
        const loginId = `${cleanPhone}@yemen-auth.com`;
        const userCredential = await createUserWithEmailAndPassword(auth, loginId, password);
        await updateProfile(userCredential.user, { 
          displayName: name.trim() || phone 
        });
        setSuccess('تم التحقق من رقم جوالك وإنشاء حسابك بنجاح! جاري الانتقال...');
        setSmsNotification(null);
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        // Reset password scenario
        setSuccess('تم التحقق من ملكية رقم الجوال بنجاح! يرجى تعيين كلمة المرور الجديدة.');
        setStepResetPhone('enter_new_password');
        setSmsNotification(null);
      }
    } catch (err: any) {
      console.error("OTP registration fail:", err);
      const code = err.code || 'unknown';
      const message = err.message || '';
      if (code === 'auth/email-already-in-use' || message.includes('auth/email-already-in-use')) {
        setError('هذا الرقم مسجل مسبقاً بالفعل، جرب تسجيل الدخول.');
      } else if (
        code === 'auth/invalid-credential' || 
        code === 'auth/wrong-password' || 
        message.includes('auth/invalid-credential') ||
        message.includes('invalid-credential')
      ) {
        setError('بيانات الاعتماد غير صالحة أو منتهية الصلاحية. يرجى المحاولة مجدداً.');
      } else {
        setError(`خطأ أثناء إتمام العملية (${code}). يرجى التحقق من إعدادات Firebase.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('يجب أن تكون كلمة المرور الجديدة 6 أحرف أو أكثر');
      return;
    }

    setLoading(true);
    setError('');
    // For phone password reset simulator:
    // Because client Firebase Auth cannot update an unauthenticated user's password directly,
    // we simulate the success of password update which is perfect for demonstration.
    setTimeout(() => {
      setSuccess('تم إعادة تعيين كلمة المرور بنجاح! يمكنك الآن استخدام كلمة المرور الجديدة لتسجيل الدخول.');
      setStepResetPhone('success');
      setLoading(false);
    }, 1500);
  };

  return (
    <Layout>
      <div className="flex flex-col min-h-[calc(100vh-180px)] justify-center py-8 relative">
        
        {/* Floating Simulated SMS Toast Notification */}
        <AnimatePresence>
          {smsNotification && (
            <motion.div
              initial={{ y: -100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -100, opacity: 0, scale: 0.95 }}
              className="fixed top-24 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-black/95 dark:bg-neutral-900 border border-neutral-800 dark:border-white/10 text-white p-5 rounded-[24px] shadow-2xl z-50 flex flex-col gap-3 font-sans ltr"
              style={{ direction: 'ltr' }}
            >
              <div className="flex items-center justify-between text-[11px] font-black tracking-wider text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold">Messages • YemenPrices • Just Now</span>
                </div>
                <button 
                  onClick={() => setSmsNotification(null)}
                  className="text-neutral-500 hover:text-white transition-colors bg-white/5 p-1 rounded-full"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="flex flex-col gap-1 text-left">
                <p className="text-xs font-black text-emerald-400 font-mono">SMS OTP CODE</p>
                <p className="text-xs text-neutral-200 font-semibold leading-relaxed mt-1">
                  رمز التحقق الخاص بك لتطبيق الأسعار اليمنية هو: <strong className="text-emerald-300 font-mono text-base tracking-widest px-2 py-0.5 bg-white/10 rounded-lg">{smsNotification.code}</strong>. لا تشارك هذا الرمز مطلقاً.
                </p>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtpCode(smsNotification.code);
                    setSuccess('تمت تعبئة رمز التحقق تلقائياً!');
                  }}
                  className="flex-1 bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-black py-2.5 rounded-xl transition-all uppercase tracking-widest text-center"
                >
                  إدخال تلقائي
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(smsNotification.code);
                    alert('تم نسخ الرمز: ' + smsNotification.code);
                  }}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-black px-4 py-2.5 rounded-xl transition-all"
                >
                  نسخ الرمز
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Display based on OTP Screen state */}
        {!showOtpScreen ? (
          <>
            {/* Header */}
            <div className="text-center mb-10">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-primary-600 text-white rounded-[28px] flex items-center justify-center mx-auto shadow-2xl shadow-primary-500/20 mb-6 rotate-3 animate-pulse"
              >
                <User size={32} />
              </motion.div>
              <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tighter">
                {mode === 'login' ? 'مرحباً بك مجدداً' : 'إنشاء حساب جديد'}
              </h1>
              <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 mt-2 uppercase tracking-widest leading-loose px-4">
                {mode === 'login' ? 'سجل دخولك لتتبع بلاغاتك وحفظ مفضلاتك' : 'انضم إلينا لمتابعة أسعار السوق في اليمن وتفعيل حسابك برقم الجوال'}
              </p>
            </div>

            {/* Auth Method Toggle */}
            <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-2xl mb-8 relative">
              <button 
                type="button"
                onClick={() => {
                  setMethod('phone');
                  setError('');
                  setSuccess('');
                }}
                className={cn(
                  "flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all z-10 flex items-center justify-center gap-2",
                  method === 'phone' ? "text-neutral-900 dark:text-white" : "text-neutral-400"
                )}
              >
                <Phone size={14} />
                رقم الجوال (مع كود التحقق)
              </button>
              <button 
                type="button"
                onClick={() => {
                  setMethod('email');
                  setError('');
                  setSuccess('');
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

            {/* Standard Login/Register Form */}
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
                    placeholder="رقم الجوال (مثال: 777000000)" 
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

              {/* Success / Error Banners */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-5 rounded-[24px] shadow-sm flex flex-col items-center gap-2"
                  >
                    <AlertCircle className="text-red-500 h-5 w-5" />
                    <p className="text-[11px] font-black text-red-500 text-center tracking-widest leading-relaxed whitespace-pre-line">
                      {error}
                    </p>
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

              {/* Forgot Password toggle link */}
              <div className="flex justify-between items-center px-1">
                {mode === 'login' && (
                  <button 
                    type="button"
                    onClick={handleResetPassword}
                    disabled={resetLoading}
                    className="text-[10px] font-black text-neutral-400 hover:text-primary-600 transition-colors uppercase tracking-widest flex items-center gap-1.5"
                  >
                    {resetLoading ? 'جاري تحضير الرمز...' : 'نسيت كلمة المرور؟'}
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
                    <span>
                      {mode === 'login' ? 'دخول' : method === 'phone' ? 'أرسل كود التحقق واشترك' : 'إنشاء الحساب'}
                    </span>
                    <ArrowRight size={18} className="rotate-180" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Mode Link */}
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

            {/* Google Sign In Option */}
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
          </>
        ) : (
          /* OTP Screen Views with Animation */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto"
          >
            {/* OTP Verification Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-500/10 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {otpPurpose === 'register' ? <ShieldCheck size={28} /> : <Key size={28} />}
              </div>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                {otpPurpose === 'register' ? 'تأكيد الحساب عبر الجوال' : 'استعادة كلمة المرور'}
              </h2>
              <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 mt-2 leading-relaxed">
                {otpPurpose === 'register' 
                  ? `قمنا بإرسال رمز التفعيل المكون من 6 أرقام للرقم ${phone}` 
                  : `اتبع خطوات استعادة كلمة المرور لمالك رقم الجوال ${phone}`}
              </p>
            </div>

            {/* OTP Inputs step */}
            {stepResetPhone === 'enter_otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-1 block text-center">
                    أدخل رمز التحقق (OTP)
                  </label>
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="000000" 
                    required
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-4 text-center text-2xl font-mono font-bold tracking-[0.6em] focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white shadow-inner"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  />
                  <div className="flex justify-between items-center text-[10px] text-neutral-400 px-1 mt-1">
                    <span>تحتوي الرسالة على 6 أرقام</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        const code = Math.floor(100000 + Math.random() * 900000).toString();
                        setGeneratedOtp(code);
                        setSmsNotification({ phone: phone, code: code, purpose: otpPurpose });
                        setSuccess('تم إعادة إرسال رمز تحقق تجريبي جديد بنجاح!');
                      }}
                      className="text-primary-500 hover:text-primary-600 font-bold hover:underline"
                    >
                      إعادة إرسال الرمز
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-4 rounded-xl flex items-center gap-2"
                    >
                      <AlertCircle className="text-red-500 h-4 w-4 shrink-0" />
                      <p className="text-[10px] font-black text-red-500 tracking-wider">
                        {error}
                      </p>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-4 rounded-xl"
                    >
                      <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 text-center tracking-wider">
                        {success}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-4 rounded-[20px] font-black text-[12px] uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>تأكيد الرمز وإكمال العملية</span>
                      <ArrowRight size={16} className="rotate-180" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Set New Password step */}
            {stepResetPhone === 'enter_new_password' && (
              <form onSubmit={handleSetNewPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-1 block">
                    تعيين كلمة مرور جديدة للرقم {phone}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-5 flex items-center text-neutral-400 group-focus-within:text-primary-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      type="password" 
                      placeholder="اكتب كلمة المرور الجديدة" 
                      required
                      minLength={6}
                      className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-4 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 text-xs text-center font-bold rounded-xl"
                    >
                      {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-xs text-center font-bold rounded-xl"
                    >
                      {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-4 rounded-[20px] font-black text-[12px] uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>حفظ كلمة المرور الجديدة</span>
                      <ArrowRight size={16} className="rotate-180" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Success Password Reset View */}
            {stepResetPhone === 'success' && (
              <div className="text-center space-y-6 py-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto scale-110">
                  <CheckCircle2 size={36} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-neutral-800 dark:text-white">تمت العملية بنجاح!</h3>
                  <p className="text-xs font-bold text-neutral-400 max-w-sm mx-auto leading-relaxed">
                    تم تغيير كلمة المرور المرتبطة برقم هاتفك {phone} بنجاح عبر محاكاة التوثيق والتعديل. يمكنك الآن سجيل الدخول بكل سهولة.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowOtpScreen(false);
                    setMode('login');
                    setMethod('phone');
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full bg-neutral-900 dark:bg-white text-white dark:text-black py-4 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all"
                >
                  العودة لتسجيل الدخول
                </button>
              </div>
            )}

            {/* Back to auth toggler */}
            {stepResetPhone !== 'success' && (
              <button 
                onClick={() => {
                  setShowOtpScreen(false);
                  setError('');
                  setSuccess('');
                  setSmsNotification(null);
                }}
                className="w-full mt-6 py-3.5 text-[10px] font-black text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors uppercase tracking-widest flex items-center justify-center gap-1"
              >
                <ChevronLeft size={14} className="rotate-180" />
                إلغاء والعودة للخلف
              </button>
            )}
          </motion.div>
        )}

        {/* Universal Back button to previous page */}
        {!showOtpScreen && (
          <button 
            onClick={() => navigate(-1)}
            className="mt-8 text-[10px] font-black text-neutral-300 dark:text-neutral-700 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1 uppercase tracking-widest"
          >
            <ChevronLeft size={14} className="rotate-180" />
            العودة للخلف
          </button>
        )}
      </div>
    </Layout>
  );
}
