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
  const getStats = (categoryId: string): CategoryStats => {
    const catProducts = products.filter(p => p.categoryId === categoryId);
    return {
      total: catProducts.length,
      up: catProducts.filter(p => p.trend === 'up').length,
      down: catProducts.filter(p => p.trend === 'down').length,
      stable: catProducts.filter(p => p.trend === 'stable').length,
    };
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((cat) => {
        const stats = getStats(cat.id);
        return (
          <Link key={cat.id} to={`/category/${cat.id}`}>
            <motion.div
              whileHover={{ y: -4, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              whileTap={{ scale: 0.98 }}
              className="bg-white dark:bg-neutral-900 p-5 rounded-[32px] shadow-sm border border-neutral-100 dark:border-white/5 flex flex-col gap-3 h-full transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="bg-neutral-50 dark:bg-neutral-800 p-2.5 rounded-2xl text-2xl shadow-inner group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10 transition-colors">
                  {cat.icon || '📦'}
                </div>
                <div className="p-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowLeft size={14} className="text-primary-500" />
                </div>
              </div>
              <div className="mt-1">
                <h3 className="font-display font-black text-neutral-800 dark:text-neutral-100 truncate text-[15px]">{cat.name}</h3>
                <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mt-0.5 tracking-wider uppercase">{stats.total.toLocaleString('en-US')} منتجات</p>
              </div>
              <div className="flex flex-wrap gap-1 mt-auto pt-2">
                <MiniStat count={stats.up} color="text-red-500" icon={<ArrowUp size={8} />} />
                <MiniStat count={stats.down} color="text-green-500" icon={<ArrowDown size={8} />} />
                <MiniStat count={stats.stable} color="text-blue-500" icon={<Minus size={8} />} />
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}

function MiniStat({ count, color, icon }: { count: number; color: string; icon: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <div className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/50 dark:border-white/5", color)}>
      {icon}
      <span className="text-[8px] font-black">{count.toLocaleString('en-US')}</span>
    </div>
  );
}
