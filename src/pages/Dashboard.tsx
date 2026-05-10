import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { ExchangeRateWidget } from '../components/ExchangeRateWidget';
import { CategoryGrid } from '../components/CategoryGrid';
import { Layout } from '../components/Layout';
import { 
  Package, 
  LineChart, 
  ShieldAlert, 
  History, 
  TrendingUp, 
  Search, 
  Filter, 
  AlertTriangle,
  ChevronDown,
  X,
  Tags,
  Box
} from 'lucide-react';
import { ReportForm } from '../components/ReportForm';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { categories, products, exchangeRates, brands } = useData();
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const latestProductUpdate = products.length > 0 
    ? Math.max(...products.map(p => p.lastUpdatedAt?.seconds || 0))
    : 0;
  
  const lastUpdateDate = latestProductUpdate > 0 ? new Date(latestProductUpdate * 1000) : null;

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchesBrand = selectedBrand === 'all' || p.brandId === selectedBrand;
      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand]);

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        {/* Hero / Header */}
        <header className="flex flex-col gap-2 px-1 py-1">
          <div className="flex items-center justify-between">
            <h2 className="text-[28px] md:text-3xl font-display font-black text-neutral-900 dark:text-white tracking-tight leading-tight transition-colors">
              سوق الأسعار <span className="text-primary-500">اليمني</span>
            </h2>
            <button 
              onClick={() => setIsReportOpen(true)}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-2xl text-xs font-black shadow-lg shadow-red-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all"
            >
              <AlertTriangle size={14} />
              إبلاغ عن حالة
            </button>
          </div>
          <p className="text-sm font-medium text-neutral-400 dark:text-neutral-500 transition-colors">تابع تحركات السوق والعملات لحظة بلحظة</p>
        </header>

        {/* Exchange Rates */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-sky-500 rounded-[34px] blur opacity-[0.08] dark:opacity-[0.15]"></div>
          <ExchangeRateWidget rates={exchangeRates} />
        </div>

        {/* Search and Filters Section */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="relative flex-1 group">
               <input 
                 type="text" 
                 placeholder="ابحث عن اسم المنتج..." 
                 className="w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-[24px] px-5 py-4 text-sm font-bold pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white shadow-sm group-hover:border-neutral-200 dark:group-hover:border-white/10"
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
               />
               <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
               {searchQuery && (
                 <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500"
                 >
                   <X size={16} />
                 </button>
               )}
            </div>
            <button 
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className={cn(
                "p-4 rounded-[24px] border transition-all flex items-center justify-center shadow-sm",
                isFilterExpanded 
                  ? "bg-primary-500 text-white border-primary-500" 
                  : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-white/5 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50"
              )}
            >
              <Filter size={20} />
            </button>
          </div>

          <AnimatePresence>
            {isFilterExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2 pt-1 px-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-2 flex items-center gap-2">
                      <Tags size={12} /> تصنيف حسب القسم
                    </label>
                    <div className="relative">
                      <select 
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-2xl px-4 py-3 text-xs font-bold appearance-none dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-sm"
                      >
                        <option value="all">كل الأقسام</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-2 flex items-center gap-2">
                      <Box size={12} /> فلترة بالعلامة التجارية
                    </label>
                    <div className="relative">
                      <select 
                        value={selectedBrand}
                        onChange={e => setSelectedBrand(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-2xl px-4 py-3 text-xs font-bold appearance-none dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-sm"
                      >
                        <option value="all">كل العلامات</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xl font-display font-black text-neutral-800 dark:text-neutral-100 transition-colors flex items-center gap-2">
              {searchQuery || selectedCategory !== 'all' || selectedBrand !== 'all' 
                ? `نتائج البحث (${filteredProducts.length})` 
                : 'الأصناف المميزة'}
            </h3>
            { (searchQuery || selectedCategory !== 'all' || selectedBrand !== 'all') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedBrand('all');
                }}
                className="text-[10px] font-black text-primary-500 uppercase tracking-widest bg-primary-50 dark:bg-primary-500/10 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-all"
              >
                إلغاء التصفية
              </button>
            )}
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.slice(0, 20).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-[40px] border border-dashed border-neutral-200 dark:border-white/5">
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-full shadow-lg">
                <Search size={40} className="text-neutral-300" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-800 dark:text-neutral-200">لا توجد نتائج</h4>
                <p className="text-xs text-neutral-400 mt-1">جرب تغيير معايير البحث أو الفلترة</p>
              </div>
            </div>
          )}

          {filteredProducts.length > 20 && (
            <p className="text-center text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-4">استخدم البحث والفلترة لتضييق النتائج</p>
          )}
        </div>

        {/* Warning / Memo */}
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-4 rounded-2xl flex gap-3 items-start transition-colors mb-10">
          <ShieldAlert className="text-amber-500 flex-shrink-0" size={20} />
          <div>
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">تنويه هام</h4>
            <p className="text-[10px] text-amber-700 dark:text-amber-500 leading-normal mt-0.5">
              الأسعار المعروضة هي أسعار استرشادية وقد تختلف قليلاً بين المحافظات والمحلات التجارية.
            </p>
          </div>
        </div>
      </div>

      <ReportForm isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </Layout>
  );
}

function StatSummaryBox({ label, value, icon, isHighlight }: { label: string; value: number; icon: React.ReactNode; isHighlight?: boolean }) {
  return (
    <div className="bg-white dark:bg-neutral-900 p-5 rounded-[28px] shadow-sm border border-neutral-100 dark:border-white/5 hover:shadow-lg dark:hover:shadow-none hover:border-neutral-200 dark:hover:border-primary-500/30 transition-all duration-300 group">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{label}</span>
          <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl group-hover:scale-110 transition-transform">
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-accent font-black text-neutral-900 dark:text-white leading-none">{value.toLocaleString('en-US')}</span>
          {isHighlight && value > 0 && (
            <div className="flex items-center gap-0.5 text-red-500 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded-lg text-[10px] font-black">
              <LineChart size={10} />
              <span>مباشر</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
