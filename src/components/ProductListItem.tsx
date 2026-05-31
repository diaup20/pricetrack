import React from 'react';
import { motion } from 'motion/react';
import { useData } from '../contexts/DataContext';
import { Product } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { TrendIndicator } from './TrendIndicator';
import { Tag, Package as PackageIcon } from 'lucide-react';

interface ProductListItemProps {
  product: Product;
  key?: any;
}

export function ProductListItem({ product }: ProductListItemProps) {
  const { categories, brands, units, packages } = useData();
  
  const category = categories.find((c: any) => c.id === product.categoryId);
  const brand = brands.find((b: any) => b.id === product.brandId);
  const unit = units.find((u: any) => u.id === product.unitId);
  const pack = packages.find((p: any) => p.id === product.packageId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-neutral-900 rounded-2xl p-3 shadow-sm border border-neutral-100 dark:border-white/5 flex items-center gap-4 group hover:border-primary-100 dark:hover:border-primary-900/50 transition-colors"
    >
      <div className="relative flex-shrink-0">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-xl object-cover bg-neutral-50 dark:bg-neutral-800"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-300 dark:text-neutral-700">
            <PackageIcon size={24} />
          </div>
        )}
        <div className="absolute -top-1 -right-1">
          <TrendIndicator trend={product.trend} className="w-4 h-4 shadow-sm" />
        </div>
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <h3 className="font-display font-bold text-base text-neutral-800 dark:text-neutral-100 truncate leading-tight group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2.5 mt-1.5">
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium bg-neutral-50 dark:bg-neutral-800/50 px-2 py-0.5 rounded-lg border border-neutral-100 dark:border-white/5">
             {unit?.name} {pack?.name}
          </span>
          {brand && (
            <span className="text-[11px] bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-lg text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100/50 dark:border-indigo-500/20 flex items-center gap-1 shadow-sm">
              <Tag size={10} className="opacity-70" /> {brand.name}
            </span>
          )}
          {product.origin && (
            <span className="text-[11px] bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-lg text-amber-600 dark:text-amber-400 font-bold border border-amber-100/50 dark:border-amber-500/20 flex items-center gap-1.5 shadow-sm">
              <span role="img" aria-label="origin" className="text-[11px]">🌍</span> {product.origin}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex flex-col items-end">
          <div className={cn(
            "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all shadow-sm",
            product.previousRetailPrice && product.previousRetailPrice !== product.retailPrice
              ? (product.retailPrice > product.previousRetailPrice ? "bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30" : "bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/30")
              : "bg-primary-500/[0.03] dark:bg-primary-500/[0.07] border-primary-500/20 dark:border-primary-500/30"
          )}>
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black opacity-40 uppercase tracking-widest leading-none mb-0.5">مستهلك</span>
              <span className={cn(
                "font-accent font-black text-sm transition-colors tracking-tighter leading-none",
                product.previousRetailPrice && product.previousRetailPrice !== product.retailPrice
                  ? (product.retailPrice > product.previousRetailPrice ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400")
                  : "text-neutral-900 dark:text-white"
              )}>
                {formatCurrency(product.retailPrice)}
              </span>
            </div>
          </div>
          {product.previousRetailPrice && product.previousRetailPrice !== product.retailPrice && (
            <div className="flex items-center gap-1.5 bg-neutral-900/5 dark:bg-white/5 px-2.5 py-1 rounded-lg mt-1.5 border border-dashed border-neutral-200 dark:border-white/10">
              <span className="text-[8px] font-black text-neutral-400 uppercase">السابق:</span>
              <span className="text-[12px] font-black text-neutral-500 line-through decoration-neutral-400/30">{formatCurrency(product.previousRetailPrice)}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
