import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Layout } from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { ProductListItem } from '../components/ProductListItem';
import { ArrowRight, Filter, LayoutGrid, List, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function CategoryProducts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sections, categories, products, brands, packages, units } = useData();

  const category = categories.find(c => c.id === id);
  const section = sections.find(s => s.id === category?.sectionId);
  const rawProducts = products.filter(p => p.categoryId === id);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedPackage, setSelectedPackage] = useState<string>('all');
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number | null>(null);

  const highestPriceLimit = useMemo(() => {
    if (rawProducts.length === 0) return 50000;
    const maxVal = Math.max(...rawProducts.map(p => p.retailPrice || 0));
    return maxVal > 0 ? Math.ceil(maxVal / 100) * 100 : 50000;
  }, [rawProducts]);

  // Filter products based on selections
  const filteredProducts = rawProducts.filter(p => {
    const pName = (p.name || '').toLowerCase();
    const matchesSearch = pName.includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrand === 'all' || p.brandId === selectedBrand;
    const matchesPackage = selectedPackage === 'all' || p.packageId === selectedPackage;
    
    const price = p.retailPrice || 0;
    const matchesMinPrice = priceMin === 0 || price >= priceMin;
    const matchesMaxPrice = priceMax === null || price <= priceMax;

    return matchesSearch && matchesBrand && matchesPackage && matchesMinPrice && matchesMaxPrice;
  });

  // Get only relevant brands and packages for this category
  const activeBrands = brands.filter(b => rawProducts.some(p => p.brandId === b.id));
  const activePackages = packages.filter(pkg => rawProducts.some(p => p.packageId === pkg.id));

  return (
    <Layout>
      <div className="flex flex-col gap-6 pb-32">
        <header className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="bg-white dark:bg-neutral-900 p-2.5 rounded-2xl shadow-sm border border-neutral-100/50 dark:border-white/5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all hover:scale-105 active:scale-95"
              >
                <ArrowRight size={22} />
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-0.5">
                  {section?.image ? (
                    <img src={section.image} alt="" className="w-6 h-6 rounded-lg object-cover shadow-sm border border-neutral-100 dark:border-white/10" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-xl">{section?.icon || '📦'}</span>
                  )}
                  <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{section?.name || 'تصنيف عام'}</span>
                </div>
                <h2 className="text-2xl font-display font-black text-neutral-900 dark:text-white leading-tight">
                  {category?.name || 'القسم'}
                </h2>
              </div>
            </div>
          </div>

          {/* New Search & Filters Section */}
          <div className="flex flex-col gap-4">
            {/* Modern Search Input */}
            <div className="relative group">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن منتج معين..."
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/30 transition-all shadow-sm"
              />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary-500 transition-colors">
                <Filter size={18} />
              </div>
            </div>

            {/* Brand Filter */}
            {activeBrands.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">العلامة التجارية</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                  <button 
                    onClick={() => setSelectedBrand('all')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all whitespace-nowrap border",
                      selectedBrand === 'all' 
                        ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-md"
                        : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-white/5 text-neutral-500"
                    )}
                  >
                    الكل
                  </button>
                  {activeBrands.map(brand => (
                    <button 
                      key={brand.id}
                      onClick={() => setSelectedBrand(brand.id)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all whitespace-nowrap border",
                        selectedBrand === brand.id 
                          ? "bg-primary-600 border-primary-500 text-white shadow-md shadow-primary-500/20"
                          : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-white/5 text-neutral-500"
                      )}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Package Filter */}
            {activePackages.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">المقاس / العبوة</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                  <button 
                    onClick={() => setSelectedPackage('all')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all whitespace-nowrap border",
                      selectedPackage === 'all' 
                        ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-md"
                        : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-white/5 text-neutral-500"
                    )}
                  >
                    الكل
                  </button>
                  {activePackages.map(pkg => (
                    <button 
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all whitespace-nowrap border",
                        selectedPackage === pkg.id 
                          ? "bg-primary-600 border-primary-500 text-white shadow-md shadow-primary-500/20"
                          : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-white/5 text-neutral-500"
                      )}
                    >
                      {pkg.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Filter */}
            <div className="flex flex-col gap-2 bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-2xl border border-neutral-100 dark:border-white/5 shadow-inner">
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Coins size={12} className="text-primary-500 animate-pulse" /> تصفية حسب السعر (ريال يمني)
                </span>
                {(priceMin > 0 || priceMax !== null) && (
                  <button 
                    onClick={() => { setPriceMin(0); setPriceMax(null); }}
                    className="text-[9px] font-black text-red-500 hover:text-red-100 transition-colors bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-lg"
                  >
                    إلغاء تصفية السعر
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-neutral-600 dark:text-neutral-400 pr-1">
                    <span>الحد الأقصى للمؤشر:</span>
                    <span className="text-primary-500 font-mono">{(priceMax !== null ? priceMax : highestPriceLimit).toLocaleString('en-US')} ر.ي.</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max={highestPriceLimit}
                    step={Math.ceil(highestPriceLimit / 50) || 500}
                    value={priceMax !== null ? priceMax : highestPriceLimit}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full accent-primary-500 h-1.5 bg-neutral-200 dark:bg-neutral-850 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between items-center text-[9px] text-neutral-400 mt-0.5">
                    <span>0 ر.ي.</span>
                    <span>{highestPriceLimit.toLocaleString('en-US')} ر.ي.</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider pr-1">من (الأدنى)</span>
                    <input 
                      type="number"
                      min="0"
                      placeholder="0"
                      value={priceMin === 0 ? '' : priceMin}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPriceMin(val === '' ? 0 : Math.max(0, Number(val)));
                      }}
                      className="w-full bg-white dark:bg-neutral-950 border border-neutral-150 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/10 shadow-inner"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider pr-1">إلى (الأقصى)</span>
                    <input 
                      type="number"
                      min="0"
                      placeholder={highestPriceLimit.toString()}
                      value={priceMax === null ? '' : priceMax}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPriceMax(val === '' ? null : Math.max(0, Number(val)));
                      }}
                      className="w-full bg-white dark:bg-neutral-950 border border-neutral-150 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/10 shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{filteredProducts.length.toLocaleString('en-US')} منتج متوفر</p>
              </div>
              {(selectedBrand !== 'all' || selectedPackage !== 'all' || searchQuery || priceMin > 0 || priceMax !== null) && (
                <button 
                  onClick={() => {
                    setSelectedBrand('all');
                    setSelectedPackage('all');
                    setSearchQuery('');
                    setPriceMin(0);
                    setPriceMax(null);
                  }}
                  className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                >
                  إعادة تعيين
                </button>
              )}
          </div>
        </header>

        <div className="flex flex-col gap-4">
          {filteredProducts.length > 0 ? (
            <AnimatePresence mode="popLayout">
              <motion.div 
                layout
                className="grid grid-cols-1 gap-4"
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-24 text-neutral-400 flex flex-col items-center gap-4 bg-white/50 dark:bg-neutral-900/50 rounded-[40px] border border-dashed border-neutral-200 dark:border-white/5 transition-colors">
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-sm text-4xl">📦</div>
              <div className="flex flex-col gap-1">
                 <p className="font-bold text-neutral-600 dark:text-neutral-300">لا توجد منتجات</p>
                 <p className="text-[10px]">سيتم إضافة منتجات لهذا القسم قريباً</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
