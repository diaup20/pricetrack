import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { logout, auth } from '../lib/firebase';
import { updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { 
  LogOut, 
  User as UserIcon, 
  ShieldCheck, 
  Mail, 
  Globe, 
  Settings, 
  ChevronLeft,
  Bell,
  Heart,
  FileText,
  AlertCircle,
  Lock,
  Edit,
  Check,
  X,
  Eye,
  EyeOff,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useNavigate, Link } from 'react-router-dom';

export function Profile() {
  const { user, isAdmin, loading, userData, updateUserData } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Local state for settings fetched from userData
  const [notificationsEnabled, setNotificationsEnabled] = useState(userData?.notifications ?? true);

  // Update local state when userData changes
  useEffect(() => {
    if (userData) {
      setNotificationsEnabled(userData.notifications ?? true);
      setNewName(user?.displayName || '');
    }
  }, [userData, user]);

  // Handle saving generic settings
  const handlePreferenceChange = async (key: string, value: any) => {
    try {
      await updateUserData({ [key]: value });
      setSuccess('تم حفظ التفضيلات بنجاح');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('فشل في حفظ التفضيلات');
    }
  };

  // Password Update State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Profile Update State
  const [newName, setNewName] = useState(user?.displayName || '');
  const [isEditingName, setIsEditingName] = useState(false);

  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;
    setUpdateLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile(user, { displayName: newName.trim() });
      await updateUserData({ displayName: newName.trim() });
      setSuccess('تم تحديث الاسم بنجاح');
      setIsEditingName(false);
    } catch (err: any) {
      setError('فشل تحديث الاسم');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPassword) return;
    
    if (newPassword !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (newPassword.length < 6) {
      setError('يجب أن تكون كلمة المرور ٦ أحرف على الأقل');
      return;
    }

    setUpdateLoading(true);
    setError('');
    setSuccess('');

    try {
      // Re-authenticate if it's a password provider and current password is required
      if (user.email && !user.email.endsWith('@google.com')) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        try {
          await reauthenticateWithCredential(user, credential);
        } catch (reAuthErr: any) {
          if (reAuthErr.code === 'auth/wrong-password') {
            setError('كلمة المرور الحالية غير صحيحة');
            setUpdateLoading(false);
            return;
          }
          throw reAuthErr;
        }
      }

      await updatePassword(user, newPassword);
      setSuccess('تم تغيير كلمة المرور بنجاح');
      setShowPasswordForm(false);
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setError('يرجى تسجيل الخروج ثم الدخول مرة أخرى لتغيير كلمة المرور');
      } else {
        setError('حدث خطأ أثناء تغيير كلمة المرور');
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return <Layout><div className="text-center py-20">جاري التحميل...</div></Layout>;

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center gap-8 px-6">
          <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-900 rounded-[40px] flex items-center justify-center text-neutral-300 dark:text-neutral-700 shadow-inner">
            <UserIcon size={48} />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tighter">حساب المستخدم</h2>
            <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 max-w-[280px] leading-relaxed mx-auto">
              سجل دخولك الآن للتمكن من تقديم البلاغات، تتبع الأسعار، والحصول على تجربة مخصصة بالكامل.
            </p>
          </div>
          <Link 
            to="/auth"
            className="w-full max-w-[240px] bg-primary-600 text-white py-5 rounded-[24px] font-black text-[13px] uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            تسجيل الدخول / إنشاء حساب
          </Link>
          <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">تطبيق كم سعره اليمن</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-8 pb-20">
        {/* Modern Profile Header */}
        <div className="relative pt-6 pb-2">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary-600/10 to-transparent dark:from-primary-950/20 -mt-20 -z-10" />
          
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" className="relative w-28 h-28 rounded-[40px] border-4 border-white dark:border-neutral-800 shadow-2xl object-cover rotate-2 group-hover:rotate-0 transition-transform duration-500" />
              ) : (
                <div className="relative w-28 h-28 rounded-[40px] bg-white dark:bg-neutral-900 border-4 border-neutral-100 dark:border-white/5 flex items-center justify-center shadow-xl rotate-2 group-hover:rotate-0 transition-transform duration-500">
                  <UserIcon size={48} className="text-primary-500/40" />
                </div>
              )}
              {isAdmin && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl border-4 border-white dark:border-neutral-800 shadow-lg animate-bounce-slow">
                  <ShieldCheck size={18} />
                </div>
              )}
            </div>

            <div className="text-center mt-8 w-full max-w-[280px]">
              {isEditingName ? (
                <div className="flex flex-col items-center gap-3">
                  <input 
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-2xl font-black text-center bg-transparent border-b-2 border-primary-500 focus:outline-none dark:text-white"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleUpdateName}
                      disabled={updateLoading}
                      className="bg-primary-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                    >
                      <Check size={14} /> حفظ التغيير
                    </button>
                    <button 
                      onClick={() => setIsEditingName(false)}
                      className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                    >
                      <X size={14} /> إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group flex items-center justify-center gap-3">
                  <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none">
                    {user.displayName || 'مستخدم يمني'}
                  </h2>
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="p-2 text-neutral-300 hover:text-primary-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className={cn(
                  "px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest",
                  isAdmin ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-primary-50 text-primary-600 border-primary-100 dark:bg-primary-900/10 dark:border-primary-500/20 dark:text-primary-400"
                )}>
                  {isAdmin ? 'مدير النظام' : 'مستكشف الأسعار'}
                </div>
                <span className="text-[10px] font-bold text-neutral-400">عضو نشط</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-4 rounded-2xl text-[11px] font-black text-red-500 text-center uppercase tracking-widest"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-4 rounded-2xl text-[11px] font-black text-emerald-600 dark:text-emerald-400 text-center uppercase tracking-widest"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          <ActionCard icon={<FileText size={20} />} label="بلاغاتي" color="bg-blue-500" to="/reports" />
          <ActionCard icon={<Heart size={20} />} label="المفضلة" color="bg-red-500" to="/favorites" />
          <ActionCard icon={<Bell size={20} />} label="التنبيهات" color="bg-amber-500" to="/notifications" />
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={cn(
              "p-5 rounded-[28px] border flex flex-col items-center justify-center gap-4 transition-all group shadow-sm",
              isSettingsOpen ? "bg-primary-600 border-primary-600 text-white" : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-white/5 text-neutral-800 dark:text-white"
            )}
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform", isSettingsOpen ? "bg-white/20" : "bg-neutral-900 text-white")}>
              <Settings size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">الإعدادات</span>
          </button>
        </div>

        {/* Collapsible Settings Section */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-6 pt-2 pb-6">
                {/* Password Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] px-2">الأمان وكلمة المرور</h3>
                  
                  {!showPasswordForm ? (
                    <button 
                      onClick={() => setShowPasswordForm(true)}
                      className="w-full bg-neutral-100 dark:bg-neutral-900 p-5 rounded-[28px] flex items-center justify-between group px-6 border border-transparent hover:border-primary-500/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-primary-500 transition-colors shadow-sm">
                          <Lock size={18} />
                        </div>
                        <span className="text-xs font-black text-neutral-800 dark:text-white tracking-widest">تغيير كلمة المرور</span>
                      </div>
                      <ChevronLeft size={18} className="text-neutral-300 group-hover:text-primary-500 transition-all rotate-180" />
                    </button>
                  ) : (
                    <motion.form 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleUpdatePassword}
                      className="bg-white dark:bg-neutral-900 border-2 border-primary-500/30 p-6 rounded-[32px] space-y-4 shadow-xl"
                    >
                      {/* Current Password - Only if not Google/Phone auth */}
                      {user.email && !user.email.endsWith('@google.com') && (
                        <div className="relative group">
                          <input 
                            type={showCurrentPass ? "text" : "password"}
                            placeholder="كلمة المرور الحالية"
                            className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 transition-all dark:text-white"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            required
                          />
                          <button 
                            type="button"
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                          >
                            {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      )}

                      <div className="relative group">
                        <input 
                          type={showNewPass ? "text" : "password"}
                          placeholder="كلمة المرور الجديدة"
                          className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 transition-all dark:text-white"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                        >
                          {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      <input 
                        type="password"
                        placeholder="تأكيد كلمة المرور"
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 transition-all dark:text-white"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                      />

                      <div className="flex gap-2 pt-2">
                        <button 
                          type="submit"
                          disabled={updateLoading}
                          className="flex-1 bg-primary-600 text-white py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-lg shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          {updateLoading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                        </button>
                        <button 
                          type="button"
                          onClick={() => setShowPasswordForm(false)}
                          className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                        >
                          إلغاء
                        </button>
                      </div>
                    </motion.form>
                  )}
                </div>

                {/* Notifications & Prefs */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] px-2">تفضيلات التطبيق</h3>
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-[32px] overflow-hidden shadow-sm">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between p-5 border-b border-neutral-50 dark:border-white/5 group hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                          {isDark ? <Moon size={18} /> : <Sun size={18} />}
                        </div>
                        <span className="text-xs font-black text-neutral-800 dark:text-white tracking-widest">المظهر الداكن</span>
                      </div>
                      <button 
                        onClick={toggleTheme}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          isDark ? "bg-primary-600" : "bg-neutral-200 dark:bg-neutral-800"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                          isDark ? "right-1" : "right-7"
                        )} />
                      </button>
                    </div>

                    {/* Notifications Toggle */}
                    <div className="flex items-center justify-between p-5 border-b border-neutral-50 dark:border-white/5 group hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                          <Bell size={18} />
                        </div>
                        <span className="text-xs font-black text-neutral-800 dark:text-white tracking-widest">الإشعارات</span>
                      </div>
                      <button 
                        onClick={() => {
                          setNotificationsEnabled(!notificationsEnabled);
                          handlePreferenceChange('notifications', !notificationsEnabled);
                        }}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          notificationsEnabled ? "bg-emerald-500" : "bg-neutral-200 dark:bg-neutral-800"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                          notificationsEnabled ? "right-1" : "right-7"
                        )} />
                      </button>
                    </div>

                    <InfoRow icon={<Globe size={18} />} label="لغة التطبيق" value="العربية" isLast={true} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Information Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] px-2 mb-2">معلومات الحساب</h3>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-[32px] overflow-hidden shadow-sm">
            <InfoRow 
              icon={<Mail size={18} />} 
              label={user.email?.endsWith('@yemen-auth.com') ? 'رقم الجوال' : 'البريد الإلكتروني'} 
              value={user.email?.endsWith('@yemen-auth.com') ? user.email.split('@')[0] : (user.email || 'غير متوفر')} 
              isLast={false} 
            />
            <InfoRow icon={<Globe size={18} />} label="اللغة المفضلة" value="العربية" isLast={true} />
          </div>
        </div>

        {/* Support Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] px-2 mb-2">المساعدة والدعم</h3>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-[32px] overflow-hidden shadow-sm">
            <MenuRow icon={<AlertCircle size={18} />} label="مركز الدعم والمساعدة" isLast={false} />
            <MenuRow icon={<ShieldCheck size={18} />} label="سياسة الخصوصية" isLast={true} />
          </div>
        </div>

        {/* Sign Out */}
        <button 
          onClick={() => logout()}
          className="flex items-center justify-center gap-3 bg-red-50 dark:bg-red-500/5 text-red-600 dark:text-red-400 py-5 rounded-[28px] font-black text-[13px] uppercase tracking-widest border border-red-100 dark:border-red-500/10 hover:bg-red-100 transition-all active:scale-[0.98] shadow-sm mb-4"
        >
          <LogOut size={20} />
          تسجيل الخروج من الحساب
        </button>

        <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-neutral-300 dark:text-neutral-700 uppercase tracking-widest opacity-60">كم سعره اليمن • v1.0.8</p>
            <p className="text-[9px] font-black text-primary-500/40 uppercase tracking-[0.1em] px-4 leading-relaxed">
              برعاية وزارة الاقتصاد والصناعة والاستثمار <br /> قطاع التجارة الداخلية
            </p>
        </div>
      </div>
    </Layout>
  );
}

function ActionCard({ icon, label, color, to }: { icon: React.ReactNode; label: string; color: string; to: string }) {
  return (
    <Link to={to} className="bg-white dark:bg-neutral-900 p-5 rounded-[28px] border border-neutral-100 dark:border-white/5 flex flex-col items-center justify-center gap-4 hover:shadow-xl hover:translate-y-[-4px] transition-all group shadow-sm">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform", color)}>
        {icon}
      </div>
      <span className="text-xs font-black text-neutral-800 dark:text-white uppercase tracking-widest">{label}</span>
    </Link>
  );
}

function InfoRow({ icon, label, value, isLast }: { icon: React.ReactNode; label: string; value: string; isLast: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-5 group hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors",
      !isLast && "border-b border-neutral-50 dark:border-white/5"
    )}>
      <div className="flex items-center gap-4">
        <div className="text-neutral-400 group-hover:text-primary-500 transition-colors">
          {icon}
        </div>
        <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500">{label}</span>
      </div>
      <span className="text-sm font-black text-neutral-800 dark:text-white tracking-tight">{value}</span>
    </div>
  );
}

function MenuRow({ icon, label, isLast }: { icon: React.ReactNode; label: string; isLast: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-5 group hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer",
      !isLast && "border-b border-neutral-50 dark:border-white/5"
    )}>
      <div className="flex items-center gap-4">
        <div className="text-neutral-400 group-hover:text-primary-500 transition-colors">
          {icon}
        </div>
        <span className="text-xs font-black text-neutral-800 dark:text-white uppercase tracking-widest">{label}</span>
      </div>
      <ChevronLeft size={16} className="text-neutral-300 group-hover:text-neutral-500 transition-all rotate-180" />
    </div>
  );
}
