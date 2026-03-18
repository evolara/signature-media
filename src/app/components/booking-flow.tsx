import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { AR } from './utils';
import { Seat } from './seat-layout';
import SeatPicker from './seat-picker';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// LocalStorage keys
const STORAGE_PREFIX = 'signature_media_bookings_';
const getStorageKey = (ticketType: 'vip' | 'classic') => `${STORAGE_PREFIX}${ticketType}`;

// Load booked seats from localStorage
function loadBookedSeatsFromStorage(ticketType: 'vip' | 'classic'): Set<string> {
  try {
    const stored = localStorage.getItem(getStorageKey(ticketType));
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (e) {
    console.error('Error loading booked seats from storage:', e);
  }
  return new Set();
}

// Save booked seats to localStorage
function saveBookedSeatsToStorage(ticketType: 'vip' | 'classic', seats: Set<string>) {
  try {
    localStorage.setItem(getStorageKey(ticketType), JSON.stringify(Array.from(seats)));
  } catch (e) {
    console.error('Error saving booked seats to storage:', e);
  }
}

interface BookingFlowProps {
  lang: 'ar' | 'en';
  selectedTicket: 'vip' | 'classic';
  onClose: () => void;
}

interface FormData {
  name: string;
  phone: string;
  quantity: number;
  paymentMethod?: 'vodafone' | 'card' | 'instapay' | 'later';
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

// Fetch booked seats from Supabase
async function fetchBookedSeats(ticketType: 'vip' | 'classic'): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from('booked_seats')
      .select('seat_key')
      .eq('ticket_type', ticketType);
    
    if (error) throw error;
    return new Set((data || []).map(row => row.seat_key));
  } catch (e) {
    console.error('Error fetching booked seats:', e);
    return new Set();
  }
}

// Reserve seats in Supabase
async function reserveSeats(seats: Seat[], ticketType: 'vip' | 'classic'): Promise<boolean> {
  try {
    const reservations = seats.map(s => ({
      seat_key: `${s.row}-${s.number}`,
      ticket_type: ticketType,
    }));
    
    const { error } = await supabase
      .from('booked_seats')
      .insert(reservations);
    
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Error reserving seats:', e);
    return false;
  }
}

function CopyNumberBtn({ number, lang }: { number: string; lang: 'ar' | 'en' }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };
  return (
    <button
      onClick={handleCopy}
      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
        copied
          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
          : 'bg-[#C6A04C]/15 text-[#C6A04C] border border-[#C6A04C]/30 hover:bg-[#C6A04C]/25'
      }`}
      style={{ fontFamily: lang === 'ar' ? 'Cairo, sans-serif' : undefined }}
    >
      {copied ? (lang === 'ar' ? '✅ تم النسخ' : '✅ Copied') : (lang === 'ar' ? 'نسخ' : 'Copy')}
    </button>
  );
}

export function BookingFlow({ lang, selectedTicket, onClose }: BookingFlowProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({ name: '', phone: '', quantity: '' as unknown as number });
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookingCode] = useState(generateBookingCode);
  const [bookedSeats, setBookedSeats] = useState<Set<string>>(new Set());
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [seatResetKey, setSeatResetKey] = useState(0);
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

  // Load booked seats from localStorage on mount
  useEffect(() => {
    // Load from localStorage (الذاكرة المحلية للجهاز)
    const stored = loadBookedSeatsFromStorage(selectedTicket);

    // 🔒 Permanently booked seats (hardcoded - لا يمكن حجزها أبداً)
    const permanentlyBooked: string[] = [];
    if (selectedTicket === 'classic') {
      permanentlyBooked.push('A-7');
      permanentlyBooked.push('A-5');
      permanentlyBooked.push('A-6');
      permanentlyBooked.push('B-5');
      permanentlyBooked.push('B-6');
      permanentlyBooked.push('B-10');
      permanentlyBooked.push('B-11');
    }
    if (selectedTicket === 'vip') {
      permanentlyBooked.push('B-8');
    }

    const merged = new Set([...stored, ...permanentlyBooked]);
    setBookedSeats(merged);
    setLoadingSeats(false);

    // Optional: Log for debugging
    if (stored.size > 0) {
      console.log(`📍 Loaded ${stored.size} booked seats for ${selectedTicket}`);
    }
  }, [selectedTicket]);

  // Reset seats when quantity changes
  useEffect(() => {
    setSelectedSeats([]);
    setErrors(e => ({ ...e, seats: '' }));
  }, [formData.quantity]);

  const isVip = selectedTicket === 'vip';

  const text = {
    ar: {
      stepLabels: ['البيانات', 'المقاعد', 'طريقة الدفع', 'التأكيد'],
      ticketName: isVip ? 'VIP Signature' : 'Classic Ticket',
      ticketPrice: isVip ? '500 جنيه' : '350 جنيه',
      name: 'الاسم الكامل',
      namePh: 'أدخل اسمك',
      phone: 'رقم الهاتف',
      phonePh: '01XXXXXXXXX',
      quantity: 'عدد التذاكر',
      quantityPh: '1',
      selectSeats: 'اختر المقاعد',
      paymentMethod: 'اختر طريقة الدفع',
      paymentDesc: 'نحن نوفر عدة طرق آمنة وموثوقة للدفع',
      vodafonePayment: 'فودافون كاش',
      cardPayment: 'كارت بنكي',
      instaPayment: 'انستاباي',
      laterPayment: 'أريد التواصل قبل الدفع',
      review: 'تأكيد البيانات',
      send: 'أرسل عبر واتساب',
      supportNumber: '+20 10 15656650',
      support: 'للشكاوي والاستفسارات',
      trustBadge: 'منصة آمنة وموثوقة',
      ticketDelivery: 'سيتم إرسال التذاكر PDF عبر الواتساب بعد تأكيد الحجز',
      next: 'التالي',
      back: 'رجوع',
      err: {
        name: 'الاسم يجب أن يكون 2 أحرف على الأقل',
        phone: 'رقم يبدأ بـ 01 ومكون من 11 رقم',
        quantity: 'عدد صحيح أكبر من 0',
        seats: 'اختر المقاعد المطابقة للعدد',
      },
    },
    en: {
      stepLabels: ['Details', 'Seats', 'Payment', 'Confirm'],
      ticketName: isVip ? 'VIP Signature' : 'Classic Ticket',
      ticketPrice: isVip ? '500 EGP' : '350 EGP',
      name: 'Full Name',
      namePh: 'Enter your name',
      phone: 'Phone Number',
      phonePh: '01XXXXXXXXX',
      quantity: 'Quantity',
      quantityPh: '1',
      selectSeats: 'Select Seats',
      paymentMethod: 'Choose Payment Method',
      paymentDesc: 'We offer several safe and reliable payment methods',
      vodafonePayment: 'Vodafone Cash',
      cardPayment: 'Bank Card',
      instaPayment: 'InstaPay',
      laterPayment: 'Contact Before Paying',
      review: 'Confirm Details',
      send: 'Send via WhatsApp',
      supportNumber: '+20 10 15656650',
      support: 'For complaints and inquiries',
      trustBadge: 'Safe & Trusted Platform',
      ticketDelivery: 'Tickets will be sent as PDF via WhatsApp after booking confirmation',
      next: 'Next',
      back: 'Back',
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
      setStep(3); // Payment Method
    }
  };

  const handlePaymentNext = () => {
    if (!formData.paymentMethod) {
      setErrors({ payment: 'payment' });
      return;
    }
    setStep(4); // Review & Send
  };

  const handleSendWhatsApp = () => {
    const seatsList = selectedSeats.map(s => `${s.row}${s.number}`).join(', ');
    const paymentLabels = {
      ar: { 
        vodafone: 'فودافون كاش', 
        card: 'كارت بنكي', 
        instapay: 'انستاباي',
        later: 'أريد التواصل قبل الدفع'
      },
      en: { 
        vodafone: 'Vodafone Cash', 
        card: 'Bank Card', 
        instapay: 'InstaPay',
        later: 'Contact Before Paying'
      }
    };
    const paymentLabel = paymentLabels[lang][formData.paymentMethod || 'vodafone'];
    
    const message = lang === 'ar'
      ? `🎫 حجز جديد\n\n👤 الاسم: ${formData.name}\n📞 الهاتف: ${formData.phone}\n🎟️ عدد التذاكر: ${formData.quantity}\n💺 المقاعد: ${seatsList}\n🎭 نوع التذكرة: ${text.ticketName}\n💳 طريقة الدفع: ${paymentLabel}\n\n📋 ${text.ticketDelivery}\n\n✅ منصة آمنة وموثوقة\n\n📞 للشكاوي والاستفسارات:\n${text.supportNumber}`
      : `🎫 New Booking\n\n👤 Name: ${formData.name}\n📞 Phone: ${formData.phone}\n🎟️ Quantity: ${formData.quantity}\n💺 Seats: ${seatsList}\n🎭 Ticket: ${text.ticketName}\n💳 Payment Method: ${paymentLabel}\n\n📋 ${text.ticketDelivery}\n\n✅ Safe & Trusted Platform\n\n📞 For complaints and inquiries:\n${text.supportNumber}`;
    
    // 💾 Save booked seats to localStorage (الحفظ المحلي)
    const newBookedSeats = selectedSeats.map(s => `${s.row}-${s.number}`);
    const existing = loadBookedSeatsFromStorage(selectedTicket);
    const updated = new Set([...existing, ...newBookedSeats]);
    saveBookedSeatsToStorage(selectedTicket, updated);
    
    // Update state to reflect new bookings
    setBookedSeats(updated);
    
    // Open WhatsApp
    const waUrl = `https://wa.me/201015656650?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    
    toast.success(
      lang === 'ar' 
        ? `✅ تم حفظ ${newBookedSeats.length} مقاعد وإرسال البيانات` 
        : `✅ Saved ${newBookedSeats.length} seats and sent data`
    );
    
    // Reset form
    setFormData({ name: '', phone: '', quantity: '' as unknown as number });
    setSelectedSeats([]);
    setStep(1);
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

  const inputCls = (err?: string) =>
    `w-full bg-[#111] border ${err ? 'border-red-500/50 focus:border-red-500' : 'border-white/8 focus:border-[#C6A04C]/50'} rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:bg-[#161616]`;

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
          role="dialog"
          aria-modal="true"
        >
          <div className={`h-[2px] w-full bg-gradient-to-r ${isVip ? 'from-[#C6A04C] to-[#A8382A]' : 'from-[#A8382A] to-[#C6A04C]'}`} />

          <div className="p-6 sm:p-8">
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              {/* Close button */}
              <button
                onClick={onClose}
                className="text-white/30 hover:text-white/70 p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex gap-1.5 justify-center mb-6">
              {text.stepLabels.map((label, i) => {
                const s = i + 1;
                const done = step > s;
                const active = step === s;
                return (
                  <div key={s} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        done
                          ? 'bg-gradient-to-br from-[#C6A04C] to-[#A8382A] text-white'
                          : active
                            ? 'bg-gradient-to-br from-[#C6A04C] to-[#A8382A] text-[#080808]'
                            : 'bg-white/8 text-white/25'
                      }`}
                    >
                      {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : s}
                    </div>
                    <span
                      className={`text-[9px] ${active ? 'text-[#C6A04C]' : 'text-white/25'}`}
                      style={{ fontFamily: AR(lang) }}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Form (Name, Phone, Quantity) */}
              {step === 1 && (
                <motion.div
                  key="s1"
                  variants={slideVar}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                >
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
                        onChange={e => {
                          setFormData(p => ({ ...p, name: e.target.value }));
                          setErrors(p => ({ ...p, name: '' }));
                        }}
                        className={inputCls(errors.name)}
                        style={{ fontFamily: AR(lang) }}
                        autoComplete="name"
                      />
                      {errors.name && (
                        <p
                          className="mt-1 text-red-400/80 text-xs flex items-center gap-1"
                          style={{ fontFamily: AR(lang) }}
                          role="alert"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {text.err.name}
                        </p>
                      )}
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
                        onChange={e => {
                          setFormData(p => ({ ...p, phone: e.target.value }));
                          setErrors(p => ({ ...p, phone: '' }));
                        }}
                        className={inputCls(errors.phone)}
                        style={{ direction: 'ltr' }}
                        inputMode="numeric"
                        autoComplete="tel"
                      />
                      {errors.phone && (
                        <p
                          className="mt-1 text-red-400/80 text-xs flex items-center gap-1"
                          style={{ fontFamily: AR(lang) }}
                          role="alert"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {text.err.phone}
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-white/50 text-xs mb-2" style={{ fontFamily: AR(lang) }}>
                        {text.quantity}
                      </label>
                      <input
                        ref={quantityRef}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.quantity === ('' as unknown as number) ? '' : formData.quantity}
                        placeholder={text.quantityPh}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setFormData(p => ({ ...p, quantity: val === '' ? '' as unknown as number : parseInt(val) }));
                          setErrors(p => ({ ...p, quantity: '' }));
                        }}
                        className={inputCls(errors.quantity)}
                      />
                      {errors.quantity && (
                        <p
                          className="mt-1 text-red-400/80 text-xs flex items-center gap-1"
                          style={{ fontFamily: AR(lang) }}
                          role="alert"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {text.err.quantity}
                        </p>
                      )}
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
                <motion.div
                  key="s2"
                  variants={slideVar}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-xl font-black text-white mb-4" style={{ fontFamily: AR(lang) }}>
                    {text.selectSeats}
                  </h2>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-white/40 text-xs" style={{ fontFamily: AR(lang) }}>
                      {lang === 'ar' ? `اختر ${formData.quantity} مقاعد` : `Select ${formData.quantity} seats`}
                    </p>
                    {selectedSeats.length > 0 && (
                      <button
                        onClick={() => {
                          setSelectedSeats([]);
                          setSeatResetKey(k => k + 1);
                        }}
                        className="flex items-center gap-1 text-[10px] font-bold text-red-400/70 hover:text-red-400 border border-red-400/20 hover:border-red-400/40 px-2 py-1 rounded-lg transition-all"
                        style={{ fontFamily: AR(lang) }}
                      >
                        <X className="w-3 h-3" />
                        {lang === 'ar' ? 'مسح الكل' : 'Clear all'}
                      </button>
                    )}
                  </div>

                  <div className="mb-6 overflow-x-auto">
                    <SeatPicker
                      key={`${selectedTicket}-${formData.quantity}-${seatResetKey}`}
                      type={selectedTicket}
                      available={bookedSeats}
                      quantity={formData.quantity}
                      onChange={setSelectedSeats}
                    />
                    {errors.seats && (
                      <p
                        className="mt-3 text-red-400/80 text-xs"
                        role="alert"
                        style={{ fontFamily: AR(lang) }}
                      >
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        {text.err.seats}
                      </p>
                    )}
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

              {/* Step 3: Payment Method */}
              {step === 3 && (
                <motion.div key="s3" variants={slideVar} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: AR(lang) }}>
                    {text.paymentMethod}
                  </h2>
                  <p className="text-white/50 text-xs mb-6" style={{ fontFamily: AR(lang) }}>
                    {text.paymentDesc}
                  </p>

                  <div className="space-y-3 mb-6">
                    {(['vodafone', 'instapay', 'later'] as const).map((method) => {
                      const labels = {
                        vodafone: text.vodafonePayment,
                        instapay: text.instaPayment,
                        later: text.laterPayment,
                      };
                      const icons = {
                        vodafone: '📱',
                        instapay: '🏦',
                        later: '📞',
                      };
                      const PAYMENT_NUMBER = '01152625577';
                      const isSelected = formData.paymentMethod === method;
                      const hasNumber = method === 'vodafone' || method === 'instapay';

                      return (
                        <div key={method}>
                          <button
                            onClick={() => {
                              if (method === 'later') {
                                window.location.href = 'tel:+201015656650';
                                return;
                              }
                              setFormData(p => ({ ...p, paymentMethod: method }));
                              setErrors(e => ({ ...e, payment: '' }));
                            }}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-sm font-semibold flex items-center gap-3 ${
                              isSelected
                                ? 'border-[#C6A04C] bg-[#C6A04C]/10 text-[#C6A04C]'
                                : 'border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/8'
                            }`}
                            style={{ fontFamily: AR(lang) }}
                          >
                            <span className="text-xl">{icons[method]}</span>
                            <span>{labels[method]}</span>
                          </button>

                          {/* Number reveal for vodafone & instapay */}
                          {hasNumber && isSelected && (
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 bg-[#111] border border-[#C6A04C]/30 rounded-xl p-3"
                            >
                              <p className="text-white/40 text-[10px] mb-2" style={{ fontFamily: AR(lang) }}>
                                {lang === 'ar' ? '📋 حوّل المبلغ على هذا الرقم ثم أرسل صورة الإيصال عبر الواتساب' : '📋 Transfer to this number then send the receipt via WhatsApp'}
                              </p>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[#C6A04C] font-mono font-black text-base tracking-widest select-all">
                                  {PAYMENT_NUMBER}
                                </span>
                                <CopyNumberBtn number={PAYMENT_NUMBER} lang={lang} />
                              </div>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Contact CTA Button */}
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="w-full mb-6 bg-gradient-to-r from-[#C6A04C]/20 to-[#A8382A]/20 border border-[#C6A04C]/40 hover:border-[#C6A04C]/70 rounded-xl p-4 transition-all group"
                    style={{ fontFamily: AR(lang) }}
                  >
                    <p className="text-[#C6A04C] font-black text-sm group-hover:scale-105 transition-transform">
                      ⚡ {lang === 'ar' ? 'تواصل معنا فوراً لتأكيد الحجز' : 'Contact us now to confirm booking'}
                    </p>
                    <p className="text-white/40 text-[10px] mt-1">
                      {lang === 'ar' ? 'واتساب أو اتصال مباشر' : 'WhatsApp or direct call'}
                    </p>
                  </button>

                  <div className="flex gap-3">
                    <BackBtn />
                    <button
                      onClick={handlePaymentNext}
                      disabled={!formData.paymentMethod}
                      className="flex-1 bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-3 rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-opacity"
                      style={{ fontFamily: AR(lang) }}
                    >
                      {text.next} {lang === 'ar' ? '←' : '→'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Contact Modal */}
              {showContactModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                  onClick={() => setShowContactModal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-[#0D0D0D] border border-[#C6A04C]/30 rounded-2xl p-6 max-w-[320px] w-full"
                  >
                    <h3 className="text-white font-black text-lg mb-1 text-center" style={{ fontFamily: AR(lang) }}>
                      {lang === 'ar' ? '⚡ تواصل سريع' : '⚡ Quick Contact'}
                    </h3>
                    <p className="text-white/40 text-xs text-center mb-6" style={{ fontFamily: AR(lang) }}>
                      {lang === 'ar' ? 'تواصل معنا بعد الحجز مباشرةً للتأكيد' : 'Contact us right after booking to confirm'}
                    </p>
                    <div className="space-y-3">
                      <a
                        href="https://wa.me/201015656650"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 rounded-xl p-4 transition-all"
                        style={{ fontFamily: AR(lang) }}
                      >
                        <span className="text-2xl">💬</span>
                        <div className="text-right flex-1">
                          <p className="text-green-400 font-black text-sm">{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</p>
                          <p className="text-white/40 text-[10px]">+20 10 15656650</p>
                        </div>
                      </a>
                      <a
                        href="tel:+201015656650"
                        className="flex items-center gap-3 w-full bg-[#C6A04C]/10 hover:bg-[#C6A04C]/20 border border-[#C6A04C]/30 rounded-xl p-4 transition-all"
                        style={{ fontFamily: AR(lang) }}
                      >
                        <span className="text-2xl">📞</span>
                        <div className="text-right flex-1">
                          <p className="text-[#C6A04C] font-black text-sm">{lang === 'ar' ? 'اتصال مباشر' : 'Direct Call'}</p>
                          <p className="text-white/40 text-[10px]">+20 10 15656650</p>
                        </div>
                      </a>
                    </div>
                    <button
                      onClick={() => setShowContactModal(false)}
                      className="mt-4 w-full text-white/30 hover:text-white/60 text-xs py-2 transition-colors"
                      style={{ fontFamily: AR(lang) }}
                    >
                      {lang === 'ar' ? 'إغلاق' : 'Close'}
                    </button>
                  </motion.div>
                </motion.div>
              )}

              {/* Step 4: Review & Send WhatsApp */}
              {step === 4 && (
                <motion.div
                  key="s3"
                  variants={slideVar}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-xl font-black text-white mb-6" style={{ fontFamily: AR(lang) }}>
                    {text.review}
                  </h2>

                  <div className="space-y-3 mb-6">
                    <div className="bg-[#111] border border-white/6 rounded-xl p-4">
                      <p className="text-white/40 text-xs mb-1" style={{ fontFamily: AR(lang) }}>
                        {text.name}
                      </p>
                      <p className="text-white text-sm" style={{ fontFamily: AR(lang) }}>
                        {formData.name}
                      </p>
                    </div>

                    <div className="bg-[#111] border border-white/6 rounded-xl p-4">
                      <p className="text-white/40 text-xs mb-1" style={{ fontFamily: AR(lang) }}>
                        {text.phone}
                      </p>
                      <p className="text-white text-sm font-mono">{formData.phone}</p>
                    </div>

                    <div className="bg-[#111] border border-white/6 rounded-xl p-4">
                      <p className="text-white/40 text-xs mb-1" style={{ fontFamily: AR(lang) }}>
                        {lang === 'ar' ? 'نوع التذكرة' : 'Ticket Type'}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-white text-sm">
                          {selectedTicket === 'vip' ? 'VIP Signature' : 'Classic'}
                        </p>
                        <p className={`text-sm font-black ${isVip ? 'text-[#C6A04C]' : 'text-white'}`}>
                          {isVip ? '500' : '350'} {lang === 'ar' ? 'جنيه' : 'EGP'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#111] border border-white/6 rounded-xl p-4">
                      <p className="text-white/40 text-xs mb-1" style={{ fontFamily: AR(lang) }}>
                        {text.quantity}
                      </p>
                      <p className="text-white text-sm">{formData.quantity}</p>
                    </div>

                    <div className="bg-[#111] border border-white/6 rounded-xl p-4">
                      <p className="text-white/40 text-xs mb-2" style={{ fontFamily: AR(lang) }}>
                        {text.selectSeats}
                      </p>
                      <p className="text-white text-sm font-mono">
                        {selectedSeats.map(s => `${s.row}${s.number}`).join(', ')}
                      </p>
                    </div>

                    <div className="bg-[#111] border border-white/6 rounded-xl p-4">
                      <p className="text-white/40 text-xs mb-1" style={{ fontFamily: AR(lang) }}>
                        {text.paymentMethod}
                      </p>
                      <p className="text-white text-sm">
                        {formData.paymentMethod === 'vodafone' ? text.vodafonePayment : formData.paymentMethod === 'card' ? text.cardPayment : formData.paymentMethod === 'instapay' ? text.instaPayment : text.laterPayment}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {/* Trust Badge */}
                    <div className="bg-[#C6A04C]/8 border border-[#C6A04C]/20 rounded-xl p-4 text-center">
                      <p className="text-[#C6A04C] text-sm font-bold" style={{ fontFamily: AR(lang) }}>
                        ✅ {text.trustBadge}
                      </p>
                      <p className="text-white/50 text-xs mt-1" style={{ fontFamily: AR(lang) }}>
                        {text.ticketDelivery}
                      </p>
                    </div>

                    {/* Support */}
                    <div className="bg-[#A8382A]/15 border border-[#A8382A]/30 rounded-xl p-4">
                      <p className="text-white/70 text-xs mb-2 font-semibold" style={{ fontFamily: AR(lang) }}>
                        📞 {text.support}
                      </p>
                      <p className="text-[#C6A04C] font-bold text-sm">{text.supportNumber}</p>
                      <p className="text-white/40 text-xs mt-2" style={{ fontFamily: AR(lang) }}>
                        {lang === 'ar' ? 'نحن هنا لمساعدتك في أي استفسار أو شكوى' : 'We are here to help with any questions or complaints'}
                      </p>
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
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
