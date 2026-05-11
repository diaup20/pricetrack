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
      className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm border border-neutral-100 dark:border-white/5 flex flex-col gap-3 transition-colors"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-lg leading-tight truncate text-neutral-800 dark:text-neutral-100">{product.name}</h3>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium line-clamp-1 mt-0.5">{product.description || 'لا يوجد وصف متاح لهذا المنتج'}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <TrendIndicator trend={currentPrices.trend} className="w-7 h-7 flex-shrink-0 shadow-lg shadow-neutral-100 dark:shadow-none" />
            <span className={cn(
              "text-[7px] font-black uppercase tracking-tighter",
              currentPrices.trend === 'up' ? "text-red-500" : currentPrices.trend === 'down' ? "text-green-500" : "text-neutral-300"
            )}>
              {currentPrices.trend === 'up' ? 'مرتفع' : currentPrices.trend === 'down' ? 'منخفض' : 'مستقر'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-1">
          {category && (
            <span className="text-[10px] bg-sky-50 dark:bg-sky-500/10 px-2.5 py-0.5 rounded-lg text-sky-600 dark:text-sky-400 font-bold border border-sky-100/50 dark:border-sky-500/20 flex items-center gap-1">
              {category.icon} {category.name}
            </span>
          )}
          {brand && (
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-lg text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100/50 dark:border-indigo-500/20 flex items-center gap-1 shadow-sm">
              <Tag size={10} className="opacity-70" /> {brand.name}
            </span>
          )}
        </div>
      </div>

      {product.variants && product.variants.length > 0 && (
        <div className="flex flex-col gap-2 p-3.5 rounded-[24px] bg-primary-500/[0.04] dark:bg-white/[0.03] border border-primary-500/10 dark:border-white/10 shadow-sm">
          <label className="text-[11px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
            <PackageIcon size={14} className="opacity-80" /> اختر الحجم المطلوب
          </label>
          <div className="relative group">
            <select
              className="w-full bg-white dark:bg-neutral-800 border-2 border-transparent dark:border-white/5 rounded-2xl px-4 py-3.5 text-[14px] font-black appearance-none focus:outline-none focus:border-primary-500/40 focus:ring-4 focus:ring-primary-500/5 pl-12 text-neutral-900 dark:text-white transition-all cursor-pointer shadow-md shadow-primary-500/5 group-hover:shadow-lg group-hover:shadow-primary-500/10"
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
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-500/20 p-2 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-sm border border-primary-500/10 group-focus-within:bg-primary-500 group-focus-within:text-white">
              <ChevronDown size={14} strokeWidth={3} />
            </div>
          </div>
        </div>
      )}

      {!(product.variants && product.variants.length > 0) && (pack || unit) && (
        <div className="bg-orange-50/50 dark:bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-100/50 dark:border-orange-500/20 flex items-center gap-1.5 transition-colors">
          <PackageIcon size={12} className="text-orange-500" />
          <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold">{unit?.name} {pack?.name}</span>
        </div>
      )}

      <div className="bg-white dark:bg-transparent rounded-xl flex flex-col gap-1">
        <PriceBox 
          label="سعر المستهلك" 
          price={currentPrices.retail} 
          previousPrice={currentPrices.previousRetail}
          type="retail" 
        />
      </div>

      <div className="flex items-center justify-between text-[11px] border-t border-dashed border-neutral-100 dark:border-white/5 pt-2 transition-colors">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <Calendar size={12} className="text-primary-500" />
          <span className="font-bold text-neutral-600 dark:text-neutral-400">
            تحديث: <span className="text-neutral-900 dark:text-white">{product.lastUpdatedAt ? format(new Date(product.lastUpdatedAt.seconds * 1000), 'd MMM yyyy', { locale: ar }) : 'جديد'}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function PriceBox({ label, price, previousPrice, type }: { label: string; price: number; previousPrice?: number; type: 'agent'|'wholesale'|'retail' }) {
  const styles = {
    agent: "text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
    wholesale: "text-indigo-600 bg-indigo-50 border-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:border-indigo-500/20",
    retail: "text-neutral-900 bg-primary-500/5 border-primary-500/20 dark:text-white dark:bg-primary-500/10 dark:border-primary-500/30"
  };

  const hasChanged = previousPrice !== undefined && previousPrice !== price;
  const percentChange = hasChanged ? ((price - previousPrice) / previousPrice) * 100 : 0;

  return (
    <div className={cn(
      "flex flex-col items-center py-6 rounded-[32px] border px-4 transition-all group scale-100 hover:scale-[1.03] shadow-sm", 
      styles[type],
      type === 'retail' && "border-primary-500/30 bg-gradient-to-b from-primary-500/[0.08] to-transparent dark:from-primary-500/[0.15] ring-4 ring-primary-500/5"
    )}>
      <span className={cn(
        "text-[10px] font-black mb-3 uppercase tracking-[0.3em] opacity-60",
        type === 'retail' && "text-primary-600 dark:text-primary-400 opacity-100"
      )}>
        {label}
      </span>
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-4">
          <span className={cn(
            "font-accent font-black leading-none tracking-tighter",
            type === 'retail' ? "text-2xl" : "text-xl"
          )}>
            {formatCurrency(price)}
          </span>
          {hasChanged && (
            <div className={cn(
              "text-[11px] font-black px-2.5 py-1.5 rounded-2xl flex items-center gap-1 shadow-lg",
              percentChange > 0 ? "bg-red-500 text-white shadow-red-500/20" : "bg-green-500 text-white shadow-green-500/20"
            )}>
              {percentChange > 0 ? '+' : ''}{percentChange.toFixed(0)}%
            </div>
          )}
        </div>
        {hasChanged && (
          <div className="flex items-center gap-2 bg-neutral-900/10 dark:bg-white/10 px-4 py-1.5 rounded-full mt-2 backdrop-blur-sm">
            <span className="text-[11px] font-bold opacity-60">السعر السابق:</span>
            <span className="text-sm font-black line-through opacity-80 decoration-neutral-400 dark:decoration-neutral-500">{formatCurrency(previousPrice)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
