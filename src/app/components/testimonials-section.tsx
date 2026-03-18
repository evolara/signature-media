import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { AR } from './utils';

// ✅ Imported via bundler — guarantees files exist at build time
import audienceImg  from '/audience.jpg';
import concertImg   from '/conciert.png';
import member3Img   from '/member3.jpg';

interface TestimonialsSectionProps {
  lang: 'ar' | 'en';
}

const gallery = [
  {
    src: audienceImg,
    alt: {
      ar: 'الجمهور خلال إحدى الأمسيات الموسيقية',
      en: 'Audience during a live musical evening',
    },
  },
  {
    src: concertImg,
    alt: {
      ar: 'أجواء الحفل الموسيقي على المسرح',
      en: 'Concert atmosphere on stage',
    },
  },
  {
    src: member3Img,
    alt: {
      ar: 'لقطة من فعالية موسيقية سابقة',
      en: 'Moment from a previous musical event',
    },
  },
];

export function TestimonialsSection({ lang }: TestimonialsSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  // ✅ Heading text filled in for both languages
  const heading = lang === 'ar' ? 'لحظات من حفلاتنا' : 'Moments from Our Concerts';
  const prevLabel = lang === 'ar' ? 'الشريحة السابقة' : 'Previous slide';
  const nextLabel = lang === 'ar' ? 'الشريحة التالية' : 'Next slide';

  return (
    <section
      id="testimonials"
      ref={ref}
      className="relative py-28 px-4 overflow-hidden bg-[#080808]"
      aria-labelledby="testimonials-heading"
    >
      {/* Decorative top line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C6A04C]/20 to-transparent" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <p className="text-[#C6A04C] text-xs tracking-[0.4em] uppercase mb-3" style={{ fontFamily: AR(lang) }}>
          ♩ {lang === 'ar' ? 'معرضنا' : 'Gallery'} ♩
        </p>
        {/* ✅ Heading now has real content */}
        <h2
          id="testimonials-heading"
          className="text-3xl sm:text-4xl md:text-5xl font-black text-white"
          style={{ fontFamily: AR(lang) }}
        >
          {heading}
        </h2>
        <div className="h-px max-w-xs mx-auto mt-4 bg-gradient-to-r from-transparent via-[#C6A04C]/40 to-transparent" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-5xl mx-auto"
      >
        <Swiper
          modules={[Autoplay, Pagination, Navigation, A11y]}
          spaceBetween={20}
          slidesPerView={1}
          loop
          // ✅ Pause on hover so users can examine the image
          autoplay={{ delay: 3000, pauseOnMouseEnter: true, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={{
            prevEl: '.swiper-btn-prev',
            nextEl: '.swiper-btn-next',
          }}
          // ✅ A11y module adds proper ARIA to slides
          a11y={{
            prevSlideMessage: prevLabel,
            nextSlideMessage: nextLabel,
          }}
          className="rounded-2xl overflow-hidden"
        >
          {gallery.map((item, i) => (
            <SwiperSlide key={i}>
              <div className="relative h-60 sm:h-80 md:h-96 overflow-hidden">
                <img
                  src={item.src}
                  alt={item.alt[lang]}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" aria-hidden="true" />
              </div>
            </SwiperSlide>
          ))}

          {/* ✅ Custom accessible nav buttons */}
          <button
            className="swiper-btn-prev absolute start-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 flex items-center justify-center text-white transition-all"
            aria-label={prevLabel}
          >
            ‹
          </button>
          <button
            className="swiper-btn-next absolute end-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 flex items-center justify-center text-white transition-all"
            aria-label={nextLabel}
          >
            ›
          </button>
        </Swiper>
      </motion.div>
    </section>
  );
}
