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
        packageId: product.packageId 
      }
    : { 
        agent: product.variants![selectedVariantIndex].agentPrice, 
        wholesale: product.variants![selectedVariantIndex].wholesalePrice, 
        retail: product.variants![selectedVariantIndex].retailPrice,
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
      <div className="flex gap-4">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-2xl object-cover bg-neutral-50 dark:bg-neutral-800 shadow-sm"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center text-neutral-300 dark:text-neutral-700">
            <PackageIcon size={32} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-bold text-lg leading-tight truncate text-neutral-800 dark:text-neutral-100">{product.name}</h3>
            <div className="flex flex-col items-center gap-1">
              <TrendIndicator trend={product.trend} className="w-7 h-7 flex-shrink-0 shadow-lg shadow-neutral-100 dark:shadow-none" />
              <span className={cn(
                "text-[7px] font-black uppercase tracking-tighter",
                product.trend === 'up' ? "text-red-500" : product.trend === 'down' ? "text-green-500" : "text-neutral-300"
              )}>
                {product.trend === 'up' ? 'مرتفع' : product.trend === 'down' ? 'منخفض' : 'مستقر'}
              </span>
            </div>
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium line-clamp-1 mt-0.5">{product.description || 'لا يوجد وصف متاح لهذا المنتج'}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {category && (
              <span className="text-[10px] bg-sky-50 dark:bg-sky-500/10 px-2.5 py-0.5 rounded-lg text-sky-600 dark:text-sky-400 font-bold border border-sky-100/50 dark:border-sky-500/20 flex items-center gap-1">
                {category.icon} {category.name}
              </span>
            )}
            {brand && (
              <span className="text-[10px] bg-neutral-50 dark:bg-neutral-800 px-2.5 py-0.5 rounded-lg text-neutral-500 dark:text-neutral-400 font-bold border border-neutral-100 dark:border-white/5 flex items-center gap-1">
                <Tag size={10} className="opacity-50" /> {brand.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {product.variants && product.variants.length > 0 && (
        <div className="relative">
          <select 
            className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 rounded-xl px-3 py-2 text-[11px] font-bold appearance-none focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white pr-8 dark:text-neutral-300 transition-colors"
            value={selectedVariantIndex}
            onChange={(e) => setSelectedVariantIndex(Number(e.target.value))}
          >
            <option value={-1}>
              {unit?.name} {packages.find((p:any)=>p.id === product.packageId)?.name} (الأساسي)
            </option>
            {product.variants.map((v, idx) => (
              <option key={idx} value={idx}>
                {unit?.name} {packages.find((p:any)=>p.id === v.packageId)?.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>
      )}

      {!(product.variants && product.variants.length > 0) && (pack || unit) && (
        <div className="bg-orange-50/50 dark:bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-100/50 dark:border-orange-500/20 flex items-center gap-1.5 transition-colors">
          <PackageIcon size={12} className="text-orange-500" />
          <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold">{unit?.name} {pack?.name}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 bg-white dark:bg-transparent rounded-xl">
        <PriceBox label="وكيل" price={currentPrices.agent} type="agent" />
        <PriceBox label="جملة" price={currentPrices.wholesale} type="wholesale" />
        <PriceBox label="تجزئة" price={currentPrices.retail} type="retail" />
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

function PriceBox({ label, price, type }: { label: string; price: number; type: 'agent'|'wholesale'|'retail' }) {
  const styles = {
    agent: "text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
    wholesale: "text-indigo-600 bg-indigo-50 border-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:border-indigo-500/20",
    retail: "text-neutral-900 bg-neutral-100 border-neutral-200 dark:text-neutral-100 dark:bg-neutral-800 dark:border-white/5"
  };

  return (
    <div className={cn("flex flex-col items-center py-2 rounded-xl border px-1 transition-colors", styles[type])}>
      <span className="text-[9px] font-black mb-0.5 uppercase tracking-tighter opacity-70">{label}</span>
      <span className="font-accent font-black text-[15px] leading-none mb-1">
        {formatCurrency(price)}
      </span>
    </div>
  );
}
