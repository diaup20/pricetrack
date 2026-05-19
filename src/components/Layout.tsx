import React, { useState, useEffect } from 'react';
import { Home, Search, ShieldCheck, User, Package, Moon, Sun, LayoutGrid, AlertTriangle, WifiOff } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'motion/react';

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
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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
        <div className="relative z-10 opacity-90">
          برعاية وزارة الاقتصاد والصناعة والاستثمار - قطاع التجارة الداخلية
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-800 to-primary-950 opacity-50" />
      </div>
      <header className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl px-6 py-5 sticky top-0 z-40 flex items-center justify-between border-b border-neutral-100/50 dark:border-white/5 transition-colors">
        <h1 className="text-2xl font-display font-black tracking-tight flex items-center gap-2.5 dark:text-white">
          <div className="bg-primary-600 text-white p-1.5 rounded-xl rotate-3 shadow-lg shadow-primary-200 dark:shadow-primary-900/20">
             <Package size={20} />
          </div>
          كم سعره
        </h1>
        <div className="flex items-center gap-2">
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
    </div>
  );
}

