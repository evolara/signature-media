import { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import logoImage from '@/assets/logo.png';
import { AR } from './utils';
import { CounterBadge } from './counter-badge';
import { useCountdown } from './use-countdown';

interface HeroSectionProps {
  lang: 'ar' | 'en';
  onBookNowClick: () => void;
}

// ✅ Particle data computed once at module level — no Math.random() on re-render
const PARTICLE_DATA = Array.from({ length: 12 }, (_, i) => ({
  // Use index-based deterministic seed for stable SSR-safe values
  size:     (((i * 7 + 3) % 5) / 5) * 3 + 1,           // 1–4px
  left:     (((i * 13 + 5) % 97)),                       // 0–97%
  top:      (((i * 17 + 11) % 93)),                      // 0–93%
  opacity:  (((i * 11 + 2) % 6) / 10) + 0.05,           // 0.05–0.65
  yRange:   20 + ((i * 9 + 1) % 40),                    // 20–60px
  duration: 4 + ((i * 6 + 3) % 6),                      // 4–10s
  delay:    ((i * 5 + 2) % 8) * 0.5,                    // 0–4s
}));

// ✅ 12 particles (down from 24) with stable data — no flickering, better perf
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {PARTICLE_DATA.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#C6A04C]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: p.opacity,
            willChange: 'transform',
          }}
          animate={{
            y: [0, -p.yRange, 0],
            opacity: [p.opacity * 0.3, p.opacity, p.opacity * 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ✅ Stable event date — defined once outside component
const EVENT_DATE = new Date('2026-03-26T20:00:00');

export function HeroSection({ lang, onBookNowClick }: HeroSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const imgY    = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const opacity  = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const springY  = useSpring(imgY, { stiffness: 80, damping: 20 });

  // ✅ Single shared hook — no duplicate countdown logic
  const countdown = useCountdown(EVENT_DATE);

  const t = lang === 'ar'
    ? {
        eid:      'اليوم الخامس من عيد الفطر المبارك',
        tagline:  'حضور راقٍ لليلة طربية استثنائية',
        sub:      'في أجواء تحمل روح الأصالة والتنظيم الاحترافي',
        // ✅ Venue info added
        venue:    'دار الأوبرا المصرية — القاهرة',
        dateStr:  'الخميس ٢٦ مارس ٢٠٢٦  |  ٨ مساءً',
        cta:      'احجز تذكرتك الآن',
        scroll:   'اكتشف التذاكر',
        days:     'أيام', hours: 'ساعات', minutes: 'دقائق', seconds: 'ثواني',
        until:    'حتى انطلاق الحفل',
      }
    : {
        eid:      '5th Day of Eid al-Fitr',
        tagline:  'An Elegant Evening of Authentic Arabic Music',
        sub:      'A refined atmosphere, professionally curated for those who appreciate the finest',
        // ✅ Venue info added
        venue:    'Cairo Opera House — Cairo',
        dateStr:  'Thursday, 26 March 2026  |  8 PM',
        cta:      'Book Your Ticket Now',
        scroll:   'Explore Tickets',
        days:     'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds',
        until:    'Until the concert begins',
      };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center"
      aria-label={lang === 'ar' ? 'القسم الرئيسي' : 'Hero'}
    >
      {/* Parallax background */}
      <motion.div className="absolute inset-0 scale-110" style={{ y: springY }}>
        <img
          src="/7461e7ec73104148c3673b779c060afe.jpeg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          fetchPriority="high"
        />
      </motion.div>

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/50 via-[#080808]/40 to-[#080808]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/50 via-transparent to-[#080808]/50" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#080808] to-transparent" />

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
        aria-hidden="true"
      />

      <Particles />

      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C6A04C]/30 to-transparent" aria-hidden="true" />

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity }}
        className="relative z-10 max-w-4xl mx-auto text-center px-5 pt-24 pb-28"
      >
        {/* Overline */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#C6A04C]/60" />
          <span className="text-[#C6A04C] text-xs tracking-[0.3em] uppercase font-medium" style={{ fontFamily: AR(lang) }}>
            {t.eid}
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#C6A04C]/60" />
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center mb-10"
        >
          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-[#C6A04C]/10 blur-2xl" />
            <div className="absolute -inset-6 rounded-full bg-[#A8382A]/8 blur-3xl" />
            <div className="relative w-52 h-52 sm:w-64 sm:h-64 rounded-full overflow-hidden shadow-[0_0_80px_rgba(198,160,76,0.2)] border border-[#C6A04C]/20">
              <img src={logoImage} alt="روح الطرب" className="w-full h-full object-cover" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-2 rounded-full border border-dashed border-[#C6A04C]/15"
              aria-hidden="true"
            />
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
        >
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3"
            style={{ fontFamily: AR(lang) }}
          >
            {t.tagline}
          </h1>
          <p
            className="text-base sm:text-lg text-white/50 mb-6 max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: AR(lang) }}
          >
            {t.sub}
          </p>

          {/* ✅ Venue + date pill — new addition */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-10"
          >
            <span
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/60 bg-white/[0.05] border border-white/10 px-4 py-2 rounded-full"
              style={{ fontFamily: AR(lang) }}
            >
              📍 {t.venue}
            </span>
            <span
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#C6A04C]/80 bg-[#C6A04C]/[0.07] border border-[#C6A04C]/20 px-4 py-2 rounded-full"
              style={{ fontFamily: AR(lang) }}
            >
              🗓 {t.dateStr}
            </span>
          </motion.div>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-12"
          aria-live="polite"
          aria-label={t.until}
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-4 px-6 py-4 rounded-2xl bg-white/[0.04] border border-[#C6A04C]/15 backdrop-blur-sm">
            <CounterBadge label={t.days}    value={countdown.days}    lang={lang} />
            <CounterBadge label={t.hours}   value={countdown.hours}   lang={lang} />
            <CounterBadge label={t.minutes} value={countdown.minutes} lang={lang} />
            <CounterBadge label={t.seconds} value={countdown.seconds} lang={lang} />
          </div>
          <p className="mt-2 text-sm text-white/40" style={{ fontFamily: AR(lang) }}>
            {t.until}
          </p>
        </motion.div>

        {/* CTA — aria-label removed to avoid duplication with inner text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            onClick={onBookNowClick}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="relative group"
          >
            <motion.span
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[#C6A04C] to-[#A8382A] blur-xl"
              aria-hidden="true"
            />
            <span
              className="relative block bg-gradient-to-r from-[#C6A04C] via-[#D4AF37] to-[#A8382A] text-[#080808] px-10 sm:px-14 py-4 sm:py-5 rounded-full text-base sm:text-lg font-black shadow-2xl border border-[#C6A04C]/50 tracking-wide"
              style={{ fontFamily: AR(lang) }}
            >
              {t.cta}
            </span>
          </motion.button>
        </motion.div>

        {/* Musical notes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center gap-6 mt-14 select-none"
          aria-hidden="true"
        >
          {['♩', '♪', '♫', '♬', '♪'].map((note, i) => (
            <motion.span
              key={i}
              className="text-[#C6A04C]/20 text-xl"
              animate={{ y: [0, -6, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            >
              {note}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        onClick={onBookNowClick}
        role="button"
        aria-label={t.scroll}
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onBookNowClick()}
      >
        <span className="text-white/25 text-xs tracking-[0.2em] uppercase" style={{ fontFamily: AR(lang) }}>
          {t.scroll}
        </span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8 bg-gradient-to-b from-[#C6A04C]/40 to-transparent"
          aria-hidden="true"
        />
      </motion.div>
    </section>
  );
}
