import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Trash2, Edit2, Star, MessageSquare, Calendar, User, Info, LogIn } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, cn, OperationType, handleFirestoreError } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface ProductReviewsProps {
  productId: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductReviews({ productId, productName, isOpen, onClose }: ProductReviewsProps) {
  const { reviews } = useData();
  const { user, userData, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Local state for adding/editing reviews
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Filter reviews for this product
  const productReviews = useMemo(() => {
    return reviews.filter(r => r.productId === productId)
      .sort((a, b) => {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds : 0;
        return dateB - dateA; // Newest first
      });
  }, [reviews, productId]);

  // Check if current user has already reviewed
  const myReview = useMemo(() => {
    if (!user) return null;
    return productReviews.find(r => r.userId === user.uid);
  }, [productReviews, user]);

  // Pre-fill form on edit or initial view
  useEffect(() => {
    if (myReview) {
      if (isEditMode) {
        setRating(myReview.rating);
        setComment(myReview.comment || '');
      }
    } else {
      setRating(0);
      setComment('');
      setIsEditMode(false);
    }
  }, [myReview, isEditMode, isOpen]);

  // Statistics
  const stats = useMemo(() => {
    const total = productReviews.length;
    if (total === 0) {
      return {
        average: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        count: 0
      };
    }

    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    const average = Math.round((sum / total) * 10) / 10;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    productReviews.forEach(r => {
      const rate = Math.round(r.rating) as 5 | 4 | 3 | 2 | 1;
      if (rate >= 1 && rate <= 5) {
        distribution[rate]++;
      }
    });

    return {
      average,
      distribution,
      count: total
    };
  }, [productReviews]);

  // Handle Review Submission (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (rating === 0) {
      setError('يرجى تحديد تقييم بالنجوم أولاً.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const displayUserName = userData?.displayName || user.displayName || user.email?.split('@')[0] || 'مستخدم كريم';
      
      if (myReview) {
        // Update Action
        const reviewRef = doc(db, 'reviews', myReview.id);
        await updateDoc(reviewRef, {
          rating: Number(rating),
          comment: comment.trim(),
          updatedAt: serverTimestamp()
        });
        setIsEditMode(false);
      } else {
        // Create Action
        const reviewsCollection = collection(db, 'reviews');
        await addDoc(reviewsCollection, {
          productId,
          userId: user.uid,
          userName: displayUserName,
          rating: Number(rating),
          comment: comment.trim(),
          createdAt: serverTimestamp()
        });
        setRating(0);
        setComment('');
      }
    } catch (err) {
      console.error('Error writing review:', err);
      handleFirestoreError(err, myReview ? OperationType.WRITE : OperationType.CREATE, 'reviews');
      setError('حدث خطأ أثناء حفظ تقييمك. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Review Deletion
  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا التقييم؟')) return;

    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await deleteDoc(reviewRef);
      if (myReview?.id === reviewId) {
        setIsEditMode(false);
        setRating(0);
        setComment('');
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      handleFirestoreError(err, OperationType.DELETE, `reviews/${reviewId}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-neutral-100 dark:border-white/5"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-white/5 bg-neutral-50 dark:bg-neutral-900/50">
              <div className="text-right">
                <h3 className="font-display font-black text-lg text-neutral-800 dark:text-neutral-100">تقييمات المنتج</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold mt-0.5">{productName}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors bg-white dark:bg-neutral-800 p-2 rounded-2xl border border-neutral-100 dark:border-white/5 shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Star rating stats snapshot */}
              <div className="bg-primary-500/[0.03] dark:bg-white/[0.02] border border-primary-500/5 dark:border-white/5 rounded-2xl p-5 flex items-center gap-6 justify-between">
                <div className="flex flex-col items-center justify-center shrink-0 w-28">
                  <span className="text-4xl font-black text-neutral-800 dark:text-neutral-100 font-accent leading-none">
                    {stats.average > 0 ? stats.average.toFixed(1) : 'من دون'}
                  </span>
                  <div className="flex items-center gap-0.5 mt-2.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= Math.round(stats.average);
                      return (
                        <Star
                          key={star}
                          size={14}
                          className={cn(
                            active ? "fill-amber-400 text-amber-400" : "text-neutral-200 dark:text-neutral-800"
                          )}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-black mt-2">
                    {stats.count === 0 ? 'لا توجد تقييمات بعد' : `${stats.count} تقييم`}
                  </span>
                </div>

                {/* Rating bars distribution */}
                <div className="flex-1 space-y-1.5 font-sans">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = stats.distribution[stars as 5|4|3|2|1] || 0;
                    const pct = stats.count > 0 ? (count / stats.count) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs font-bold text-neutral-600 dark:text-neutral-400">
                        <span className="w-3 text-left font-accent text-[11px]">{stars}</span>
                        <div className="h-2 flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="h-full bg-amber-400 rounded-full"
                          />
                        </div>
                        <span className="w-6 text-right font-accent text-[10px] opacity-80">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Your rating section */}
              <div className="border-b border-dashed border-neutral-100 dark:border-white/5 pb-2">
                {user ? (
                  // User logged in
                  myReview && !isEditMode ? (
                    // User already completed review and NOT in edit mode
                    <div className="bg-amber-500/[0.02] dark:bg-amber-500/[0.01] border border-amber-500/10 rounded-2xl p-4 flex items-start justify-between">
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg font-black">
                            تقييمك للمنتج
                          </span>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={12}
                                className={cn(
                                  s <= myReview.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200 dark:text-neutral-800"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-1.5">{myReview.comment || 'من دون تعليق'}</p>
                        <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-black">
                          {myReview.createdAt ? format(new Date(myReview.createdAt.seconds * 1000), 'd MMMM yyyy - h:mm a', { locale: ar }) : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsEditMode(true)}
                          className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-colors"
                          title="تعديل التقييم"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(myReview.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                          title="حذف التقييم"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Submission or editing form
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="text-right flex items-center justify-between">
                        <h4 className="font-display font-black text-sm text-neutral-800 dark:text-neutral-100">
                          {isEditMode ? 'تعديل التقييم والتعليق' : 'مشاركة تجربتك لهذا المنتج'}
                        </h4>
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={() => setIsEditMode(false)}
                            className="text-xs font-black text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                          >
                            إلغاء التعديل
                          </button>
                        )}
                      </div>

                      {/* Interactive Stars Selection */}
                      <div className="flex items-center justify-center gap-2 py-1 bg-neutral-50 dark:bg-neutral-800/20 border border-neutral-100 dark:border-white/5 rounded-2xl">
                        {[1, 2, 3, 4, 5].map((starIndex) => {
                          const active = starIndex <= (hoverRating || rating);
                          return (
                            <button
                              key={starIndex}
                              type="button"
                              onClick={() => setRating(starIndex)}
                              onMouseEnter={() => setHoverRating(starIndex)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 transition-transform active:scale-95 group/star"
                            >
                              <Star
                                size={28}
                                className={cn(
                                  "transition-all",
                                  active 
                                    ? "fill-amber-400 text-amber-400 drop-shadow-sm scale-110" 
                                    : "text-neutral-300 dark:text-neutral-700 group-hover/star:text-amber-300"
                                )}
                              />
                            </button>
                          );
                        })}
                      </div>

                      {/* Comment body */}
                      <div className="relative">
                        <textarea
                          rows={3}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="اكتب تعليقاً أو نصيحة قصيرة للمستهلكين حول السعر أو توفر المنتج..."
                          className="w-full text-right bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-white/5 rounded-2xl p-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:text-white"
                          maxLength={1000}
                        />
                        <div className="absolute left-3 bottom-3 text-[9px] text-neutral-400 dark:text-neutral-500 font-accent">
                          {comment.length} / 1000
                        </div>
                      </div>

                      {error && (
                        <p className="text-right text-xs text-red-500 font-bold flex items-center gap-1">
                          <Info size={12} />
                          <span>{error}</span>
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(
                          "w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white shadow-lg transition-all active:scale-98",
                          isSubmitting 
                            ? "bg-neutral-400 cursor-not-allowed shadow-none" 
                            : "bg-primary-600 hover:bg-primary-700 shadow-primary-500/20 hover:scale-[1.01]"
                        )}
                      >
                        <Send size={16} />
                        <span>{isSubmitting ? 'جاري الحفظ...' : isEditMode ? 'تحديث التقييم' : 'إرسال التقييم'}</span>
                      </button>
                    </form>
                  )
                ) : (
                  // Prompt to login
                  <div className="bg-primary-500/[0.03] dark:bg-neutral-800/40 border border-dashed border-primary-500/10 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-3">
                    <LogIn className="text-primary-500 animate-pulse" size={24} />
                    <div className="text-center">
                      <p className="text-xs font-black text-neutral-800 dark:text-neutral-200">سجل دخولك لتتمكن من تقييم هذا المنتج</p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs leading-relaxed">
                        مشاركتك تعليقك وتقييمك لأسعار السلع تساعد جميع المواطنين على معرفة الحقائق واختيار الشراء الأنسب.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate('/auth');
                      }}
                      className="mt-1 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      تسجيل الدخول الآن
                    </button>
                  </div>
                )}
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black text-neutral-400 uppercase tracking-wider">آراء المستهلكين والمواطنين</span>
                  <div className="h-px flex-1 mx-3 bg-neutral-100 dark:bg-white/5" />
                </div>

                {productReviews.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <MessageSquare size={36} className="mx-auto text-neutral-300 dark:text-neutral-700 stroke-[1.5]" />
                    <p className="text-xs font-black text-neutral-400 dark:text-neutral-500">لا توجد آراء أو تعليقات لهذا المنتج حتى الآن.</p>
                    <p className="text-[10px] text-neutral-300 dark:text-neutral-600">كن أول من يشارك تقييمه للمساعدة في حماية أسعار السوق!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100 dark:divide-white/5 space-y-4">
                    {productReviews.map((rev) => {
                      const isMyReview = user?.uid === rev.userId;
                      return (
                        <div key={rev.id} className="pt-4 first:pt-0 flex items-start gap-3.5 group/item">
                          {/* Avatar Initials Placeholder */}
                          <div className="w-9 h-9 shrink-0 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/50 dark:border-white/5 flex items-center justify-center text-xs font-black text-neutral-600 dark:text-neutral-300">
                            {rev.userName ? rev.userName.substring(0, 1).toUpperCase() : <User size={14} />}
                          </div>

                          {/* Review Detail Card */}
                          <div className="flex-1 min-w-0 text-right space-y-1">
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className={cn(
                                  "text-xs font-black",
                                  isMyReview ? "text-primary-600 dark:text-primary-400" : "text-neutral-800 dark:text-neutral-200"
                                )}>
                                  {rev.userName}
                                  {isMyReview && <span className="text-[9px] bg-primary-100 dark:bg-primary-500/10 text-primary-500 px-1.5 py-0.5 rounded-md mr-1.5">أنت</span>}
                                </span>
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      size={10}
                                      className={cn(
                                        s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200 dark:text-neutral-800"
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                              
                              {/* Delete button (Admin or author only) */}
                              {(isAdmin || isMyReview) && (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(rev.id)}
                                  className="text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                  title="حذف هذا الرأي"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>

                            {rev.comment && (
                              <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed mt-0.5">
                                {rev.comment}
                              </p>
                            )}

                            <div className="flex items-center gap-1 text-[9px] text-neutral-400 dark:text-neutral-500 font-black pt-1">
                              <Calendar size={10} />
                              <span>
                                {rev.createdAt ? format(new Date(rev.createdAt.seconds * 1000), 'd MMMM yyyy - h:mm a', { locale: ar }) : 'الآن'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
