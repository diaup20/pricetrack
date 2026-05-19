import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Layout } from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { ProductListItem } from '../components/ProductListItem';
import { ArrowRight, Filter, LayoutGrid, List } from 'lucide-react';
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

  // Filter products based on selections
  const filteredProducts = rawProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrand === 'all' || p.brandId === selectedBrand;
    const matchesPackage = selectedPackage === 'all' || p.packageId === selectedPackage;
    return matchesSearch && matchesBrand && matchesPackage;
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
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{filteredProducts.length.toLocaleString('en-US')} منتج متوفر</p>
              </div>
              {(selectedBrand !== 'all' || selectedPackage !== 'all' || searchQuery) && (
                <button 
                  onClick={() => {
                    setSelectedBrand('all');
                    setSelectedPackage('all');
                    setSearchQuery('');
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
