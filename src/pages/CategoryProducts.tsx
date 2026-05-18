import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Layout } from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { ProductListItem } from '../components/ProductListItem';
import { ArrowRight, Filter, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function CategoryProducts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sections, categories, products } = useData();

  const category = categories.find(c => c.id === id);
  const section = sections.find(s => s.id === category?.sectionId);
  const categoryProducts = products.filter(p => p.categoryId === id);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="bg-white dark:bg-neutral-900 p-2.5 rounded-2xl shadow-sm border border-neutral-100/50 dark:border-white/5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all hover:scale-105 active:scale-95"
              >
                <ArrowRight size={22} />
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xl">{section?.icon || '📦'}</span>
                  <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{section?.name || 'تصنيف عام'}</span>
                </div>
                <h2 className="text-2xl font-display font-black text-neutral-900 dark:text-white leading-tight">
                  {category?.name || 'القسم'}
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                className="bg-white dark:bg-neutral-900 p-2.5 rounded-2xl shadow-sm border border-neutral-100/50 dark:border-white/5 text-neutral-400 dark:text-neutral-300 hover:text-primary-500 transition-colors"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List size={22} /> : <LayoutGrid size={22} />}
              </motion.button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{categoryProducts.length.toLocaleString('en-US')} منتج متوفر حالياً</p>
              </div>
          </div>
        </header>

        <div className="flex flex-col gap-4">
          {categoryProducts.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div 
                key={viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "grid gap-4 transition-all duration-300",
                  viewMode === 'grid' ? "grid-cols-1" : "grid-cols-1"
                )}
              >
                {categoryProducts.map((product) => (
                  viewMode === 'grid' 
                    ? <ProductCard key={product.id} product={product} />
                    : <ProductListItem key={product.id} product={product} />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-24 text-neutral-400 flex flex-col items-center gap-4 bg-white/50 dark:bg-neutral-900/50 rounded-[40px] border border-dashed border-neutral-200 dark:border-white/5 transition-colors">
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-sm text-4xl">📦</div>
              <div className="flex flex-col gap-1">
                 <p className="font-bold text-neutral-600 dark:text-neutral-300">لا توجد منتجات</p>
                 <p className="text-[10px]">سيتم إضافة منتجات لهذا القسم قريباً</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
