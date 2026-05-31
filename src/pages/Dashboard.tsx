import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { ExchangeRateWidget } from '../components/ExchangeRateWidget';
import { ProductCard } from '../components/ProductCard';
import { Layout } from '../components/Layout';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  X, 
  LineChart,
  AlertTriangle,
  Mic,
  MicOff,
  Volume2,
  Phone
} from 'lucide-react';
import { ReportForm } from '../components/ReportForm';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { sections, categories, products, exchangeRates, brands } = useData();
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

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

  // Filtered Categories based on Section
  const filteredCategories = useMemo(() => {
    if (selectedSection === 'all') return categories;
    return categories.filter(c => c.sectionId === selectedSection);
  }, [categories, selectedSection]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const pName = (p.name || '').toLowerCase();
      const pDesc = (p.description || '').toLowerCase();
      const pOrigin = (p.origin || '').toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchesSearch = pName.includes(q) || pDesc.includes(q) || pOrigin.includes(q);
      
      // Get category for this product to check its section
      const productCategory = categories.find(c => c.id === p.categoryId);
      const matchesSection = selectedSection === 'all' || productCategory?.sectionId === selectedSection;
      
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchesBrand = selectedBrand === 'all' || p.brandId === selectedBrand;
      const matchesOrigin = selectedOrigin === 'all' || p.origin === selectedOrigin;
      return matchesSearch && matchesSection && matchesCategory && matchesBrand && matchesOrigin;
    });
  }, [products, categories, searchQuery, selectedSection, selectedCategory, selectedBrand, selectedOrigin]);

  return (
    <Layout>
      <div className="flex flex-col gap-8 -mt-2">
        {/* Modern Header Section */}
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col">
            <h1 className="text-4xl font-display font-black text-neutral-900 dark:text-white leading-tight tracking-tight">سوق الأسعار</h1>
            <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest leading-none mt-2">اليمن • تحديث مباشر</p>
          </div>
          <button 
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 px-5 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-neutral-200 dark:shadow-none hover:translate-y-[-2px] transition-all active:scale-95"
          >
            <AlertTriangle size={14} className="text-amber-400" />
            <span>إضافة بلاغ</span>
          </button>
        </div>

        {/* Improved Exchange Rates Section */}
        <div className="px-1">
           <ExchangeRateWidget rates={exchangeRates} />
        </div>

        {/* Modern Search Bar */}
        <div className="sticky top-[84px] z-30 transition-all px-1" ref={containerRef}>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-sky-500/20 rounded-[28px] blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity" />
             <div className="relative">
               <input 
                 type="text" 
                 placeholder="ابحث عن منتج أو سعر..." 
                 className="w-full bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-white/5 rounded-[24px] py-5 pr-14 pl-28 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white shadow-xl shadow-neutral-100/50 dark:shadow-none"
                 value={searchQuery}
                 onChange={e => {
                   setSearchQuery(e.target.value);
                   setShowSuggestions(true);
                   setFocusedSuggestionIndex(-1);
                 }}
                 onFocus={() => setShowSuggestions(true)}
                 onKeyDown={handleKeyDown}
               />
               <Search size={22} className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
               
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
             </div>
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
                          <Search size={14} className="text-neutral-300 dark:text-neutral-600" />
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

          {/* Listening / Error Banners */}
          <div className="mt-2 space-y-2">
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
                      <p className="text-xs font-black text-red-600 dark:text-red-400 text-right">جاري الاستماع إليك...</p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 text-right">تحدّث الآن باسم المنتج لتتم كتابته تلقائياً.</p>
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
                  <div className="flex-1 text-right">
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
          </div>
        </div>

        {/* Modern Sections Grid/Scroll */}
        <div className="flex flex-col gap-3 px-1">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em]">تصفح حسب الفئة</h2>
            {selectedSection !== 'all' && (
              <button 
                onClick={() => {
                  setSelectedSection('all');
                  setSelectedCategory('all');
                }}
                className="text-[9px] font-black text-primary-500 uppercase tracking-widest hover:underline"
              >
                عرض الكل
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
            <button 
              onClick={() => {
                setSelectedSection('all');
                setSelectedCategory('all');
              }}
              className={cn(
                "flex-shrink-0 flex flex-col items-center gap-2 group",
                selectedSection === 'all' ? "opacity-100" : "opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all"
              )}
            >
              <div className={cn(
                "w-16 h-16 rounded-[24px] flex items-center justify-center text-2xl transition-all shadow-sm border",
                selectedSection === 'all' 
                  ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-neutral-950 scale-105 shadow-xl shadow-neutral-200 dark:shadow-none" 
                  : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-white/10 text-neutral-400 group-hover:border-primary-500/30"
              )}>
                🌍
              </div>
              <span className={cn(
                 "text-[9px] font-black uppercase tracking-widest",
                 selectedSection === 'all' ? "text-neutral-900 dark:text-white" : "text-neutral-400"
              )}>الكل</span>
            </button>

            {sections.map((section) => (
              <button 
                key={section.id}
                onClick={() => {
                  setSelectedSection(section.id);
                  setSelectedCategory('all');
                }}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-2 group",
                  selectedSection === section.id ? "opacity-100" : "opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all"
                )}
              >
                <div className={cn(
                  "w-16 h-16 rounded-[24px] flex items-center justify-center text-2xl transition-all shadow-sm border overflow-hidden",
                  selectedSection === section.id 
                    ? "bg-primary-600 border-primary-500 text-white scale-105 shadow-xl shadow-primary-500/20" 
                    : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-white/10 text-neutral-400 group-hover:border-primary-500/30"
                )}>
                  {section.image ? (
                    <img src={section.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span>{section.icon || '📦'}</span>
                  )}
                </div>
                <span className={cn(
                   "text-[9px] font-black uppercase tracking-widest",
                   selectedSection === section.id ? "text-primary-600" : "text-neutral-400"
                )}>{section.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Button */}
        <div className="px-1">
           <button 
             onClick={() => setIsFilterExpanded(!isFilterExpanded)}
             className={cn(
               "w-full py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-dashed",
               isFilterExpanded 
                 ? "bg-primary-50 border-primary-200 text-primary-600" 
                 : "bg-neutral-50 border-neutral-200 text-neutral-400 dark:bg-neutral-900 dark:border-white/5"
             )}
           >
             <Filter size={14} />
             {isFilterExpanded ? 'إخفاء خيارات التصفية' : 'خيارات بحث متقدمة'}
           </button>
        </div>

        <AnimatePresence>
          {isFilterExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-3xl"
            >
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-1">القسم الفرعي</label>
                  <div className="relative">
                    <select 
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-3 text-xs font-bold appearance-none dark:text-white border-none"
                    >
                      <option value="all">الكل</option>
                      {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-1">الماركة التجارية</label>
                  <div className="relative">
                    <select 
                      value={selectedBrand}
                      onChange={e => setSelectedBrand(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-3 text-xs font-bold appearance-none dark:text-white border-none"
                    >
                      <option value="all">الكل</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-1">بلد المنشأ</label>
                  <div className="relative">
                    <select 
                      value={selectedOrigin}
                      onChange={e => setSelectedOrigin(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-3 text-xs font-bold appearance-none dark:text-white border-none"
                    >
                      <option value="all">الكل</option>
                      {origins.map(orig => (
                        <option key={orig} value={orig}>{orig}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results with modern spacing */}
        <div className="flex flex-col gap-4 mt-2">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
              {filteredProducts.slice(0, 20).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4 bg-white/50 dark:bg-neutral-900/50 rounded-[48px] border border-dashed border-neutral-200 dark:border-white/5">
                <Search size={48} className="text-neutral-200" />
                <h4 className="font-bold text-neutral-400">لا توجد منتجات مطابقة</h4>
            </div>
          )}
        </div>
      </div>

      <ReportForm isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </Layout>
  );
}
