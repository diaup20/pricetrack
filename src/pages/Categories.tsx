import React from 'react';
import { Layout } from '../components/Layout';
import { CategoryGrid } from '../components/CategoryGrid';
import { useData } from '../contexts/DataContext';
import { LayoutGrid, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function Categories() {
  const { sections, categories, products } = useData();
  const [activeSectionId, setActiveSectionId] = React.useState<string | 'all' | 'unassigned'>('all');

  const filteredCategories = React.useMemo(() => {
    if (activeSectionId === 'all') return categories;
    if (activeSectionId === 'unassigned') {
      return categories.filter(c => !c.sectionId);
    }
    return categories.filter(c => c.sectionId === activeSectionId);
  }, [categories, activeSectionId]);

  const activeSection = sections.find(s => s.id === activeSectionId);
  const unassignedCount = categories.filter(c => !c.sectionId).length;

  return (
    <Layout>
      <div className="flex flex-col gap-6 md:gap-8 pb-32">
        {/* Simplified Header */}
        <header className="flex flex-col gap-8 mt-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-1"
            >
              <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight dark:text-white transition-colors">
                استكشف <span className="text-primary-500">الأقسام</span>
              </h1>
              <p className="text-sm font-medium text-neutral-400 dark:text-neutral-500">تصفح المنتجات حسب التصنيف المناسب</p>
            </motion.div>

            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">إجمالي التصنيفات</span>
              <span className="text-2xl font-display font-black text-primary-600">{categories.length}</span>
            </div>
          </div>
          
          {/* Enhanced Section Pills */}
          <div className="sticky top-0 z-30 -mx-4 px-4 py-2 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-md border-y border-neutral-100 dark:border-white/5">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
              <button 
                onClick={() => setActiveSectionId('all')}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all whitespace-nowrap border",
                  activeSectionId === 'all' 
                    ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/20" 
                    : "bg-white dark:bg-neutral-800 border-neutral-100 dark:border-white/5 text-neutral-500 hover:border-primary-200"
                )}
              >
                <span>🌍</span>
                الكل
              </button>

              {sections.map((section) => (
                <button 
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all whitespace-nowrap border",
                    activeSectionId === section.id 
                      ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/20" 
                      : "bg-white dark:bg-neutral-800 border-neutral-100 dark:border-white/5 text-neutral-500 hover:border-primary-200"
                  )}
                >
                  <span>{section.icon || '📦'}</span>
                  {section.name}
                </button>
              ))}

              {unassignedCount > 0 && (
                <button 
                  onClick={() => setActiveSectionId('unassigned')}
                  className={cn(
                    "relative flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all whitespace-nowrap border",
                    activeSectionId === 'unassigned' 
                      ? "bg-neutral-800 border-neutral-700 text-white shadow-lg" 
                      : "bg-white dark:bg-neutral-800 border-neutral-100 dark:border-white/5 text-neutral-500"
                  )}
                >
                  <span>📦</span>
                  أخرى
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSectionId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
                  <h2 className="text-xl font-display font-black text-neutral-800 dark:text-white">
                    {activeSectionId === 'all' ? 'جميع التصنيفات' : activeSectionId === 'unassigned' ? 'أصناف غير معنونة' : activeSection?.name}
                  </h2>
                </div>
                {activeSectionId !== 'all' && (
                   <span className="text-[10px] font-black text-neutral-400 bg-neutral-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-neutral-100 dark:border-white/5">
                    {filteredCategories.length} أصناف فرعية
                   </span>
                )}
              </div>

              {filteredCategories.length > 0 ? (
                <div className="px-1">
                  <CategoryGrid categories={filteredCategories} products={products} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-white/10 rounded-[48px] gap-4">
                  <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-300">
                    <LayoutGrid size={32} />
                  </div>
                  <h3 className="font-bold text-neutral-800 dark:text-white uppercase tracking-tight">لا توجد محتويات</h3>
                  <p className="text-xs text-neutral-400 max-w-[200px]">لم يتم العثور على أي تصنيفات في هذا القسم حالياً.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
