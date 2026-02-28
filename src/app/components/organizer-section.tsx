import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Mic2, Radio, Headphones, ShieldCheck } from 'lucide-react';
import smLogo from '@/assets/sm-logo.png';
import smInstagram from '@/assets/sm-instagram.png';
import smGlass from '@/assets/sm-glass.png';

interface OrganizerSectionProps {
  lang: 'ar' | 'en';
}

import { AR } from './utils';

const TRUST_ICONS = [
  { icon: Mic2,        key: 'audio' },
  { icon: Radio,       key: 'podcast' },
  { icon: Headphones,  key: 'media' },
  { icon: ShieldCheck, key: 'trust' },
];

export function OrganizerSection({ lang }: OrganizerSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const t = {
    ar: {
      overline: 'الجهة المنظِّمة',
      heading: 'Signature Media',
      subheading: 'وراء كل تجربة استثنائية… فريق استثنائي',
      body: 'Signature Media هي شركة متخصصة في الإنتاج الصوتي، البودكاست، وخدمات الميديا الاحترافية. بخبرة ممتدة في تنظيم الفعاليات الموسيقية الراقية، تضمن لك تجربة حضور مُصممة بعناية — من أول لحظة حتى آخر نوتة.',
      pillars: [
        { label: 'إنتاج صوتي', desc: 'جودة صوتية احترافية' },
        { label: 'بودكاست', desc: 'محتوى مرئي ومسموع' },
        { label: 'خدمات ميديا', desc: 'إنتاج متكامل' },
        { label: 'موثوقية تامة', desc: 'فريق محترف ومنظَّم' },
      ],
      instagramLabel: 'تابعونا على إنستغرام',
      instagramHandle: '@SignatureMedia',
      quote: '"نحن لا ننظِّم حفلات فقط — نصنع ذكريات."',
      badge: 'المنظِّم الرسمي للحفل',
    },
    en: {
      overline: 'Official Organizer',
      heading: 'Signature Media',
      subheading: 'Behind every extraordinary experience — an extraordinary team',
      body: 'Signature Media is a specialized company in audio production, podcasting, and professional media services. With extensive experience organizing premium musical events, they ensure a meticulously crafted attendance experience — from the very first moment to the last note.',
      pillars: [
        { label: 'Audio Production', desc: 'Studio-grade quality' },
        { label: 'Podcast', desc: 'Visual & audio content' },
        { label: 'Media Services', desc: 'Full-scale production' },
        { label: 'Full Trust', desc: 'Professional & organized' },
      ],
      instagramLabel: 'Follow us on Instagram',
      instagramHandle: '@SignatureMedia',
      quote: '"We don\'t just organize concerts — we create memories."',
      badge: 'Official Concert Organizer',
    },
  }[lang];

  return (
    <section
      ref={ref}
      className="relative py-28 px-4 overflow-hidden"
      aria-labelledby="organizer-heading"
    >
      {/* Dark bg with blue-tinted gradient to echo SM brand */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-[#090c12] to-[#080808]" />

      {/* Subtle blue glow top-center */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 opacity-10"
        style={{ background: 'radial-gradient(ellipse, #1a4a8a 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Horizontal line top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#1a4a8a]/40 to-transparent" aria-hidden="true" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C6A04C]/20 to-transparent" aria-hidden="true" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-[#1a6aaa]/60" />
            <span
              className="text-[#1a8aee]/70 text-xs tracking-[0.35em] uppercase font-medium"
              style={{ fontFamily: AR(lang) }}
            >
              {t.overline}
            </span>
            <div className="h-px w-10 bg-[#1a6aaa]/60" />
          </div>
          <h2
            id="organizer-heading"
            className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4"
            style={{ fontFamily: 'Cairo, sans-serif', letterSpacing: '-0.01em' }}
          >
            {t.heading}
          </h2>
          <p
            className="text-white/45 text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: AR(lang) }}
          >
            {t.subheading}
          </p>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">

          {/* Left: Images collage */}
          <motion.div
            initial={{ opacity: 0, x: lang === 'ar' ? 30 : -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative flex items-center justify-center"
          >
            {/* Glass mockup - background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 blur-sm scale-110">
              <img
                src={smGlass}
                alt=""
                aria-hidden="true"
                className="w-full max-w-sm object-contain"
              />
            </div>

            {/* Instagram post card */}
            <div className="relative z-10 w-56 sm:w-64 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60 rotate-[-3deg] translate-x-[-20px]">
              <img
                src={smInstagram}
                alt="Signature Media on Instagram"
                className="w-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Main logo card */}
            <div className="relative z-20 w-52 sm:w-60 rounded-2xl overflow-hidden border border-[#1a6aaa]/30 shadow-[0_0_40px_rgba(26,106,170,0.2)] rotate-[4deg] translate-x-[20px] -translate-y-4 bg-[#0a0a0a]">
              <img
                src={smLogo}
                alt="Signature Media Logo"
                className="w-full object-contain p-4"
                loading="lazy"
              />
            </div>

            {/* Official badge overlay */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-30"
            >
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#C6A04C]/90 to-[#A8382A]/90 text-[#080808] text-xs font-black px-4 py-2 rounded-full shadow-xl whitespace-nowrap"
                style={{ fontFamily: AR(lang) }}
              >
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                {t.badge}
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Text content */}
          <motion.div
            initial={{ opacity: 0, x: lang === 'ar' ? -30 : 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-6 pt-6 lg:pt-0"
          >
            {/* Quote */}
            <blockquote
              className="border-r-2 border-[#1a6aaa]/50 pr-5 italic text-white/60 text-base sm:text-lg leading-relaxed"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              style={{ fontFamily: AR(lang), borderRight: lang === 'en' ? 'none' : undefined, borderLeft: lang === 'en' ? '2px solid rgba(26,106,170,0.5)' : undefined, paddingRight: lang === 'en' ? 0 : undefined, paddingLeft: lang === 'en' ? '1.25rem' : undefined }}
            >
              {t.quote}
            </blockquote>

            {/* Body text */}
            <p
              className="text-white/55 text-sm sm:text-base leading-loose"
              style={{ fontFamily: AR(lang) }}
            >
              {t.body}
            </p>

            {/* Instagram handle */}
            <a
              href="https://www.instagram.com/SignatureMedia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-[#1a8aee]/70 hover:text-[#1a8aee] transition-colors group w-fit"
            >
              <span className="text-lg" aria-hidden="true">📷</span>
              <div>
                <p className="text-xs text-white/30 group-hover:text-white/50 transition-colors" style={{ fontFamily: AR(lang) }}>
                  {t.instagramLabel}
                </p>
                <p className="font-bold text-sm">{t.instagramHandle}</p>
              </div>
            </a>
          </motion.div>
        </div>

        {/* ── Trust Pillars ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {TRUST_ICONS.map(({ icon: Icon, key }, i) => {
            const pillar = t.pillars[i];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.08 }}
                className="flex flex-col items-center text-center p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#1a6aaa]/20 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#1a4a8a]/15 group-hover:bg-[#1a4a8a]/25 flex items-center justify-center mb-3 transition-colors">
                  <Icon className="w-5 h-5 text-[#1a8aee]/60 group-hover:text-[#1a8aee]/90 transition-colors" />
                </div>
                <p className="text-white/80 text-sm font-bold mb-0.5" style={{ fontFamily: AR(lang) }}>
                  {pillar.label}
                </p>
                <p className="text-white/30 text-xs" style={{ fontFamily: AR(lang) }}>
                  {pillar.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
