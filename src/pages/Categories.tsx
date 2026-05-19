import React from 'react';
import { Layout } from '../components/Layout';
import { CategoryGrid } from '../components/CategoryGrid';
import { useData } from '../contexts/DataContext';
import { LayoutGrid, ArrowLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Categories() {
  const { sections, categories, products } = useData();
  const [activeSectionId, setActiveSectionId] = React.useState<string | 'all'>('all');

  const filteredCategories = React.useMemo(() => {
    if (activeSectionId === 'all') return categories;
    return categories.filter(c => c.sectionId === activeSectionId);
  }, [categories, activeSectionId]);

  const activeSection = sections.find(s => s.id === activeSectionId);

  // Stats calculation
  const getSectionStats = (sectionId: string) => {
    const cats = categories.filter(c => c.sectionId === sectionId);
    return {
      catCount: cats.length,
      prodCount: products.filter(p => cats.some(c => c.id === p.categoryId)).length
    };
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 md:gap-10 pb-32">
        {/* Modern Header */}
        <header className="pt-6 px-1">
          <div className="flex items-center justify-between mb-4">
             <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-primary-500/10 text-primary-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
             >
               <Sparkles size={12} />
               التصنيفات الذكية
             </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-4xl font-display font-black tracking-tight dark:text-white leading-none">
              اختر <span className="text-primary-500">التصنيف</span>
            </h1>
            <p className="text-sm font-medium text-neutral-400 dark:text-neutral-500 max-w-[280px]">تصفح السلع والمنتجات حسب التصنيفات الرسمية المعتمدة</p>
          </motion.div>
        </header>

        {/* Section Navigation (Sticky Pills) */}
        <div className="sticky top-0 z-40 -mx-4 px-4 py-3 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-100 dark:border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setActiveSectionId('all')}
              className={cn(
                "flex-shrink-0 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                activeSectionId === 'all' 
                  ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-lg" 
                  : "bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/10 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              )}
            >
              الكل
            </button>

            {sections.map((section) => (
              <button 
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
                  activeSectionId === section.id 
                    ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/20" 
                    : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-white/10 text-neutral-400 hover:border-neutral-200"
                )}
              >
                {section.image ? (
                  <img src={section.image} alt="" className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span>{section.icon || '📦'}</span>
                )}
                <span>{section.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSectionId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col gap-8"
            >
              {/* If All is selected, show Section Cards first */}
              {activeSectionId === 'all' && (
                <div className="grid grid-cols-1 gap-4 px-1">
                  <div className="flex items-center justify-between px-1 mb-2">
                    <h2 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">الأقسام الكبرى</h2>
                    <span className="text-[10px] font-bold text-primary-500">{sections.length} قسم</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {sections.map((section, idx) => {
                      const stats = getSectionStats(section.id);
                      return (
                        <motion.button
                          key={section.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => setActiveSectionId(section.id)}
                          className="group relative overflow-hidden rounded-[32px] bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 p-5 flex items-center justify-between transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm hover:shadow-xl hover:border-primary-500/30"
                        >
                          <div className="flex items-center gap-5">
                            <div className="relative w-16 h-16 rounded-2xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-3xl group-hover:bg-primary-500 group-hover:text-white transition-all shadow-inner overflow-hidden">
                               {section.image ? (
                                 <img src={section.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                               ) : (
                                 <span>{section.icon || '📦'}</span>
                               )}
                            </div>
  
                            <div className="text-right">
                               <h3 className="font-display font-black text-neutral-800 dark:text-white text-lg leading-tight">{section.name}</h3>
                               <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
                                 {stats.catCount} تصنيفات • {stats.prodCount} منتجات
                               </p>
                            </div>
                          </div>
  
                          <div className="flex items-center gap-3">
                             <div className="hidden sm:flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity">
                               <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest">استكشف القسم</span>
                             </div>
                             <div className="w-10 h-10 rounded-full bg-neutral-50 dark:bg-neutral-800 group-hover:bg-primary-500 group-hover:text-white flex items-center justify-center transition-all shadow-sm">
                                <ArrowLeft size={16} className="ltr:rotate-180" />
                             </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub Categories Section - Only show when a specific section is selected */}
              {activeSectionId !== 'all' && (
                <div className="space-y-6 px-1">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
                      <h2 className="text-xl font-display font-black text-neutral-800 dark:text-white">
                        {activeSection?.name}
                      </h2>
                    </div>
                    <span className="bg-neutral-100 dark:bg-white/5 text-neutral-400 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest">
                      {filteredCategories.length}
                    </span>
                  </div>

                  {filteredCategories.length > 0 ? (
                    <CategoryGrid categories={filteredCategories} products={products} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-[48px] gap-4 shadow-sm">
                      <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-200">
                        <LayoutGrid size={32} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-neutral-800 dark:text-white">لا توجد محتويات</h3>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest">يرجى المحاولة في قسم آخر</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
