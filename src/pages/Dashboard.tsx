import React from 'react';
import { useData } from '../contexts/DataContext';
import { ExchangeRateWidget } from '../components/ExchangeRateWidget';
import { CategoryGrid } from '../components/CategoryGrid';
import { Layout } from '../components/Layout';
import { Package, LineChart, ShieldAlert } from 'lucide-react';

export function Dashboard() {
  const { categories, products, exchangeRates } = useData();

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        {/* Hero / Header */}
        <header className="flex flex-col gap-1.5 px-1 py-2">
          <h2 className="text-3xl font-display font-black text-neutral-900 dark:text-white tracking-tight leading-tight transition-colors">
            سوق الأسعار <span className="text-primary-500">اليمني</span>
          </h2>
          <p className="text-sm font-medium text-neutral-400 dark:text-neutral-500 transition-colors">تابع تحركات السوق والعملات لحظة بلحظة</p>
        </header>

        {/* Exchange Rates */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-sky-500 rounded-[34px] blur opacity-[0.08] dark:opacity-[0.15]"></div>
          <ExchangeRateWidget rates={exchangeRates} />
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <StatSummaryBox 
            label="إجمالي الأصناف" 
            value={products.length} 
            icon={<Package size={16} className="text-neutral-400" />} 
          />
          <StatSummaryBox 
            label="تغيرات اليوم" 
            value={products.filter(p => p.trend !== 'stable').length} 
            icon={<LineChart size={16} className="text-neutral-400" />} 
            isHighlight
          />
        </div>

        {/* Categories Section */}
        <div>
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="text-xl font-display font-black text-neutral-800 dark:text-neutral-100 transition-colors">الأقسام الرئيسية</h3>
            <div className="h-px flex-1 mx-4 bg-neutral-100 dark:bg-white/5 hidden sm:block"></div>
            <span className="text-[10px] font-black text-neutral-300 dark:text-neutral-600 uppercase tracking-widest bg-neutral-50 dark:bg-neutral-900 px-2 py-1 rounded-lg transition-all">استعراض</span>
          </div>
          <CategoryGrid categories={categories} products={products} />
        </div>

        {/* Warning / Memo */}
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-4 rounded-2xl flex gap-3 items-start transition-colors">
          <ShieldAlert className="text-amber-500 flex-shrink-0" size={20} />
          <div>
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">تنويه هام</h4>
            <p className="text-[10px] text-amber-700 dark:text-amber-500 leading-normal mt-0.5">
              الأسعار المعروضة هي أسعار استرشادية وقد تختلف قليلاً بين المحافظات والمحلات التجارية.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatSummaryBox({ label, value, icon, isHighlight }: { label: string; value: number; icon: React.ReactNode; isHighlight?: boolean }) {
  return (
    <div className="bg-white dark:bg-neutral-900 p-5 rounded-[28px] shadow-sm border border-neutral-100 dark:border-white/5 hover:shadow-lg dark:hover:shadow-none hover:border-neutral-200 dark:hover:border-primary-500/30 transition-all duration-300 group">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{label}</span>
          <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl group-hover:scale-110 transition-transform">
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-accent font-black text-neutral-900 dark:text-white leading-none">{value.toLocaleString('en-US')}</span>
          {isHighlight && value > 0 && (
            <div className="flex items-center gap-0.5 text-red-500 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded-lg text-[10px] font-black">
              <LineChart size={10} />
              <span>مباشر</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
