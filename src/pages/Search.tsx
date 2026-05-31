import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Layout } from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { Search as SearchIcon, X, Filter, SlidersHorizontal, PackageSearch, LayoutGrid, Tag, ChevronDown, Coins, Mic, MicOff, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function Search() {
  const { products, categories, brands } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number | null>(null);

  // Get unique countries of origin from products
  const origins = useMemo(() => {
    const originSet = new Set<string>();
    products.forEach((p) => {
      if (p.origin && p.origin.trim()) {
        originSet.add(p.origin.trim());
      }
    });
    return Array.from(originSet).sort();
  }, [products]);

  // Voice Search States
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-suggestions States & Refs
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    const matches: string[] = [];
    for (const p of products) {
      const name = p.name || '';
      if (name.toLowerCase().includes(query) && !matches.includes(name)) {
        matches.push(name);
        if (matches.length >= 6) break; // Limit to up to 6 matches
      }
    }
    return matches;
  }, [products, searchQuery]);

  // Click outside to close auto-suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShowSuggestions(true);
      setFocusedSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setShowSuggestions(true);
      setFocusedSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (focusedSuggestionIndex >= 0 && focusedSuggestionIndex < suggestions.length) {
        e.preventDefault();
        setSearchQuery(suggestions[focusedSuggestionIndex]);
        setShowSuggestions(false);
      } else {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const toggleListening = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceError('البحث الصوتي غير مدعوم في متصفحك الحالي. يرجى استخدام متصفح يدعم هذه الميزة مثل Google Chrome.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    setVoiceError(null);
    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ar-YE'; // Yemeni Arabic dialect recognition

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setVoiceError('يرجى السماح بالوصول إلى الميكروفون لاستخدام البحث الصوتي.');
        } else if (event.error === 'no-speech') {
          setVoiceError('لم نتمكن من سماعك بوضوح. يرجى المحاولة والتحدث مرة أخرى.');
        } else {
          setVoiceError('حدث خطأ أثناء التعرف على الصوت. حاول مرة أخرى.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const highestPriceLimit = useMemo(() => {
    if (products.length === 0) return 50000;
    const maxVal = Math.max(...products.map(p => p.retailPrice || 0));
    return maxVal > 0 ? Math.ceil(maxVal / 100) * 100 : 50000;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const pName = (p.name || '').toLowerCase();
      const pDesc = (p.description || '').toLowerCase();
      const pOrigin = (p.origin || '').toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || pName.includes(q) || pDesc.includes(q) || pOrigin.includes(q);
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchesBrand = selectedBrand === 'all' || p.brandId === selectedBrand;
      const matchesOrigin = selectedOrigin === 'all' || p.origin === selectedOrigin;
      
      const price = p.retailPrice || 0;
      const matchesMinPrice = priceMin === 0 || price >= priceMin;
      const matchesMaxPrice = priceMax === null || price <= priceMax;

      return matchesSearch && matchesCategory && matchesBrand && matchesOrigin && matchesMinPrice && matchesMaxPrice;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand, selectedOrigin, priceMin, priceMax]);

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

          <div className="relative group" ref={containerRef}>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-sky-500 rounded-3xl blur opacity-[0.05] group-focus-within:opacity-10 transition-opacity"></div>
            <input
              type="text"
              autoFocus
              placeholder="عن ماذا تبحث اليوم؟ (اسم المنتج، الوصف...)"
              className="relative w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-3xl py-5 pr-14 pl-28 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-base font-bold dark:text-white dark:placeholder:text-neutral-600"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                setFocusedSuggestionIndex(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
            />
            <SearchIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary-500 transition-colors" size={24} />
            
            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                  className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors bg-neutral-50 dark:bg-neutral-800 p-2 rounded-full"
                  title="مسح البحث"
                >
                  <X size={16} />
                </button>
              )}
              <button 
                type="button"
                onClick={toggleListening}
                className={cn(
                  "p-2.5 rounded-full transition-all flex items-center justify-center relative group",
                  isListening 
                    ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30" 
                    : "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-500/20"
                )}
                title={isListening ? "جاري الاستماع... اضغط للإيقاف" : "البحث الصوتي"}
              >
                {isListening ? (
                  <>
                    <MicOff size={18} />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </>
                ) : (
                  <Mic size={18} />
                )}
              </button>
            </div>

            {/* Auto-suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.99 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 z-50 mt-2 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-2xl shadow-xl max-h-72 overflow-y-auto overflow-x-hidden backdrop-blur-xl"
                >
                  <div className="p-2 flex flex-col gap-0.5 font-sans">
                    <div className="px-3 py-1.5 text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest border-b border-neutral-50 dark:border-white/5 mb-1 text-right">
                      اقتراحات البحث السريعة
                    </div>
                    {suggestions.map((suggestion, idx) => {
                      const isFocused = idx === focusedSuggestionIndex;
                      return (
                        <button
                          key={suggestion}
                          type="button"
                          onMouseEnter={() => setFocusedSuggestionIndex(idx)}
                          onClick={() => {
                            setSearchQuery(suggestion);
                            setShowSuggestions(false);
                          }}
                          className={cn(
                            "w-full text-right px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between transition-colors",
                            isFocused 
                              ? "bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400" 
                              : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <SearchIcon size={14} className="text-neutral-300 dark:text-neutral-600" />
                            <span>{suggestion}</span>
                          </div>
                          
                          {isFocused && (
                            <span className="text-[10px] font-black text-primary-500/80 bg-primary-100/50 dark:bg-primary-500/20 px-2 py-0.5 rounded-md font-sans">
                              تحديد ↵
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-500/20 p-4 rounded-2xl flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <Volume2 className="text-red-500 animate-bounce h-5 w-5 relative" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-red-600 dark:text-red-400">جاري الاستماع إليك...</p>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">تحدّث الآن باسم المنتج أو العلامة التجارية لتتم كتابتها تلقائياً.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (recognitionRef.current) recognitionRef.current.stop();
                    setIsListening(false);
                  }}
                  className="text-xs font-black text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-xl transition-colors"
                >
                  إيقاف
                </button>
              </motion.div>
            )}

            {voiceError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-500/20 p-4 rounded-2xl flex items-start gap-3"
              >
                <MicOff className="text-amber-500 h-5 w-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-black text-amber-600 dark:text-amber-400">تنبيه البحث الصوتي</p>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">{voiceError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceError(null)}
                  className="text-[10px] font-black text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                >
                  إغلاق
                </button>
              </motion.div>
            )}
          </AnimatePresence>

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
                        setSelectedOrigin('all');
                        setSearchQuery('');
                        setPriceMin(0);
                        setPriceMax(null);
                      }}
                      className="text-[10px] font-black text-primary-500 hover:text-primary-600 uppercase tracking-widest transition-colors bg-primary-50 dark:bg-primary-500/10 px-3 py-1.5 rounded-xl"
                    >
                      إعادة ضبط
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-3 flex items-center gap-2 font-sans">
                        <span role="img" aria-label="origin">🌍</span> تصفية حسب بلد المنشأ
                      </label>
                      <div className="relative group/select">
                        <select
                          value={selectedOrigin}
                          onChange={(e) => setSelectedOrigin(e.target.value)}
                          className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold appearance-none focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-neutral-800 dark:text-white cursor-pointer pr-12 pl-12"
                        >
                          <option value="all">جميع بلدان المنشأ</option>
                          {origins.map(orig => (
                            <option key={orig} value={orig}>
                              {orig}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 group-focus-within/select:text-primary-500 transition-colors">
                          <span role="img" aria-label="origin" className="text-sm">🌍</span>
                        </div>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-300">
                          <ChevronDown size={18} strokeWidth={3} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-3 flex items-center gap-2">
                        <Coins size={12} /> تصفية حسب السعر (ريال يمني)
                      </label>
                      <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-white/5 rounded-2xl p-4 space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-xs font-bold text-neutral-600 dark:text-neutral-300">
                            <span>الحد الأقصى:</span>
                            <span className="text-primary-500 font-mono">{(priceMax !== null ? priceMax : highestPriceLimit).toLocaleString('en-US')} ر.ي.</span>
                          </div>
                          <input 
                            type="range"
                            min="0"
                            max={highestPriceLimit}
                            step={Math.ceil(highestPriceLimit / 50) || 500}
                            value={priceMax !== null ? priceMax : highestPriceLimit}
                            onChange={(e) => setPriceMax(Number(e.target.value))}
                            className="w-full accent-primary-500 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider pr-1">الأدنى</span>
                            <input 
                              type="number"
                              min="0"
                              placeholder="0"
                              value={priceMin === 0 ? '' : priceMin}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPriceMin(val === '' ? 0 : Math.max(0, Number(val)));
                              }}
                              className="w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-inner"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider pr-1">الأقصى</span>
                            <input 
                              type="number"
                              min="0"
                              placeholder={highestPriceLimit.toString()}
                              value={priceMax === null ? '' : priceMax}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPriceMax(val === '' ? null : Math.max(0, Number(val)));
                              }}
                              className="w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-inner"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[9px] font-medium text-neutral-400">
                          <span>0 ر.ي.</span>
                          <span>{highestPriceLimit.toLocaleString('en-US')} ر.ي.</span>
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
              {searchQuery || selectedCategory !== 'all' || selectedBrand !== 'all' || priceMin > 0 || priceMax !== null ? (
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
                    setPriceMin(0);
                    setPriceMax(null);
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
