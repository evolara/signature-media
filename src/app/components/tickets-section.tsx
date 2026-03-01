import { motion, useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { Sparkles, Music2, Star, Armchair } from 'lucide-react';
import logoImage from '@/assets/logo.png';
import { AR } from './utils';
import { CounterBadge } from './counter-badge';
import { seatLayout } from './seat-layout';

interface TicketsSectionProps {
  lang: 'ar' | 'en';
  onSelectTicket: (type: 'vip' | 'classic') => void;
}



function TicketCard({
  lang, isVip, onSelect,
  title, titleSub, price, currency, description, buttonLabel, badge
}: {
  lang: 'ar' | 'en'; isVip: boolean; onSelect: () => void;
  title: string; titleSub: string; price: string; currency: string;
  description: string; buttonLabel: string; badge?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const goldBorder = 'border-[#C6A04C]/30 hover:border-[#C6A04C]/60';
  const redBorder = 'border-[#A8382A]/30 hover:border-[#A8382A]/60';

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: isVip ? 0.2 : 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className={`relative group cursor-pointer`}
    >
      {/* Ambient glow behind card */}
      <div
        className={`absolute -inset-2 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${
          isVip ? 'bg-gradient-to-br from-[#C6A04C]/20 to-[#A8382A]/20' : 'bg-gradient-to-br from-[#A8382A]/15 to-[#C6A04C]/15'
        }`}
        aria-hidden="true"
      />

      <div
        className={`relative h-full bg-[#0D0D0D] rounded-2xl border ${isVip ? goldBorder : redBorder} transition-all duration-500 overflow-hidden`}
      >
        {/* Top accent line */}
        <div
          className={`h-[2px] w-full bg-gradient-to-r ${isVip ? 'from-[#C6A04C] via-[#D4AF37] to-[#A8382A]' : 'from-[#A8382A] via-[#C6A04C] to-[#A8382A]'}`}
          aria-hidden="true"
        />

        {/* Inner glow at top */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 blur-3xl opacity-20 ${isVip ? 'bg-[#C6A04C]' : 'bg-[#A8382A]'}`}
          aria-hidden="true"
        />

        <div className="p-7 sm:p-8 relative">            <img src={logoImage} alt="" className="absolute top-4 right-4 w-12 h-12 opacity-20" />          {/* Badge */}
          {badge && (
            <div className="flex justify-center mb-5">
              <span
                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-semibold tracking-wider uppercase ${
                  isVip
                    ? 'bg-[#C6A04C]/10 border-[#C6A04C]/30 text-[#C6A04C]'
                    : 'bg-[#A8382A]/10 border-[#A8382A]/30 text-[#A8382A]/80'
                }`}
                style={{ fontFamily: AR(lang) }}
              >
                {isVip ? <Sparkles className="w-3 h-3" /> : <Music2 className="w-3 h-3" />}
                {badge}
              </span>
            </div>
          )}

          {/* Title */}
          <div className="text-center mb-6">
            <h3
              className={`text-2xl sm:text-3xl font-black mb-1 ${isVip ? 'text-[#C6A04C]' : 'text-white'}`}
              style={{ fontFamily: AR(lang) }}
            >
              {title}
            </h3>
            <p className="text-white/35 text-sm" style={{ fontFamily: lang === 'ar' ? "'Cormorant Garamond', serif" : 'Cairo, sans-serif' }}>
              {titleSub}
            </p>
          </div>

          {/* Divider */}
          <div className={`h-px mb-6 bg-gradient-to-r from-transparent ${isVip ? 'via-[#C6A04C]/30' : 'via-[#A8382A]/30'} to-transparent`} aria-hidden="true" />

          {/* Price */}
          <div className="text-center mb-7">
            <div className="flex items-end justify-center gap-2">
              <span className="text-5xl sm:text-6xl font-black text-white tabular-nums leading-none">{price}</span>
              <span className={`text-lg font-bold mb-1 ${isVip ? 'text-[#C6A04C]' : 'text-[#A8382A]/80'}`}>{currency}</span>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start gap-2 mb-8" style={{ fontFamily: AR(lang) }}>
            <Star
              className={`w-4 h-4 flex-shrink-0 mt-1 ${isVip ? 'text-[#C6A04C]' : 'text-[#A8382A]/70'}`}
              fill="currentColor"
            />
            <p className="text-white/70 text-sm leading-relaxed">
              {description}
            </p>
          </div>

          {/* CTA */}
          <motion.button
            onClick={onSelect}
            whileTap={{ scale: 0.97 }}
            className={`w-full py-3.5 rounded-xl font-black text-sm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A04C] ${
              isVip
                ? 'bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] hover:shadow-lg hover:shadow-[#C6A04C]/25'
                : 'bg-transparent border-2 border-[#A8382A]/50 text-white hover:bg-[#A8382A]/10 hover:border-[#A8382A]'
            }`}
            style={{ fontFamily: AR(lang) }}
          >
            {buttonLabel}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

export function TicketsSection({ lang, onSelectTicket }: TicketsSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const t = {
    ar: {
      heading: 'التذاكر',
      subheading: 'تذاكر أمسية خامس ليالي عيد الفطر المبارك',
      seatsAvailable: 'المقاعد المتاحة',
      classicTitle: 'Classic', classicSub: 'كلاسيك',
      classicBadge: 'حضور راقٍ',
      classicPrice: '350', classicCur: 'جنيه',
      vipTitle: 'VIP Signature', vipSub: 'في آي بي سيجنتشر',
      vipBadge: 'تجربة حصرية',
      vipPrice: '500', vipCur: 'جنيه',
      cta: 'احجز الآن',
      classicDescAr: 'حضور راقٍ لليلة طربية استثنائية، في أجواء تحمل روح الأصالة والتنظيم الاحترافي، لتعيش تجربة موسيقية مميزة تليق بذوقك.',
      vipDescAr: 'تجربة حضور أكثر خصوصية وتميّزًا، ضمن أجواء فاخرة تعكس هوية الحفل وتمنحك إحساسًا مختلفًا بالاستمتاع والرقي.',
    },
    en: {
      heading: 'Tickets',
      subheading: 'Ticket for the fifth evening of Eid al-Fitr',
      seatsAvailable: 'Available Seats',
      classicDescEn: 'An elegant admission to a distinguished evening of authentic Arabic music, offering a refined atmosphere and a professionally curated experience.',
      vipDescEn: 'A more exclusive and distinguished attendance experience, crafted for guests who appreciate a refined and elevated musical atmosphere.',
      classicTitle: 'Classic', classicSub: 'كلاسيك',
      classicBadge: 'Elegant Attendance',
      classicPrice: '350', classicCur: 'EGP',
      vipTitle: 'VIP Signature', vipSub: 'في آي بي سيجنتشر',
      vipBadge: 'Exclusive Experience',
      vipPrice: '500', vipCur: 'EGP',
      cta: 'Book Now',
    },
  }[lang];

  // Calculate total seats for each type
  const totalClassicSeats = Object.values(seatLayout.classic).reduce((a, b) => a + b, 0);
  const totalVipSeats = Object.values(seatLayout.vip).reduce((a, b) => a + b, 0);

  // Load booked seats from localStorage
  const [bookedSeats, setBookedSeats] = useState({ classic: 0, vip: 0 });

  useEffect(() => {
    const loadBookedSeats = () => {
      try {
        const classicStored = localStorage.getItem('signature_media_bookings_classic');
        const vipStored = localStorage.getItem('signature_media_bookings_vip');
        
        const classicCount = classicStored ? JSON.parse(classicStored).length : 0;
        const vipCount = vipStored ? JSON.parse(vipStored).length : 0;
        
        setBookedSeats({ classic: classicCount, vip: vipCount });
      } catch (e) {
        console.error('Error loading booked seats:', e);
      }
    };
    
    loadBookedSeats();
    
    // Listen for storage changes
    const handleStorageChange = () => loadBookedSeats();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const availableClassic = totalClassicSeats - bookedSeats.classic;
  const availableVip = totalVipSeats - bookedSeats.vip;

  const [countdown, setCountdown] = useState({ days: '0', hours: '00', minutes: '00', seconds: '00' });

  useEffect(() => {
    const target = new Date('2026-03-26T20:00:00');
    const update = () => {
      const now = new Date();
      let diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown({ days: '0', hours: '00', minutes: '00', seconds: '00' });
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= d * (1000 * 60 * 60 * 24);
      const h = Math.floor(diff / (1000 * 60 * 60));
      diff -= h * (1000 * 60 * 60);
      const m = Math.floor(diff / (1000 * 60));
      diff -= m * (1000 * 60);
      const s = Math.floor(diff / 1000);
      setCountdown({
        days: `${d}`,
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lang]);

  return (
    <section
      id="tickets"
      ref={ref}
      className="relative py-28 px-4 overflow-hidden"
      aria-labelledby="tickets-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-[#0A0A0A] to-[#080808]" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(198,160,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(198,160,76,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
        aria-hidden="true"
      />

      {/* Corner ornaments */}
      <div className="absolute top-12 left-8 w-20 h-20 border-t border-l border-[#C6A04C]/10" aria-hidden="true" />
      <div className="absolute top-12 right-8 w-20 h-20 border-t border-r border-[#C6A04C]/10" aria-hidden="true" />
      <div className="absolute bottom-12 left-8 w-20 h-20 border-b border-l border-[#C6A04C]/10" aria-hidden="true" />
      <div className="absolute bottom-12 right-8 w-20 h-20 border-b border-r border-[#C6A04C]/10" aria-hidden="true" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p
            className="text-[#C6A04C] text-xs tracking-[0.4em] uppercase mb-3"
            style={{ fontFamily: AR(lang) }}
          >
            ♩ {t.heading} ♩
          </p>
          <h2
            id="tickets-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: AR(lang) }}
          >
            {t.subheading}
          </h2>
          <div className="h-px max-w-xs mx-auto bg-gradient-to-r from-transparent via-[#C6A04C]/40 to-transparent" />
        </motion.div>

        {/* Seats availability bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex items-center justify-center gap-8 mb-14 flex-wrap"
        >
          {/* VIP Seats */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#C6A04C]/10 to-[#A8382A]/10 border border-[#C6A04C]/30 rounded-xl px-5 py-3">
            <Armchair className="w-5 h-5 text-[#C6A04C]" />
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-white/50" style={{ fontFamily: AR(lang) }}>
                VIP
              </p>
              <p className="text-lg font-black text-[#C6A04C] tabular-nums">
                {availableVip} <span className="text-white/40 text-xs">/ {totalVipSeats}</span>
              </p>
            </div>
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          {/* Classic Seats */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#A8382A]/10 to-[#C6A04C]/10 border border-[#A8382A]/30 rounded-xl px-5 py-3">
            <Armchair className="w-5 h-5 text-[#A8382A]/70" />
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-white/50" style={{ fontFamily: AR(lang) }}>
                {lang === 'ar' ? 'كلاسيك' : 'Classic'}
              </p>
              <p className="text-lg font-black text-white tabular-nums">
                {availableClassic} <span className="text-white/40 text-xs">/ {totalClassicSeats}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <TicketCard
            lang={lang} isVip={false}
            onSelect={() => onSelectTicket('classic')}
            title={t.classicTitle} titleSub={t.classicSub}
            badge={t.classicBadge}
            price={t.classicPrice} currency={t.classicCur}
            description={lang === 'ar' ? t.classicDescAr : t.classicDescEn}
            buttonLabel={t.cta}
          />
          <TicketCard
            lang={lang} isVip={true}
            onSelect={() => onSelectTicket('vip')}
            title={t.vipTitle} titleSub={t.vipSub}
            badge={t.vipBadge}
            price={t.vipPrice} currency={t.vipCur}
            description={lang === 'ar' ? t.vipDescAr : t.vipDescEn}
            buttonLabel={t.cta}
          />
        </div>
      </div>
    </section>
  );
}
