import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { AR } from './utils';

// seating support
import { Seat } from './seat-layout';
import SeatPicker from './seat-picker';

interface BookingFlowProps {
  lang: 'ar' | 'en';
  selectedTicket: 'vip' | 'classic';
  onClose: () => void;
}

interface FormData {
  name: string;
  phone: string;
  quantity: number;
}

function generateBookingCode() {
  return `${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function validateForm(data: FormData) {
  const errors: Record<string, string> = {};
  if (data.name.trim().length < 2) errors.name = 'name';
  if (!/^(01)[0-9]{9}$/.test(data.phone.replace(/\s/g, ''))) errors.phone = 'phone';
  if (!Number.isInteger(data.quantity) || data.quantity < 1) errors.quantity = 'quantity';
  return errors;
}

function validateSeats(quantity: number, selectedSeats: Seat[]) {
  return selectedSeats.length !== quantity ? { seats: 'seats' } : {};
}


export function BookingFlow({ lang, selectedTicket, onClose }: BookingFlowProps) {
  const [step, setStep] = useState(1); // 1: form, 2: seats, 3: review+whatsapp
  const [formData, setFormData] = useState<FormData>({ name: '', phone: '', quantity: 1 });
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookingCode] = useState(generateBookingCode);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalRef.current?.focus();
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const isVip = selectedTicket === 'vip';

  const text = {
    ar: {
      stepLabels: ['البيانات', 'المقاعد', 'التأكيد'],
      ticketName: isVip ? 'VIP Signature' : 'Classic Ticket',
      ticketPrice: isVip ? '500 جنيه' : '350 جنيه',
      name: 'الاسم الكامل', namePh: 'أدخل اسمك',
      phone: 'رقم الهاتف', phonePh: '01XXXXXXXXX',
      quantity: 'عدد التذاكر', quantityPh: '1',
      selectSeats: 'اختر المقاعد',
      review: 'راجع البيانات',
      send: 'أرسل عبر واتساب',
      next: 'التالي', back: 'رجوع',
      err: {
        name: 'الاسم يجب أن يكون 2 أحرف على الأقل',
        phone: 'رقم يبدأ بـ 01 ومكون من 11 رقم',
        quantity: 'عدد صحيح أكبر من 0',
        seats: 'اختر المقاعد المطابقة للعدد',
      },
    },
    en: {
      stepLabels: ['Details', 'Seats', 'Confirm'],
      ticketName: isVip ? 'VIP Signature' : 'Classic Ticket',
      ticketPrice: isVip ? '500 EGP' : '350 EGP',
      name: 'Full Name', namePh: 'Enter your name',
      phone: 'Phone Number', phonePh: '01XXXXXXXXX',
      quantity: 'Quantity', quantityPh: '1',
      selectSeats: 'Select Seats',
      review: 'Review Info',
      send: 'Send via WhatsApp',
      next: 'Next', back: 'Back',
      err: {
        name: 'Name must be at least 2 characters',
        phone: 'Must start with 01 and be 11 digits',
        quantity: 'Valid number greater than 0',
        seats: 'Pick seats matching the quantity',
      },
    },
  }[lang];

  const handleFormNext = () => {
    const errs = validateForm(formData);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setStep(2);
    } else {
      const first = Object.keys(errs)[0];
      if (first === 'name') nameRef.current?.focus();
      if (first === 'phone') phoneRef.current?.focus();
      if (first === 'quantity') quantityRef.current?.focus();
    }
  };

  const handleSeatsNext = () => {
    const errs = validateSeats(formData.quantity, selectedSeats);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setStep(3);
    }
  };

  const handleSendWhatsApp = () => {
    const message = lang === 'ar'
      ? `الاسم: ${formData.name}\nالهاتف: ${formData.phone}\nعدد التذاكر: ${formData.quantity}\nالمقاعد: ${selectedSeats.map(s => `${s.row}${s.number}`).join(', ')}\nنوع التذكرة: ${text.ticketName}`
      : `Name: ${formData.name}\nPhone: ${formData.phone}\nQuantity: ${formData.quantity}\nSeats: ${selectedSeats.map(s => `${s.row}${s.number}`).join(', ')}\nTicket: ${text.ticketName}`;
    const wa = `https://wa.me/201015656650?text=${encodeURIComponent(message)}`;
    window.open(wa, '_blank');
  };

  const BackBtn = () => (
    <button
      onClick={() => setStep(step - 1)}
      className="flex items-center gap-1.5 text-white/40 hover:text-white/70 px-4 py-3 rounded-xl hover:bg-white/5 text-sm"
      style={{ fontFamily: AR(lang) }}
    >
      {lang === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      {text.back}
    </button>
  );

  const inputCls = (err?: string) => `w-full bg-[#111] border ${err ? 'border-red-500/50 focus:border-red-500' : 'border-white/8 focus:border-[#C6A04C]/50'} rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:bg-[#161616]`;

  const slideVar = {
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
        className="fixed inset-0 bg-black/85 backdrop-blur-lg z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          onClick={e => e.stopPropagation()}
          className="relative bg-[#0D0D0D] border border-[#C6A04C]/20 rounded-2xl max-w-[450px] w-full max-h-[90vh] overflow-y-auto outline-none"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#C6A04C22 transparent' }}
          role="dialog" aria-modal="true"
        >
          <div className={`h-[2px] w-full bg-gradient-to-r ${isVip ? 'from-[#C6A04C] to-[#A8382A]' : 'from-[#A8382A] to-[#C6A04C]'}`} />

          <div className="p-6 sm:p-8">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/70 z-10 p-1" aria-label="Close">
              <X className="w-5 h-5" />
            </button>

            {/* Step indicator */}
            <div className="flex gap-1.5 justify-center mb-6">
              {text.stepLabels.map((label, i) => {
                const s = i + 1;
                const done = step > s, active = step === s;
                return (
                  <div key={s} className="flex flex-col items-center gap-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      done ? 'bg-gradient-to-br from-[#C6A04C] to-[#A8382A] text-white'
                        : active ? 'bg-gradient-to-br from-[#C6A04C] to-[#A8382A] text-[#080808]'
                        : 'bg-white/8 text-white/25'
                    }`}>
                      {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : s}
                    </div>
                    <span className={`text-[9px] ${active ? 'text-[#C6A04C]' : 'text-white/25'}`} style={{ fontFamily: AR(lang) }}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            <AnimatePresence mode="wait">

              {/* Step 1: Form (Name, Phone, Quantity) */}
              {step === 1 && (
                <motion.div key="s1" variants={slideVar} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-xl font-black text-white mb-6" style={{ fontFamily: AR(lang) }}>
                    {text.stepLabels[0]}
                  </h2>

                  <div className="space-y-4 mb-6">
                    {/* Name */}
                    <div>
                      <label className="block text-white/50 text-xs mb-2" style={{ fontFamily: AR(lang) }}>
                        {text.name}
                      </label>
                      <input
                        ref={nameRef}
                        type="text"
                        value={formData.name}
                        placeholder={text.namePh}
                        onChange={e => { setFormData(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); }}
                        className={inputCls(errors.name)}
                        style={{ fontFamily: AR(lang) }}
                        autoComplete="name"
                      />
                      {errors.name && <p className="mt-1 text-red-400/80 text-xs flex items-center gap-1" style={{ fontFamily: AR(lang) }} role="alert">
                        <AlertCircle className="w-3 h-3" />{text.err.name}
                      </p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-white/50 text-xs mb-2" style={{ fontFamily: AR(lang) }}>
                        {text.phone}
                      </label>
                      <input
                        ref={phoneRef}
                        type="tel"
                        value={formData.phone}
                        placeholder={text.phonePh}
                        onChange={e => { setFormData(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: '' })); }}
                        className={inputCls(errors.phone)}
                        style={{ direction: 'ltr' }}
                        inputMode="numeric"
                        autoComplete="tel"
                      />
                      {errors.phone && <p className="mt-1 text-red-400/80 text-xs flex items-center gap-1" style={{ fontFamily: AR(lang) }} role="alert">
                        <AlertCircle className="w-3 h-3" />{text.err.phone}
                      </p>}
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-white/50 text-xs mb-2" style={{ fontFamily: AR(lang) }}>
                        {text.quantity}
                      </label>
                      <input
                        ref={quantityRef}
                        type="number"
                        min="1"
                        max="20"
                        value={formData.quantity}
                        placeholder={text.quantityPh}
                        onChange={e => { setFormData(p => ({ ...p, quantity: parseInt(e.target.value) || 1 })); setErrors(p => ({ ...p, quantity: '' })); }}
                        className={inputCls(errors.quantity)}
                      />
                      {errors.quantity && <p className="mt-1 text-red-400/80 text-xs flex items-center gap-1" style={{ fontFamily: AR(lang) }} role="alert">
                        <AlertCircle className="w-3 h-3" />{text.err.quantity}
                      </p>}
                    </div>
                  </div>

                  <button
                    onClick={handleFormNext}
                    disabled={Object.keys(validateForm(formData)).length > 0}
                    className="w-full bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-3.5 rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-opacity"
                    style={{ fontFamily: AR(lang) }}
                  >
                    {text.next} {lang === 'ar' ? '←' : '→'}
                  </button>
                </motion.div>
              )}

              {/* Step 2: Seats Selection */}
              {step === 2 && (
                <motion.div key="s2" variants={slideVar} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-xl font-black text-white mb-4" style={{ fontFamily: AR(lang) }}>
                    {text.selectSeats}
                  </h2>
                  <p className="text-white/40 text-xs mb-4" style={{ fontFamily: AR(lang) }}>
                    {lang === 'ar' ? `اختر ${formData.quantity} مقاعد` : `Select ${formData.quantity} seats`}
                  </p>

                  <div className="mb-6 overflow-x-auto">
                    <SeatPicker
                      type={selectedTicket}
                      available={new Set<string>()}
                      quantity={formData.quantity}
                      onChange={setSelectedSeats}
                    />
                    {errors.seats && <p className="mt-3 text-red-400/80 text-xs" role="alert" style={{ fontFamily: AR(lang) }}>
                      <AlertCircle className="w-3 h-3 inline mr-1" />{text.err.seats}
                    </p>}
                  </div>

                  <div className="flex gap-3">
                    <BackBtn />
                    <button
                      onClick={handleSeatsNext}
                      disabled={selectedSeats.length !== formData.quantity}
                      className="flex-1 bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-3 rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-opacity"
                      style={{ fontFamily: AR(lang) }}
                    >
                      {text.next} {lang === 'ar' ? '←' : '→'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review & Send WhatsApp */}
              {step === 3 && (
                <motion.div key="s3" variants={slideVar} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-xl font-black text-white mb-6" style={{ fontFamily: AR(lang) }}>
                    {text.review}
                  </h2>

                  <div className="space-y-3 mb-6">
                    <div className="bg-[#111] border border-white/6 rounded-xl p-4">
                      <p className="text-white/40 text-xs mb-1" style={{ fontFamily: AR(lang) }}>{text.name}</p>
                      <p className="text-white text-sm" style={{ fontFamily: AR(lang) }}>{formData.name}</p>
                    </div>

                    <div className="bg-[#111] border border-white/6 rounded-xl p-4">
                      <p className="text-white/40 text-xs mb-1" style={{ fontFamily: AR(lang) }}>{text.phone}</p>
                      <p className="text-white text-sm font-mono">{formData.phone}</p>
                    </div>

                    <div className="bg-[#111] border border-white/6 rounded-xl p-4">
                      <p className="text-white/40 text-xs mb-1" style={{ fontFamily: AR(lang) }}>{text.ticketName}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-white text-sm">{selectedTicket === 'vip' ? 'VIP Signature' : 'Classic'}</p>
                        <p className={`text-sm font-black ${isVip ? 'text-[#C6A04C]' : 'text-white'}`}>{isVip ? '500' : '350'} {lang === 'ar' ? 'جنيه' : 'EGP'}</p>
                      </div>
                    </div>

                    <div className="bg-[#111] border border-white/6 rounded-xl p-4">
                      <p className="text-white/40 text-xs mb-1" style={{ fontFamily: AR(lang) }}>{text.quantity}</p>
                      <p className="text-white text-sm">{formData.quantity}</p>
                    </div>

                    <div className="bg-[#111] border border-white/6 rounded-xl p-4">
                      <p className="text-white/40 text-xs mb-2" style={{ fontFamily: AR(lang) }}>{text.selectSeats}</p>
                      <p className="text-white text-sm font-mono">{selectedSeats.map(s => `${s.row}${s.number}`).join(', ')}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleSendWhatsApp}
                    className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 font-black py-3.5 rounded-xl mb-3 text-sm transition-colors"
                    style={{ fontFamily: AR(lang) }}
                  >
                    {text.send} {lang === 'ar' ? '←' : '→'}
                  </button>

                  <div className="flex gap-3">
                    <BackBtn />
                    <button
                      onClick={onClose}
                      className="flex-1 bg-white/8 hover:bg-white/12 text-white font-black py-3 rounded-xl text-sm transition-colors"
                      style={{ fontFamily: AR(lang) }}
                    >
                      {lang === 'ar' ? 'إغلاق' : 'Close'}
                    </button>
                  </div>
                </motion.div>
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
