import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, AlertCircle, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { AR } from './utils';
import { Seat } from './seat-layout';
import SeatPicker from './seat-picker';

// ─── Constants ────────────────────────────────────────────────────────────────
const PERMANENTLY_BOOKED: Record<'vip' | 'classic', string[]> = {
  classic: ['B-12', 'B-13', 'B-14', 'B-15', 'B-16'],
  vip:     [],
};

const PAYMENT_NUMBER = '01152625577';

// ─── Types ────────────────────────────────────────────────────────────────────
interface BookingFlowProps {
  lang: 'ar' | 'en';
  selectedTicket: 'vip' | 'classic';
  onClose: () => void;
}

interface FormData {
  name: string;
  phone: string;
  quantity: number | '';
  paymentMethod?: 'vodafone' | 'instapay' | 'later';
}

const EMPTY_FORM: FormData = { name: '', phone: '', quantity: '' };

function generateBookingCode() {
  return `${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function validateForm(data: FormData): Record<string, string> {
  const e: Record<string, string> = {};
  if (data.name.trim().length < 2) e.name = 'name';
  if (!/^(01)[0-9]{9}$/.test(data.phone.replace(/\s/g, ''))) e.phone = 'phone';
  if (data.quantity === '' || !Number.isInteger(data.quantity) || data.quantity < 1) e.quantity = 'quantity';
  return e;
}

function validateSeats(quantity: number | '', seats: Seat[]): Record<string, string> {
  return seats.length !== quantity ? { seats: 'seats' } : {};
}

// ─── CopyNumberBtn ────────────────────────────────────────────────────────────
function CopyNumberBtn({ number, lang }: { number: string; lang: 'ar' | 'en' }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(number); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };
  return (
    <button onClick={copy}
      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${copied ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-[#C6A04C]/15 text-[#C6A04C] border border-[#C6A04C]/30 hover:bg-[#C6A04C]/25'}`}
      style={{ fontFamily: AR(lang) }}>
      {copied ? (lang === 'ar' ? '✅ تم النسخ' : '✅ Copied') : (lang === 'ar' ? 'نسخ' : 'Copy')}
    </button>
  );
}

// ─── BackBtn ──────────────────────────────────────────────────────────────────
function BackBtn({ lang, onBack }: { lang: 'ar' | 'en'; onBack: () => void }) {
  return (
    <button onClick={onBack}
      className="flex items-center gap-1.5 text-white/40 hover:text-white/70 px-4 py-3 rounded-xl hover:bg-white/5 text-sm"
      style={{ fontFamily: AR(lang) }}>
      {lang === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      {lang === 'ar' ? 'رجوع' : 'Back'}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function BookingFlow({ lang, selectedTicket, onClose }: BookingFlowProps) {
  const [step, setStep]                   = useState(1);
  const [formData, setFormData]           = useState<FormData>(EMPTY_FORM);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [errors, setErrors]               = useState<Record<string, string>>({});
  const [bookingCode]                     = useState(generateBookingCode);
  const [showContactModal, setShowContactModal] = useState(false);

  // ✅ Blocked seats from code only — no Supabase, no localStorage
  const bookedSeats = new Set(PERMANENTLY_BOOKED[selectedTicket]);

  const nameRef     = useRef<HTMLInputElement>(null);
  const phoneRef    = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const modalRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalRef.current?.focus();
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  useEffect(() => {
    setSelectedSeats([]);
    setErrors(e => ({ ...e, seats: '' }));
  }, [formData.quantity]);

  const isVip       = selectedTicket === 'vip';
  const formErrors  = validateForm(formData);
  const isFormValid = Object.keys(formErrors).length === 0;

  const text = lang === 'ar'
    ? {
        stepLabels:      ['البيانات', 'المقاعد', 'طريقة الدفع', 'التأكيد'],
        ticketName:      isVip ? 'VIP Signature' : 'Classic Ticket',
        name:            'الاسم الكامل',    namePh: 'أدخل اسمك',
        phone:           'رقم الهاتف',      phonePh: '01XXXXXXXXX',
        quantity:        'عدد التذاكر',     quantityPh: '1',
        selectSeats:     'اختر المقاعد',
        paymentMethod:   'اختر طريقة الدفع',
        paymentDesc:     'نحن نوفر عدة طرق آمنة وموثوقة للدفع',
        vodafonePayment: 'فودافون كاش',
        instaPayment:    'انستاباي',
        laterPayment:    'أريد التواصل قبل الدفع',
        review:          'تأكيد البيانات',
        send:            'أرسل عبر واتساب',
        supportNumber:   '+20 11 52625577',
        support:         'للشكاوي والاستفسارات',
        trustBadge:      'منصة آمنة وموثوقة',
        ticketDelivery:  'سيتم إرسال التذاكر PDF عبر الواتساب بعد تأكيد الحجز',
        next:            'التالي',
        closeLabel:      'إغلاق النافذة',
        close:           'إغلاق',
        sentTitle:       'تم الإرسال بنجاح! 🎉',
        sentBody:        'تم إرسال بيانات حجزك عبر واتساب. سنتواصل معك قريباً لتأكيد المقاعد وإرسال التذكرة.',
        sentCode:        'كود الحجز',
        newBooking:      'حجز جديد',
        err: { name: 'الاسم يجب أن يكون 2 أحرف على الأقل', phone: 'رقم يبدأ بـ 01 ومكون من 11 رقم', quantity: 'عدد صحيح أكبر من 0', seats: 'اختر المقاعد المطابقة للعدد' },
      }
    : {
        stepLabels:      ['Details', 'Seats', 'Payment', 'Confirm'],
        ticketName:      isVip ? 'VIP Signature' : 'Classic Ticket',
        name:            'Full Name',       namePh: 'Enter your name',
        phone:           'Phone Number',    phonePh: '01XXXXXXXXX',
        quantity:        'Quantity',        quantityPh: '1',
        selectSeats:     'Select Seats',
        paymentMethod:   'Choose Payment Method',
        paymentDesc:     'We offer several safe and reliable payment methods',
        vodafonePayment: 'Vodafone Cash',
        instaPayment:    'InstaPay',
        laterPayment:    'Contact Before Paying',
        review:          'Confirm Details',
        send:            'Send via WhatsApp',
        supportNumber:   '+20 11 52625577',
        support:         'For complaints and inquiries',
        trustBadge:      'Safe & Trusted Platform',
        ticketDelivery:  'Tickets will be sent as PDF via WhatsApp after booking confirmation',
        next:            'Next',
        closeLabel:      'Close dialog',
        close:           'Close',
        sentTitle:       'Sent Successfully! 🎉',
        sentBody:        "Your booking details were sent via WhatsApp. We'll reach out soon to confirm your seats.",
        sentCode:        'Booking Code',
        newBooking:      'New Booking',
        err: { name: 'Name must be at least 2 characters', phone: 'Must start with 01 and be 11 digits', quantity: 'Valid number greater than 0', seats: 'Pick seats matching the quantity' },
      };

  const goBack = useCallback(() => setStep(s => s - 1), []);

  const handleFormNext = useCallback(() => {
    setErrors(formErrors);
    if (isFormValid) {
      setStep(2);
    } else {
      const first = Object.keys(formErrors)[0];
      if (first === 'name')     nameRef.current?.focus();
      if (first === 'phone')    phoneRef.current?.focus();
      if (first === 'quantity') quantityRef.current?.focus();
    }
  }, [formErrors, isFormValid]);

  const handleSeatsNext = useCallback(() => {
    const errs = validateSeats(formData.quantity, selectedSeats);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(3);
  }, [formData.quantity, selectedSeats]);

  const handlePaymentNext = useCallback(() => {
    if (!formData.paymentMethod) { setErrors({ payment: 'payment' }); return; }
    setStep(4);
  }, [formData.paymentMethod]);

  const handleSendWhatsApp = useCallback(() => {
    const seatsList = selectedSeats.map(s => `${s.row}${s.number}`).join(', ');
    const payLabels = {
      ar: { vodafone: 'فودافون كاش', instapay: 'انستاباي', later: 'أريد التواصل قبل الدفع' },
      en: { vodafone: 'Vodafone Cash', instapay: 'InstaPay', later: 'Contact Before Paying' },
    };
    const payLabel = payLabels[lang][formData.paymentMethod ?? 'vodafone'];

    const message = lang === 'ar'
      ? `🎫 حجز جديد\n\n👤 الاسم: ${formData.name}\n📞 الهاتف: ${formData.phone}\n🎟️ عدد التذاكر: ${formData.quantity}\n💺 المقاعد: ${seatsList}\n🎭 نوع التذكرة: ${text.ticketName}\n💳 طريقة الدفع: ${payLabel}\n📋 كود الحجز: ${bookingCode}\n\n✅ منصة آمنة وموثوقة`
      : `🎫 New Booking\n\n👤 Name: ${formData.name}\n📞 Phone: ${formData.phone}\n🎟️ Qty: ${formData.quantity}\n💺 Seats: ${seatsList}\n🎭 Ticket: ${text.ticketName}\n💳 Payment: ${payLabel}\n📋 Code: ${bookingCode}\n\n✅ Safe & Trusted Platform`;

    window.open(`https://wa.me/201152625577?text=${encodeURIComponent(message)}`, '_blank');
    setStep(5);
  }, [selectedSeats, formData, lang, bookingCode, text.ticketName]);

  const handleNewBooking = useCallback(() => {
    setFormData(EMPTY_FORM);
    setSelectedSeats([]);
    setErrors({});
    setStep(1);
  }, []);

  const inputCls = (err?: string) =>
    `w-full bg-[#111] border ${err ? 'border-red-500/50 focus:border-red-500' : 'border-white/8 focus:border-[#C6A04C]/50'} rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:bg-[#161616]`;

  const slideVar = {
    enter:  { opacity: 0, x: lang === 'ar' ? -20 : 20 },
    center: { opacity: 1, x: 0 },
    exit:   { opacity: 0, x: lang === 'ar' ? 20 : -20 },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
          aria-label={lang === 'ar' ? 'نافذة الحجز' : 'Booking dialog'}
          tabIndex={-1}
        >
          <div className={`h-[2px] w-full bg-gradient-to-r ${isVip ? 'from-[#C6A04C] to-[#A8382A]' : 'from-[#A8382A] to-[#C6A04C]'}`} />

          <div className="p-6 sm:p-8">
            <div className="absolute top-4 right-4 z-10">
              <button onClick={onClose} className="text-white/30 hover:text-white/70 p-1" aria-label={text.closeLabel}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {step < 5 && (
              <div className="flex gap-1.5 justify-center mb-6" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4}>
                {text.stepLabels.map((label, i) => {
                  const s = i + 1; const done = step > s; const active = step === s;
                  return (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${done ? 'bg-gradient-to-br from-[#C6A04C] to-[#A8382A] text-white' : active ? 'bg-gradient-to-br from-[#C6A04C] to-[#A8382A] text-[#080808]' : 'bg-white/8 text-white/25'}`}>
                        {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : s}
                      </div>
                      <span className={`text-[9px] ${active ? 'text-[#C6A04C]' : 'text-white/25'}`} style={{ fontFamily: AR(lang) }}>{label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <AnimatePresence mode="wait">

              {/* Step 1 */}
              {step === 1 && (
                <motion.div key="s1" variants={slideVar} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-xl font-black text-white mb-6" style={{ fontFamily: AR(lang) }}>{text.stepLabels[0]}</h2>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-white/50 text-xs mb-2" style={{ fontFamily: AR(lang) }}>{text.name}</label>
                      <input ref={nameRef} type="text" value={formData.name} placeholder={text.namePh} autoComplete="name"
                        onChange={e => { setFormData(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); }}
                        className={inputCls(errors.name)} style={{ fontFamily: AR(lang) }} />
                      {errors.name && <p className="mt-1 text-red-400/80 text-xs flex items-center gap-1" role="alert" style={{ fontFamily: AR(lang) }}><AlertCircle className="w-3 h-3" />{text.err.name}</p>}
                    </div>
                    <div>
                      <label className="block text-white/50 text-xs mb-2" style={{ fontFamily: AR(lang) }}>{text.phone}</label>
                      <input ref={phoneRef} type="tel" value={formData.phone} placeholder={text.phonePh} inputMode="numeric" autoComplete="tel"
                        onChange={e => { setFormData(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: '' })); }}
                        className={inputCls(errors.phone)} style={{ direction: 'ltr' }} />
                      {errors.phone && <p className="mt-1 text-red-400/80 text-xs flex items-center gap-1" role="alert" style={{ fontFamily: AR(lang) }}><AlertCircle className="w-3 h-3" />{text.err.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-white/50 text-xs mb-2" style={{ fontFamily: AR(lang) }}>{text.quantity}</label>
                      <input ref={quantityRef} type="text" inputMode="numeric" pattern="[0-9]*"
                        value={formData.quantity} placeholder={text.quantityPh}
                        onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); setFormData(p => ({ ...p, quantity: v === '' ? '' : parseInt(v) })); setErrors(p => ({ ...p, quantity: '' })); }}
                        className={inputCls(errors.quantity)} />
                      {errors.quantity && <p className="mt-1 text-red-400/80 text-xs flex items-center gap-1" role="alert" style={{ fontFamily: AR(lang) }}><AlertCircle className="w-3 h-3" />{text.err.quantity}</p>}
                    </div>
                  </div>
                  <button onClick={handleFormNext} disabled={!isFormValid}
                    className="w-full bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-3.5 rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-opacity"
                    style={{ fontFamily: AR(lang) }}>
                    {text.next} {lang === 'ar' ? '←' : '→'}
                  </button>
                </motion.div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <motion.div key="s2" variants={slideVar} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-xl font-black text-white mb-4" style={{ fontFamily: AR(lang) }}>{text.selectSeats}</h2>
                  <p className="text-white/40 text-xs mb-4" style={{ fontFamily: AR(lang) }}>
                    {lang === 'ar' ? `اختر ${formData.quantity} مقاعد` : `Select ${formData.quantity} seats`}
                  </p>
                  <div className="mb-6 overflow-x-auto">
                    <SeatPicker
                      key={`${selectedTicket}-${formData.quantity}`}
                      type={selectedTicket}
                      available={bookedSeats}
                      quantity={formData.quantity as number}
                      onChange={setSelectedSeats}
                    />
                    {errors.seats && <p className="mt-3 text-red-400/80 text-xs" role="alert" style={{ fontFamily: AR(lang) }}><AlertCircle className="w-3 h-3 inline mr-1" />{text.err.seats}</p>}
                  </div>
                  <div className="flex gap-3">
                    <BackBtn lang={lang} onBack={goBack} />
                    <button onClick={handleSeatsNext} disabled={selectedSeats.length !== formData.quantity}
                      className="flex-1 bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-3 rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-opacity"
                      style={{ fontFamily: AR(lang) }}>
                      {text.next} {lang === 'ar' ? '←' : '→'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <motion.div key="s3-pay" variants={slideVar} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: AR(lang) }}>{text.paymentMethod}</h2>
                  <p className="text-white/50 text-xs mb-6" style={{ fontFamily: AR(lang) }}>{text.paymentDesc}</p>
                  <div className="space-y-3 mb-6">
                    {(['vodafone', 'instapay', 'later'] as const).map(method => {
                      const labels = { vodafone: text.vodafonePayment, instapay: text.instaPayment, later: text.laterPayment };
                      const icons  = { vodafone: '📱', instapay: '🏦', later: '📞' };
                      const isSel  = formData.paymentMethod === method;
                      const hasNum = method === 'vodafone' || method === 'instapay';
                      return (
                        <div key={method}>
                          <button
                            onClick={() => {
                              if (method === 'later') { const a = document.createElement('a'); a.href = 'tel:+201152625577'; a.click(); return; }
                              setFormData(p => ({ ...p, paymentMethod: method }));
                              setErrors(e => ({ ...e, payment: '' }));
                            }}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-sm font-semibold flex items-center gap-3 ${isSel ? 'border-[#C6A04C] bg-[#C6A04C]/10 text-[#C6A04C]' : 'border-white/10 bg-white/5 text-white hover:border-white/20'}`}
                            style={{ fontFamily: AR(lang) }}>
                            <span className="text-xl">{icons[method]}</span>
                            <span>{labels[method]}</span>
                          </button>
                          {hasNum && isSel && (
                            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 bg-[#111] border border-[#C6A04C]/30 rounded-xl p-3">
                              <p className="text-white/40 text-[10px] mb-2" style={{ fontFamily: AR(lang) }}>
                                {lang === 'ar' ? '📋 حوّل المبلغ على هذا الرقم ثم أرسل صورة الإيصال عبر الواتساب' : '📋 Transfer to this number then send the receipt via WhatsApp'}
                              </p>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[#C6A04C] font-mono font-black text-base tracking-widest select-all">{PAYMENT_NUMBER}</span>
                                <CopyNumberBtn number={PAYMENT_NUMBER} lang={lang} />
                              </div>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => setShowContactModal(true)}
                    className="w-full mb-6 bg-gradient-to-r from-[#C6A04C]/20 to-[#A8382A]/20 border border-[#C6A04C]/40 hover:border-[#C6A04C]/70 rounded-xl p-4 transition-all"
                    style={{ fontFamily: AR(lang) }}>
                    <p className="text-[#C6A04C] font-black text-sm">⚡ {lang === 'ar' ? 'تواصل معنا فوراً لتأكيد الحجز' : 'Contact us now to confirm booking'}</p>
                    <p className="text-white/40 text-[10px] mt-1">{lang === 'ar' ? 'واتساب أو اتصال مباشر' : 'WhatsApp or direct call'}</p>
                  </button>
                  <div className="flex gap-3">
                    <BackBtn lang={lang} onBack={goBack} />
                    <button onClick={handlePaymentNext} disabled={!formData.paymentMethod}
                      className="flex-1 bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-3 rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-opacity"
                      style={{ fontFamily: AR(lang) }}>
                      {text.next} {lang === 'ar' ? '←' : '→'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <motion.div key="s4" variants={slideVar} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-xl font-black text-white mb-6" style={{ fontFamily: AR(lang) }}>{text.review}</h2>
                  <div className="space-y-3 mb-6">
                    {[
                      { label: text.name,         value: formData.name },
                      { label: text.phone,         value: formData.phone },
                      { label: lang === 'ar' ? 'نوع التذكرة' : 'Ticket Type', value: `${selectedTicket === 'vip' ? 'VIP Signature' : 'Classic'} — ${isVip ? '500' : '350'} ${lang === 'ar' ? 'جنيه' : 'EGP'}` },
                      { label: text.quantity,      value: `${formData.quantity}` },
                      { label: text.selectSeats,   value: selectedSeats.map(s => `${s.row}${s.number}`).join(', ') },
                      { label: text.paymentMethod, value: formData.paymentMethod === 'vodafone' ? text.vodafonePayment : formData.paymentMethod === 'instapay' ? text.instaPayment : text.laterPayment },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-[#111] border border-white/6 rounded-xl p-4">
                        <p className="text-white/40 text-xs mb-1" style={{ fontFamily: AR(lang) }}>{label}</p>
                        <p className="text-white text-sm" style={{ fontFamily: AR(lang) }}>{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="bg-[#C6A04C]/8 border border-[#C6A04C]/20 rounded-xl p-4 text-center">
                      <p className="text-[#C6A04C] text-sm font-bold" style={{ fontFamily: AR(lang) }}>✅ {text.trustBadge}</p>
                      <p className="text-white/50 text-xs mt-1" style={{ fontFamily: AR(lang) }}>{text.ticketDelivery}</p>
                    </div>
                    <div className="bg-[#A8382A]/15 border border-[#A8382A]/30 rounded-xl p-4">
                      <p className="text-white/70 text-xs mb-2 font-semibold" style={{ fontFamily: AR(lang) }}>📞 {text.support}</p>
                      <p className="text-[#C6A04C] font-bold text-sm">{text.supportNumber}</p>
                    </div>
                  </div>
                  <button onClick={handleSendWhatsApp}
                    className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 font-black py-3.5 rounded-xl mb-3 text-sm transition-colors flex items-center justify-center gap-2"
                    style={{ fontFamily: AR(lang) }}>
                    {text.send} {lang === 'ar' ? '←' : '→'}
                  </button>
                  <BackBtn lang={lang} onBack={goBack} />
                </motion.div>
              )}

              {/* Step 5 */}
              {step === 5 && (
                <motion.div key="s5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="text-center py-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }} className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-green-400" />
                    </div>
                  </motion.div>
                  <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: AR(lang) }}>{text.sentTitle}</h2>
                  <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-xs mx-auto" style={{ fontFamily: AR(lang) }}>{text.sentBody}</p>
                  <div className="bg-[#111] border border-[#C6A04C]/20 rounded-xl p-4 mb-8">
                    <p className="text-white/40 text-xs mb-2" style={{ fontFamily: AR(lang) }}>{text.sentCode}</p>
                    <p className="text-[#C6A04C] font-mono font-black text-lg tracking-widest select-all">{bookingCode}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button onClick={handleNewBooking} className="w-full bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity" style={{ fontFamily: AR(lang) }}>
                      {text.newBooking}
                    </button>
                    <button onClick={onClose} className="w-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold py-3 rounded-xl text-sm transition-all" style={{ fontFamily: AR(lang) }}>
                      {text.close}
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Contact Modal */}
          {showContactModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
              onClick={() => setShowContactModal(false)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={e => e.stopPropagation()}
                className="bg-[#0D0D0D] border border-[#C6A04C]/30 rounded-2xl p-6 max-w-[320px] w-full">
                <h3 className="text-white font-black text-lg mb-1 text-center" style={{ fontFamily: AR(lang) }}>
                  {lang === 'ar' ? '⚡ تواصل سريع' : '⚡ Quick Contact'}
                </h3>
                <p className="text-white/40 text-xs text-center mb-6" style={{ fontFamily: AR(lang) }}>
                  {lang === 'ar' ? 'تواصل معنا بعد الحجز مباشرةً للتأكيد' : 'Contact us right after booking to confirm'}
                </p>
                <div className="space-y-3">
                  <a href="https://wa.me/201152625577" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 rounded-xl p-4 transition-all" style={{ fontFamily: AR(lang) }}>
                    <span className="text-2xl">💬</span>
                    <div className="text-right flex-1">
                      <p className="text-green-400 font-black text-sm">{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</p>
                      <p className="text-white/40 text-[10px]">+20 11 52625577</p>
                    </div>
                  </a>
                  <a href="tel:+201152625577"
                    className="flex items-center gap-3 w-full bg-[#C6A04C]/10 hover:bg-[#C6A04C]/20 border border-[#C6A04C]/30 rounded-xl p-4 transition-all" style={{ fontFamily: AR(lang) }}>
                    <span className="text-2xl">📞</span>
                    <div className="text-right flex-1">
                      <p className="text-[#C6A04C] font-black text-sm">{lang === 'ar' ? 'اتصال مباشر' : 'Direct Call'}</p>
                      <p className="text-white/40 text-[10px]">+20 11 52625577</p>
                    </div>
                  </a>
                </div>
                <button onClick={() => setShowContactModal(false)} className="mt-4 w-full text-white/30 hover:text-white/60 text-xs py-2 transition-colors" style={{ fontFamily: AR(lang) }}>
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
