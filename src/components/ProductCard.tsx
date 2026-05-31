import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useData } from '../contexts/DataContext';
import { Product, Trend, ProductVariant } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { TrendIndicator } from './TrendIndicator';
import { Calendar, Tag, Package as PackageIcon, ChevronDown, AlertTriangle, Star, MessageSquare, Share2, Check } from 'lucide-react';
import { ProductReviews } from './ProductReviews';
import { ReportForm } from './ReportForm';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ProductCardProps {
  product: Product;
  key?: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const { sections, categories, brands, units, packages, exchangeRates, reviews } = useData();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(-1); 
  const [showReportForm, setShowReportForm] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [copied, setCopied] = useState(false);

  const productReviews = React.useMemo(() => {
    return reviews.filter(r => r.productId === product.id);
  }, [reviews, product.id]);

  const ratingStats = React.useMemo(() => {
    const total = productReviews.length;
    if (total === 0) return { average: 0, count: 0 };
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: Math.round((sum / total) * 10) / 10,
      count: total
    };
  }, [productReviews]);
  
  const category = categories.find((c: any) => c.id === product.categoryId);
  const section = sections.find((s: any) => s.id === category?.sectionId);
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

  const handleShare = async () => {
    const shareTitle = `تطبيق كم سعره - تفاصيل سعر ${product.name}`;
    const shareText = `🔍 تفاصيل سعر المنتج: *${product.name}*
${product.origin ? `🌍 بلد المنشأ: ${product.origin}\n` : ''}📦 الحجم/العبوة: ${pack?.name || 'الأساسي'}
💰 سعر المستهلك: *${formatCurrency(currentPrices.retail)}*
📈 حالة السعر: ${currentPrices.trend === 'up' ? 'مرتفع 🔺' : currentPrices.trend === 'down' ? 'منخفض 🔻' : 'مستقر 🔹'}
📆 آخر تحديث: ${product.lastUpdatedAt ? format(new Date(product.lastUpdatedAt.seconds * 1000), 'd MMMM yyyy', { locale: ar }) : 'مؤخراً'}

🇾🇪 المبادرة الوطنية لرقابة أسعار السلع - وزارة الاقتصاد والصناعة والاستثمار.`;
    const shareUrl = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share API canceled or failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareTitle}\n\n${shareText}\n\nرابط المنصة: ${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error('Clipboard fallback failed:', err);
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-900 rounded-xl p-3 shadow-sm border border-neutral-100 dark:border-white/5 flex flex-col gap-2 transition-colors group"
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
              <span className="text-xs">{section?.icon || '📦'}</span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mx-1">{section?.name || 'عام'}</span>
              <span className="text-neutral-300 dark:text-neutral-700 mx-1 text-[10px]">{'<'}</span>
              <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">{category?.name}</span>
            </div>
            <h3 className="font-display font-bold text-base leading-tight truncate text-neutral-800 dark:text-neutral-100">{product.name}</h3>
            
            {/* Consumer ratings link and average indicator */}
            <button
              type="button"
              onClick={() => setShowReviews(true)}
              className="flex items-center gap-1.5 mt-1 hover:text-primary-500 transition-all text-right group/rate"
            >
              <div className="flex items-center text-amber-400">
                {ratingStats.count > 0 ? (
                  <>
                    <Star size={11} className="fill-amber-400" />
                    <span className="text-[11px] font-black text-neutral-700 dark:text-neutral-300 mr-1 font-accent leading-none group-hover/rate:text-primary-500">
                      {ratingStats.average.toFixed(1)}
                    </span>
                  </>
                ) : (
                  <>
                    <Star size={11} className="text-neutral-300 dark:text-neutral-600" />
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold mr-1 leading-none">
                      لا توجد تقييمات
                    </span>
                  </>
                )}
              </div>
              {ratingStats.count > 0 && (
                <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-black">
                  ({ratingStats.count} {ratingStats.count >= 3 && ratingStats.count <= 10 ? 'تقييمات' : 'تقييم'})
                </span>
              )}
              <span className="text-[9px] text-primary-600 dark:text-primary-400 font-black hover:underline bg-primary-50 dark:bg-primary-500/10 px-1.5 py-0.5 rounded-md mr-1.5">
                شاهد واكتب تقييماً
              </span>
            </button>
            
            {brand && (
              <div className="flex flex-col gap-1.5 mt-1.5 font-sans">
                <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                  <Tag size={10} className="text-primary-500" />
                  <span className="text-[10px] font-medium">العلامة التجارية:</span>
                  <span className="text-[10px] font-semibold text-neutral-900 dark:text-white">{brand.name}</span>
                </div>
                {product.origin && (
                  <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                    <span className="text-[10px]" role="img" aria-label="origin">🌍</span>
                    <span className="text-[10px] font-medium">بلد المنشأ:</span>
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">{product.origin}</span>
                  </div>
                )}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReportForm(true)}
                  className="w-fit flex items-center gap-2 px-4 py-2 mt-1 rounded-xl bg-red-500 dark:bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all active:scale-95 group/btn"
                >
                  <AlertTriangle size={14} className="group-hover/btn:animate-bounce" />
                  <span className="text-[11px] font-black uppercase tracking-tight">إبلاغ عن سعر</span>
                </motion.button>
              </div>
            )}
            {!brand && product.origin && (
              <div className="flex flex-col gap-1.5 mt-1.5 font-sans">
                <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                  <span className="text-[10px]" role="img" aria-label="origin">🌍</span>
                  <span className="text-[10px] font-medium">بلد المنشأ:</span>
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">{product.origin}</span>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReportForm(true)}
                  className="w-fit flex items-center gap-2 px-4 py-2 mt-1 rounded-xl bg-red-500 dark:bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all active:scale-95 group/btn"
                >
                  <AlertTriangle size={14} className="group-hover/btn:animate-bounce" />
                  <span className="text-[11px] font-black uppercase tracking-tight">إبلاغ عن سعر</span>
                </motion.button>
              </div>
            )}
            {!brand && !product.origin && (
              <div className="flex flex-col gap-1.5 mt-1.5">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReportForm(true)}
                  className="w-fit flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 dark:bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all active:scale-95 group/btn"
                >
                  <AlertTriangle size={14} className="group-hover/btn:animate-bounce" />
                  <span className="text-[11px] font-black uppercase tracking-tight">إبلاغ عن سعر</span>
                </motion.button>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
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
        </div>
      </div>

      {/* Sizes Section - Now with buttons */}
      <div className="flex flex-col gap-2 mt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">الأحجام المتوفرة</span>
          <div className="h-px flex-1 mx-3 bg-neutral-100 dark:bg-white/5" />
        </div>
        <div className="flex flex-wrap gap-2 px-0.5">
          <button 
            onClick={() => setSelectedVariantIndex(-1)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border",
              selectedVariantIndex === -1 
                ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/20 scale-105" 
                : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-100 dark:border-white/5 hover:border-primary-200 dark:hover:border-primary-900/30"
            )}
          >
            {packages.find((p: any) => p.id === product.packageId)?.name || 'الأساسي'}
          </button>
          {product.variants?.map((v, idx) => (
            <button 
              key={idx}
              onClick={() => setSelectedVariantIndex(idx)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border",
                selectedVariantIndex === idx 
                  ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/20 scale-105" 
                  : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-100 dark:border-white/5 hover:border-primary-200 dark:hover:border-primary-900/30"
              )}
            >
              {packages.find((p: any) => p.id === v.packageId)?.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1 mt-1 p-2.5 rounded-xl bg-primary-500/[0.04] dark:bg-white/[0.04] border border-primary-500/10 dark:border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-primary-700 dark:text-primary-400 uppercase tracking-tight">سعر المستهلك</span>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black text-primary-600 dark:text-primary-400 font-accent tracking-tighter">
              {formatCurrency(currentPrices.retail)}
            </span>
          </div>
        </div>

        {currentPrices.previousRetail !== undefined && currentPrices.previousRetail !== currentPrices.retail && (
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">السعر السابق</span>
            <span className="text-sm font-bold line-through text-neutral-400 dark:text-neutral-500 font-accent tracking-tighter opacity-80">
              {formatCurrency(currentPrices.previousRetail)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-dashed border-neutral-100 dark:border-white/10">
          <div className="flex items-center gap-1 text-primary-500 dark:text-primary-400">
            <Calendar size={10} className="stroke-[3]" />
            <span className="text-[10px] font-bold uppercase">آخر تحديث</span>
          </div>
          <span className="text-[10px] font-semibold text-neutral-800 dark:text-white bg-neutral-50 dark:bg-white/5 px-1.5 py-0.5 rounded">
            {product.lastUpdatedAt ? format(new Date(product.lastUpdatedAt.seconds * 1000), 'd MMM yyyy', { locale: ar }) : 'جديد'}
          </span>
        </div>
      </div>

      {/* Share Action Button */}
      <div className="mt-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShare}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all font-black text-[11px] border border-dashed",
            copied
              ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
              : "bg-primary-500/[0.04] dark:bg-white/[0.04] text-primary-600 dark:text-primary-400 border-primary-500/10 hover:bg-primary-500/[0.08]"
          )}
        >
          {copied ? <Check size={13} className="stroke-[3]" /> : <Share2 size={13} />}
          <span>{copied ? 'تم نسخ التفاصيل!' : 'مشاركة تفاصيل السعر'}</span>
        </motion.button>
      </div>

      <ReportForm 
        isOpen={showReportForm} 
        onClose={() => setShowReportForm(false)} 
      />

      <ProductReviews
        productId={product.id}
        productName={product.name}
        isOpen={showReviews}
        onClose={() => setShowReviews(false)}
      />
    </motion.div>
  );
}
