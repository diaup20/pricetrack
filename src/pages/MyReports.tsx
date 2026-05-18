import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  Search,
  Filter,
  FileText,
  MapPin,
  Calendar,
  LogIn
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, documentId, onSnapshot, orderBy } from 'firebase/firestore';
import { Report, ReportStatus } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ReportForm } from '../components/ReportForm';
import { Link } from 'react-router-dom';

export function MyReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReportStatus | 'all'>('all');
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'reports'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Report));
      
      setReports(reportsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reports:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user && !loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24 text-center gap-8 px-6">
          <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-900 rounded-[40px] flex items-center justify-center text-neutral-300 dark:text-neutral-700 shadow-inner">
            <FileText size={48} />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tighter">بلاغاتي</h2>
            <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 max-w-[280px] leading-relaxed mx-auto">
              لمشاهدة بلاغاتك السابقة وتتبع حالتها، يرجى تسجيل الدخول إلى حسابك أولاً.
            </p>
          </div>
          <Link 
            to="/auth"
            className="w-full max-w-[240px] bg-primary-600 text-white py-5 rounded-[24px] font-black text-[13px] uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <LogIn size={20} />
            تسجيل الدخول
          </Link>
        </div>
      </Layout>
    );
  }

  const filteredReports = reports.filter(r => filter === 'all' || r.status === filter);

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'new': return 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20';
      case 'review': return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20';
      case 'resolved': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20';
      case 'rejected': return 'text-red-500 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20';
      default: return 'text-neutral-500 bg-neutral-50 dark:bg-neutral-500/10 border-neutral-100 dark:border-neutral-500/20';
    }
  };

  const getStatusLabel = (status: ReportStatus) => {
    switch (status) {
      case 'new': return 'جديد';
      case 'review': return 'قيد المراجعة';
      case 'resolved': return 'تم المعاينة';
      case 'rejected': return 'مرفوض';
      default: return status;
    }
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case 'new': return <Clock size={12} />;
      case 'review': return <Search size={12} />;
      case 'resolved': return <CheckCircle2 size={12} />;
      case 'rejected': return <AlertTriangle size={12} />;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8 -mt-2">
        {/* Header */}
        <div className="flex flex-col gap-2 px-1">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tighter">بلاغاتي</h1>
            <button 
              onClick={() => setIsReportOpen(true)}
              className="w-10 h-10 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
            >
              <Plus size={20} />
            </button>
          </div>
          <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">تتبع حالة البلاغات المقدمة من قبلك</p>
        </div>

        {/* Quick Action Button */}
        <div className="px-1">
          <button 
            onClick={() => setIsReportOpen(true)}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-3xl p-5 flex items-center gap-4 group hover:border-primary-500/40 transition-all shadow-sm"
          >
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-950/30 text-primary-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <div className="flex-1 text-right">
              <h3 className="text-sm font-black text-neutral-900 dark:text-white">تقديم بلاغ جديد</h3>
              <p className="text-[10px] font-bold text-neutral-400 mt-0.5">أبلغ عن تلاعب بالأسعار أو مخالفات</p>
            </div>
            <ChevronRight size={20} className="text-neutral-300" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'new', label: 'جديد' },
            { id: 'review', label: 'قيد المراجعة' },
            { id: 'resolved', label: 'تم المعاينة' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={cn(
                "px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
                filter === item.id 
                  ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-950 shadow-lg" 
                  : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-white/10 text-neutral-400"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Reports List */}
        <div className="flex flex-col gap-4 pb-20">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredReports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-[32px] p-6 flex flex-col gap-5 shadow-sm relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-800 rounded-2xl flex items-center justify-center text-primary-600 shadow-sm border border-neutral-100 dark:border-white/5">
                        <FileText size={22} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-neutral-900 dark:text-white leading-tight">{report.itemName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{report.reportType}</span>
                           <span className="w-1 h-1 rounded-full bg-neutral-300" />
                           <span className="text-[10px] font-black text-primary-600 tracking-tighter">
                             {report.currentPrice.toLocaleString('en-US')} ريال
                           </span>
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm",
                      getStatusColor(report.status)
                    )}>
                      {getStatusIcon(report.status)}
                      {getStatusLabel(report.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100/50 dark:border-white/5">
                       <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                         <MapPin size={10} /> الموقع
                       </span>
                       <p className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 leading-tight">
                         {report.governorate}، {report.district}
                       </p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100/50 dark:border-white/5">
                       <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                         <Calendar size={10} /> التاريخ
                       </span>
                       <p className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 leading-tight">
                         {report.createdAt ? format(new Date(report.createdAt.seconds * 1000), 'yyyy/MM/dd', { locale: ar }) : ''}
                       </p>
                    </div>
                  </div>

                  {report.status === 'review' && (
                    <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3 relative z-10">
                      <div className="w-8 h-8 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0">
                        <Search size={14} />
                      </div>
                      <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed">
                        بلاغك قيد المراجعة من قبل المختصين وسيتم المعاينة قريباً.
                      </p>
                    </div>
                  )}

                  {report.status === 'resolved' && (
                    <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 relative z-10">
                      <div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0">
                        <CheckCircle2 size={14} />
                      </div>
                      <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 leading-relaxed">
                        تمت المتابعة واتخاذ الإجراءات اللازمة حيال هذا البلاغ. شكراً لمساهمتكم.
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center gap-6 px-4 bg-white/50 dark:bg-neutral-900/50 rounded-[48px] border border-dashed border-neutral-200 dark:border-white/5">
              <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-[32px] flex items-center justify-center text-neutral-300 dark:text-neutral-700">
                <FileText size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-neutral-800 dark:text-white">لا توجد بلاغات</h3>
                <p className="text-xs font-bold text-neutral-400 leading-relaxed max-w-[240px]">
                  لم تقم بتقديم أي بلاغات حتى الآن. بلاغاتك ستظهر هنا لتتبع حالتها.
                </p>
              </div>
              <button 
                onClick={() => setIsReportOpen(true)}
                className="bg-primary-600 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary-200 dark:shadow-none hover:scale-105 transition-all active:scale-95"
              >
                تقديم أول بلاغ الآن
              </button>
            </div>
          )}
        </div>
      </div>

      <ReportForm isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </Layout>
  );
}
