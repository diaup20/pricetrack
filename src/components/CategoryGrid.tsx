import React from 'react';
import { motion } from 'motion/react';
import { Category, Product, CategoryStats } from '../types';
import { ArrowLeft, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface CategoryGridProps {
  categories: Category[];
  products: Product[];
}

export function CategoryGrid({ categories, products }: CategoryGridProps) {
  const getCategoryData = (categoryId: string) => {
    const catProducts = products.filter(p => p.categoryId === categoryId);
    const latestUpdate = catProducts.length > 0 
      ? Math.max(...catProducts.map(p => p.lastUpdatedAt?.seconds || 0))
      : 0;

    return {
      count: catProducts.length,
      up: catProducts.filter(p => p.trend === 'up').length,
      down: catProducts.filter(p => p.trend === 'down').length,
      latestUpdate: latestUpdate > 0 ? new Date(latestUpdate * 1000) : null
    };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((cat, index) => {
        const data = getCategoryData(cat.id);

        return (
          <Link key={cat.id} to={`/category/${cat.id}`} className="group">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.05, 
                duration: 0.5,
                ease: [0.19, 1, 0.22, 1]
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative p-5 bg-white dark:bg-neutral-900 rounded-[32px] border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:border-primary-500/30 transition-all duration-500 overflow-hidden flex items-center justify-between gap-4"
            >
              {/* Highlight background on hover */}
              <div className="absolute inset-0 bg-primary-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-2xl group-hover:bg-primary-500 group-hover:text-white transition-all duration-500 shadow-inner overflow-hidden">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    cat.icon || '🛍️'
                  )}
                </div>
                <div>
                  <h3 className="font-display font-black text-neutral-800 dark:text-neutral-100 text-base leading-tight transition-colors group-hover:text-primary-600">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                      {data.count} أصناف متوفرة
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-end gap-1.5">
                {(data.up > 0 || data.down > 0) && (
                  <div className="flex items-center -space-x-1 rtl:space-x-reverse">
                    {data.up > 0 && (
                      <div className="w-6 h-6 flex items-center justify-center bg-red-50 dark:bg-red-500/10 rounded-full border-2 border-white dark:border-neutral-900 shadow-sm">
                        <ArrowUp size={10} className="text-red-500" />
                      </div>
                    )}
                    {data.down > 0 && (
                      <div className="w-6 h-6 flex items-center justify-center bg-green-50 dark:bg-green-500/10 rounded-full border-2 border-white dark:border-neutral-900 shadow-sm">
                        <ArrowDown size={10} className="text-green-500" />
                      </div>
                    )}
                  </div>
                )}
                <div className="p-2 rounded-full bg-neutral-50 dark:bg-neutral-800 group-hover:bg-primary-500/10 transition-colors">
                  <ArrowLeft size={14} className="text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all ltr:rotate-180" />
                </div>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}


