import React, { useState, useEffect } from 'react';
import { Home, Search, ShieldCheck, User, Package, Moon, Sun, LayoutGrid, AlertTriangle, WifiOff, MapPin, Check, X, ChevronDown, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationCenter } from './NotificationCenter';

export function Navigation() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const navItems = [
    { icon: Home, label: 'الرئيسية', path: '/' },
    { icon: LayoutGrid, label: 'الأقسام', path: '/categories' },
    { icon: AlertTriangle, label: 'بلاغاتي', path: '/reports' },
    { icon: Search, label: 'البحث', path: '/search' },
    ...(isAdmin ? [{ icon: ShieldCheck, label: 'الإدارة', path: '/admin' }] : []),
    { icon: User, label: 'حسابي', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl border-t border-neutral-100/50 dark:border-white/5 px-8 pt-3 pb-6 flex justify-between items-center z-50 safe-area-bottom transition-colors">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-300 relative",
              isActive ? "text-primary-600" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            )}
          >
            <item.icon size={22} className={cn("transition-all duration-300", isActive && "scale-110")} />
            <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
            {isActive && (
              <motion.span 
                layoutId="nav-active"
                className="absolute -top-3 w-8 h-1 bg-primary-500 rounded-full shadow-[0_0_8px_rgba(14,165,233,0.5)]" 
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { governorates } = useData();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Governorate election state
  const [showGovModal, setShowGovModal] = useState(false);
  const [selectedGovId, setSelectedGovId] = useState<string>('');
  
  // Storage keys
  const GOV_ID_KEY = 'userGovernorateId';
  const GOV_NAME_KEY = 'userGovernorateName';

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Resolve current governorate name
  const [currentGovId, setCurrentGovId] = useState<string>(() => localStorage.getItem(GOV_ID_KEY) || '');
  const [currentGovName, setCurrentGovName] = useState<string>(() => localStorage.getItem(GOV_NAME_KEY) || 'غير محدد');

  // Trigger governorate selector overlay if none is set
  useEffect(() => {
    const storedId = localStorage.getItem(GOV_ID_KEY);
    if (!storedId) {
      setTimeout(() => {
        setShowGovModal(true);
      }, 800);
    }
  }, []);

  // Update name if governorates load and matching ID exists
  useEffect(() => {
    if (currentGovId && governorates.length > 0) {
      const matched = governorates.find(g => g.id === currentGovId);
      if (matched && matched.name !== currentGovName) {
        setCurrentGovName(matched.name);
        localStorage.setItem(GOV_NAME_KEY, matched.name);
      }
    }
  }, [governorates, currentGovId]);

  // Log and register visitor count/views with specific governorate
  const logVisitToFirestore = async (gId: string, gName: string) => {
    try {
      if (!gId || !gName) return;
      await addDoc(collection(db, 'visits'), {
        userId: user?.uid || 'guest',
        governorateId: gId,
        governorateName: gName,
        userAgent: navigator.userAgent || 'unknown',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error logging visit:', err);
    }
  };

  // Log on initial app load (once per session storage to avoid duplication)
  useEffect(() => {
    const sessionLogged = sessionStorage.getItem('loggedVisitSession');
    if (!sessionLogged && currentGovId && currentGovName !== 'غير محدد') {
      logVisitToFirestore(currentGovId, currentGovName);
      sessionStorage.setItem('loggedVisitSession', 'true');
    }
  }, [currentGovId, currentGovName]);

  // Handle confirming governorate choice
  const handleSelectGovernorate = (govId: string) => {
    const matched = governorates.find(g => g.id === govId);
    if (matched) {
      // Set to storage
      localStorage.setItem(GOV_ID_KEY, govId);
      localStorage.setItem(GOV_NAME_KEY, matched.name);
      
      // Update local state
      setCurrentGovId(govId);
      setCurrentGovName(matched.name);
      setShowGovModal(false);

      // Force session logging of view for this new governorate context
      logVisitToFirestore(govId, matched.name);
      sessionStorage.setItem('loggedVisitSession', 'true');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#F8F9FA] dark:bg-neutral-950 min-h-screen pb-24 shadow-2xl shadow-neutral-200/50 dark:shadow-none relative transition-colors duration-300">
      {!isOnline && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-amber-500 text-white text-[9px] font-black py-1.5 px-4 text-center uppercase tracking-widest flex items-center justify-center gap-2 overflow-hidden z-[60]"
        >
          <WifiOff size={10} />
          أنت تتصفح في وضع عدم الاتصال - يتم عرض البيانات المخزنة
        </motion.div>
      )}
      <div className="bg-primary-900 text-white text-[10px] font-black py-2 px-4 text-center uppercase tracking-[0.2em] relative overflow-hidden">
        <div className="relative z-10 opacity-90 font-display">
          برعاية وزارة الاقتصاد والصناعة والاستثمار - قطاع التجارة الداخلية
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-800 to-primary-950 opacity-50" />
      </div>
      <header className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl px-5 py-4 sticky top-0 z-40 flex items-center justify-between border-b border-neutral-100/50 dark:border-white/5 transition-colors">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-display font-black tracking-tight flex items-center gap-2.5 dark:text-white">
            <div className="bg-primary-600 text-white p-1.5 rounded-xl rotate-3 shadow-lg shadow-primary-200 dark:shadow-primary-900/20">
               <Package size={18} />
            </div>
            كم سعره
          </h1>
          
          {/* Active Governorate Indicator and Selector Button */}
          <button
            onClick={() => {
              setSelectedGovId(currentGovId);
              setShowGovModal(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-[10px] font-black rounded-lg text-primary-600 dark:text-primary-400 border border-primary-500/10 hover:bg-primary-550/10 transition-all hover:scale-102 shrink-0 space-x-reverse"
          >
            <MapPin size={11} className="animate-pulse" />
            <span>{currentGovName}</span>
            <ChevronDown size={10} className="opacity-65" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
            <NotificationCenter />
            <button 
              onClick={toggleTheme}
              className="p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-2xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all hover:scale-110"
              aria-label="تبديل الوضع"
            >
              {isDark ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} />}
            </button>
            <Link to="/search" className="p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-2xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all hover:scale-110">
              <Search size={22} />
            </Link>
        </div>
      </header>

      <main className="px-4 md:px-6 py-6 md:py-8">
        {children}
      </main>
      <Navigation />

      {/* Governorate Selector Modal */}
      <AnimatePresence>
        {showGovModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (currentGovId) setShowGovModal(false); }}
              className="absolute inset-0 bg-neutral-950/70 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-[32px] overflow-hidden shadow-2xl p-6 border border-neutral-100 dark:border-white/5 flex flex-col gap-5 text-right font-sans"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <Sparkles size={18} className="text-primary-500" />
                    تحديد محافظتك
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold leading-relaxed">
                    يرجى تحديد محافظتك لعرض الأسعار والسلع والعملات السائدة في منطقتك بدقة تامة.
                  </p>
                </div>
                {currentGovId && (
                  <button
                    onClick={() => setShowGovModal(false)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 rounded-lg"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Selector List */}
              <div className="max-h-56 overflow-y-auto pr-1 space-y-2 no-scrollbar">
                {governorates.length === 0 ? (
                  <div className="text-center py-6 text-xs font-bold text-neutral-400">
                    جاري تحميل المحافظات المتاحة...
                  </div>
                ) : (
                  governorates.map((gov) => {
                    const isSelected = selectedGovId === gov.id || (!selectedGovId && currentGovId === gov.id);
                    return (
                      <button
                        key={gov.id}
                        type="button"
                        onClick={() => setSelectedGovId(gov.id)}
                        className={cn(
                          "w-full px-4 py-3 rounded-2xl font-black text-xs text-right transition-all flex items-center justify-between border",
                          isSelected 
                            ? "bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/10" 
                            : "bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/40 dark:hover:bg-neutral-800 border-neutral-100 dark:border-white/5 text-neutral-700 dark:text-neutral-300"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <MapPin size={12} className={isSelected ? "text-white" : "text-neutral-400"} />
                          {gov.name}
                        </span>
                        {isSelected && <Check size={14} className="text-white" />}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Confirm button */}
              <button
                type="button"
                disabled={!selectedGovId}
                onClick={() => handleSelectGovernorate(selectedGovId)}
                className={cn(
                  "w-full py-3.5 rounded-2xl font-black text-xs text-center text-white transition-all shadow-lg shadow-primary-500/10 active:scale-98",
                  selectedGovId 
                    ? "bg-primary-600 hover:bg-primary-700 hover:scale-[1.01]" 
                    : "bg-neutral-300 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-600 shadow-none cursor-not-allowed"
                )}
              >
                تحديث وتأكيد الاختيار
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

