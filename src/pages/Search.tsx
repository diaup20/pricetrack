import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Layout } from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { ProductListItem } from '../components/ProductListItem';
import { Search as SearchIcon, SlidersHorizontal, X, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function Search() {
  const { products, categories, brands, units, packages } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    categoryId: '',
    brandId: '',
    unitId: '',
    packageId: '',
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filters.categoryId || p.categoryId === filters.categoryId;
    const matchesBrand = !filters.brandId || p.brandId === filters.brandId;
    const matchesUnit = !filters.unitId || p.unitId === filters.unitId;
    const matchesPackage = !filters.packageId || p.packageId === filters.packageId;
    return matchesSearch && matchesCategory && matchesBrand && matchesUnit && matchesPackage;
  });

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-5">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-sky-500 rounded-2xl blur opacity-[0.05] group-focus-within:opacity-10 transition-opacity"></div>
            <input
              type="text"
              placeholder="ابحث عن اسم المنتج، العلامة التجارية..."
              className="relative w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-2xl py-4 pr-12 pl-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium dark:text-white dark:placeholder:text-neutral-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary-500 transition-colors" size={20} />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
                "flex items-center justify-between px-6 py-4 rounded-2xl border transition-all font-bold text-sm",
                showFilters 
                  ? "bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-neutral-900 shadow-xl shadow-neutral-200 dark:shadow-none" 
                  : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-white/5 text-neutral-600 dark:text-neutral-300 shadow-sm hover:border-neutral-200"
            )}
          >
            <div className="flex items-center gap-3">
              <SlidersHorizontal size={18} />
              <span>تصفية متقدمة للمنتجات</span>
            </div>
            {showFilters ? <X size={18} className="opacity-50" /> : null}
          </button>
        </header>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-100 dark:border-white/5 shadow-sm grid grid-cols-2 gap-4 mb-6 transition-colors">
                <FilterSelect 
                  label="القسم" 
                  value={filters.categoryId} 
                  options={categories} 
                  onChange={(v) => setFilters({...filters, categoryId: v})}
                />
                <FilterSelect 
                  label="العلامة التجارية" 
                  value={filters.brandId} 
                  options={brands} 
                  onChange={(v) => setFilters({...filters, brandId: v})}
                />
                <FilterSelect 
                  label="الوحدة" 
                  value={filters.unitId} 
                  options={units} 
                  onChange={(v) => setFilters({...filters, unitId: v})}
                />
                <FilterSelect 
                  label="العبوة" 
                  value={filters.packageId} 
                  options={packages} 
                  onChange={(v) => setFilters({...filters, packageId: v})}
                />
                <button 
                  onClick={() => setFilters({ categoryId: '', brandId: '', unitId: '', packageId: '' })}
                  className="col-span-2 text-xs text-red-500 font-bold text-center mt-2"
                >
                  مسح الفلاتر
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-400 dark:text-neutral-500">النتائج ({filteredProducts.length.toLocaleString('en-US')})</h3>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "grid gap-4 transition-all duration-300",
                viewMode === 'grid' ? "grid-cols-1" : "grid-cols-1"
              )}
            >
              {filteredProducts.map((p) => (
                viewMode === 'grid' 
                  ? <ProductCard key={p.id} product={p} />
                  : <ProductListItem key={p.id} product={p} />
              ))}
            </motion.div>
          </AnimatePresence>
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-neutral-400">
              <p>لم يتم العثور على نتائج تطابق بحثك</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: any[]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mr-2">{label}</label>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 dark:text-neutral-300 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white dark:focus:bg-neutral-700 transition-all appearance-none"
      >
        <option value="">الكل</option>
        {options.map(o => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
    </div>
  );
}
