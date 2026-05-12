import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Layout } from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { Search as SearchIcon, X, Filter, SlidersHorizontal, PackageSearch, LayoutGrid, Tag, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function Search() {
  const { products, categories, brands } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchesBrand = selectedBrand === 'all' || p.brandId === selectedBrand;
      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand]);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-black tracking-tight dark:text-white">البحث عن المنتجات</h2>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-widest mt-0.5">اكتشف أسعار المنتجات في السوق اليمني</p>
            </div>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "p-3 rounded-2xl border transition-all relative overflow-hidden group",
                isFilterOpen 
                  ? "bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20" 
                  : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-white/5 text-neutral-500"
              )}
            >
              <div className="relative z-10 flex items-center gap-2">
                <Filter size={20} className={cn(isFilterOpen ? "animate-pulse" : "")} />
                <span className="text-xs font-black hidden md:block">الفلاتر</span>
              </div>
            </button>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-sky-500 rounded-3xl blur opacity-[0.05] group-focus-within:opacity-10 transition-opacity"></div>
            <input
              type="text"
              autoFocus
              placeholder="عن ماذا تبحث اليوم؟ (اسم المنتج، الوصف...)"
              className="relative w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-3xl py-5 pr-14 pl-6 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-base font-bold dark:text-white dark:placeholder:text-neutral-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary-500 transition-colors" size={24} />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors bg-neutral-50 dark:bg-neutral-800 p-1.5 rounded-full"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white dark:bg-neutral-900 rounded-[32px] p-6 border border-neutral-100 dark:border-white/5 shadow-xl shadow-neutral-200/20 dark:shadow-none flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-neutral-800 dark:text-white">
                      <SlidersHorizontal size={18} className="text-primary-500" />
                      <span className="font-display font-black tracking-tight">خيارات التصفية</span>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedBrand('all');
                        setSearchQuery('');
                      }}
                      className="text-[10px] font-black text-primary-500 hover:text-primary-600 uppercase tracking-widest transition-colors bg-primary-50 dark:bg-primary-500/10 px-3 py-1.5 rounded-xl"
                    >
                      إعادة ضبط
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-3 flex items-center gap-2">
                        <LayoutGrid size={12} /> تصفية حسب القسم
                      </label>
                      <div className="relative group/select">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold appearance-none focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-neutral-800 dark:text-white cursor-pointer pr-12 pl-12"
                        >
                          <option value="all">جميع الأقسام</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 group-focus-within/select:text-primary-500 transition-colors">
                          <LayoutGrid size={20} />
                        </div>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-300">
                          <ChevronDown size={18} strokeWidth={3} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-3 flex items-center gap-2">
                        <Tag size={12} /> تصفية حسب العلامة التجارية
                      </label>
                      <div className="relative group/select">
                        <select
                          value={selectedBrand}
                          onChange={(e) => setSelectedBrand(e.target.value)}
                          className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold appearance-none focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-neutral-800 dark:text-white cursor-pointer pr-12 pl-12"
                        >
                          <option value="all">جميع العلامات التجارية</option>
                          {brands.map(brand => (
                            <option key={brand.id} value={brand.id}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 group-focus-within/select:text-primary-500 transition-colors">
                          <Tag size={20} />
                        </div>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-300">
                          <ChevronDown size={18} strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-display font-black text-neutral-800 dark:text-neutral-100">
              {searchQuery || selectedCategory !== 'all' || selectedBrand !== 'all' ? (
                <span>نتائج البحث <span className="text-primary-500">({filteredProducts.length})</span></span>
              ) : (
                <span>اقتراحات <span className="text-primary-500">لك</span></span>
              )}
            </h3>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center gap-6 bg-white dark:bg-neutral-900 rounded-[40px] border border-dashed border-neutral-200 dark:border-white/10 shadow-inner"
            >
              <div className="w-24 h-24 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-200 relative">
                  <PackageSearch size={48} />
                  <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 bg-primary-500/10 rounded-full"
                  />
              </div>
              <div className="max-w-[240px]">
                <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-lg">لم نعثر على أي منتجات</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-medium">حاول البحث باستخدام كلمات مختلفة أو التحقق من قسم آخر</p>
              </div>
              <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedBrand('all');
                  }}
                  className="mt-2 text-xs font-black text-primary-500 bg-primary-50 dark:bg-primary-500/10 px-8 py-3.5 rounded-2xl hover:bg-neutral-100 transition-all border border-primary-100 dark:border-primary-500/20"
              >
                  عرض جميع المنتجات
              </button>
            </motion.div>
          )}
        </section>
      </div>
    </Layout>
  );
}
