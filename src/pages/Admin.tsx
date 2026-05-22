import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Layout } from '../components/Layout';
import { loginWithGoogle, db, auth } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  serverTimestamp, 
  onSnapshot, 
  setDoc,
  writeBatch 
} from 'firebase/firestore';
import { OperationType, handleFirestoreError, compressImage } from '../lib/utils';
import { 
  LogOut,
  LayoutGrid,
  Plus, 
  Edit2, 
  Trash2, 
  LogIn, 
  Settings, 
  Package, 
  Tags, 
  Box, 
  Ruler, 
  TrendingUp, 
  TrendingDown,
  Minus,
  ShieldCheck, 
  LineChart, 
  Users as UsersIcon, 
  Search as SearchIcon,
  X,
  History,
  SlidersHorizontal,
  Download,
  Upload,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Trend, ProductVariant, Report, ReportStatus, ReportType } from '../types';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const { sections, categories, brands, units, packages, products, exchangeRates, reportTypes, governorates, districts } = useData();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'rates' | 'meta' | 'users' | 'reports'>('overview');

  const navigation = [
    { id: 'overview', label: 'نظرة عامة', icon: <LineChart size={18} /> },
    { id: 'products', label: 'المنتجات', icon: <Package size={18} /> },
    { id: 'reports', label: 'البلاغات', icon: <AlertTriangle size={18} /> },
    { id: 'rates', label: 'الصرف', icon: <TrendingUp size={18} /> },
    { id: 'meta', label: 'الإعدادات', icon: <Settings size={18} /> },
    { id: 'users', label: 'المستخدمين', icon: <UsersIcon size={18} /> },
  ];

  if (loading) return <Layout><div className="text-center py-20 italic text-neutral-400">جاري التحميل...</div></Layout>;

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <div className="bg-white p-8 rounded-full shadow-2xl flex items-center justify-center">
            <LoginIllustration />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">لوحة التحكم</h2>
            <p className="text-neutral-500 mt-1">يجب تسجيل الدخول بصلاحية مدير للوصول.</p>
          </div>
          <button 
            onClick={loginWithGoogle}
            className="bg-neutral-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-neutral-200"
          >
            <LogIn size={20} />
            سجل دخول عبر جوجل
          </button>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="text-center py-40">
          <h2 className="text-2xl font-bold text-red-500">عفواً!</h2>
          <p className="text-neutral-500 mt-2">ليس لديك صلاحية الوصول لهذه الصفحة.</p>
          <p className="text-xs text-neutral-400 mt-4">بريدك: {user.email}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-8 pb-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
          <div>
            <h2 className="text-3xl font-display font-black text-neutral-900 dark:text-white tracking-tight">إدارة النظام</h2>
            <p className="text-sm font-medium text-neutral-400 dark:text-neutral-500 mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              مرحباً {user.displayName}، أنت في وضع الإدارة
            </p>
          </div>
          <div className="flex gap-2">
             <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 px-4 py-2 rounded-2xl shadow-sm text-xs font-bold text-neutral-600 dark:text-neutral-300 flex items-center gap-2 transition-colors">
               <ShieldCheck size={14} className="text-blue-500" />
               مسؤول نظام
             </div>
          </div>
        </header>

        <div className="flex gap-2 bg-neutral-200/40 dark:bg-neutral-900/40 p-1 rounded-[24px] overflow-x-auto no-scrollbar scroll-smooth w-full md:w-fit border border-neutral-100/50 dark:border-white/5 transition-colors sticky top-20 z-40 backdrop-blur-md">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 md:px-6 py-3 rounded-[20px] text-[11px] md:text-[13px] font-bold transition-all whitespace-nowrap",
                activeTab === item.id 
                  ? "bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-white" 
                  : "text-neutral-500 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-white/30 dark:hover:bg-neutral-800/30"
              )}
            >
              <span className={cn(
                "transition-all duration-300 p-1 md:p-1.5 rounded-lg shrink-0", 
                activeTab === item.id ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500"
              )}>
                {React.cloneElement(item.icon as React.ReactElement, { size: 14 })}
              </span>
              {item.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="min-h-[400px]"
        >
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="المنتجات" value={products.length} color="bg-blue-500" icon={<Package size={20} />} trend={products.some(p => p.trend !== 'stable') ? 'up' : 'stable'} />
                <StatCard label="الأقسام" value={categories.length} color="bg-purple-500" icon={<Tags size={20} />} />
                <StatCard label="أسعار الصرف" value={exchangeRates.length} color="bg-green-500" icon={<TrendingUp size={20} />} trend="up" />
                <StatCard label="تحديثات اليوم" value={products.filter(p => p.trend !== 'stable').length} color="bg-orange-500" icon={<LineChart size={20} />} trend="up" />
                <ReportStatsCard />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RecentActivity products={products} categories={categories} />
                </div>
                
                <div className="flex flex-col gap-6">
                  <div className="bg-white dark:bg-neutral-900 p-6 rounded-[32px] border border-neutral-100 dark:border-white/5 shadow-sm flex flex-col gap-4">
                    <h3 className="font-bold flex items-center gap-2 text-neutral-900 dark:text-white text-sm">
                      <ShieldCheck size={18} className="text-blue-500" /> 
                      إجراءات النظام الحساسة
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-medium">هذه العمليات تؤثر على جميع البيانات بشكل دائم وتتطلب الحذر عند الاستخدام</p>
                    <div className="flex flex-col gap-3 pt-2">
                      <ActionButton 
                        onClick={async () => {
                          const percent = window.prompt('أدخل نسبة الزيادة المئوية لجميع المنتجات (مثلاً 5):');
                          if (percent && !isNaN(Number(percent))) {
                            const factor = 1 + (Number(percent) / 100);
                            if (window.confirm(`سيتم زيادة أسعار ${products.length} منتج بنسبة ${percent}%، هل أنت متأكد؟`)) {
                              for (const p of products) {
                                await updateDoc(doc(db, 'products', p.id), {
                                  retailPrice: Math.round(p.retailPrice * factor),
                                  previousRetailPrice: p.retailPrice,
                                  trend: 'up',
                                  lastUpdatedAt: serverTimestamp()
                                });
                              }
                              alert('تم تحديث جميع الأسعار بنجاح');
                            }
                          }
                        }}
                        label="تحديث كافة الأسعار (%)"
                        icon={<TrendingUp size={16} />}
                        variant="neutral"
                      />

                      <ActionButton 
                        onClick={async () => {
                          if (window.confirm('تحذير: سيتم حذف كافة المنتجات من النظام نهائياً! هل أنت متأكد؟')) {
                            const confirmed = window.confirm('هل أنت متأكد حقاً؟ لا يمكن التراجع عن هذه الخطوة.');
                            if (confirmed) {
                              for (const p of products) await deleteDoc(doc(db, 'products', p.id));
                              alert('تم حذف جميع المنتجات');
                            }
                          }
                        }}
                        label="حذف كافة المنتجات"
                        icon={<Trash2 size={16} />}
                        variant="danger"
                      />
                    </div>
                  </div>

                  <div className="bg-primary-600 p-6 rounded-[32px] text-white overflow-hidden relative group">
                    <div className="absolute -bottom-4 -left-4 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700 font-black text-8xl">★</div>
                    <div className="relative z-10 flex flex-col gap-4">
                      <h4 className="font-display font-black text-lg">نصيحة الإدارة</h4>
                      <p className="text-xs font-medium text-primary-100 leading-relaxed">
                        تأكد من تحديث أسعار الصرف بانتظام لضمان دقة هوامش الربح المقدرة في النظام لمختلف العملات.
                      </p>
                      <button 
                        onClick={() => setActiveTab('rates')}
                        className="bg-white/20 hover:bg-white/30 transition-all text-white py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider backdrop-blur-md border border-white/10"
                      >
                        انتقل للصرف الآن
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <ProductManager sections={sections} products={products} categories={categories} brands={brands} units={units} packages={packages} />
          )}
          {activeTab === 'rates' && (
            <ExchangeRateManager rates={exchangeRates} />
          )}
          {activeTab === 'meta' && (
            <MetaManager 
              sections={sections}
              categories={categories} 
              brands={brands} 
              units={units} 
              packages={packages} 
              reportTypes={reportTypes}
              governorates={governorates}
              districts={districts}
            />
          )}
          {activeTab === 'users' && <UserManager />}
          {activeTab === 'reports' && <ReportManager />}
        </motion.div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, color, icon, trend }: { label: string; value: number; color: string; icon: React.ReactNode; trend?: string }) {
  return (
    <div className="bg-white dark:bg-neutral-900 p-4 md:p-6 rounded-[28px] md:rounded-[32px] shadow-sm border border-neutral-100 dark:border-white/5 relative overflow-hidden group hover:shadow-xl dark:hover:shadow-none hover:shadow-neutral-200/50 hover:-translate-y-1 transition-all duration-500">
      <div className={cn("absolute -top-4 -right-4 p-8 opacity-[0.05] group-hover:opacity-10 transition-opacity rotate-12 transition-transform duration-700 font-mono text-[60px] md:text-[80px]", color.replace('bg-', 'text-'))}>
        {icon}
      </div>
      <div className="flex justify-between items-start mb-3 md:mb-4">
        <div className={cn("inline-flex p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-sm", color.replace('bg-', 'bg-opacity-10 text-').replace('500', '600'))}>
          {React.cloneElement(icon as React.ReactElement, { size: 16 })}
        </div>
        {trend && (
          <div className={cn(
            "text-[9px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg flex items-center gap-1",
            trend === 'up' ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" : "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
          )}>
            {trend === 'up' ? <TrendingUp size={8} /> : <TrendingUp size={8} className="rotate-180" />}
            {trend === 'up' ? 'نشط' : 'مستقر'}
          </div>
        )}
      </div>
      <p className="text-[10px] md:text-[11px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-1 md:gap-2 mt-0.5 md:mt-1">
        <p className="text-2xl md:text-4xl font-accent font-black text-neutral-900 dark:text-white leading-tight">{value.toLocaleString('en-US')}</p>
        <span className="text-[8px] md:text-[10px] font-bold text-neutral-300 dark:text-neutral-600 uppercase tracking-wider">إجمالي</span>
      </div>
    </div>
  );
}

function RecentActivity({ products, categories }: { products: Product[], categories: any[] }) {
  const recent = [...products]
    .sort((a, b) => {
      const dateA = a.lastUpdatedAt?.seconds || 0;
      const dateB = b.lastUpdatedAt?.seconds || 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-neutral-900 p-5 md:p-8 rounded-[28px] md:rounded-[32px] border border-neutral-100 dark:border-white/5 shadow-sm flex flex-col gap-5 md:gap-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-black text-base md:text-lg flex items-center gap-2 dark:text-white">
          <div className="p-1.5 md:p-2 bg-orange-500 text-white rounded-lg">
            <LineChart size={14} />
          </div>
          آخر نشاط فوري
        </h3>
        <span className="hidden sm:inline-block text-[10px] font-black text-neutral-400 uppercase tracking-widest bg-neutral-50 dark:bg-neutral-800 px-3 py-1.5 rounded-full">المخزون</span>
      </div>

      <div className="flex flex-col">
        {recent.map((p, idx) => {
          const cat = categories.find(c => c.id === p.categoryId);
          return (
            <div key={p.id} className={cn(
              "flex items-center justify-between py-3.5 md:py-4 group transition-all",
              idx !== recent.length - 1 && "border-bottom border-dashed border-neutral-100 dark:border-white/5 border-b"
            )}>
              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                <div className="text-base md:text-lg w-9 h-9 md:w-11 md:h-11 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 rounded-xl group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10 transition-colors shrink-0">
                  {cat?.icon || '📦'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] md:text-sm font-bold text-neutral-800 dark:text-neutral-100 truncate">{p.name}</span>
                  <span className="text-[9px] md:text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
                    {cat?.name || 'بدون قسم'} • {p.lastUpdatedAt ? new Date(p.lastUpdatedAt.seconds * 1000).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }) : 'مُحدث'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <div className="flex flex-col items-end">
                   <span className="text-[13px] md:text-sm font-black text-neutral-900 dark:text-white leading-none mb-1">{p.retailPrice.toLocaleString()}</span>
                   <div className="flex items-center gap-1">
                      {p.trend === 'up' && <TrendingUp size={8} className="text-red-500" />}
                      {p.trend === 'down' && <TrendingUp size={8} className="text-green-500 rotate-180" />}
                      <span className={cn(
                        "text-[8px] md:text-[9px] font-bold uppercase",
                        p.trend === 'up' ? "text-red-500" : (p.trend === 'down' ? "text-green-500" : "text-neutral-300")
                      )}>
                        {p.trend === 'up' ? 'سعر مرتفع' : (p.trend === 'down' ? 'سعر منخفض' : 'سعر مستقر')}
                      </span>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
        {recent.length === 0 && (
          <div className="py-12 text-center text-[11px] font-medium text-neutral-400 italic">لا يوجد نشاط مسجل حتى الآن</div>
        )}
      </div>
    </div>
  );
}

function ActionButton({ onClick, label, icon, variant }: { onClick: () => void; label: string; icon: React.ReactNode; variant: 'neutral' | 'danger' }) {
  const styles = {
    neutral: "bg-neutral-50 text-neutral-900 hover:bg-neutral-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full text-right p-4 rounded-2xl text-sm font-bold flex items-center justify-between transition-all active:scale-[0.98] group",
        styles[variant]
      )}
    >
      <span>{label}</span>
      <div className={cn("p-2 rounded-xl bg-white shadow-sm border border-neutral-100 transition-transform group-hover:scale-110", variant === 'danger' ? "text-red-500" : "text-blue-500")}>
        {icon}
      </div>
    </button>
  );
}

function UserManager() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubAdmins = onSnapshot(collection(db, 'admins'), (s) => {
      setAdmins(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubUsers = onSnapshot(collection(db, 'users'), (s) => {
      setUsers(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubAdmins(); unsubUsers(); };
  }, []);

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAdmin = async (userId: string, email: string, currentIsAdmin: boolean) => {
    if (email === 'abdsharki20@gmail.com') return alert('لا يمكن تعديل صلاحيات المدير الرئيسي!');
    if (currentIsAdmin) {
      if (window.confirm('هل تريد إزالة صلاحيات المسؤول؟')) {
        await deleteDoc(doc(db, 'admins', userId));
      }
    } else {
      if (window.confirm('هل تريد منح هذا المستخدم صلاحيات المسؤول؟')) {
        await setDoc(doc(db, 'admins', userId), { email, role: 'admin', addedAt: serverTimestamp() });
      }
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 p-4 md:p-5 rounded-[24px] md:rounded-[32px] border border-neutral-100 dark:border-white/5 flex flex-col gap-5 md:gap-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h3 className="text-lg md:text-xl font-display font-black flex items-center gap-2 md:gap-3 dark:text-white w-full md:w-auto">
          <div className="p-1.5 md:p-2 bg-blue-500 text-white rounded-lg">
            <UsersIcon size={16} />
          </div>
          إدارة المستخدمين
          <span className="bg-neutral-50 dark:bg-neutral-800 text-neutral-400 text-[9px] md:text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider">{users.length}</span>
        </h3>
        <div className="relative w-full md:w-64">
           <input 
             type="text" 
             placeholder="ابحث عن مستخدم..." 
             className="w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-xl md:rounded-2xl px-4 py-3 text-[11px] font-bold pr-11 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all dark:text-white shadow-sm"
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
           />
           <SearchIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((u) => {
          const isUserAdmin = admins.some(a => a.id === u.id);
          return (
            <div key={u.id} className="bg-white dark:bg-neutral-900 p-5 rounded-[28px] border border-neutral-100 dark:border-white/5 flex flex-col gap-4 shadow-sm hover:shadow-lg dark:hover:shadow-none hover:border-neutral-200 dark:hover:border-primary-500/30 transition-all group">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={u.photoURL} alt="" className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 shadow-sm" />
                  {isUserAdmin && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-lg shadow-sm border-2 border-white dark:border-neutral-900">
                      <ShieldCheck size={10} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold truncate text-neutral-800 dark:text-neutral-100">
                    {u.displayName}
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">{u.email}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-dashed border-neutral-100 dark:border-white/5 transition-colors">
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500">الحالة: {isUserAdmin ? 'مسؤول' : 'مستخدم'}</span>
                <button 
                  onClick={() => toggleAdmin(u.id, u.email, isUserAdmin)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-bold transition-all",
                    isUserAdmin ? "bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20" : "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-500/20"
                  )}
                  disabled={u.email === 'abdsharki20@gmail.com'}
                >
                  {isUserAdmin ? 'إبطال الصلاحية' : 'ترقية لمسؤول'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helpers for more robust data matching and processing
const normalizeArabic = (text: any) => {
  if (text === null || text === undefined) return "";
  const str = String(text).trim();
  if (!str) return "";
  return str
    // Replace Alif variants
    .replace(/[أإآ]/g, "ا")
    // Replace Ta Marbuta with Ha
    .replace(/ة/g, "ه")
    // Replace Alef Maqsura with Ya
    .replace(/ى/g, "ي")
    // Remove Arabic diacritics (Harakat)
    .replace(/[\u064B-\u065F]/g, "")
    // Remove zero-width characters and unusual whitespace
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
};

const convertArabicNumerals = (text: string) => {
  if (!text) return "";
  const arabic = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  const farsi = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  let res = String(text);
  for (let i = 0; i < 10; i++) {
    res = res.replace(arabic[i], i.toString()).replace(farsi[i], i.toString());
  }
  return res;
};

function ProductManager({ sections, products, categories, brands, units, packages }: any) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importTotal, setImportTotal] = useState(0);

  const filtered = products.filter((p: Product) => {
    const matchesSearch = !searchQuery || normalizeArabic(p.name).includes(normalizeArabic(searchQuery));
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string, name: string) => {
    try {
      if (window.confirm(`🚨 تنبيه هام: هل أنت متأكد من حذف المنتج "${name}" نهائياً من النظام؟ لا يمكن استعادة البيانات بعد هذه الخطوة.`)) {
        await deleteDoc(doc(db, 'products', id));
        alert('تم حذف المنتج بنجاح');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const handleExport = () => {
    if (!products || products.length === 0) {
      alert('لا توجد منتجات لتصديرها');
      return;
    }

    try {
      const EXCEL_LIMIT = 32760;
      const t = (val: any) => {
        if (typeof val !== 'string') return val;
        return val.length > EXCEL_LIMIT ? val.slice(0, EXCEL_LIMIT) : val;
      };

      const exportData = products.map((p: any) => ({
        'اسم المنتج': t(p.name || ''),
        'الوصف': t(p.description || ''),
        'القسم': t(categories.find((c: any) => c.id === p.categoryId)?.name || ''),
        'العلامة التجارية': t(brands.find((b: any) => b.id === p.brandId)?.name || ''),
        'وحدة القياس': t(units.find((u: any) => u.id === p.unitId)?.name || ''),
        'نوع العبوة': t(packages.find((pk: any) => pk.id === p.packageId)?.name || ''),
        'سعر الوكيل': p.agentPrice || 0,
        'سعر الجملة': p.wholesalePrice || 0,
        'سعر المستهلك': p.retailPrice || 0,
        'السعر السابق': p.previousRetailPrice || 0,
        'رابط الصورة': t(p.imageUrl || ''),
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "المنتجات");
      
      const colWidths = [
        { wch: 30 }, // Product Name
        { wch: 35 }, // Description
        { wch: 15 }, // Category
        { wch: 15 }, // Brand
        { wch: 15 }, // Unit
        { wch: 15 }, // Package
        { wch: 12 }, // Agent
        { wch: 12 }, // Wholesale
        { wch: 12 }, // Retail
        { wch: 12 }, // Previous Price
        { wch: 25 }, // Image
      ];
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `منتجات_سوق_اليمن_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Export Error:', error);
      alert('حدث خطأ أثناء التصدير: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const downloadTemplate = () => {
    const templateData = [{
      'اسم المنتج': 'مثال: علبة قشطة السعيد',
      'الوصف': 'وصف اختياري هنا يوضح مواصفات المنتج',
      'القسم': 'اسم القسم (يجب أن يكون موجوداً مسبقاً في النظام)',
      'العلامة التجارية': 'اسم العلامة التجارية',
      'وحدة القياس': '250 جرام',
      'نوع العبوة': 'علبة ورق',
      'سعر الوكيل': 500,
      'سعر الجملة': 550,
      'سعر المستهلك': 600,
      'السعر السابق': 650,
      'رابط الصورة': 'رابط مباشر للصورة (اختياري)'
    }];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "نموذج الاستيراد");
    ws['!cols'] = [
      { wch: 25 }, { wch: 35 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, 
      { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 25 }
    ];
    XLSX.writeFile(wb, 'نموذج_استيراد_منتجات_سوق_اليمن.xlsx');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportProgress(0);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (!workbook.SheetNames.length) {
          throw new Error('الملف لا يحتوي على بيانات');
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as any[];

        if (!jsonData.length) {
          throw new Error('الملف فارغ');
        }

        const confirmed = window.confirm(`تم العثور على ${jsonData.length} منتج. هل تريد المتابعة في عملية الاستيراد؟`);
        if (!confirmed) {
          setImporting(false);
          return;
        }

        setImportTotal(jsonData.length);
        let importedCount = 0;
        let updatedCount = 0;
        let errorsCount = 0;

        // Configuration for field mapping
        const fieldMaps = {
          name: ['الاسم', 'اسم المنتج', 'name', 'title'],
          description: ['الوصف', 'description', 'desc'],
          category: ['القسم', 'التصنيف', 'category', 'section'],
          brand: ['العلامة التجارية', 'العلامة', 'brand', 'ماركة'],
          unit: ['وحدة القياس', 'الحجم', 'الوزن', 'unit', 'size'],
          package: ['العبوة', 'نوع العبوة', 'package', 'pack'],
          agentPrice: ['سعر الوكيل', 'وكيل', 'agentPrice'],
          wholesalePrice: ['سعر الجملة', 'جملة', 'wholesalePrice'],
          retailPrice: ['سعر المستهلك', 'السعر', 'تجزئة', 'retailPrice'],
          previousRetailPrice: ['السعر السابق', 'تجزئة سابق', 'previousRetailPrice']
        };

        const findValueByKeys = (row: any, keys: string[]) => {
          const rowKeys = Object.keys(row);
          for (const searchKey of keys) {
            const searchNorm = normalizeArabic(searchKey);
            const foundKey = rowKeys.find(rk => normalizeArabic(rk) === searchNorm || normalizeArabic(rk).includes(searchNorm));
            if (foundKey) return row[foundKey];
          }
          return "";
        };

        const cleanPrice = (val: any) => {
          if (val === undefined || val === null || val === "") return 0;
          const str = convertArabicNumerals(String(val)).replace(/[^\d.]/g, '');
          const num = parseFloat(str);
          return isNaN(num) ? 0 : num;
        };

        // We'll process in chunks for better performance and Firestore limits
        const CHUNK_SIZE = 400; // Firestore batch limit is 500
        for (let i = 0; i < jsonData.length; i += CHUNK_SIZE) {
          const chunk = jsonData.slice(i, i + CHUNK_SIZE);
          const batch = writeBatch(db);
          let opsInBatch = 0;

          for (const row of chunk) {
            try {
              const name = String(findValueByKeys(row, fieldMaps.name)).trim();
              if (!name || name.toLowerCase().includes('مثال')) continue;

              const description = String(findValueByKeys(row, fieldMaps.description)).trim();
              const catSearch = String(findValueByKeys(row, fieldMaps.category)).trim();
              const brandSearch = String(findValueByKeys(row, fieldMaps.brand)).trim();
              const unitSearch = String(findValueByKeys(row, fieldMaps.unit)).trim();
              const packSearch = String(findValueByKeys(row, fieldMaps.package)).trim();

              const agentPrice = cleanPrice(findValueByKeys(row, fieldMaps.agentPrice));
              const wholesalePrice = cleanPrice(findValueByKeys(row, fieldMaps.wholesalePrice));
              const retailPrice = cleanPrice(findValueByKeys(row, fieldMaps.retailPrice));
              const importedPreviousPrice = cleanPrice(findValueByKeys(row, fieldMaps.previousRetailPrice));
              const imageUrl = String(findValueByKeys(row, ['رابط الصورة', 'رابط', 'imageUrl', 'image'])).trim();

              // Resolve IDs
              const catId = categories.find((c: any) => normalizeArabic(c.name) === normalizeArabic(catSearch))?.id || '';
              const brandId = brands.find((b: any) => normalizeArabic(b.name) === normalizeArabic(brandSearch))?.id || '';
              const unitId = units.find((u: any) => normalizeArabic(u.name) === normalizeArabic(unitSearch))?.id || '';
              const packId = packages.find((pk: any) => normalizeArabic(pk.name) === normalizeArabic(packSearch))?.id || '';

              const existingProduct = products.find((p: any) => normalizeArabic(p.name) === normalizeArabic(name));

              const productData: any = {
                name: name.slice(0, 500),
                description: description.slice(0, 5000),
                categoryId: catId,
                brandId: brandId,
                unitId: unitId,
                packageId: packId,
                agentPrice,
                wholesalePrice,
                retailPrice,
                imageUrl: imageUrl.length < 30000 ? imageUrl : '',
                lastUpdatedAt: serverTimestamp()
              };

              if (existingProduct) {
                const docRef = doc(db, 'products', existingProduct.id);
                const finalPreviousPrice = importedPreviousPrice || existingProduct.retailPrice;
                batch.update(docRef, {
                  ...productData,
                  previousRetailPrice: finalPreviousPrice,
                  trend: retailPrice > finalPreviousPrice ? 'up' : (retailPrice < finalPreviousPrice ? 'down' : 'stable')
                });
                updatedCount++;
              } else {
                const docRef = doc(collection(db, 'products'));
                const finalPreviousPrice = importedPreviousPrice || retailPrice;
                batch.set(docRef, {
                  ...productData,
                  id: docRef.id,
                  previousRetailPrice: finalPreviousPrice,
                  trend: retailPrice > finalPreviousPrice ? 'up' : (retailPrice < finalPreviousPrice ? 'down' : 'stable'),
                  createdAt: serverTimestamp(),
                  variants: []
                });
                importedCount++;
              }
              opsInBatch++;
            } catch (err) {
              console.error('Row error:', err);
              errorsCount++;
            }
          }

          if (opsInBatch > 0) {
            await batch.commit();
          }
          setImportProgress(Math.min(i + CHUNK_SIZE, jsonData.length));
        }

        alert(`تم الانتهاء!
تم إضافة: ${importedCount}
تم تحديث: ${updatedCount}
الأخطاء: ${errorsCount}`);

      } catch (error) {
        console.error('Import Error:', error);
        alert('حدث خطأ أثناء الاستيراد: ' + (error instanceof Error ? error.message : String(error)));
      } finally {
        setImporting(false);
        setImportProgress(0);
        setImportTotal(0);
        if (e.target) e.target.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-neutral-900 p-4 md:p-6 rounded-[28px] md:rounded-[32px] border border-neutral-100 dark:border-white/5 shadow-sm">
          <div className="flex flex-col">
            <h3 className="font-display font-black text-lg md:text-xl flex items-center gap-2 md:gap-3 dark:text-white">
              <div className="bg-blue-500 text-white p-1.5 md:p-2 rounded-xl">
                <Package size={18} />
              </div>
              إدارة المخزون ({filtered.length})
            </h3>
            <p className="text-[10px] md:text-xs text-neutral-400 dark:text-neutral-500 mt-1">تعديل، إضافة، استيراد وتصدير المنتجات من وإلى Excel</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <button 
              onClick={downloadTemplate}
              className="bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-3 md:px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-bold flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all border border-neutral-100 dark:border-white/5 shadow-sm"
            >
              <FileText size={14} className="text-orange-500" />
              <span className="hidden sm:inline">تحميل النموذج</span>
              <span className="inline sm:hidden">النموذج</span>
            </button>
            <label className={cn(
              "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-3 md:px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-bold flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all border border-neutral-100 dark:border-white/5 shadow-sm cursor-pointer relative overflow-hidden group",
              importing && "opacity-80 pointer-events-none"
            )}>
              <Upload size={14} className={cn("text-blue-500", importing && "animate-bounce")} />
              <span className="relative z-10">
                {importing ? `جاري (${Math.round((importProgress/importTotal)*100)}%)` : 'استيراد'}
              </span>
              {importing && (
                <div className="absolute inset-0 bg-blue-500/10 origin-right transition-transform" style={{ transform: `scaleX(${importProgress/importTotal})` }} />
              )}
              <input type="file" accept=".xlsx, .xls" onChange={handleImport} className="hidden" disabled={importing} />
            </label>
            <button 
              onClick={handleExport}
              className="bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-3 md:px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-bold flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all border border-neutral-100 dark:border-white/5 shadow-sm"
            >
              <Download size={14} className="text-green-500" />
              <span>تصدير</span>
            </button>
            <button 
              onClick={() => { setEditingProduct(null); setShowForm(true); }}
              className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 md:px-6 py-3 md:py-3.5 rounded-xl md:rounded-2xl shadow-xl shadow-neutral-200 dark:shadow-none flex items-center gap-2 text-[10px] md:text-xs font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={16} />
              إضافة
            </button>
          </div>
        </div>

      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="ابحث باسم المنتج..." 
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-2xl px-6 py-4 text-sm pr-12 shadow-sm focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "px-6 py-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
              selectedCategory === 'all' 
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-md" 
                : "bg-white dark:bg-neutral-900 text-neutral-500 border-neutral-100 dark:border-white/5 hover:border-neutral-200"
            )}
          >
            الكل
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-6 py-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2",
                selectedCategory === cat.id 
                  ? "bg-primary-500 text-white border-primary-500 shadow-md" 
                  : "bg-white dark:bg-neutral-900 text-neutral-500 border-neutral-100 dark:border-white/5 hover:border-neutral-200"
              )}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <ProductForm 
          onClose={() => setShowForm(false)} 
          initialData={editingProduct}
          sections={sections}
          categories={categories}
          brands={brands}
          units={units}
          packages={packages}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p: Product) => {
          const cat = categories.find((c:any) => c.id === p.categoryId);
          const brand = brands.find((b:any) => b.id === p.brandId);
          const section = sections.find((s:any) => s.id === (p.sectionId || cat?.sectionId));
          return (
            <div key={p.id} className="bg-white dark:bg-neutral-900 p-5 rounded-[32px] border border-neutral-100 dark:border-white/5 flex flex-col gap-4 shadow-sm group hover:border-primary-500/30 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-2xl">{cat?.icon || '📦'}</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-neutral-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">{p.name}</span>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {section && (
                        <span className="text-[8px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded-md truncate max-w-[70px]">
                          {section.name}
                        </span>
                      )}
                      <span className="text-[8px] font-black uppercase text-neutral-400 bg-neutral-50 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md truncate max-w-[70px]">
                        {cat?.name || 'بدون قسم'}
                      </span>
                      {brand && (
                        <span className="text-[8px] font-black uppercase text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded-md truncate max-w-[70px]">
                          {brand.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingProduct(p); setShowForm(true); }} className="p-2.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 rounded-xl hover:bg-neutral-900 dark:hover:bg-white hover:text-white dark:hover:text-neutral-900 transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p.id, p.name);
                    }} 
                    className="p-2.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                    title="حذف المنتج"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="bg-neutral-50/50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-white/5 grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-0.5 items-center justify-center">
                  <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest leading-none">وكيل</span>
                  <span className="text-xs font-black text-blue-600 leading-normal">{p.agentPrice.toLocaleString()}</span>
                </div>
                <div className="flex flex-col gap-0.5 items-center justify-center border-x border-dashed border-neutral-200 dark:border-white/10">
                  <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest leading-none">جملة</span>
                  <span className="text-xs font-black text-indigo-600 leading-normal">{p.wholesalePrice.toLocaleString()}</span>
                </div>
                <div className="flex flex-col gap-0.5 items-center justify-center">
                  <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest leading-none">سعر المستهلك</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm font-black text-neutral-900 dark:text-white leading-normal">{p.retailPrice.toLocaleString()}</span>
                    <div className={cn(
                      "flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg border",
                      p.trend === 'up' ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:border-red-500/20" :
                      p.trend === 'down' ? "bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:border-green-500/20" :
                      "bg-neutral-50 text-neutral-400 border-neutral-100 dark:bg-neutral-800 dark:border-white/5"
                    )}>
                      {p.trend === 'up' && <TrendingUp size={10} />}
                      {p.trend === 'down' && <TrendingDown size={10} />}
                      {p.trend === 'stable' && <Minus size={10} />}
                      <span className="text-[7px] font-black uppercase">
                        {p.trend === 'up' ? 'مرتفع' : p.trend === 'down' ? 'منخفض' : 'مستقر'}
                      </span>
                    </div>
                  </div>
                  {p.previousRetailPrice !== p.retailPrice && (
                    <div className="flex items-center gap-1 mt-0.5 opacity-50">
                      <span className="text-[7px] font-bold">سابق:</span>
                      <span className="text-[9px] font-black text-neutral-400 line-through">
                        {p.previousRetailPrice.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center text-neutral-400 italic text-sm">لم يتم العثور على منتجات تطابق بحثك</div>
        )}
      </div>
    </div>
  );
}

function ProductForm({ onClose, initialData, sections, categories, brands, units, packages }: any) {
  const [formTab, setFormTab] = useState<'basic' | 'prices' | 'variants'>('basic');
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    sectionId: initialData?.sectionId || (initialData?.categoryId ? categories.find((c: any) => c.id === initialData.categoryId)?.sectionId : '') || '',
    categoryId: initialData?.categoryId || '',
    brandId: initialData?.brandId || '',
    unitId: initialData?.unitId || '',
    packageId: initialData?.packageId || '',
    agentPrice: initialData?.agentPrice || 0,
    wholesalePrice: initialData?.wholesalePrice || 0,
    retailPrice: initialData?.retailPrice || 0,
    previousRetailPrice: initialData?.previousRetailPrice || initialData?.retailPrice || 0,
    imageUrl: initialData?.imageUrl || '',
    description: initialData?.description || '',
    trend: initialData?.trend || 'stable' as Trend,
    variants: (initialData?.variants || [] as ProductVariant[]).map((v: any) => ({
      packageId: v.packageId || '',
      agentPrice: v.agentPrice || 0,
      wholesalePrice: v.wholesalePrice || 0,
      retailPrice: v.retailPrice || 0,
      previousRetailPrice: v.previousRetailPrice || v.retailPrice || 0,
      trend: v.trend || 'stable'
    })),
  });

  const filteredCategoriesForSection = React.useMemo(() => {
    if (!formData.sectionId) return [];
    return categories.filter((c: any) => c.sectionId === formData.sectionId);
  }, [categories, formData.sectionId]);

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { packageId: '', agentPrice: 0, wholesalePrice: 0, retailPrice: 0, previousRetailPrice: 0, trend: 'stable' }]
    });
  };

  const removeVariant = (index: number) => {
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 400, 32000); // 32KB limit
      setFormData({ ...formData, imageUrl: compressed });
    } catch (error) {
      console.error('Image upload error:', error);
      alert('حدث خطأ أثناء معالجة الصورة، يرجى المحاولة بصورة أصغر.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if any field exceeds limit
    const oversizeFields: string[] = [];
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > 32767) {
        oversizeFields.push(key);
      }
    });

    if (oversizeFields.length > 0) {
      alert(`عفواً! الحقول التالية تجاوزت الحد المسموح به: ${oversizeFields.join(', ')}. يرجى تقليل حجم البيانات أو اختيار صورة أصغر.`);
      return;
    }

    const retailPrice = Number(formData.retailPrice);
    const previousRetailPrice = Number(formData.previousRetailPrice);
    
    let trend: Trend = 'stable';
    if (retailPrice > previousRetailPrice) trend = 'up';
    else if (retailPrice < previousRetailPrice) trend = 'down';
    else trend = 'stable';

    const data = {
      ...formData,
      agentPrice: Number(formData.agentPrice),
      wholesalePrice: Number(formData.wholesalePrice),
      retailPrice,
      previousRetailPrice,
      trend,
      lastUpdatedAt: serverTimestamp(),
      createdAt: initialData?.createdAt || serverTimestamp(),
      variants: formData.variants.map((v: any) => {
        const variantRetailPrice = Number(v.retailPrice);
        const variantPreviousRetailPrice = Number(v.previousRetailPrice || v.retailPrice);
        
        let variantTrend: Trend = 'stable';
        if (variantRetailPrice > variantPreviousRetailPrice) variantTrend = 'up';
        else if (variantRetailPrice < variantPreviousRetailPrice) variantTrend = 'down';

        return {
          ...v,
          agentPrice: Number(v.agentPrice),
          wholesalePrice: Number(v.wholesalePrice),
          retailPrice: variantRetailPrice,
          previousRetailPrice: variantPreviousRetailPrice,
          trend: variantTrend,
        };
      }),
    };

    if (initialData) {
      await updateDoc(doc(db, 'products', initialData.id), data);
    } else {
      await addDoc(collection(db, 'products'), data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-900/40 backdrop-blur-sm p-4 overflow-y-auto pointer-events-auto">
      <div className="min-h-full flex items-center justify-center py-10">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[32px] p-6 md:p-8 shadow-2xl flex flex-col gap-6 w-full max-w-2xl relative">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xl">{initialData ? 'تعديل منتج' : 'إضافة منتج جديد'}</h4>
            <button onClick={onClose} className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-full text-neutral-400 dark:text-neutral-500"><X size={24} /></button>
          </div>

          <div className="flex gap-1 bg-neutral-50 dark:bg-neutral-800 p-1 rounded-2xl">
            {(['basic', 'prices', 'variants'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormTab(t)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                  formTab === t 
                    ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm" 
                    : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                )}
              >
                {t === 'basic' ? 'المعلومات الأساسية' : t === 'prices' ? 'الأسعار' : 'الأحجام الإضافية'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {formTab === 'basic' && (
                <motion.div 
                  key="basic"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-5"
                >
                  <Input label="اسم المنتج" value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} required placeholder="مثال: دقيق السعيد" />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select label="القسم الرئيسي" value={formData.sectionId} options={sections} onChange={(e:any) => setFormData({...formData, sectionId: e.target.value, categoryId: ''})} required />
                    <Select 
                      label="الصنف الفرعي" 
                      value={formData.categoryId} 
                      options={filteredCategoriesForSection} 
                      onChange={(e:any) => setFormData({...formData, categoryId: e.target.value})} 
                      required 
                      disabled={!formData.sectionId}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select label="العلامة التجارية" value={formData.brandId} options={brands} onChange={(e:any) => setFormData({...formData, brandId: e.target.value})} required />
                    <Select label="الوحدة الأساسية" value={formData.unitId} options={units} onChange={(e:any) => setFormData({...formData, unitId: e.target.value})} required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select label="العبوة الأساسية" value={formData.packageId} options={packages} onChange={(e:any) => setFormData({...formData, packageId: e.target.value})} required />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">صورة المنتج</label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {formData.imageUrl ? (
                          <img src={formData.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <ImageIcon size={24} className="text-neutral-300" />
                        )}
                      </div>
                      <label className="flex-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 rounded-2xl px-4 py-4 text-xs font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer text-center">
                        رفع صورة من الجهاز
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      {formData.imageUrl && (
                        <button 
                          type="button" 
                          onClick={() => {
                            if (window.confirm('هل تريد إزالة الصورة؟')) {
                              setFormData({...formData, imageUrl: ''});
                            }
                          }} 
                          className="p-4 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {formTab === 'prices' && (
                <motion.div 
                  key="prices"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-6"
                >
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-[32px] flex flex-col gap-6 border border-neutral-100 dark:border-white/5">
                    <div className="flex items-center justify-between px-2">
                      <h5 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">أسعار البيع الأساسية</h5>
                      <TrendingUp size={14} className="text-primary-500" />
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 p-2 rounded-2xl border border-neutral-50 dark:border-white/5">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                          <ShieldCheck size={20} />
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1 leading-none">سعر الوكيل</label>
                          <input type="number" value={formData.agentPrice} onChange={(e:any) => setFormData({...formData, agentPrice: e.target.value})} required className="w-full bg-transparent font-black text-blue-600 dark:text-blue-400 focus:outline-none text-lg" />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 p-2 rounded-2xl border border-neutral-50 dark:border-white/5">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
                          <Package size={20} />
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1 leading-none">سعر الجملة</label>
                          <input type="number" value={formData.wholesalePrice} onChange={(e:any) => setFormData({...formData, wholesalePrice: e.target.value})} required className="w-full bg-transparent font-black text-indigo-600 dark:text-indigo-400 focus:outline-none text-lg" />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 p-2 rounded-2xl border border-neutral-50 dark:border-white/5">
                        <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-500 shrink-0">
                          <TrendingUp size={20} />
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1 leading-none">سعر المستهلك الحالي</label>
                          <input type="number" value={formData.retailPrice} onChange={(e:any) => setFormData({...formData, retailPrice: e.target.value})} required className="w-full bg-transparent font-black text-neutral-900 dark:text-white focus:outline-none text-lg" />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-neutral-50 dark:bg-neutral-800/30 p-2 rounded-2xl border border-dashed border-neutral-200 dark:border-white/5">
                        <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-400 shrink-0">
                          <Minus size={20} />
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1 leading-none">السعر السابق (للمؤشر)</label>
                          <input type="number" value={formData.previousRetailPrice} onChange={(e:any) => setFormData({...formData, previousRetailPrice: e.target.value})} className="w-full bg-transparent font-black text-neutral-500 focus:outline-none text-lg" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none px-2">اتجاه السعر (يتم ضبطه تلقائياً حسب الفارق)</label>
                    <div className="flex gap-2">
                      {[
                        {id: 'up', name: 'مرتفع', icon: <TrendingUp size={14} />, color: 'text-red-500 bg-red-50 dark:bg-red-500/10 border-red-100'},
                        {id: 'down', name: 'منخفض', icon: <TrendingDown size={14} />, color: 'text-green-500 bg-green-50 dark:bg-green-500/10 border-green-100'},
                        {id: 'stable', name: 'مستقر', icon: <Minus size={14} />, color: 'text-neutral-500 bg-neutral-50 dark:bg-neutral-800 border-neutral-100'}
                      ].map((t) => (
                        <div 
                          key={t.id}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border text-[11px] font-black transition-all",
                            formData.trend === t.id ? t.color : "bg-white dark:bg-neutral-900 text-neutral-300 border-neutral-50 shadow-sm opacity-50"
                          )}
                        >
                          {t.icon}
                          {t.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {formTab === 'variants' && (
                <motion.div 
                  key="variants"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-4 rounded-2xl">
                    <div className="flex flex-col">
                      <h5 className="text-[10px] font-black text-neutral-900 dark:text-white uppercase tracking-widest">أحجام وعبوات إضافية</h5>
                      <p className="text-[9px] text-neutral-400">مثلاً: سعر الكرتون مقابل سعر الحبة</p>
                    </div>
                    <button type="button" onClick={addVariant} className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black transition-all active:scale-95 shadow-lg shadow-neutral-200 dark:shadow-none">
                      <Plus size={14} /> إضافة
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                    {formData.variants.map((v: any, index: number) => (
                      <div key={index} className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 p-5 rounded-[24px] shadow-sm flex flex-col gap-4 relative group">
                        <button 
                          type="button" 
                          onClick={() => {
                            if (window.confirm('هل تريد حذف هذا الحجم؟')) {
                              removeVariant(index);
                            }
                          }} 
                          className="absolute -top-2 -left-2 p-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                        <Select 
                          label="العبوة" 
                          value={v.packageId} 
                          options={packages} 
                          onChange={(e:any) => updateVariant(index, 'packageId', e.target.value)} 
                          required 
                        />
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="flex flex-col gap-1 flex-1">
                             <label className="text-[9px] font-black text-neutral-400 px-3 uppercase tracking-widest">مستهلك جديد</label>
                             <input type="number" value={v.retailPrice} onChange={(e:any) => updateVariant(index, 'retailPrice', e.target.value)} required className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-white/5 rounded-xl px-3 py-3 text-[11px] font-black text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-center" />
                          </div>
                          <div className="flex flex-col gap-1 flex-1">
                             <label className="text-[9px] font-black text-neutral-400 px-3 uppercase tracking-widest">مستهلك سابق</label>
                             <input type="number" value={v.previousRetailPrice} onChange={(e:any) => updateVariant(index, 'previousRetailPrice', e.target.value)} required className="w-full bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-white/5 rounded-xl px-3 py-3 text-[11px] font-black text-neutral-400 dark:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500/20 text-center" />
                          </div>
                          <div className="flex flex-col gap-1 flex-1 opacity-60">
                             <label className="text-[9px] font-black text-blue-500 px-3 uppercase tracking-widest">وكيل</label>
                             <input type="number" value={v.agentPrice} onChange={(e:any) => updateVariant(index, 'agentPrice', e.target.value)} required className="w-full bg-blue-50/10 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/10 rounded-xl px-3 py-3 text-[10px] font-black text-blue-600 dark:text-blue-400 focus:outline-none text-center" />
                          </div>
                          <div className="flex flex-col gap-1 flex-1 opacity-60">
                             <label className="text-[9px] font-black text-indigo-500 px-3 uppercase tracking-widest">جملة</label>
                             <input type="number" value={v.wholesalePrice} onChange={(e:any) => updateVariant(index, 'wholesalePrice', e.target.value)} required className="w-full bg-indigo-50/10 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10 rounded-xl px-3 py-3 text-[10px] font-black text-indigo-600 dark:text-indigo-400 focus:outline-none text-center" />
                          </div>
                        </div>
                      </div>
                    ))}
                    {formData.variants.length === 0 && (
                      <div className="text-center py-10 border border-dashed border-neutral-200 dark:border-white/10 rounded-3xl text-xs text-neutral-400 font-bold">لا يوجد أحجام إضافية لهذا المنتج</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex gap-3 mt-4">
              <button 
                type="submit" 
                className="flex-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-5 rounded-[24px] font-black font-display shadow-xl shadow-neutral-200 dark:shadow-none hover:scale-[1.01] active:scale-[0.98] transition-all"
              >
                {initialData ? 'تحديث البيانات' : 'إضافة المنتج'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function ExchangeRateManager({ rates }: any) {
  const [showForm, setShowForm] = useState(false);
  const [editingRate, setEditingRate] = useState<any>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const data = {
      fromCurrency: e.target.from.value,
      toCurrency: e.target.to.value,
      rate: Number(e.target.buy.value), // Keep rate as buy for backwards compatibility if needed
      buyRate: Number(e.target.buy.value),
      sellRate: Number(e.target.sell.value),
      trend: e.target.trend.value,
      lastUpdatedAt: serverTimestamp(),
      previousRate: editingRate?.buyRate || Number(e.target.buy.value),
    };
    if (editingRate) {
      await updateDoc(doc(db, 'exchangeRates', editingRate.id), data);
    } else {
      await addDoc(collection(db, 'exchangeRates'), data);
    }
    setShowForm(false);
    setEditingRate(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">إدارة أسعار الصرف</h3>
        <button onClick={() => { setEditingRate(null); setShowForm(true); }} className="bg-neutral-900 text-white p-3 rounded-2xl shadow-lg">
          <Plus size={18} />
        </button>
      </div>
      
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-neutral-900/40 backdrop-blur-sm p-6 flex items-center justify-center">
          <motion.form 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onSubmit={handleSubmit} 
            className="bg-white rounded-[32px] p-8 w-full max-w-sm flex flex-col gap-5 shadow-2xl relative"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-lg">{editingRate ? 'تعديل سعر' : 'إضافة سعر صرف'}</h4>
              <button type="button" onClick={() => setShowForm(false)} className="p-2 bg-neutral-50 rounded-full text-neutral-400"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="اسم العملة (مثلاً ريال سعودي)" name="from" defaultValue={editingRate?.fromCurrency} required />
              <Input label="إلى عملة (مثلاً ريال يمني)" name="to" defaultValue={editingRate?.toCurrency} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="سعر الشراء" name="buy" type="number" step="0.01" defaultValue={editingRate?.buyRate || editingRate?.rate} required />
              <Input label="سعر البيع" name="sell" type="number" step="0.01" defaultValue={editingRate?.sellRate} required />
            </div>
            <Select label="الاتجاه" name="trend" defaultValue={editingRate?.trend} options={[{id: 'up', name: 'ارتفاع'}, {id: 'down', name: 'انخفاض'}, {id: 'stable', name: 'ثبات'}]} required />
            <button className="bg-neutral-900 text-white py-5 rounded-2xl font-bold mt-2 shadow-lg">تحديث السعر</button>
          </motion.form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rates.map((r: any) => (
          <div key={r.id} className="bg-white dark:bg-neutral-900 p-6 rounded-[32px] border border-neutral-100 dark:border-white/5 flex flex-col gap-6 shadow-sm group hover:border-primary-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-800 rounded-2xl flex items-center justify-center text-green-500 shadow-inner">
                  <TrendingUp size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-black text-lg text-neutral-900 dark:text-white leading-tight">{r.fromCurrency}</span>
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">مقابل {r.toCurrency}</span>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => { setEditingRate(r); setShowForm(true); }} 
                  className="p-2.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 rounded-xl hover:bg-neutral-900 dark:hover:bg-white hover:text-white dark:hover:text-neutral-900 transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من حذف سعر الصرف هذا؟')) {
                      deleteDoc(doc(db, 'exchangeRates', r.id));
                    }
                  }} 
                  className="p-2.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-neutral-50/50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-white/5 flex flex-col gap-1 items-center">
                  <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">شراء</span>
                  <span className="text-2xl font-accent font-black text-neutral-900 dark:text-white">{(r.buyRate || r.rate).toLocaleString()}</span>
               </div>
               <div className="bg-neutral-50/50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-white/5 flex flex-col gap-1 items-center">
                  <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">بيع</span>
                  <span className="text-2xl font-accent font-black text-neutral-900 dark:text-white">{(r.sellRate || '-').toLocaleString()}</span>
               </div>
            </div>

            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    r.trend === 'up' ? "bg-red-500" : (r.trend === 'down' ? "bg-green-500" : "bg-neutral-300")
                  )} />
                  <span className="text-[10px] font-bold text-neutral-400">
                    {r.trend === 'up' ? 'يرتفع' : (r.trend === 'down' ? 'ينخفض' : 'مستقر')}
                  </span>
               </div>
               <span className="text-[8px] font-black text-neutral-300 uppercase tracking-widest">
                 تحديث: {r.lastUpdatedAt ? new Date(r.lastUpdatedAt.seconds * 1000).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }) : 'أوتوماتيكي'}
               </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetaManager({ sections, categories, brands, units, packages, reportTypes, governorates, districts }: any) {
  const [activeMeta, setActiveMeta] = useState<'sections' | 'categories' | 'brands' | 'units' | 'packages' | 'report_types' | 'governorates' | 'districts'>('sections');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [inputValue, setInputValue] = useState('');
  const [iconValue, setIconValue] = useState('📦');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [orderValue, setOrderValue] = useState<number | string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 200, 25000); // Very small for categories/sections (25KB)
        setImageUrl(compressed);
      } catch (error) {
        console.error('Meta image upload error:', error);
        alert('يرجى اختيار صورة أصغر أو رمز تعبيري');
      }
    }
  };

  const metaSections = [
    { id: 'sections', label: 'الأقسام الكبرى', icon: <LayoutGrid size={18} />, color: 'text-indigo-500', bg: 'bg-indigo-50', desc: 'إدارة الأقسام الرئيسية (مواد غذائية، لحوم، إلخ)' },
    { id: 'categories', label: 'الأصناف الرئيسية', icon: <Tags size={18} />, color: 'text-purple-500', bg: 'bg-purple-50', desc: 'إدارة تصنيفات السلع والمنتجات تحت الأقسام' },
    { id: 'brands', label: 'العلامات التجارية', icon: <ShieldCheck size={18} />, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'إدارة الشركات والماركات التجارية' },
    { id: 'units', label: 'وحدات القياس', icon: <Ruler size={18} />, color: 'text-orange-500', bg: 'bg-orange-50', desc: 'إدارة وحدات الكيل، الوزن، والسعة' },
    { id: 'packages', label: 'أنواع العبوات', icon: <Box size={18} />, color: 'text-green-500', bg: 'bg-green-50', desc: 'إدارة أشكال وأحجام التغليف' },
    { id: 'report_types', label: 'أنواع البلاغات', icon: <AlertTriangle size={18} />, color: 'text-red-500', bg: 'bg-red-50', desc: 'إدارة أنواع الشكاوي والبلاغات' },
    { id: 'governorates', label: 'المحافظات', icon: <MapPin size={18} />, color: 'text-indigo-500', bg: 'bg-indigo-50', desc: 'إدارة محافظات الجمهورية' },
    { id: 'districts', label: 'المديريات', icon: <MapPin size={18} />, color: 'text-violet-500', bg: 'bg-violet-50', desc: 'إدارة المديريات التابعة للمحافظات' },
  ];

  const collectionNames = { sections, categories, brands, units, packages, report_types: reportTypes, governorates, districts };
  const currentItems = (collectionNames as any)[activeMeta];
  const activeSection = metaSections.find(s => s.id === activeMeta);

  const handleOpenForm = (item: any = null) => {
    setEditingItem(item);
    setInputValue(item ? item.name : '');
    setIconValue(item?.icon || '📦');
    setImageUrl(item?.image || '');
    setSelectedGovernorate(item?.governorateId || '');
    setSelectedSection(item?.sectionId || '');
    setOrderValue(item?.order !== undefined ? item.order : '');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const data: any = { name: inputValue.trim() };
    if (activeMeta === 'categories' || activeMeta === 'sections') {
      data.icon = iconValue;
      data.image = imageUrl;
    }
    if (activeMeta === 'sections' || activeMeta === 'categories') {
      data.order = orderValue !== '' ? Number(orderValue) : 0;
    }
    if (activeMeta === 'categories') data.sectionId = selectedSection;
    if (activeMeta === 'districts') {
      if (!selectedGovernorate) {
        alert('يرجى اختيار المحافظة');
        return;
      }
      data.governorateId = selectedGovernorate;
    }

    if (editingItem) {
      await updateDoc(doc(db, activeMeta, editingItem.id), data);
    } else {
      await addDoc(collection(db, activeMeta), data);
    }
    setShowForm(false);
    setEditingItem(null);
    setInputValue('');
  };

  const handleSeed = async () => {
    if (!window.confirm('هل تريد تهيئة بيانات تجريبية كاملة لكافة الإعدادات؟')) return;
    
    // 1. Categories
    const catsData = [
      { name: 'قمح ودقيق', icon: '🌾' },
      { name: 'أرز وبقوليات', icon: '🍚' },
      { name: 'سكر وزيوت', icon: '🧂' },
      { name: 'محروقات', icon: '⛽' },
      { name: 'خضروات وفواكه', icon: '🍎' }
    ];
    for (const c of catsData) await addDoc(collection(db, 'categories'), c);

    // 2. Brands
    const brandsData = [{ name: 'السعيد' }, { name: 'هائل سعيد' }, { name: 'روابي' }, { name: 'الخليج' }, { name: 'الكمال' }];
    for (const b of brandsData) await addDoc(collection(db, 'brands'), b);

    // 3. Units & Packages
    const unitsData = [{ name: 'كجم' }, { name: 'لتر' }, { name: 'حبه' }, { name: 'متر' }];
    for (const u of unitsData) await addDoc(collection(db, 'units'), u);

    const packagesData = [
      { name: 'كيس 50 كجم' }, 
      { name: 'كيس 25 كجم' }, 
      { name: 'كيس 10 كجم' }, 
      { name: 'كرتون' }, 
      { name: 'دبة 20 لتر' }
    ];
    for (const p of packagesData) await addDoc(collection(db, 'packages'), p);

    const reportTypesData = [
      { name: 'رفع سعر' },
      { name: 'سلعة منتهية' },
      { name: 'احتكار' },
      { name: 'غش تجاري' },
      { name: 'اختلاف سعر' },
      { name: 'منتج مفقود' }
    ];
    for (const rt of reportTypesData) await addDoc(collection(db, 'report_types'), rt);

    const YEMEN_INIT: Record<string, string[]> = {
      "صنعاء - الأمانة": ["السبعين", "التحرير", "الثورة", "شعوب"],
      "عدن": ["المنصورة", "الشيخ عثمان", "كريتر", "المعلا"],
      "تعز": ["المظفر", "القاهرة", "صالة"],
      "حضرموت": ["المكلا", "سيئون", "تريم"],
      "الحديدة": ["الحالي", "الحوك", "الميناء"],
    };

    for (const [gov, dists] of Object.entries(YEMEN_INIT)) {
      const gRef = await addDoc(collection(db, 'governorates'), { name: gov });
      for (const dst of dists) {
        await addDoc(collection(db, 'districts'), { name: dst, governorateId: gRef.id });
      }
    }

    alert('تمت تهيئة البيانات بنجاح!');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('حذف هذا العنصر؟ قد يؤثر ذلك على المنتجات المرتبطة به.')) {
      await deleteDoc(doc(db, activeMeta, id));
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top Switcher */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 bg-neutral-100/50 dark:bg-neutral-900/50 p-1 md:p-2 rounded-[24px] md:rounded-[32px] border border-neutral-100 dark:border-white/5 overflow-x-auto no-scrollbar">
        {metaSections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveMeta(sec.id as any)}
            className={cn(
              "flex items-center justify-center gap-2 md:gap-3 px-3 md:px-6 py-3 md:py-4 rounded-[18px] md:rounded-[24px] text-[10px] md:text-[13px] font-bold transition-all whitespace-nowrap",
              activeMeta === sec.id 
                ? "bg-white dark:bg-neutral-800 shadow-md text-neutral-900 dark:text-white scale-[1.02]" 
                : "text-neutral-500 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            )}
          >
            {React.cloneElement(sec.icon as React.ReactElement, { size: 14, className: activeMeta === sec.id ? sec.color : 'text-neutral-400' })}
            {sec.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-5 md:p-6 rounded-[28px] md:rounded-[32px] border border-neutral-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-4 md:gap-5 w-full sm:w-auto">
             <div className={cn("p-3 md:p-4 rounded-2xl shadow-inner", activeSection?.bg, activeSection?.color)}>
               {React.cloneElement(activeSection?.icon as React.ReactElement, { size: 20 })}
             </div>
             <div className="flex flex-col">
                <h3 className="text-lg md:text-xl font-display font-black text-neutral-900 dark:text-white leading-none">{activeSection?.label}</h3>
                <p className="text-[10px] md:text-xs font-medium text-neutral-400 dark:text-neutral-500 mt-2">{activeSection?.desc}</p>
             </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-dashed border-neutral-100 dark:border-white/5 pt-4 sm:pt-0 mt-2 sm:mt-0">
            <button 
              onClick={handleSeed}
              className="px-3 py-2 text-[10px] font-bold text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              تهيئة البيانات
            </button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOpenForm()}
              className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold shadow-lg shadow-neutral-200 dark:shadow-none hover:-translate-y-0.5 transition-all"
            >
              <Plus size={16} />
              <span>إضافة جديد</span>
            </motion.button>
          </div>
        </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {currentItems.map((item: any) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id} 
                  className="bg-white dark:bg-neutral-900 p-5 rounded-[28px] border border-neutral-100 dark:border-white/5 flex flex-col gap-4 group hover:border-primary-500/30 transition-all duration-300 shadow-sm hover:shadow-xl h-full"
                >
                  <div className="flex items-center gap-4">
                    {(activeMeta === 'categories' || activeMeta === 'sections') ? (
                      <div className="relative w-16 h-16 flex-shrink-0">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-16 h-16 rounded-2xl object-cover shadow-inner border border-neutral-100 dark:border-white/10"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-3xl w-16 h-16 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 rounded-2xl shadow-inner group-hover:bg-primary-500 group-hover:text-white transition-all duration-500">
                            {item.icon || '📦'}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={cn("w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-2xl shadow-inner bg-neutral-50 dark:bg-neutral-800 group-hover:bg-neutral-100 dark:group-hover:bg-neutral-700 transition-all duration-500", activeSection?.color)}>
                         {activeSection?.icon && React.cloneElement(activeSection.icon as React.ReactElement, { size: 24 })}
                      </div>
                    )}
                    <div className="flex flex-col justify-center overflow-hidden">
                      <h4 className="font-bold text-neutral-800 dark:text-white text-sm leading-tight truncate px-1">{item.name}</h4>
                      {activeMeta === 'sections' && (
                        <p className="text-[10px] font-black text-indigo-500 mt-1.5 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full self-start">
                          الترتيب: {item.order !== undefined ? item.order : 'غير محدد'}
                        </p>
                      )}
                      {activeMeta === 'categories' && item.sectionId && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 rounded-full">
                            {sections.find((s: any) => s.id === item.sectionId)?.name || 'بدون قسم'}
                          </span>
                          <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-full">
                            الترتيب: {item.order !== undefined ? item.order : 'غير محدد'}
                          </span>
                        </div>
                      )}
                      {activeMeta === 'districts' && (
                        <p className="text-[10px] font-black text-primary-500 mt-1.5 uppercase tracking-widest bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 rounded-full self-start">
                          {governorates.find((g: any) => g.id === item.governorateId)?.name || 'غير محدد'}
                        </p>
                      )}
                      <p className="text-[9px] font-bold text-neutral-300 dark:text-neutral-600 uppercase tracking-widest mt-1">ID: {item.id.substring(0, 8)}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-auto pt-4 border-t border-dashed border-neutral-100 dark:border-white/5">
                    <button 
                      onClick={() => handleOpenForm(item)} 
                      className="flex-1 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 dark:text-neutral-500 rounded-xl hover:bg-neutral-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all shadow-sm flex items-center justify-center gap-2 text-[10px] font-bold"
                    >
                      <Edit2 size={14} />
                      تعديل
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="flex-1 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 dark:text-neutral-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 text-[10px] font-bold"
                    >
                      <Trash2 size={14} />
                      حذف
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {currentItems.length === 0 && (
              <div className="col-span-full py-24 text-center bg-white/50 border-2 border-dashed border-neutral-200 rounded-[48px] flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-4xl mb-6 opacity-40">🗂️</div>
                <h5 className="font-display font-black text-xl text-neutral-600">لا تتوفر أي بيانات حالياً</h5>
                <p className="text-sm text-neutral-400 mt-2 max-w-[200px] leading-relaxed font-medium">ابدأ الآن بإضافة أول سجل في قائمة {activeSection?.label} لهذا المتجر</p>
                <button 
                  onClick={() => handleOpenForm()}
                  className="mt-8 text-xs font-black text-primary-600 hover:underline uppercase tracking-widest"
                >
                  انقر هنا للإضافة
                </button>
              </div>
            )}
          </div>
        </div>

      {/* Modal Form */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md pointer-events-auto"
              onClick={() => setShowForm(false)}
            />
            <motion.form 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onSubmit={handleSubmit} 
              className="relative bg-white rounded-[48px] p-10 w-full max-w-md flex flex-col gap-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] pointer-events-auto"
            >
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="absolute top-8 left-8 p-3 bg-neutral-50 text-neutral-400 rounded-full hover:bg-neutral-100 hover:text-neutral-900 transition-all active:scale-90"
              >
                <X size={24} />
              </button>

              <div className="text-center pt-4">
                <div className={cn("inline-flex p-5 rounded-[28px] mb-6 shadow-highlight", activeSection?.bg, activeSection?.color)}>
                  {activeSection?.icon && React.cloneElement(activeSection.icon as React.ReactElement, { size: 40 })}
                </div>
                <h4 className="font-display font-black text-3xl text-neutral-900">{editingItem ? 'تعديل البيانات' : 'إضافة سجل'}</h4>
                <p className="text-sm font-medium text-neutral-400 mt-3 px-6">يرجى تعبئة كافة الحقول المطلوبة لضمان دقة البيانات في النظام</p>
              </div>
              
              <div className="flex flex-col gap-6">
                {(activeMeta === 'sections' || activeMeta === 'categories') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-3">
                      <label className="text-[11px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mr-5">تحميل صورة</label>
                      <div className="relative group/upload h-32 rounded-[24px] border-2 border-dashed border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-800/30 overflow-hidden transition-all hover:border-primary-500/50">
                        {imageUrl ? (
                          <>
                            <img src={imageUrl} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button 
                              type="button"
                              onClick={() => setImageUrl('')}
                              className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover/upload:opacity-100 transition-all shadow-lg"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                            <Upload size={24} className="text-neutral-300 dark:text-neutral-600 mb-2 transition-transform group-hover/upload:-translate-y-1" />
                            <span className="text-[10px] font-bold text-neutral-400">اضغط لرفع صورة</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                          </label>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <label className="text-[11px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mr-5">أو رمز (Emoji)</label>
                      <input 
                        type="text" 
                        className="h-32 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 rounded-[24px] px-8 py-5 text-4xl text-center focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white dark:focus:bg-neutral-700 transition-all shadow-inner dark:text-white"
                        value={iconValue} 
                        onChange={(e) => setIconValue(e.target.value)} 
                        placeholder="📦" 
                      />
                    </div>
                  </div>
                )}
                {activeMeta === 'categories' && (
                  <div className="flex flex-col gap-3">
                    <label className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mr-5">القسم الكبير</label>
                    <div className="relative">
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-[24px] px-8 py-5 font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner appearance-none"
                      >
                        <option value="">اختر القسم الرئيسي...</option>
                        {sections.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <ChevronDown size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mr-5">مسمى {activeSection?.label.slice(0, -1)}</label>
                  <input 
                    type="text" 
                    className="bg-neutral-50 border border-neutral-100 rounded-[24px] px-8 py-5 font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner text-lg"
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    required 
                    autoFocus 
                    placeholder="أدخل الاسم بوضوح..." 
                  />
                </div>

                {(activeMeta === 'sections' || activeMeta === 'categories') && (
                  <div className="flex flex-col gap-3">
                    <label className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mr-5">
                      {activeMeta === 'sections' ? 'ترتيب القسم' : 'ترتيب الصنف'} (رقم أصغر يظهر أولاً)
                    </label>
                    <input 
                      type="number" 
                      className="bg-neutral-50 border border-neutral-100 rounded-[24px] px-8 py-5 font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner text-lg"
                      value={orderValue} 
                      onChange={(e) => setOrderValue(e.target.value)} 
                      placeholder="مثال: 1 للظهور أولاً، 2 للظهور ثانياً..." 
                    />
                  </div>
                )}

                {activeMeta === 'districts' && (
                  <div className="flex flex-col gap-3">
                    <label className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mr-5">المحافظة التابعة لها</label>
                    <div className="relative">
                      <select
                        required
                        value={selectedGovernorate}
                        onChange={(e) => setSelectedGovernorate(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-[24px] px-8 py-5 font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner appearance-none"
                      >
                        <option value="">اختر المحافظة...</option>
                        {governorates.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                      <ChevronDown size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
              
              <button className="bg-neutral-900 text-white py-6 rounded-[32px] font-display font-black text-lg shadow-2xl shadow-neutral-300 hover:translate-y-[-4px] transition-all active:scale-[0.98] mt-4">
                {editingItem ? 'حفظ التعديلات' : 'إضافة الآن'}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// UI Helpers (Refined for Admin)
function ReportStatsCard() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    return onSnapshot(collection(db, 'reports'), (s) => setCount(s.size));
  }, []);
  return <StatCard label="البلاغات الجديدة" value={count} color="bg-red-500" icon={<AlertTriangle size={20} />} trend={count > 0 ? 'up' : 'stable'} />;
}

function ReportManager() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('all');

  useEffect(() => {
    return onSnapshot(collection(db, 'reports'), (s) => {
      setReports(s.docs.map(d => ({ id: d.id, ...d.data() } as Report)).sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
  }, []);

  const filtered = reports.filter(r => filterStatus === 'all' || r.status === filterStatus);

  const [showAnalytics, setShowAnalytics] = useState(true);

  // --- Analytics calculations ---
  const typeCounts: Record<string, number> = {};
  const govCounts: Record<string, number> = {};
  const itemCounts: Record<string, number> = {};

  reports.forEach(r => {
    // 1. Report Type
    const t = r.reportType || 'مخالفة سعرية';
    typeCounts[t] = (typeCounts[t] || 0) + 1;

    // 2. Governorate
    const g = r.governorate || 'غير محدد';
    govCounts[g] = (govCounts[g] || 0) + 1;

    // 3. Product / Item
    const item = r.itemName || 'غير محدد';
    itemCounts[item] = (itemCounts[item] || 0) + 1;
  });

  const typeChartData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  const govChartData = Object.entries(govCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value);
  const itemChartData = Object.entries(itemCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value)
    .slice(0, 5);

  const chartColors = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-950 dark:bg-neutral-800 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-lg border border-white/10 flex flex-col gap-0.5 z-[100]" dir="rtl">
          <span className="opacity-90">{payload[0].name}</span>
          <span className="font-mono text-primary-400">{payload[0].value} بلاغ</span>
        </div>
      );
    }
    return null;
  };

  const handleExportReports = () => {
    if (!reports || reports.length === 0) {
      alert('لا توجد بلاغات لتصديرها');
      return;
    }

    try {
      const exportData = reports.map(r => ({
        'رقم البلاغ': `#${r.id.substring(0, 6)}`,
        'الاسم الكامل': r.reporterName || 'غير متوفر',
        'رقم الهاتف': r.reporterPhone || 'غير متوفر',
        'تاريخ البلاغ': r.createdAt ? new Date(r.createdAt.seconds * 1000).toLocaleString('ar-YE') : 'غير متوفر',
        'نوع البلاغ': r.reportType || 'غير متوفر',
        'اسم السلعة': r.itemName || 'غير متوفر',
        'اسم المتجر': r.storeName || 'غير متوفر',
        'السعر المبلغ عنه': r.currentPrice || '0',
        'المحافظة': r.governorate || 'غير متوفر',
        'المديرية': r.district || 'غير متوفر',
        'الحالة': getStatusInfo(r.status).label,
        'الوصف/التوضيح': r.description || ''
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "البلاغات");

      // Set column widths
      ws['!cols'] = [
        { wch: 15 }, // id
        { wch: 25 }, // name
        { wch: 15 }, // phone
        { wch: 20 }, // date
        { wch: 20 }, // type
        { wch: 30 }, // item
        { wch: 25 }, // store
        { wch: 15 }, // price
        { wch: 15 }, // gov
        { wch: 15 }, // district
        { wch: 15 }, // status
        { wch: 40 }, // description
      ];

      XLSX.writeFile(wb, `بلاغات_الأسعار_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Export Error:', error);
      alert('حدث خطأ أثناء تصدير البيانات');
    }
  };

  const updateStatus = async (id: string, status: ReportStatus) => {
    await updateDoc(doc(db, 'reports', id), { status });
  };

  const getStatusInfo = (status: ReportStatus) => {
    switch (status) {
      case 'new': return { label: 'جديد', color: 'bg-blue-500', icon: <Plus size={10} /> };
      case 'review': return { label: 'قيد المراجعة', color: 'bg-amber-500', icon: <Clock size={10} /> };
      case 'resolved': return { label: 'تم الحل', color: 'bg-green-500', icon: <CheckCircle2 size={10} /> };
      case 'rejected': return { label: 'مرفوض', color: 'bg-red-500', icon: <AlertCircle size={10} /> };
    }
  };

  const getTypeText = (type: string) => {
    return type;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-[32px] border border-neutral-100 dark:border-white/5 shadow-sm">
        <h3 className="text-xl font-display font-black flex items-center gap-3 dark:text-white">
          <div className="p-2 bg-red-500 text-white rounded-lg">
            <AlertTriangle size={18} />
          </div>
          إدارة البلاغات
          <span className="bg-neutral-50 dark:bg-neutral-800 text-neutral-400 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider">{reports.length}</span>
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all border border-indigo-100 dark:border-indigo-500/20 shadow-sm"
          >
            <LineChart size={14} />
            {showAnalytics ? 'إخفاء الإحصائيات' : 'عرض الإحصائيات'}
          </button>
          <button 
            onClick={handleExportReports}
            className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 hover:bg-green-100 transition-all border border-green-100 dark:border-green-500/20 shadow-sm"
          >
            <Download size={14} />
            تصدير Excel
          </button>
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {(['all', 'new', 'review', 'resolved', 'rejected'] as const).map(s => (
              <button 
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap",
                  filterStatus === s 
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm" 
                    : "bg-neutral-50 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                )}
              >
                {s === 'all' ? 'الكل' : getStatusInfo(s as ReportStatus).label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showAnalytics && reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: نوع البلاغات */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-[32px] border border-neutral-100 dark:border-white/5 shadow-sm flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-black text-neutral-900 dark:text-white">توزيع البلاغات حسب النوع</h4>
              <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mt-0.5">مقارنة نسب البلاغات المسجلة</p>
            </div>
            
            <div className="h-[200px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {typeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-neutral-900 dark:text-white">{reports.length}</span>
                <span className="text-[9px] font-bold text-neutral-400">إجمالي البلاغات</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 gap-y-1.5 mt-2 justify-center">
              {typeChartData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800/40 px-2 py-1 rounded-full text-[9px] font-bold">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                  <span className="text-neutral-600 dark:text-neutral-400 truncate max-w-[80px]">{item.name}</span>
                  <span className="text-neutral-400 font-mono ml-0.5">({item.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: البلاغات حسب المحافظة */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-[32px] border border-neutral-100 dark:border-white/5 shadow-sm flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-black text-neutral-900 dark:text-white">البلاغات حسب المحافظة</h4>
              <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mt-0.5">عدد البلاغات في كل محافظة</p>
            </div>
            
            <div className="h-[220px] w-full">
              {govChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={govChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:stroke-neutral-800" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#888888', fontSize: 9, fontWeight: 'bold' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#888888', fontSize: 9, fontWeight: 'bold' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                      {govChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[(index + 1) % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-neutral-400 font-bold">لا توجد بيانات كافية</div>
              )}
            </div>
          </div>

          {/* Card 3: أعلى السلع إبلاغاً */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-[32px] border border-neutral-100 dark:border-white/5 shadow-sm flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-black text-neutral-900 dark:text-white">أكثر السلع بلاغاً (أعلى 5)</h4>
              <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mt-0.5">السلع الأكثر تكراراً بالبلاغات</p>
            </div>
            
            <div className="h-[220px] w-full">
              {itemChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={itemChartData} 
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" className="dark:stroke-neutral-800" />
                    <XAxis 
                      type="number" 
                      tick={{ fill: '#888888', fontSize: 9, fontWeight: 'bold' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fill: '#888888', fontSize: 9, fontWeight: 'bold' }} 
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]}>
                      {itemChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[(index + 3) % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-neutral-400 font-bold">لا توجد بيانات كافية</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(r => {
          const status = getStatusInfo(r.status);
          return (
            <div key={r.id} className="bg-white dark:bg-neutral-900 p-6 rounded-[32px] border border-neutral-100 dark:border-white/5 flex flex-col gap-5 shadow-sm group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("px-2.5 py-1 rounded-full text-white text-[9px] font-black flex items-center gap-1.5", status.color)}>
                    {status.icon}
                    {status.label}
                  </div>
                  <span className="text-[10px] font-black text-neutral-300 dark:text-neutral-600 uppercase tracking-widest">
                    #{r.id.substring(0, 6)}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-neutral-400">
                  {r.createdAt ? new Date(r.createdAt.seconds * 1000).toLocaleString('ar-YE') : 'الآن'}
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-lg font-bold text-neutral-900 dark:text-white">{r.itemName}</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-[10px] font-bold text-red-500">{getTypeText(r.reportType)}</span>
                    <span className="px-3 py-1 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-[10px] font-bold text-neutral-500">{r.currentPrice} ريال</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">المُبلغ</span>
                    <span className="text-xs font-bold dark:text-white">{r.reporterName}</span>
                    <span className="text-[10px] font-medium text-neutral-500">{r.reporterPhone}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">المتجر / الموقع</span>
                    <span className="text-xs font-bold dark:text-white">{r.storeName || 'غير محدد'}</span>
                    <span className="text-[10px] font-medium text-neutral-500">{r.governorate} - {r.district}</span>
                  </div>
                </div>

                {r.description && (
                  <div className="text-sm p-4 text-neutral-600 dark:text-neutral-400 bg-neutral-50/50 dark:bg-neutral-800/50 rounded-2xl border border-dashed border-neutral-100 dark:border-white/5">
                    {r.description}
                  </div>
                )}

                {r.imageUrl && (
                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-inner">
                    <img 
                      src={r.imageUrl} 
                      alt="مرفق البلاغ" 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-white/5">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateStatus(r.id, 'review')}
                      disabled={r.status === 'review'}
                      className="px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 text-xs font-bold rounded-xl hover:bg-amber-100 transition-colors disabled:opacity-30"
                    >
                      مراجعة
                    </button>
                    <button 
                      onClick={() => updateStatus(r.id, 'resolved')}
                      disabled={r.status === 'resolved'}
                      className="px-4 py-2 bg-green-50 dark:bg-green-500/10 text-green-600 text-xs font-bold rounded-xl hover:bg-green-100 transition-colors disabled:opacity-30"
                    >
                      تم الحل
                    </button>
                    <button 
                      onClick={() => updateStatus(r.id, 'rejected')}
                      disabled={r.status === 'rejected'}
                      className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-30"
                    >
                      رفض
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      if(window.confirm('حذف البلاغ نهائياً؟')) deleteDoc(doc(db, 'reports', r.id));
                    }}
                    className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-40 text-center italic text-neutral-400">لا توجد بلاغات حالياً</div>
        )}
      </div>
    </div>
  );
}

const Input = ({ label, ...props }: any) => (
  <div className="flex flex-col gap-2 md:gap-3">
    <label className="text-[10px] md:text-[11px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mr-4 md:mr-5">{label}</label>
    <input 
      {...props} 
      className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 rounded-xl md:rounded-[24px] px-5 md:px-7 py-3.5 md:py-5 text-sm md:text-[15px] font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-primary-500/5 focus:bg-white dark:focus:bg-neutral-900 focus:border-primary-200 dark:focus:border-primary-500/20 transition-all placeholder:text-neutral-300 dark:placeholder:text-neutral-600 shadow-inner" 
    />
  </div>
);

const Select = ({ label, options, ...props }: any) => (
  <div className="flex flex-col gap-2 md:gap-3">
    <label className="text-[10px] md:text-[11px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mr-4 md:mr-5">{label}</label>
    <div className="relative">
      <select 
        {...props} 
        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 rounded-xl md:rounded-[24px] px-5 md:px-7 py-3.5 md:py-5 text-sm md:text-[15px] font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-primary-500/5 focus:bg-white dark:focus:bg-neutral-900 focus:border-primary-200 dark:focus:border-primary-500/20 transition-all appearance-none shadow-inner"
      >
        <option value="" className="dark:bg-neutral-900">اختر من الخيارات المتاحة...</option>
        {options.map((o: any) => <option key={o.id} value={o.id} className="dark:bg-neutral-900">{o.name}</option>)}
      </select>
      <div className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
         <SlidersHorizontal size={14} />
      </div>
    </div>
  </div>
);
const LoginIllustration = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="text-neutral-200" />
    <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2" className="text-neutral-200" />
    <path d="M6 18C6 15 9 14 12 14C15 14 18 15 18 18" stroke="currentColor" strokeWidth="2" className="text-neutral-200" />
  </svg>
);
