import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { AR } from './utils';

interface TestimonialsSectionProps {
  lang: 'ar' | 'en';
}

const gallery: string[] = [
  '/audience.jpg',
  '/conciert.png',
  '/member3.jpg',
];

export function TestimonialsSection({ lang }: TestimonialsSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const t = {
    ar: { heading: '' },
    en: { heading: '' },
  }[lang];

  return (
    <section
      id="testimonials"
      ref={ref}
      className="relative py-28 px-4 overflow-hidden bg-[#080808]"
      aria-labelledby="testimonials-heading"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <h2
          id="testimonials-heading"
          className="text-3xl sm:text-4xl md:text-5xl font-black text-white"
          style={{ fontFamily: AR(lang) }}
        >
          {t.heading}
        </h2>
      </motion.div>

      <div className="max-w-5xl mx-auto">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          loop
          autoplay={{ delay: 3000 }}
          pagination={{ clickable: true }}
          navigation
        >
          {gallery.map((src, i) => (
            <SwiperSlide key={i}>
              <div className="relative h-60 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={src}
                  alt={`concert ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
