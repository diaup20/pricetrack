import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { Bell, BellRing, Package, TrendingUp, Tags, X, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { AppNotification } from '../types';

export function NotificationCenter() {
  const { notifications } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Read state persistence via localStorage
  const [lastViewedId, setLastViewedId] = useState<string>(() => {
    return localStorage.getItem('lastViewedNotificationId') || '';
  });

  // Calculate if there are unread notifications
  const hasUnread = React.useMemo(() => {
    if (notifications.length === 0) return false;
    if (!lastViewedId) return true;
    
    // Check if the latest notification's ID matches the last viewed one
    return notifications[0].id !== lastViewedId;
  }, [notifications, lastViewedId]);

  // Click outside to close helper
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When dropdown is opened, mark latest notification as viewed
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && notifications.length > 0) {
      const latestId = notifications[0].id;
      localStorage.setItem('lastViewedNotificationId', latestId);
      setLastViewedId(latestId);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'price_update':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center shrink-0">
            <TrendingUp size={16} />
          </div>
        );
      case 'new_product':
        return (
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Package size={16} />
          </div>
        );
      case 'new_category':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Tags size={16} />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-neutral-500/10 text-neutral-600 dark:bg-neutral-500/20 dark:text-neutral-400 flex items-center justify-center shrink-0">
            <Bell size={16} />
          </div>
        );
    }
  };

  const parseTime = (item: AppNotification) => {
    if (!item.createdAt) return 'مؤخراً';
    try {
      const date = item.createdAt.seconds 
        ? new Date(item.createdAt.seconds * 1000) 
        : new Date(item.createdAt);
      return formatDistanceToNow(date, { addSuffix: true, locale: ar });
    } catch (e) {
      return 'مؤخراً';
    }
  };

  return (
    <div className="relative font-sans" ref={containerRef}>
      {/* Bell Trigger Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={handleToggle}
        className={cn(
          "p-2.5 rounded-2xl relative transition-all duration-300",
          isOpen
            ? "bg-primary-500/10 text-primary-600 dark:text-primary-400"
            : "bg-neutral-50 dark:bg-neutral-800 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:scale-110"
        )}
        aria-label="التنبيهات والإشعارات"
      >
        <AnimatePresence>
          {hasUnread ? (
            <motion.div
              animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
              transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.6 }}
            >
              <BellRing size={20} className="text-primary-500" />
            </motion.div>
          ) : (
            <Bell size={20} />
          )}
        </AnimatePresence>
        
        {/* Unread dot badge */}
        {hasUnread && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-neutral-900 animate-pulse" />
        )}
      </motion.button>

      {/* Notifications Dropdown Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute left-0 mt-3.5 w-80 bg-white dark:bg-neutral-900 rounded-[28px] shadow-2xl border border-neutral-100 dark:border-white/5 z-50 overflow-hidden text-right"
          >
            {/* Header */}
            <div className="p-4 border-b border-neutral-50 dark:border-white/5 flex items-center justify-between">
              <span className="text-xs font-black text-neutral-900 dark:text-white">مركز التنبيهات</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-center text-neutral-300 dark:text-neutral-700">
                    <Bell size={22} />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-neutral-800 dark:text-neutral-200">لا توجد تنبيهات جديدة</h5>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold mt-1 leading-relaxed">سنقوم بإخطارك فور إضافة أصناف أو تحديث أسعار السلع.</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-neutral-50 dark:divide-white/5">
                  {notifications.slice(0, 20).map((item) => (
                    <div 
                      key={item.id}
                      className={cn(
                        "p-4 flex gap-3 hover:bg-neutral-50/50 dark:hover:bg-white/[0.02] transition-colors items-start border-r-2 text-right",
                        item.type === 'price_update' && "border-amber-500",
                        item.type === 'new_product' && "border-sky-500",
                        item.type === 'new_category' && "border-emerald-500"
                      )}
                    >
                      {getIcon(item.type)}
                      <div className="flex-1 space-y-1 overflow-hidden">
                        <div className="flex items-center justify-between gap-2">
                          <h6 className="text-[11px] font-black text-neutral-900 dark:text-white truncate">
                            {item.title}
                          </h6>
                          <div className="flex items-center gap-1 text-[9px] font-bold text-neutral-400 dark:text-neutral-500 shrink-0">
                            <Calendar size={8} />
                            <span>{parseTime(item)}</span>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold leading-relaxed text-neutral-500 dark:text-neutral-400">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="bg-neutral-50 dark:bg-neutral-800/20 p-3.5 text-center text-[10px] font-black text-neutral-400 dark:text-neutral-500 border-t border-neutral-50 dark:border-white/5">
                تظهر آخر التنبيهات المسجلة للسلع والأسعار.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
