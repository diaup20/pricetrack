import React from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { logout, loginWithGoogle } from '../lib/firebase';
import { LogOut, User as UserIcon, ShieldCheck, Mail, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function Profile() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <Layout><div className="text-center py-20">جاري التحميل...</div></Layout>;

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <header className="text-center py-6">
          <div className="inline-block relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary-500 to-sky-400 rounded-full blur-2xl opacity-10"></div>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User" className="relative w-28 h-28 rounded-[32px] border-4 border-white dark:border-neutral-800 shadow-2xl mx-auto object-cover rotate-3" />
            ) : (
              <div className="relative w-28 h-28 rounded-[32px] bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto shadow-inner">
                <UserIcon size={48} className="text-neutral-300 dark:text-neutral-700" />
              </div>
            )}
            {isAdmin && (
              <div className="absolute -bottom-2 -right-2 bg-primary-600 text-white p-2 rounded-2xl border-4 border-white dark:border-neutral-800 shadow-lg">
                <ShieldCheck size={16} />
              </div>
            )}
          </div>
          <h2 className="text-3xl font-display font-black mt-8 text-neutral-900 dark:text-white tracking-tight">{user?.displayName || 'زائر غير مسجل'}</h2>
          <div className="inline-flex items-center gap-2 mt-2 px-4 py-1.5 bg-neutral-100 dark:bg-neutral-900 rounded-full transition-colors">
            <span className={cn("w-2 h-2 rounded-full", user ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-700")}></span>
            <p className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">{isAdmin ? 'مدير النظام' : 'مستخدم منصة'}</p>
          </div>
        </header>

        <div className="flex flex-col gap-3">
          <InfoCard icon={<Mail size={18} />} label="البريد الإلكتروني" value={user?.email || 'غير متاح'} />
          <InfoCard icon={<Globe size={18} />} label="اللغة" value="العربية" />
          <InfoCard icon={<ShieldCheck size={18} />} label="نوع الحساب" value={isAdmin ? 'إدمن (صلاحيات كاملة)' : 'مشاهدة فقط'} />
        </div>

        {user ? (
          <button 
            onClick={() => logout()}
            className="mt-6 flex items-center justify-center gap-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 py-5 rounded-[24px] font-black text-sm border-2 border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all active:scale-[0.98]"
          >
            <LogOut size={20} />
            تسجيل الخروج من الحساب
          </button>
        ) : (
          <button 
            onClick={() => loginWithGoogle()}
            className="mt-6 flex items-center justify-center gap-3 bg-neutral-900 dark:bg-neutral-800 text-white dark:text-white py-5 rounded-[24px] font-black text-sm shadow-xl shadow-neutral-200 dark:shadow-none hover:translate-y-[-2px] transition-all active:scale-[0.98]"
          >
            <UserIcon size={20} />
            سجل دخولك عبر جوجل
          </button>
        )}

        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="w-12 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full"></div>
          <p className="text-[10px] font-black text-neutral-300 dark:text-neutral-700 uppercase tracking-widest">سوقي اليمن - الإصدار 1.0.2</p>
        </div>
      </div>
    </Layout>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-neutral-900 p-5 rounded-[28px] border border-neutral-100 dark:border-white/5 flex items-center gap-4 hover:shadow-md dark:hover:shadow-none transition-all group">
      <div className="text-primary-500 bg-primary-50 dark:bg-primary-500/10 p-3 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-black uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{value}</p>
      </div>
    </div>
  );
}
