import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import logoImage from '@/assets/logo.png';
import { AR } from './utils';
import { CounterBadge } from './counter-badge';

interface HeroSectionProps {
  lang: 'ar' | 'en';
  onBookNowClick: () => void;
}

// Animated particle dots in background
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#C6A04C]"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.3 + 0.05,
          }}
          animate={{
            y: [0, -(20 + Math.random() * 40), 0],
            opacity: [0.05, 0.25, 0.05],
          }}
          transition={{
            duration: 4 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function HeroSection({ lang, onBookNowClick }: HeroSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const springY = useSpring(imgY, { stiffness: 80, damping: 20 });

  const t = {
    ar: {
      date: '',
      dateSub: '',
      eid: 'اليوم الخامس من عيد الفطر المبارك',
      tagline: 'حضور راقٍ لليلة طربية استثنائية',
      sub: 'في أجواء تحمل روح الأصالة والتنظيم الاحترافي',
      cta: 'احجز تذكرتك الآن',
      scroll: 'اكتشف التذاكر',
    },
    en: {
      date: '',
      dateSub: '',
      eid: '5th Day of Eid',
      tagline: 'An Elegant Evening of Authentic Arabic Music',
      sub: 'A refined atmosphere, professionally curated for those who appreciate the finest',
      cta: 'Book Your Ticket Now',
      scroll: 'Explore Tickets',
    },
  }[lang];

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
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= days * (1000 * 60 * 60 * 24);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * (1000 * 60 * 60);
      const minutes = Math.floor(diff / (1000 * 60));
      diff -= minutes * (1000 * 60);
      const seconds = Math.floor(diff / 1000);
      setCountdown({
        days: `${days}`,
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lang]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center"
      aria-label={lang === 'ar' ? 'القسم الرئيسي' : 'Hero'}
    >
      {/* Parallax Background */}
      <motion.div className="absolute inset-0 scale-110" style={{ y: springY }}>
        <img
          src="/7461e7ec73104148c3673b779c060afe.jpeg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          fetchPriority="high"
        />
      </motion.div>

      {/* Layered gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/50 via-[#080808]/40 to-[#080808]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/50 via-transparent to-[#080808]/50" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#080808] to-transparent" />

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
        aria-hidden="true"
      />

      <Particles />

      {/* Horizontal line accents */}
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
          <span
            className="text-[#C6A04C] text-xs tracking-[0.3em] uppercase font-medium"
            style={{ fontFamily: AR(lang) }}
          >
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
            {/* Rotating ring */}
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
            className="text-base sm:text-lg text-white/50 mb-10 max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: AR(lang) }}
          >
            {t.sub}
          </p>
        </motion.div>

        {/* Countdown badges */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-12"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-4 px-6 py-4 rounded-2xl bg-white/[0.04] border border-[#C6A04C]/15 backdrop-blur-sm">
            <CounterBadge
              label={lang === 'ar' ? 'أيام' : 'Days'}
              value={countdown.days}
              lang={lang}
            />
            <CounterBadge
              label={lang === 'ar' ? 'ساعات' : 'Hours'}
              value={countdown.hours}
              lang={lang}
            />
            <CounterBadge
              label={lang === 'ar' ? 'دقائق' : 'Minutes'}
              value={countdown.minutes}
              lang={lang}
            />
            <CounterBadge
              label={lang === 'ar' ? 'ثواني' : 'Seconds'}
              value={countdown.seconds}
              lang={lang}
            />
          </div>
          <p
            className="mt-2 text-sm text-white/40"
            style={{
              fontFamily:
                lang === 'ar' ? "'Cormorant Garamond', serif" : 'Cairo, sans-serif',
            }}
          >
            {lang === 'ar' ? 'حتى 26-3-2026 8م' : 'until 26-3-2026 8pm'}
          </p>
        </motion.div>

        {/* CTA */}
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
            aria-label={t.cta}
          >
            {/* Glow pulse */}
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

        {/* Musical notes decoration */}
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
        aria-label={t.scroll}
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
