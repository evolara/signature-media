import { motion, useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { Sparkles, Music2, Star, Clock } from 'lucide-react';
import logoImage from '@/assets/logo.png';
import { AR } from './utils';
import { CounterBadge } from './counter-badge';

interface TicketsSectionProps {
  lang: 'ar' | 'en';
  onSelectTicket: (type: 'vip' | 'classic') => void;
}

// ─── Countdown Block ───────────────────────────────────────────────────────────
function CountdownTimer({ lang, target }: { lang: 'ar' | 'en'; target: Date }) {
  const [countdown, setCountdown] = useState({ days: '0', hours: '00', minutes: '00', seconds: '00' });

  useEffect(() => {
    const update = () => {
      let diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown({ days: '0', hours: '00', minutes: '00', seconds: '00' });
        return;
      }
      const d = Math.floor(diff / 86_400_000); diff -= d * 86_400_000;
      const h = Math.floor(diff / 3_600_000);  diff -= h * 3_600_000;
      const m = Math.floor(diff / 60_000);      diff -= m * 60_000;
      const s = Math.floor(diff / 1_000);
      setCountdown({ days: `${d}`, hours: String(h).padStart(2, '0'), minutes: String(m).padStart(2, '0'), seconds: String(s).padStart(2, '0') });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [target]);

  const labels = lang === 'ar'
    ? { days: 'يوم', hours: 'ساعة', minutes: 'دقيقة', seconds: 'ثانية' }
    : { days: 'Days', hours: 'Hrs', minutes: 'Min', seconds: 'Sec' };

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5" aria-live="polite" aria-label={lang === 'ar' ? 'العد التنازلي للحفل' : 'Event countdown'}>
      <Clock className="w-4 h-4 text-[#C6A04C] flex-shrink-0" aria-hidden="true" />
      {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit, i) => (
        <div key={unit} className="flex items-center gap-3 sm:gap-5">
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-black text-white tabular-nums leading-none">{countdown[unit]}</p>
            <p className="text-[#C6A04C]/60 text-[10px] mt-1 tracking-wider uppercase" style={{ fontFamily: AR(lang) }}>{labels[unit]}</p>
          </div>
          {i < 3 && <span className="text-[#C6A04C]/40 text-xl font-light -mt-3" aria-hidden="true">:</span>}
        </div>
      ))}
    </div>
  );
}

// ─── Ticket Card ───────────────────────────────────────────────────────────────
function TicketCard({
  lang, isVip, onSelect,
  title, titleSub, price, currency, description, buttonLabel, badge, remainingSeats,
}: {
  lang: 'ar' | 'en'; isVip: boolean; onSelect: () => void;
  title: string; titleSub: string; price: string; currency: string;
  description: string; buttonLabel: string; badge?: string; remainingSeats: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [loading, setLoading] = useState(false);

  const handleSelect = () => {
    setLoading(true);
    // Give brief visual feedback before delegating upward
    setTimeout(() => {
      setLoading(false);
      onSelect();
    }, 350);
  };

  const isLow = remainingSeats <= 8;

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: isVip ? 0.1 : 0.2, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="relative group cursor-pointer"
    >
      {/* Ambient glow */}
      <div
        className={`absolute -inset-2 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${
          isVip ? 'bg-gradient-to-br from-[#C6A04C]/20 to-[#A8382A]/20' : 'bg-gradient-to-br from-[#A8382A]/15 to-[#C6A04C]/15'
        }`}
        aria-hidden="true"
      />

      <div
        className={`relative h-full bg-[#0D0D0D] rounded-2xl border transition-all duration-500 overflow-hidden ${
          isVip ? 'border-[#C6A04C]/30 hover:border-[#C6A04C]/60' : 'border-[#A8382A]/30 hover:border-[#A8382A]/60'
        }`}
      >
        {/* Top accent line */}
        <div
          className={`h-[2px] w-full bg-gradient-to-r ${isVip ? 'from-[#C6A04C] via-[#D4AF37] to-[#A8382A]' : 'from-[#A8382A] via-[#C6A04C] to-[#A8382A]'}`}
          aria-hidden="true"
        />

        {/* Inner glow */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 blur-3xl opacity-20 ${isVip ? 'bg-[#C6A04C]' : 'bg-[#A8382A]'}`}
          aria-hidden="true"
        />

        <div className="p-7 sm:p-8 relative">
          <img src={logoImage} alt="" className="absolute top-4 right-4 w-12 h-12 opacity-20" />

          {/* Badge */}
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
          <div className="flex items-start gap-2 mb-6" style={{ fontFamily: AR(lang) }}>
            <Star
              className={`w-4 h-4 flex-shrink-0 mt-1 ${isVip ? 'text-[#C6A04C]' : 'text-[#A8382A]/70'}`}
              fill="currentColor"
            />
            <p className="text-white/70 text-sm leading-relaxed">{description}</p>
          </div>

          {/* Remaining seats indicator */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="flex gap-1" aria-hidden="true">
              {Array.from({ length: Math.min(remainingSeats, 10) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${isLow ? 'bg-red-500/80' : isVip ? 'bg-[#C6A04C]/60' : 'bg-[#A8382A]/60'}`}
                />
              ))}
              {remainingSeats > 10 && <span className="text-white/30 text-xs">+{remainingSeats - 10}</span>}
            </div>
            <p
              className={`text-xs font-semibold ${isLow ? 'text-red-400' : 'text-white/40'}`}
              style={{ fontFamily: AR(lang) }}
              aria-label={lang === 'ar' ? `${remainingSeats} مقعد متبقي` : `${remainingSeats} seats remaining`}
            >
              {lang === 'ar' ? `${remainingSeats} مقعد متبقٍ` : `${remainingSeats} seats left`}
            </p>
          </div>

          {/* CTA */}
          <motion.button
            onClick={handleSelect}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            aria-busy={loading}
            className={`w-full py-3.5 rounded-xl font-black text-sm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A04C] disabled:opacity-70 disabled:cursor-wait ${
              isVip
                ? 'bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] hover:shadow-lg hover:shadow-[#C6A04C]/25'
                : 'bg-transparent border-2 border-[#A8382A]/50 text-white hover:bg-[#A8382A]/10 hover:border-[#A8382A]'
            }`}
            style={{ fontFamily: AR(lang) }}
          >
            {loading
              ? (lang === 'ar' ? '...' : '...')
              : buttonLabel}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Main Section ──────────────────────────────────────────────────────────────
const EVENT_DATE = new Date('2026-03-26T20:00:00');

export function TicketsSection({ lang, onSelectTicket }: TicketsSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const t = lang === 'ar'
    ? {
        heading: 'التذاكر',
        subheading: 'تذاكر أمسية خامس ليالي عيد الفطر المبارك',
        classicTitle: 'Classic', classicSub: 'كلاسيك',
        classicBadge: 'حضور راقٍ',
        classicPrice: '350', classicCur: 'جنيه',
        classicDesc: 'حضور راقٍ لليلة طربية استثنائية، في أجواء تحمل روح الأصالة والتنظيم الاحترافي، لتعيش تجربة موسيقية مميزة تليق بذوقك.',
        vipTitle: 'VIP Signature', vipSub: 'في آي بي سيجنتشر',
        vipBadge: 'تجربة حصرية',
        vipPrice: '500', vipCur: 'جنيه',
        vipDesc: 'تجربة حضور أكثر خصوصية وتميّزًا، ضمن أجواء فاخرة تعكس هوية الحفل وتمنحك إحساسًا مختلفًا بالاستمتاع والرقي.',
        cta: 'احجز الآن',
      }
    : {
        heading: 'Tickets',
        subheading: 'Ticket for the fifth evening of Eid al-Fitr',
        classicTitle: 'Classic', classicSub: 'كلاسيك',
        classicBadge: 'Elegant Attendance',
        classicPrice: '350', classicCur: 'EGP',
        classicDesc: 'An elegant admission to a distinguished evening of authentic Arabic music, offering a refined atmosphere and a professionally curated experience.',
        vipTitle: 'VIP Signature', vipSub: 'في آي بي سيجنتشر',
        vipBadge: 'Exclusive Experience',
        vipPrice: '500', vipCur: 'EGP',
        vipDesc: 'A more exclusive and distinguished attendance experience, crafted for guests who appreciate a refined and elevated musical atmosphere.',
        cta: 'Book Now',
      };

  // Fixed per session for urgency effect
  const [seats] = useState(() => ({
    vip:     Math.floor(Math.random() * 8)  + 4,   // 4–11
    classic: Math.floor(Math.random() * 12) + 8,   // 8–19
  }));

  return (
    <section
      id="tickets"
      ref={ref}
      className="relative py-28 px-4 overflow-hidden"
      aria-labelledby="tickets-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-[#0A0A0A] to-[#080808]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(198,160,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(198,160,76,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
        aria-hidden="true"
      />

      {/* Corner ornaments */}
      {[
        'top-12 left-8 border-t border-l',
        'top-12 right-8 border-t border-r',
        'bottom-12 left-8 border-b border-l',
        'bottom-12 right-8 border-b border-r',
      ].map((cls) => (
        <div key={cls} className={`absolute w-20 h-20 border-[#C6A04C]/10 ${cls}`} aria-hidden="true" />
      ))}

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <p className="text-[#C6A04C] text-xs tracking-[0.4em] uppercase mb-3" style={{ fontFamily: AR(lang) }}>
            ♩ {t.heading} ♩
          </p>
          <h2
            id="tickets-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: AR(lang) }}
          >
            {t.subheading}
          </h2>
          <div className="h-px max-w-xs mx-auto bg-gradient-to-r from-transparent via-[#C6A04C]/40 to-transparent mb-8" />

          {/* ✅ Countdown — now actually displayed */}
          <CountdownTimer lang={lang} target={EVENT_DATE} />
        </motion.div>

        {/* Cards — VIP first (higher value, right-to-left read order) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <TicketCard
            lang={lang} isVip={true}
            onSelect={() => onSelectTicket('vip')}
            title={t.vipTitle} titleSub={t.vipSub}
            badge={t.vipBadge}
            price={t.vipPrice} currency={t.vipCur}
            description={t.vipDesc}
            buttonLabel={t.cta}
            remainingSeats={seats.vip}        // ✅ now used & displayed
          />
          <TicketCard
            lang={lang} isVip={false}
            onSelect={() => onSelectTicket('classic')}
            title={t.classicTitle} titleSub={t.classicSub}
            badge={t.classicBadge}
            price={t.classicPrice} currency={t.classicCur}
            description={t.classicDesc}       // ✅ unified key, no undefined risk
            buttonLabel={t.cta}
            remainingSeats={seats.classic}    // ✅ now used & displayed
          />
        </div>
      </div>
    </section>
  );
}
