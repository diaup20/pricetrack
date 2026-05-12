import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useData } from '../contexts/DataContext';
import { Product, Trend, ProductVariant } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { TrendIndicator } from './TrendIndicator';
import { Calendar, Tag, Package as PackageIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ProductCardProps {
  product: Product;
  key?: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const { categories, brands, units, packages } = useData();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(-1); // -1 means base product
  
  const category = categories.find((c: any) => c.id === product.categoryId);
  const brand = brands.find((b: any) => b.id === product.brandId);
  const unit = units.find((u: any) => u.id === product.unitId);
  
  const currentPrices = selectedVariantIndex === -1 
    ? { 
        agent: product.agentPrice, 
        wholesale: product.wholesalePrice, 
        retail: product.retailPrice, 
        previousRetail: product.previousRetailPrice,
        trend: product.trend,
        packageId: product.packageId 
      }
    : { 
        agent: product.variants![selectedVariantIndex].agentPrice, 
        wholesale: product.variants![selectedVariantIndex].wholesalePrice, 
        retail: product.variants![selectedVariantIndex].retailPrice,
        previousRetail: product.variants![selectedVariantIndex].previousRetailPrice,
        trend: product.variants![selectedVariantIndex].trend,
        packageId: product.variants![selectedVariantIndex].packageId 
      };

  const pack = packages.find((p: any) => p.id === currentPrices.packageId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-900 rounded-xl p-3 shadow-sm border border-neutral-100 dark:border-white/5 flex flex-col gap-2 transition-colors"
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-sm leading-tight truncate text-neutral-800 dark:text-neutral-100">{product.name}</h3>
            <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium line-clamp-1">{product.description || 'لا يوجد وصف'}</p>
          </div>
          <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800/50 px-1.5 py-0.5 rounded-md border border-neutral-100 dark:border-white/5">
            <TrendIndicator trend={currentPrices.trend} className="w-3.5 h-3.5 flex-shrink-0" />
            <span className={cn(
              "text-[8px] font-black uppercase tracking-tighter",
              currentPrices.trend === 'up' ? "text-red-500" : currentPrices.trend === 'down' ? "text-green-500" : "text-neutral-400"
            )}>
              {currentPrices.trend === 'up' ? 'مرتفع' : currentPrices.trend === 'down' ? 'منخفض' : 'مستقر'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-0.5">
          {category && (
            <span className="text-[8px] bg-sky-50 dark:bg-sky-500/10 px-1.5 py-0.5 rounded text-sky-600 dark:text-sky-400 font-bold border border-sky-100/50 dark:border-sky-500/20">
              {category.name}
            </span>
          )}
          {brand && (
            <span className="text-[8px] bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100/50 dark:border-indigo-500/20">
              {brand.name}
            </span>
          )}
        </div>
      </div>

      {product.variants && product.variants.length > 0 && (
        <div className="flex flex-col gap-1 p-1.5 rounded-lg bg-neutral-50/50 dark:bg-white/[0.02] border border-neutral-100 dark:border-white/5">
          <div className="relative group">
            <select
              className="w-full bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 rounded px-2 py-1 text-[11px] font-black appearance-none focus:outline-none pl-6 text-neutral-900 dark:text-white cursor-pointer"
              value={selectedVariantIndex}
              onChange={(e) => setSelectedVariantIndex(Number(e.target.value))}
            >
              <option value={-1}>
                {packages.find((p: any) => p.id === product.packageId)?.name || 'الأساسي'}
              </option>
              {product.variants.map((v, idx) => (
                <option key={idx} value={idx}>
                  {packages.find((p: any) => p.id === v.packageId)?.name}
                </option>
              ))}
            </select>
            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
              <ChevronDown size={10} strokeWidth={3} />
            </div>
          </div>
        </div>
      )}

      {!(product.variants && product.variants.length > 0) && (pack || unit) && (
        <div className="bg-orange-50/30 dark:bg-orange-500/5 px-2 py-0.5 rounded border border-orange-100/30 dark:border-orange-500/10 flex items-center gap-1">
          <PackageIcon size={8} className="text-orange-400" />
          <span className="text-[8px] text-orange-600 dark:text-orange-400 font-bold">{unit?.name} {pack?.name}</span>
        </div>
      )}

      <div className="flex flex-col gap-1 mt-1 p-2 rounded-lg bg-primary-500/[0.04] dark:bg-white/[0.04] border border-primary-500/10 dark:border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-tight">سعر المستهلك</span>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black text-primary-600 dark:text-primary-400 font-accent tracking-tighter">
              {formatCurrency(currentPrices.retail)}
            </span>
            {currentPrices.previousRetail !== undefined && currentPrices.previousRetail !== currentPrices.retail && (
              <div className={cn(
                "text-[7px] font-black px-1 py-0.5 rounded flex items-center shadow-sm text-white",
                (currentPrices.retail - currentPrices.previousRetail) > 0 ? "bg-red-500 shadow-red-500/20" : "bg-green-500 shadow-green-500/20"
              )}>
                {((currentPrices.retail - currentPrices.previousRetail) / currentPrices.previousRetail * 100).toFixed(0)}%
              </div>
            )}
          </div>
        </div>

        {currentPrices.previousRetail !== undefined && currentPrices.previousRetail !== currentPrices.retail && (
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400">السعر السابق</span>
            <span className="text-xs font-black line-through text-neutral-400 dark:text-neutral-500 font-accent tracking-tighter opacity-80">
              {formatCurrency(currentPrices.previousRetail)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-dashed border-neutral-100 dark:border-white/10">
          <div className="flex items-center gap-1 text-primary-500 dark:text-primary-400">
            <Calendar size={10} className="stroke-[3]" />
            <span className="text-[9px] font-black uppercase">آخر تحديث</span>
          </div>
          <span className="text-[10px] font-black text-neutral-900 dark:text-white bg-neutral-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
            {product.lastUpdatedAt ? format(new Date(product.lastUpdatedAt.seconds * 1000), 'd MMM yyyy', { locale: ar }) : 'جديد'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
