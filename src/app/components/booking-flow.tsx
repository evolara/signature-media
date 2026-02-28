import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy, Upload, X, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { AR } from './utils';

// seating support
import { Seat, allSeats } from './seat-layout';
import SeatPicker from './seat-picker';

interface BookingFlowProps {
  lang: 'ar' | 'en';
  selectedTicket: 'vip' | 'standard';
  onClose: () => void;
}

// reused types
interface FormData {
  name: string;
  phone: string;
  email: string;
  quantity: number;
}


function genBookingId() {
  return `RT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function validate(formData: FormData) {
  const errors: Record<string, string> = {};
  if (formData.name.trim().length < 2) errors.name = 'name';
  if (!/^(01)[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) errors.phone = 'phone';
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'email';
  if (!Number.isInteger(formData.quantity) || formData.quantity < 1) errors.quantity = 'quantity';
  return errors;
}

function validateSeats(quantity: number, selectedSeats: Seat[]) {
  const errors: Record<string, string> = {};
  if (selectedSeats.length !== quantity) errors.seats = 'seats';
  return errors;
}


export function BookingFlow({ lang, selectedTicket, onClose }: BookingFlowProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({ name: '', phone: '', email: '', quantity: 1 });
  const [paymentMethod, setPaymentMethod] = useState<'vodafone' | 'instapay' | 'card'>('vodafone');
  const [seatsNote, setSeatsNote] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [bookingId] = useState(genBookingId);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);

  // Focus trap
  useEffect(() => {
    modalRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const isVip = selectedTicket === 'vip';

  const content = {
    ar: {
      stepLabels: ['التذكرة', 'بياناتك', 'اختيار المقاعد', 'راجع معلوماتك', 'طريقة الدفع', 'الدفع', 'تم'],
      vipName: 'VIP Signature', stdName: 'Classic Ticket',
      vipPrice: '500 جنيه', stdPrice: '350 جنيه',
      ticketLabel: 'التذكرة المختارة', priceLabel: 'السعر',
      name: 'الاسم الكامل', namePh: 'أدخل اسمك كاملاً',
      phone: 'رقم الهاتف', phonePh: '01XXXXXXXXX',
      email: 'البريد الإلكتروني', emailPh: 'example@email.com',
      emailOpt: 'اختياري',
      quantity: 'عدد التذاكر', quantityPh: 'أدخل عدد التذاكر',
      paymentTitle: 'اختر طريقة الدفع',
      paymentOptions: ['فودافون كاش', 'إنستاباي', 'كارت بنكي'],
      seatsLabel: 'اختر الأماكن أو اكتب ملاحظة', seatsPh: 'اكتب ملاحظتك هنا',
      errs: {
        name: 'الاسم يجب أن يحتوي على حرفين على الأقل',
        phone: 'رقم يبدأ بـ 01 ومكون من 11 رقم',
        email: 'بريد إلكتروني غير صحيح',
        quantity: 'أدخل عدداً صحيحاً أكبر من 0',
        seats: 'اختر المقاعد المطابقة لعدد التذاكر',
        receipt: 'ارفع إيصال الدفع أولاً',
        size: 'حجم الملف يتجاوز 10MB',
        type: 'نوع الملف غير مدعوم',
      },
      whatsappText: 'ارسل الدفع عبر واتساب',
      next: 'التالي', back: 'رجوع',
      reviewTitle: 'راجع معلوماتك',
      payTitle: 'تعليمات الدفع',
      payDesc: 'حوّل المبلغ إلى أحد الحسابات التالية ثم ارفع صورة الإيصال',
      vodafone: 'فودافون كاش', instapay: 'إنستاباي',
      copy: 'نسخ', copied: 'تم ✓',
      uploadLabel: 'ارفع إيصال الدفع',
      dragText: 'أو اسحب الملف هنا',
      fileHint: 'JPG · PNG · PDF · حتى 10MB',
      confirm: 'تأكيد الحجز',
      confirmed: 'تم تأكيد حجزك!',
      bookingNo: 'رقم الحجز',
      thanks: 'شكراً لاختيارك روح الطرب. التذكرة ستُرسل بعد التأكيد واستلام الواتساب ✨',
      close: 'إغلاق',
      uploaded: 'تم رفع الإيصال ✓',
      whatsappReceive: 'استلام التذاكر عبر واتساب',
    },
    en: {
      stepLabels: ['Ticket', 'Details', 'Seats', 'Review', 'Payment Method', 'Payment', 'Done'],
      vipName: 'VIP Signature', stdName: 'Classic Ticket',
      vipPrice: 'EGP 500', stdPrice: 'EGP 350',
      ticketLabel: 'Selected Ticket', priceLabel: 'Price',
      name: 'Full Name', namePh: 'Enter your full name',
      phone: 'Phone Number', phonePh: '01XXXXXXXXX',
      email: 'Email Address', emailPh: 'example@email.com',
      emailOpt: 'optional',
      quantity: 'Quantity', quantityPh: 'Enter number of tickets',
      paymentTitle: 'Choose payment method',
      paymentOptions: ['Vodafone Cash', 'InstaPay', 'Bank Card'],
      seatsLabel: 'Select seats or write a note', seatsPh: 'Type your note here',
      errs: {
        name: 'Name must be at least 2 characters',
        phone: 'Must start with 01 and be 11 digits',
        email: 'Invalid email address',
        quantity: 'Enter a valid number greater than 0',
        seats: 'Pick seats matching the ticket count',
        receipt: 'Please upload your payment receipt',
        size: 'File exceeds 10MB limit',
        type: 'Unsupported file type',
      },
      whatsappText: 'Send payment via WhatsApp',
      next: 'Next', back: 'Back',
      reviewTitle: 'Review your info',
      payTitle: 'Payment Instructions',
      payDesc: 'Transfer the amount to one of the accounts below, then upload a photo of your receipt',
      vodafone: 'Vodafone Cash', instapay: 'InstaPay',
      copy: 'Copy', copied: 'Copied ✓',
      uploadLabel: 'Upload Payment Receipt',
      dragText: 'or drag & drop here',
      fileHint: 'JPG · PNG · PDF · up to 10MB',
      confirm: 'Confirm Booking',
      confirmed: 'Booking Confirmed!',
      bookingNo: 'Booking ID',
      thanks: 'Thank you for choosing Rooh Al-Tarab. Your ticket will be sent after confirmation and WhatsApp receipt ✨',
      close: 'Close',
      uploaded: 'Receipt uploaded ✓',
      whatsappReceive: 'Receive tickets via WhatsApp',
    },
  }[lang];

  const ticketName = isVip ? content.vipName : content.stdName;
  const ticketPrice = isVip ? content.vipPrice : content.stdPrice;

  const handleCopy = (val: string, key: string) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const processFile = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error(content.errs.size); return; }
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) { toast.error(content.errs.type); return; }
    setReceipt(file);
    toast.success(content.uploaded);
  }, [content]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files?.[0]; if (f) processFile(f);
  }, [processFile]);

  const goNext2 = () => {
    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setStep(3); // move to seats selection
    } else {
      const first = Object.keys(errs)[0];
      const refs: Record<string, React.RefObject<HTMLInputElement>> = {
        name: nameRef as React.RefObject<HTMLInputElement>,
        phone: phoneRef as React.RefObject<HTMLInputElement>,
        email: emailRef as React.RefObject<HTMLInputElement>,
        quantity: quantityRef as React.RefObject<HTMLInputElement>,
      };
      refs[first]?.current?.focus();
    }
  };

  const goNextSeat = () => {
    const errs = validateSeats(formData.quantity, selectedSeats);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setStep(4); // review
    }
  };

  const goNextFromReview = () => {
    setStep(5);
  };

  const goNext3 = () => {
    setStep(6); // move to payment upload step
  };

  // goNext4 is no longer used but kept for clarity if additional steps added
  const goNext4 = () => {
    setStep(7);
  };


  const handleConfirm = () => {
    if (!receipt) {
      toast.error(content.errs.receipt);
      fileRef.current?.focus();
      return;
    }
    setStep(7); // move to confirmed page
  };

  const BackBtn = ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      aria-label={content.back}
      className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm py-3.5 px-4 rounded-xl hover:bg-white/5"
      style={{ fontFamily: AR(lang) }}
    >
      {lang === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      {content.back}
    </button>
  );

  const inputCls = (err?: string) =>
    `w-full bg-[#111] border ${err ? 'border-red-500/50 focus:border-red-500' : 'border-white/8 focus:border-[#C6A04C]/50'} rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:bg-[#161616] transition-all`;

  const ACCOUNTS = [
    { key: 'vodafone', label: content.vodafone, val: '01012345678', icon: '📱' },
    { key: 'instapay', label: content.instapay, val: 'roohaltarab@instapay', icon: '💳' },
  ];

  const slideVariants = {
    enter: { opacity: 0, x: lang === 'ar' ? -20 : 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: lang === 'ar' ? 20 : -20 },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/85 backdrop-blur-lg z-50 flex items-center justify-center p-4 overflow-x-hidden"
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          onClick={e => e.stopPropagation()}
          className="relative bg-[#0D0D0D] border border-[#C6A04C]/20 rounded-2xl max-w-[420px] w-full max-h-[92vh] overflow-y-auto overflow-x-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] outline-none"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#C6A04C22 transparent' }}
          role="dialog" aria-modal="true"
        >
          {/* Top accent */}
          <div className={`h-[2px] w-full bg-gradient-to-r ${isVip ? 'from-[#C6A04C] via-[#D4AF37] to-[#A8382A]' : 'from-[#A8382A] via-[#C6A04C] to-[#A8382A]'}`} />

          <div className="pt-12 p-6 sm:pt-14 sm:p-8">
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-white/30 hover:text-white/70 transition-colors z-10 rounded-full p-1 hover:bg-white/5"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Progress (absolute, sits above card edge) */}
            {step < content.stepLabels.length && (
                <div className="absolute inset-x-0 -top-6 z-40 pointer-events-none">
                <div className="flex items-center justify-center gap-2 bg-transparent px-2 pointer-events-auto overflow-visible">
                  {content.stepLabels.map((label, i) => {
                    const s = i + 1;
                    const done = step > s, active = step === s;
                    return (
                      <div key={s} className="flex items-center gap-2" aria-label={`Step ${s}: ${label}`} aria-current={active ? 'step' : undefined}>
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 relative -top-1 ${
                            done ? 'bg-gradient-to-br from-[#C6A04C] to-[#A8382A] text-white'
                                 : active ? 'bg-gradient-to-br from-[#C6A04C] to-[#A8382A] text-[#080808] shadow-lg shadow-[#C6A04C]/30'
                                 : 'bg-white/[0.06] text-white/25 border border-white/8'
                          }`}>
                            {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : s}
                          </div>
                          <span className={`text-[10px] ${active ? 'text-[#C6A04C]' : 'text-white/25'} transition-colors`} style={{ fontFamily: AR(lang) }}>
                            {label}
                          </span>
                        </div>
                        {s < content.stepLabels.length && (
                            <div className={`flex-1 h-px mt-[-14px] mx-2 transition-all duration-500 ${done ? 'bg-gradient-to-r from-[#C6A04C] to-[#A8382A]' : 'bg-white/8'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">

              {/* ── Step 1: Ticket ── */}
              {step === 1 && (
                <motion.div key="s1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-xl font-black text-center text-white mb-6" style={{ fontFamily: AR(lang) }}>
                    {content.ticketLabel}
                  </h2>
                  <div className={`rounded-xl border p-5 mb-6 ${isVip ? 'border-[#C6A04C]/25 bg-[#C6A04C]/5' : 'border-[#A8382A]/20 bg-[#A8382A]/5'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/35 mb-1" style={{ fontFamily: AR(lang) }}>{content.ticketLabel}</p>
                        <p className={`text-lg font-black ${isVip ? 'text-[#C6A04C]' : 'text-white'}`} style={{ fontFamily: AR(lang) }}>{ticketName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/35 mb-1" style={{ fontFamily: AR(lang) }}>{content.priceLabel}</p>
                        <p className="text-xl font-black text-white" style={{ fontFamily: AR(lang) }}>{ticketPrice}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-4 rounded-xl hover:opacity-90 transition-opacity text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A04C]"
                    style={{ fontFamily: AR(lang) }}
                  >
                    {content.next} {lang === 'ar' ? '←' : '→'}
                  </button>
                </motion.div>
              )}

              {/* ── Step 2: Form ── */}
              {step === 2 && (
                <motion.div key="s2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <motion.h2 id="step-heading" className="text-xl font-black text-center text-white mb-6" style={{ fontFamily: AR(lang) }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>{content.stepLabels[1]}</motion.h2>
                  <div className="space-y-4 mb-6">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-white/50 text-xs mb-1.5" style={{ fontFamily: AR(lang) }}>{content.name}</label>
                      <input
                        id="name"
                        ref={nameRef}
                        type="text" value={formData.name} placeholder={content.namePh}
                        onChange={e => { setFormData(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); }}
                        className={inputCls(errors.name)} style={{ fontFamily: AR(lang) }}
                        autoComplete="name"
                        required
                        aria-required="true"
                        aria-invalid={errors.name ? 'true' : 'false'}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                      {errors.name && <p id="name-error" className="mt-1 text-red-400/80 text-xs flex items-center gap-1" style={{ fontFamily: AR(lang) }} role="alert"><AlertCircle className="w-3 h-3 flex-shrink-0" />{content.errs.name}</p>}
                    </div>
                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-white/50 text-xs mb-1.5" style={{ fontFamily: AR(lang) }}>{content.phone}</label>
                      <input
                        id="phone"
                        ref={phoneRef}
                        type="tel" value={formData.phone} placeholder={content.phonePh} inputMode="numeric"
                        onChange={e => { setFormData(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: '' })); }}
                        className={inputCls(errors.phone)} style={{ direction: 'ltr' }}
                        autoComplete="tel"
                        required
                        aria-required="true"
                        aria-invalid={errors.phone ? 'true' : 'false'}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                      />
                      {errors.phone && <p id="phone-error" className="mt-1 text-red-400/80 text-xs flex items-center gap-1" style={{ fontFamily: AR(lang) }} role="alert"><AlertCircle className="w-3 h-3 flex-shrink-0" />{content.errs.phone}</p>}
                    </div>
                    {/* Email */}
                    <div>
                      <label className="block text-white/50 text-xs mb-1.5 flex items-center gap-1.5" style={{ fontFamily: AR(lang) }}>
                        {content.email}
                        <span className="text-white/20">({content.emailOpt})</span>
                      </label>
                      <input
                        id="email"
                        ref={emailRef}
                        type="email" value={formData.email} placeholder={content.emailPh} inputMode="email"
                        onChange={e => { setFormData(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
                        className={inputCls(errors.email)} style={{ direction: 'ltr' }}
                        autoComplete="email"
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                      {errors.email && <p id="email-error" className="mt-1 text-red-400/80 text-xs flex items-center gap-1" style={{ fontFamily: AR(lang) }} role="alert"><AlertCircle className="w-3 h-3 flex-shrink-0" />{content.errs.email}</p>}
                    </div>
                    {/* Quantity */}
                    <div>
                      <label htmlFor="quantity" className="block text-white/50 text-xs mb-1.5" style={{ fontFamily: AR(lang) }}>{content.quantity}</label>
                      <input
                        id="quantity"
                        ref={quantityRef}
                        type="number" min={1} value={formData.quantity} placeholder={content.quantityPh}
                        onChange={e => { setFormData(p => ({ ...p, quantity: parseInt(e.target.value) || 1 })); setErrors(p => ({ ...p, quantity: '' })); }}
                        className={inputCls(errors.quantity)} style={{ width: '120px' }}
                        required
                        aria-required="true"
                        aria-invalid={errors.quantity ? 'true' : 'false'}
                        aria-describedby={errors.quantity ? 'quantity-error' : undefined}
                      />
                      {errors.quantity && <p id="quantity-error" className="mt-1 text-red-400/80 text-xs flex items-center gap-1" style={{ fontFamily: AR(lang) }} role="alert"><AlertCircle className="w-3 h-3 flex-shrink-0" />{content.errs.quantity}</p>}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <BackBtn onClick={() => setStep(1)} />
                    <button
                      onClick={goNext2}
                      disabled={Object.keys(validate(formData)).length > 0}
                      className={`flex-1 bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-3.5 rounded-xl transition-opacity text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A04C] disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 ${Object.keys(validate(formData)).length===0?'animate-pulse':''}`}
                      style={{ fontFamily: AR(lang) }}
                    >
                      {content.next} {lang === 'ar' ? '←' : '→'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Seats ── */}
              {step === 3 && (
                <motion.div key="s3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <motion.h2 className="text-xl font-black text-center text-white mb-6" style={{ fontFamily: AR(lang) }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    {content.stepLabels[2]}
                  </motion.h2>
                  <div className="mb-4">
                    <SeatPicker
                      type={selectedTicket}
                      available={new Set<string>() /* TODO: replace with API data */}
                      quantity={formData.quantity}
                      onChange={setSelectedSeats}
                    />
                    {errors.seats && <p className="mt-2 text-red-400/80 text-xs" role="alert" style={{ fontFamily: AR(lang) }}>{content.errs.seats}</p>}
                  </div>
                  <div className="mb-4">
                    <label htmlFor="seat-note" className="block text-white/50 text-xs mb-1.5" style={{ fontFamily: AR(lang) }}>{content.seatsLabel}</label>
                    <textarea
                      id="seat-note"
                      value={seatsNote}
                      placeholder={content.seatsPh}
                      onChange={e => setSeatsNote(e.target.value)}
                      className="w-full bg-[#111] border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:bg-[#161616] transition-all h-24 resize-none"
                      style={{ fontFamily: AR(lang) }}
                      aria-label={content.seatsLabel}
                    />
                  </div>
                  <div className="flex gap-3">
                    <BackBtn onClick={() => setStep(2)} />
                    <button
                      onClick={goNextSeat}
                      className="flex-1 bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A04C]"
                      style={{ fontFamily: AR(lang) }}
                    >
                      {content.next} {lang === 'ar' ? '←' : '→'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 4: Review ── */}
              {step === 4 && (
                <motion.div key="s3-review" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-xl font-black text-center text-white mb-4" style={{ fontFamily: AR(lang) }}>{content.reviewTitle}</h2>
                  <div className="space-y-3 mb-6">
                    <div className="bg-[#111] border border-white/6 rounded-xl p-4 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-white/40 text-xs mb-0.5" style={{ fontFamily: AR(lang) }}>{content.name}</p>
                        <p className="text-white truncate" style={{ fontFamily: AR(lang) }}>{formData.name || '-'}</p>
                      </div>
                      <button onClick={() => setStep(2)} className="text-xs text-[#C6A04C] px-3 py-2 rounded-lg">{lang==='ar'?'تعديل':'Edit'}</button>
                    </div>
                    <div className="bg-[#111] border border-white/6 rounded-xl p-4 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-white/40 text-xs mb-0.5" style={{ fontFamily: AR(lang) }}>{content.phone}</p>
                        <p className="text-white truncate" style={{ fontFamily: AR(lang) }}>{formData.phone || '-'}</p>
                      </div>
                      <button onClick={() => setStep(2)} className="text-xs text-[#C6A04C] px-3 py-2 rounded-lg" aria-label={lang==='ar'?'تعديل الهاتف':'Edit phone'}>{lang==='ar'?'تعديل':'Edit'}</button>
                    </div>
                    <div className="bg-[#111] border border-white/6 rounded-xl p-4 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-white/40 text-xs mb-0.5" style={{ fontFamily: AR(lang) }}>{content.email}</p>
                        <p className="text-white truncate" style={{ fontFamily: AR(lang) }}>{formData.email || '-'}</p>
                      </div>
                      <button onClick={() => setStep(2)} className="text-xs text-[#C6A04C] px-3 py-2 rounded-lg" aria-label={lang==='ar'?'تعديل البريد':'Edit email'}>{lang==='ar'?'تعديل':'Edit'}</button>
                    </div>
                    <div className="bg-[#111] border border-white/6 rounded-xl p-4 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-white/40 text-xs mb-0.5" style={{ fontFamily: AR(lang) }}>{content.quantity}</p>
                        <p className="text-white" style={{ fontFamily: AR(lang) }}>{formData.quantity}</p>
                      </div>
                      <button onClick={() => setStep(2)} className="text-xs text-[#C6A04C] px-3 py-2 rounded-lg" aria-label={lang==='ar'?'تعديل الكمية':'Edit quantity'}>{lang==='ar'?'تعديل':'Edit'}</button>
                    </div>
                    <div className="bg-[#111] border border-white/6 rounded-xl p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <p className="text-white/40 text-xs mb-0.5" style={{ fontFamily: AR(lang) }}>{content.seatsLabel}</p>
                        <button onClick={() => setStep(3)} className="text-xs text-[#C6A04C] px-3 py-2 rounded-lg" aria-label={lang==='ar'?'تعديل الأماكن':'Edit seats'}>{lang==='ar'?'تعديل':'Edit'}</button>
                      </div>
                      <p className="text-white truncate" style={{ fontFamily: AR(lang) }}>
                        {selectedSeats.length > 0 ? selectedSeats.map(s => `${s.row}${s.number}`).join(', ') : '-'}
                      </p>
                      {seatsNote && (
                        <p className="text-white/50 text-xs italic" style={{ fontFamily: AR(lang) }}>{seatsNote}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <BackBtn onClick={() => setStep(2)} />
                    <button onClick={goNextFromReview} className="flex-1 bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A04C]" style={{ fontFamily: AR(lang) }}>
                      {content.next} {lang === 'ar' ? '←' : '→'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 5: Payment Method ── */}
              {step === 5 && (
                <motion.div key="s4" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <motion.h2
                    id="step-heading"
                    className="text-xl font-black text-center text-white mb-6"
                    style={{ fontFamily: AR(lang) }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >{content.paymentTitle}</motion.h2>
                  <div role="radiogroup" aria-labelledby="step-heading" aria-required="true" className="space-y-3 mb-6">
                    {content.paymentOptions.map((opt, idx) => {
                      const key = opt.toLowerCase().replace(/\s+/g, '');
                      return (
                        <label key={idx} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio" name="payment" value={key}
                            checked={paymentMethod === key as any}
                            onChange={() => setPaymentMethod(key as any)}
                            className="accent-[#C6A04C]"
                          />
                          <span className="text-white" style={{ fontFamily: AR(lang) }}>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="flex gap-3">
                    <BackBtn onClick={() => setStep(4)} />
                    <button onClick={goNext3} className="flex-1 bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A04C]" style={{ fontFamily: AR(lang) }}>
                      {content.next} {lang === 'ar' ? '←' : '→'}
                    </button>
                  </div>
                </motion.div>
              )}


              {/* ── Step 6: Payment (upload + WhatsApp) ── */}
              {step === 6 && (
                <motion.div key="s5" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <motion.h2 className="text-xl font-black text-center text-white mb-1" style={{ fontFamily: AR(lang) }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>{content.payTitle}</motion.h2>
                  <p className="text-white/35 text-xs text-center mb-6 leading-relaxed" style={{ fontFamily: AR(lang) }}>{content.payDesc}</p>

                  {/* Amount reminder */}
                  <div className="bg-white/[0.03] border border-white/6 rounded-xl p-3 mb-5 flex items-center justify-between">
                    <span className="text-white/40 text-xs" style={{ fontFamily: AR(lang) }}>{ticketName}</span>
                    <span className="text-[#C6A04C] font-black text-base">{ticketPrice}</span>
                  </div>

                  {/* Payment accounts */}
                  <div className="space-y-3 mb-5">
                    {ACCOUNTS.map(({ key, label, val, icon }) => (
                      <div key={key} className="bg-[#111] border border-white/6 rounded-xl p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-white/40 text-xs mb-0.5" style={{ fontFamily: AR(lang) }}>{icon} {label}</p>
                          <p className="text-[#C6A04C] font-mono font-bold text-sm sm:text-base tracking-wide select-all truncate">{val}</p>
                        </div>
                        <button
                          onClick={() => handleCopy(val, key)}
                          className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all ${
                            copied === key
                              ? 'bg-green-500/15 text-green-400 border border-green-500/25 animate-pulse'
                              : 'bg-[#C6A04C]/8 text-[#C6A04C]/70 hover:text-[#C6A04C] hover:bg-[#C6A04C]/15 border border-[#C6A04C]/15'
                          }`}
                          aria-label={`Copy ${label}`}
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copied === key ? content.copied : content.copy}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Upload */}
                  <label
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { fileRef.current?.click(); e.preventDefault(); } }}
                    className={`block rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-300 mb-5 ${
                      isDragging ? 'border-[#C6A04C] bg-[#C6A04C]/8 scale-[1.01]'
                      : receipt ? 'border-green-500/40 bg-green-500/5'
                      : 'border-white/10 hover:border-[#C6A04C]/30 hover:bg-[#C6A04C]/5'
                    }`}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    {receipt ? (
                      <div className="text-green-400">
                        <Check className="w-7 h-7 mx-auto mb-2" strokeWidth={2.5} />
                        <p className="font-semibold text-sm truncate px-4" style={{ fontFamily: AR(lang) }}>{receipt.name}</p>
                        <p className="text-green-400/50 text-xs mt-1">{content.uploaded}</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-7 h-7 text-white/20 mx-auto mb-2" />
                        <p className="text-white/60 text-sm font-semibold mb-1" style={{ fontFamily: AR(lang) }} id="upload-instructions">{content.uploadLabel}</p>
                        <p className="text-white/25 text-xs mb-0.5">{content.dragText}</p>
                        <p className="text-white/15 text-xs">{content.fileHint}</p>
                      </>
                    )}
                    <input ref={fileRef} id="receipt-file" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} className="hidden" aria-describedby="upload-instructions" />
                  </label>

                  {/* WhatsApp link */}
                  <div className="mb-6 text-center">
                    <a
                      href={`https://wa.me/201015656650?text=${encodeURIComponent(lang==='ar'?`ضع صورة الدفع. الاسم: ${formData.name}, الهاتف: ${formData.phone}`:`Please send payment image. Name: ${formData.name}, Phone: ${formData.phone}`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-block bg-green-500/20 text-green-400 px-4 py-2 rounded-xl hover:bg-green-500/25 transition"
                      style={{ fontFamily: AR(lang) }}
                    >
                      {content.whatsappText}
                    </a>
                  </div>

                  <div className="flex gap-3">
                    <BackBtn onClick={() => setStep(5)} />
                    <button
                      onClick={handleConfirm}
                      disabled={!receipt}
                      className={`flex-1 bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-3.5 rounded-xl transition-opacity text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A04C] disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 ${receipt?'animate-pulse':''}`}
                      style={{ fontFamily: AR(lang) }}
                    >
                      {content.confirm}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 7: Confirmed ── */}
              {step === 7 && (
                <motion.div key="s6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="text-center py-4">
                  {/* Checkmark */}
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 250, damping: 20 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C6A04C] to-[#A8382A] flex items-center justify-center mx-auto mb-5 shadow-[0_0_40px_rgba(198,160,76,0.3)]"
                  >
                    <Check className="w-10 h-10 text-[#080808]" strokeWidth={3} />
                  </motion.div>

                  <motion.h2 className="text-2xl sm:text-3xl font-black text-white mb-2" style={{ fontFamily: AR(lang) }} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}>{content.confirmed}</motion.h2>
                  <p className="text-white/40 text-sm mb-8 leading-relaxed" style={{ fontFamily: AR(lang) }}>{content.thanks}</p>

                  {/* Booking card */}
                  <div className="bg-gradient-to-br from-[#C6A04C]/8 to-[#A8382A]/8 border border-[#C6A04C]/25 rounded-xl p-5 mb-6">
                    <p className="text-white/35 text-xs mb-1.5" style={{ fontFamily: AR(lang) }}>{content.bookingNo}</p>
                    <p className="text-2xl font-black text-[#C6A04C] font-mono tracking-widest select-all mb-2 break-words">{bookingId}</p>
                    <div className="h-px bg-[#C6A04C]/15 mb-2" />
                    <p className="text-white/30 text-xs" style={{ fontFamily: AR(lang) }}>{ticketName} · {ticketPrice}</p>
                  </div>

                  {/* Download/WhatsApp actions */}
                  <div className="space-y-3 mb-6">
                    <button disabled className="w-full bg-white/10 text-white/50 font-black py-3 rounded-xl cursor-not-allowed text-sm" style={{ fontFamily: AR(lang) }}>
                      {lang === 'ar' ? 'تحميل التذكرة' : 'Download Ticket'}
                    </button>
                    <p className="text-white/30 text-xs mt-2" style={{ fontFamily: AR(lang) }}>
                      {lang === 'ar' ? 'التذكرة متاحة بعد التأكيد واستلام الواتساب.' : 'Ticket available after confirmation and WhatsApp receipt.'}
                    </p>
                    <a
                      href={`https://wa.me/201015656650?text=${encodeURIComponent(lang==='ar'?`أود استلام التذاكر. الاسم: ${formData.name}, الهاتف: ${formData.phone}`:`I would like to receive tickets. Name: ${formData.name}, Phone: ${formData.phone}`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-full inline-block bg-green-500/20 text-green-400 font-black py-3 rounded-xl hover:bg-green-500/25 text-sm transition"
                      style={{ fontFamily: AR(lang) }}
                    >
                      {content.whatsappReceive}
                    </a>
                  </div>

                  {/* Notes decoration */}
                  <div className="flex justify-center gap-4 mb-6 text-[#C6A04C]/20 select-none" aria-hidden="true">
                    {['♩','♪','♫','♬','♪','♩'].map((n, i) => (
                      <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 1.5+i*0.2, repeat: Infinity, delay: i*0.15 }}>{n}</motion.span>
                    ))}
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-4 rounded-xl hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A04C]"
                    style={{ fontFamily: AR(lang) }}
                  >
                    {content.close}
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
