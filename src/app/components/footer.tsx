import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { AR } from './utils';
import { Globe, Code2 } from 'lucide-react';
import logoImage from '@/assets/logo.png';

interface FooterProps {
  lang: 'ar' | 'en';
  onLanguageToggle: () => void;
}

export function Footer({ lang, onLanguageToggle }: FooterProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const t = lang === 'ar'
    ? {
        tagline:     'موسيقى الروح، لروح الموسيقى',
        switchLabel: 'English',
        // ✅ تاريخ صحيح: الخميس ٢٦ مارس ٢٠٢٦
        date:        'الخميس ٢٦ مارس ٢٠٢٦',
        location:    'القاهرة، مصر',
        copyright:   '© ٢٠٢٦ روح الطرب — جميع الحقوق محفوظة',
        devLabel:    'تصميم وتطوير',
      }
    : {
        tagline:     'Music of the soul, for the soul of music',
        switchLabel: 'العربية',
        // ✅ Correct date: Thursday, March 26, 2026
        date:        'Thursday, March 26, 2026',
        location:    'Cairo, Egypt',
        copyright:   '© 2026 Aelzyat — All Rights Reserved',
        devLabel:    'Designed & Developed by',
      };

  return (
    <footer
      ref={ref}
      className="relative bg-[#080808] border-t border-[#C6A04C]/10 py-16 px-4 overflow-hidden"
      role="contentinfo"
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(198,160,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(198,160,76,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#C6A04C]/5 blur-3xl" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto relative z-10 text-center"
      >
        {/* Logo */}
        <div className="flex justify-center mb-7">
          <div className="relative">
            <div className="absolute inset-0 bg-[#C6A04C]/10 rounded-full blur-xl" />
            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[#C6A04C]/20 shadow-lg">
              <img src={logoImage} alt="" aria-hidden="true" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>

        {/* Name */}
        <p className="text-[#C6A04C]/80 text-sm font-semibold mb-1 tracking-widest uppercase" style={{ fontFamily: AR(lang) }}>
          {lang === 'ar' ? 'روح الطرب' : 'Rooh Al-Tarab'}
        </p>
        <p className="text-white/25 text-xs mb-8 italic" style={{ fontFamily: lang === 'ar' ? "'Cormorant Garamond', serif" : AR(lang) }}>
          {t.tagline}
        </p>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C6A04C]/20" />
          <span className="text-[#C6A04C]/30 text-xs">✦</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C6A04C]/20" />
        </div>

        {/* Date + Location */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 mb-8">
          <span className="text-white/35 text-xs" style={{ fontFamily: AR(lang) }}>{t.date}</span>
          <span className="text-[#C6A04C]/20 hidden sm:inline">·</span>
          <span className="text-white/35 text-xs" style={{ fontFamily: AR(lang) }}>{t.location}</span>
        </div>

        {/* Language toggle */}
        <div className="flex justify-center mb-8">
          <button
            onClick={onLanguageToggle}
            aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            className="flex items-center gap-2 text-white/30 hover:text-[#C6A04C]/70 border border-white/8 hover:border-[#C6A04C]/25 px-5 py-2.5 rounded-full text-xs transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C6A04C]"
          >
            <Globe className="w-3.5 h-3.5" />
            <span style={{ fontFamily: AR(lang) }}>{t.switchLabel}</span>
          </button>
        </div>

        {/* Copyright */}
        <p className="text-white/15 text-xs mb-6" style={{ fontFamily: AR(lang) }}>{t.copyright}</p>

        {/* ── Developer credit ── */}
        <div className="flex items-center justify-center gap-2">
          <Code2 className="w-3 h-3 text-white/15" />
          <p className="text-white/15 text-[11px]" style={{ fontFamily: AR(lang) }}>
            {t.devLabel}{' '}
            <a
              href="https://github.com/aelzyat0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C6A04C]/40 hover:text-[#C6A04C]/70 transition-colors duration-300 font-semibold"
            >
              aelzyat
            </a>
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
