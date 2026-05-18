import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { ExchangeRateWidget } from '../components/ExchangeRateWidget';
import { ProductCard } from '../components/ProductCard';
import { Layout } from '../components/Layout';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  X, 
  LineChart,
  AlertTriangle
} from 'lucide-react';
import { ReportForm } from '../components/ReportForm';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { sections, categories, products, exchangeRates, brands } = useData();
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Filtered Categories based on Section
  const filteredCategories = useMemo(() => {
    if (selectedSection === 'all') return categories;
    return categories.filter(c => c.sectionId === selectedSection);
  }, [categories, selectedSection]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Get category for this product to check its section
      const productCategory = categories.find(c => c.id === p.categoryId);
      const matchesSection = selectedSection === 'all' || productCategory?.sectionId === selectedSection;
      
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchesBrand = selectedBrand === 'all' || p.brandId === selectedBrand;
      return matchesSearch && matchesSection && matchesCategory && matchesBrand;
    });
  }, [products, categories, searchQuery, selectedSection, selectedCategory, selectedBrand]);

  return (
    <Layout>
      <div className="flex flex-col gap-8 -mt-2">
        {/* Modern Header Section */}
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col">
            <h1 className="text-3xl font-display font-black text-neutral-900 dark:text-white leading-tight tracking-tight">سوق الأسعار</h1>
            <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest leading-none mt-1">اليمن • تحديث مباشر</p>
          </div>
          <button 
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-neutral-200 dark:shadow-none hover:translate-y-[-2px] transition-all active:scale-95"
          >
            <AlertTriangle size={14} className="text-amber-400" />
            <span>إبلاغ عن حالة</span>
          </button>
        </div>

        {/* Improved Exchange Rates Section */}
        <div className="px-1">
           <ExchangeRateWidget rates={exchangeRates} />
        </div>

        {/* Modern Search Bar */}
        <div className="sticky top-[84px] z-30 transition-all px-1">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-sky-500/20 rounded-[28px] blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity" />
             <div className="relative">
               <input 
                 type="text" 
                 placeholder="ابحث عن منتج أو سعر..." 
                 className="w-full bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-white/5 rounded-[24px] px-6 py-5 text-sm font-bold pr-14 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white shadow-xl shadow-neutral-100/50 dark:shadow-none"
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
               />
               <Search size={22} className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
               {searchQuery && (
                 <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                 >
                   <X size={18} />
                 </button>
               )}
             </div>
          </div>
        </div>

        {/* Pill Selection Sections */}
        <div className="flex flex-col gap-0">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
            <button 
              onClick={() => {
                setSelectedSection('all');
                setSelectedCategory('all');
              }}
              className={cn(
                "px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
                selectedSection === 'all' 
                  ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-950 shadow-lg" 
                  : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-white/10 text-neutral-500"
              )}
            >
              الجميع
            </button>

            {sections.map((section) => (
              <button 
                key={section.id}
                onClick={() => {
                  setSelectedSection(section.id);
                  setSelectedCategory('all');
                }}
                className={cn(
                  "px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 whitespace-nowrap",
                  selectedSection === section.id 
                    ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/20" 
                    : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-white/10 text-neutral-500 hover:border-neutral-200"
                )}
              >
                <span>{section.icon || '📦'}</span>
                <span>{section.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Button */}
        <div className="px-1">
           <button 
             onClick={() => setIsFilterExpanded(!isFilterExpanded)}
             className={cn(
               "w-full py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-dashed",
               isFilterExpanded 
                 ? "bg-primary-50 border-primary-200 text-primary-600" 
                 : "bg-neutral-50 border-neutral-200 text-neutral-400 dark:bg-neutral-900 dark:border-white/5"
             )}
           >
             <Filter size={14} />
             {isFilterExpanded ? 'إخفاء خيارات التصفية' : 'خيارات بحث متقدمة'}
           </button>
        </div>

        <AnimatePresence>
          {isFilterExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-3xl"
            >
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-1">القسم الفرعي</label>
                  <div className="relative">
                    <select 
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-3 text-xs font-bold appearance-none dark:text-white border-none"
                    >
                      <option value="all">الكل</option>
                      {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-1">الماركة التجارية</label>
                  <div className="relative">
                    <select 
                      value={selectedBrand}
                      onChange={e => setSelectedBrand(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-3 text-xs font-bold appearance-none dark:text-white border-none"
                    >
                      <option value="all">الكل</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results with modern spacing */}
        <div className="flex flex-col gap-4 mt-2">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
              {filteredProducts.slice(0, 20).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4 bg-white/50 dark:bg-neutral-900/50 rounded-[48px] border border-dashed border-neutral-200 dark:border-white/5">
                <Search size={48} className="text-neutral-200" />
                <h4 className="font-bold text-neutral-400">لا توجد منتجات مطابقة</h4>
            </div>
          )}
        </div>
      </div>

      <ReportForm isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </Layout>
  );
}
