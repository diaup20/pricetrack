import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Camera, MapPin, AlertTriangle, Phone, User, Calendar, Store, Tag, ChevronDown } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ReportType } from '../types';
import { cn } from '../lib/utils';
import { useData } from '../contexts/DataContext';

export function ReportForm({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { reportTypes, governorates, districts } = useData();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    reporterName: '',
    reporterPhone: '',
    reportDate: new Date().toISOString().split('T')[0],
    reportType: '' as ReportType,
    itemName: '',
    currentPrice: '',
    storeName: '',
    governorate: '',
    district: '',
    locationDetails: '',
    description: '',
    imageUrl: '',
  });

  const filteredDistricts = districts.filter(d => d.governorateId === formData.governorate);

  const validatePhone = (phone: string) => {
    return /^7[01378]\d{7}$/.test(phone);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 5) { // 5MB max for initial selection
        alert('حجم الملف كبير جداً');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Target a very small size to stay well under 32KB limit
          const MAX_SIZE = 150; 
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Use low quality to ensure small base64 string
          let quality = 0.3;
          let compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          
          // Iteratively reduce quality if still too large
          while (compressedBase64.length > 30000 && quality > 0.05) {
            quality -= 0.05;
            compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          }

          if (compressedBase64.length > 32767) {
            // Final emergency fallback: resize even more
            const tinyCanvas = document.createElement('canvas');
            tinyCanvas.width = 80;
            tinyCanvas.height = (80 / width) * height;
            tinyCanvas.getContext('2d')?.drawImage(canvas, 0, 0, tinyCanvas.width, tinyCanvas.height);
            compressedBase64 = tinyCanvas.toDataURL('image/jpeg', 0.1);
          }

          if (compressedBase64.length <= 32767) {
            setFormData(prev => ({ ...prev, imageUrl: compressedBase64 }));
          } else {
            alert('تعذر ضغط الصورة بشكل كافٍ. يرجى اختيار صورة أصغر.');
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.reporterName) newErrors.reporterName = 'الاسم مطلوب';
      if (!formData.reporterPhone) {
        newErrors.reporterPhone = 'رقم الجوال مطلوب';
      } else if (!validatePhone(formData.reporterPhone)) {
        newErrors.reporterPhone = 'رقم جوال يمني غير صحيح (يجب أن يبدأ بـ 77، 73، 71، 70، 78)';
      }
    } else if (step === 2) {
      if (!formData.reportType) newErrors.reportType = 'نوع البلاغ مطلوب';
      if (!formData.itemName) newErrors.itemName = 'اسم السلعة مطلوب';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    if (!formData.governorate || !formData.district) {
      alert('يرجى اختيار المحافظة والمديرية');
      return;
    }

    // Double check field lengths for Firestore limits
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string' && value.length > 32767) {
        alert(`الحقل ${key} يتجاوز الحد المسموح به (32,767 حرفاً). يرجى تقليل طول النص.`);
        return;
      }
    }

    setLoading(true);
    try {
      // Find names for governorate and district
      const govName = governorates.find(g => g.id === formData.governorate)?.name || formData.governorate;
      const districtName = districts.find(d => d.id === formData.district)?.name || formData.district;

      const reportRef = await addDoc(collection(db, 'reports'), {
        ...formData,
        governorate: govName,
        district: districtName,
        currentPrice: Number(formData.currentPrice),
        status: 'new',
        createdAt: serverTimestamp(),
      });

      // Save to localStorage for "My Reports" page
      const myReports = JSON.parse(localStorage.getItem('my_reports') || '[]');
      myReports.push(reportRef.id);
      localStorage.setItem('my_reports', JSON.stringify(myReports));

      alert('تم إرسال البلاغ بنجاح. شكراً لتعاونكم.');
      onClose();
      setStep(1);
      setFormData({
        reporterName: '',
        reporterPhone: '',
        reportDate: new Date().toISOString().split('T')[0],
        reportType: '' as ReportType,
        itemName: '',
        currentPrice: '',
        storeName: '',
        governorate: '',
        district: '',
        locationDetails: '',
        description: '',
        imageUrl: '',
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-500 text-white p-2 rounded-xl">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="font-display font-black text-xl text-neutral-900 dark:text-white">إبلاغ عن حالة</h2>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">ساهم في حماية المستهلك</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-400">
                <X size={20} />
              </button>
            </div>

            {/* Steps Indicator */}
            <div className="flex px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex flex-col gap-1.5">
                  <div className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    step >= s ? "bg-primary-500" : "bg-neutral-200 dark:bg-neutral-700"
                  )} />
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-wider text-center",
                    step >= s ? "text-primary-500" : "text-neutral-400"
                  )}>
                    {s === 1 ? "بيانات المُبلغ" : s === 2 ? "بيانات السلعة" : "التفاصيل"}
                  </span>
                </div>
              ))}
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
              {step === 1 && (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                      <User size={12} /> الاسم الكامل <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required
                      type="text" 
                      value={formData.reporterName}
                      onChange={e => setFormData({...formData, reporterName: e.target.value})}
                      maxLength={100}
                      placeholder="أدخل اسمك هنا..."
                      className={cn(
                        "w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white",
                        errors.reporterName && "ring-2 ring-red-500"
                      )}
                    />
                    {errors.reporterName && <p className="text-[10px] font-bold text-red-500 mr-2">{errors.reporterName}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                      <Phone size={12} /> رقم الجوال اليمني <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required
                      type="tel" 
                      value={formData.reporterPhone}
                      onChange={e => setFormData({...formData, reporterPhone: e.target.value})}
                      maxLength={20}
                      placeholder="77XXXXXXX"
                      className={cn(
                        "w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white",
                        errors.reporterPhone && "ring-2 ring-red-500"
                      )}
                    />
                    {errors.reporterPhone && <p className="text-[10px] font-bold text-red-500 mr-2">{errors.reporterPhone}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={12} /> تاريخ البلاغ <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required
                      type="date" 
                      value={formData.reportDate}
                      onChange={e => setFormData({...formData, reportDate: e.target.value})}
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">نوع البلاغ <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        required
                        value={formData.reportType}
                        onChange={e => setFormData({...formData, reportType: e.target.value as ReportType})}
                        className={cn(
                          "w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white appearance-none",
                          errors.reportType && "ring-2 ring-red-500"
                        )}
                      >
                        <option value="">اختر نوع البلاغ...</option>
                        {reportTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                    {errors.reportType && <p className="text-[10px] font-bold text-red-500 mr-2">{errors.reportType}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                      <Tag size={12} /> اسم السلعة <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required
                      type="text" 
                      value={formData.itemName}
                      onChange={e => setFormData({...formData, itemName: e.target.value})}
                      maxLength={200}
                      placeholder="مثال: دقيق السعيد 50كجم"
                      className={cn(
                        "w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white",
                        errors.itemName && "ring-2 ring-red-500"
                      )}
                    />
                    {errors.itemName && <p className="text-[10px] font-bold text-red-500 mr-2">{errors.itemName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                        <Store size={12} /> اسم المتجر <span className="text-red-500">*</span>
                      </label>
                      <input 
                        required
                        type="text" 
                        value={formData.storeName}
                        onChange={e => setFormData({...formData, storeName: e.target.value})}
                        maxLength={200}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">السعر الحالي <span className="text-red-500">*</span></label>
                      <input 
                        required
                        type="number" 
                        value={formData.currentPrice}
                        onChange={e => setFormData({...formData, currentPrice: e.target.value})}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={12} /> المحافظة <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={formData.governorate}
                        onChange={e => setFormData({...formData, governorate: e.target.value, district: ''})}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white appearance-none"
                      >
                        <option value="">اختر المحافظة...</option>
                        {governorates.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">المديرية <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        required
                        value={formData.district}
                        onChange={e => setFormData({...formData, district: e.target.value})}
                        disabled={!formData.governorate}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white disabled:opacity-50 appearance-none"
                      >
                        <option value="">اختر المديرية...</option>
                        {filteredDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">الحي / الشارع <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    value={formData.locationDetails}
                    onChange={e => setFormData({...formData, locationDetails: e.target.value})}
                    maxLength={200}
                    placeholder="أدخل تفاصيل الموقع..."
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">وصف مختصر <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    maxLength={1000}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white resize-none"
                    placeholder="أدخل أي تفاصيل إضافية هنا..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">إرفاق صورة السلعة أو الفاتورة</label>
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="report-image"
                      />
                      <label 
                        htmlFor="report-image"
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border-2 border-dashed border-neutral-200 dark:border-white/10 rounded-2xl p-4 text-sm font-bold text-neutral-400 flex items-center justify-center gap-2 cursor-pointer hover:bg-neutral-100 transition-all"
                      >
                        <Camera size={20} />
                        {formData.imageUrl ? 'تم اختيار صورة' : 'اضغط لاختيار صورة'}
                      </label>
                    </div>
                    {formData.imageUrl && (
                      <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-inner flex shrink-0">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </form>

            {/* Footer Footer */}
            <div className="p-6 border-t border-neutral-100 dark:border-white/5 bg-neutral-50 dark:bg-neutral-800/30 flex gap-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-4 rounded-2xl text-sm font-bold text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                >
                  السابق
                </button>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-4 rounded-2xl text-sm font-bold shadow-lg active:scale-[0.98] transition-all"
                >
                  متابعة
                </button>
              ) : (
                <button
                  disabled={loading}
                  onClick={handleSubmit}
                  className={cn(
                    "flex-1 bg-primary-500 text-white py-4 rounded-2xl text-sm font-bold shadow-lg shadow-primary-200 dark:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {loading ? 'جاري الإرسال...' : (
                    <>
                      إرسال البلاغ <Send size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
