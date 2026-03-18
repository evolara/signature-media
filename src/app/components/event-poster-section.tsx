import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import posterImage from '@/assets/concert-poster.jpg';
import { AR } from './utils';

interface EventPosterSectionProps {
  lang: 'ar' | 'en';
}

export function EventPosterSection({ lang }: EventPosterSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="relative py-16 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-[#0A0A0A] to-[#080808]" />

      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-[#C6A04C]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative group"
        >
          {/* Glow border effect */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#C6A04C]/20 via-transparent to-[#A8382A]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Poster image */}
          <div className="relative rounded-2xl overflow-hidden border border-[#C6A04C]/15 shadow-2xl shadow-black/60">
            <img
              src={posterImage}
              alt={lang === 'ar' ? 'بوستر حفل روح الطرب — دار الحرس الجمهوري' : 'Rouh Al-Tarab Concert Poster — Republican Guard House'}
              className="w-full h-auto object-cover"
            />

            {/* Subtle bottom overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#080808]/60 to-transparent" />
          </div>
        </motion.div>

        {/* Caption */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center text-white/30 text-xs mt-4 tracking-widest uppercase"
          style={{ fontFamily: AR(lang) }}
        >
          {lang === 'ar' ? '♩ روح الطرب — خامس ليالي عيد الفطر ♩' : '♩ Rouh Al-Tarab — Fifth Night of Eid Al-Fitr ♩'}
        </motion.p>
      </div>
    </section>
  );
}
