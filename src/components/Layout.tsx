import React, { useState, useEffect } from 'react';
import { Home, Search, ShieldCheck, User, Package, Moon, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'motion/react';

export function Navigation() {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { isDark } = useTheme();

  const navItems = [
    { icon: Home, label: 'الرئيسية', path: '/' },
    { icon: Search, label: 'البحث', path: '/search' },
    ...(isAdmin ? [{ icon: ShieldCheck, label: 'الإدارة', path: '/admin' }] : []),
    { icon: User, label: 'حسابي', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl border-t border-neutral-100/50 dark:border-white/5 px-8 py-4 flex justify-between items-center z-50 safe-area-bottom transition-colors">
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
                className="absolute -top-4 w-8 h-1 bg-primary-500 rounded-full" 
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

  return (
    <div className="max-w-md mx-auto bg-[#F8F9FA] dark:bg-neutral-950 min-h-screen pb-24 shadow-2xl shadow-neutral-200/50 dark:shadow-none relative transition-colors duration-300">
      <header className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl px-6 py-5 sticky top-0 z-40 flex items-center justify-between border-b border-neutral-100/50 dark:border-white/5 transition-colors">
        <h1 className="text-2xl font-display font-black tracking-tight flex items-center gap-2.5 dark:text-white">
          <div className="bg-primary-600 text-white p-1.5 rounded-xl rotate-3 shadow-lg shadow-primary-200 dark:shadow-primary-900/20">
             <Package size={20} />
          </div>
          سوقي
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
