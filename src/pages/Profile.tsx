import React from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../lib/firebase';
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
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useNavigate, Link } from 'react-router-dom';

export function Profile() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

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

            <div className="text-center mt-8">
              <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none mb-2">
                {user.displayName || 'مستخدم يمني'}
              </h2>
              <div className="flex items-center justify-center gap-2">
                <div className={cn(
                  "px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest",
                  isAdmin ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-primary-50 text-primary-600 border-primary-100 dark:bg-primary-900/10 dark:border-primary-500/20 dark:text-primary-400"
                )}>
                  {isAdmin ? 'مدير النظام' : 'مستكشف الأسعار'}
                </div>
                <span className="text-[10px] font-bold text-neutral-400">عضو منذ ٢٠٢٤</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          <ActionCard icon={<FileText size={20} />} label="بلاغاتي" color="bg-blue-500" to="/reports" />
          <ActionCard icon={<Heart size={20} />} label="المفضلة" color="bg-red-500" to="/favorites" />
          <ActionCard icon={<Bell size={20} />} label="التنبيهات" color="bg-amber-500" to="/notifications" />
          <ActionCard icon={<Settings size={20} />} label="الإعدادات" color="bg-neutral-900" to="/settings" />
        </div>

        {/* Information Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] px-2 mb-2">معلومات الحساب</h3>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-[32px] overflow-hidden shadow-sm">
            <InfoRow icon={<Mail size={18} />} label="البريد الإلكتروني" value={user.email || 'غير متوفر'} isLast={false} />
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

        <div className="text-center">
            <p className="text-[10px] font-black text-neutral-300 dark:text-neutral-700 uppercase tracking-widest opacity-60">كم سعره اليمن • v1.0.4</p>
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
