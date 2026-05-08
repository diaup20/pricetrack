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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {categories.map((cat, index) => {
        const data = getCategoryData(cat.id);
        const timeAgo = data.latestUpdate ? data.latestUpdate.toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }) : null;

        return (
          <Link key={cat.id} to={`/category/${cat.id}`} className="block h-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -6, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="relative h-full flex flex-col p-5 md:p-6 bg-white dark:bg-neutral-900 rounded-[32px] md:rounded-[40px] border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-2xl dark:hover:shadow-none transition-all duration-500 overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-150" />
              
              <div className="relative z-10 flex flex-col h-full gap-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 rounded-2xl md:rounded-3xl text-2xl md:text-3xl shadow-inner group-hover:bg-primary-500 transition-all duration-500 group-hover:text-white">
                    <span className="group-hover:filter group-hover:brightness-0 group-hover:invert">
                      {cat.icon || '📦'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5">
                    {data.up > 0 && (
                      <div className="flex items-center gap-1 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-100/50 dark:border-red-500/10">
                        <ArrowUp size={10} className="text-red-500" />
                        <span className="text-[10px] font-black text-red-600 dark:text-red-400">{data.up}</span>
                      </div>
                    )}
                    {data.down > 0 && (
                      <div className="flex items-center gap-1 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-lg border border-green-100/50 dark:border-green-500/10">
                        <ArrowDown size={10} className="text-green-500" />
                        <span className="text-[10px] font-black text-green-600 dark:text-green-400">{data.down}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-auto flex flex-col gap-1">
                  <h3 className="font-display font-black text-neutral-900 dark:text-white text-base md:text-lg tracking-tight group-hover:text-primary-500 transition-colors">
                    {cat.name}
                  </h3>
                  
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] md:text-[11px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest leading-none">
                        {data.count} أصناف
                      </span>
                      {timeAgo && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                            <span className="text-[9px] md:text-[10px] font-black text-primary-500 uppercase tracking-wider">{timeAgo}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-6 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                <div className="bg-primary-500 text-white p-1.5 rounded-full shadow-lg">
                  <ArrowLeft size={14} />
                </div>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}


