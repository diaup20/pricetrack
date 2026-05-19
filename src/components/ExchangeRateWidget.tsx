import { motion } from 'motion/react';
import { ExchangeRate } from '../types';
import { formatSAR, cn } from '../lib/utils';
import { TrendIndicator } from './TrendIndicator';
import { RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ExchangeRateWidgetProps {
  rates: ExchangeRate[];
}

export function ExchangeRateWidget({ rates }: ExchangeRateWidgetProps) {
  return (
    <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-black flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-inner">
              <RefreshCw size={18} className="text-primary-300 animate-spin-slow" />
            </div>
            أسعار الصرف اليوم
          </h2>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none">مباشر الآن</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rates.map((rate) => (
            <motion.div
              key={rate.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              className="bg-white/[0.03] backdrop-blur-3xl p-4 rounded-[28px] border border-white/10 group transition-all relative flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/5 group-hover:bg-primary-500/20 transition-all">
                    {rate.fromCurrency.includes('سعودي') ? '🇸🇦' : 
                     rate.fromCurrency.includes('دولار') ? '🇺🇸' : 
                     rate.fromCurrency.includes('يمني') ? '🇾🇪' : '💱'}
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {rate.fromCurrency} 
                      {rate.region && (
                        <span className={cn(
                          "mr-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest",
                          rate.region === 'sanaa' ? "bg-amber-500/20 text-amber-500" : "bg-blue-500/20 text-blue-500"
                        )}>
                          {rate.region === 'sanaa' ? 'صنعاء' : 'عدن'}
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">مقابل {rate.toCurrency}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                   <TrendIndicator trend={rate.trend} className="w-3.5 h-3.5 mb-1" />
                   <span className="text-[9px] font-bold text-white/20 uppercase">معدل مباشر</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-auto">
                <div className="flex-1 flex flex-col items-center py-3 px-2 rounded-2xl bg-black/20 border border-white/5">
                  <span className="text-[10px] font-bold text-primary-400/60 uppercase tracking-widest mb-1">شراء</span>
                  <span className="text-xl font-accent font-black text-primary-400">
                    {(rate.buyRate || rate.rate).toLocaleString('en-US')}
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center py-3 px-2 rounded-2xl bg-black/20 border border-white/5">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">بيع</span>
                  <span className="text-xl font-accent font-black text-white">
                    {(rate.sellRate || rate.rate).toLocaleString('en-US')}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between text-[8px] font-bold text-white/20 px-1">
                 <span>تحديث تلقائي</span>
                 <span>{rate.lastUpdatedAt ? format(new Date(rate.lastUpdatedAt.seconds * 1000), 'HH:mm', { locale: ar }) : ''}</span>
              </div>
            </motion.div>
          ))}
          {rates.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center py-10 bg-white/5 rounded-[32px] border border-dashed border-white/10">
              <span className="text-white/20 text-xs font-black uppercase tracking-widest">لا توجد بيانات متاحة حالياً</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
