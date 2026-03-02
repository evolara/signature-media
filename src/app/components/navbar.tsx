import { useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate, AnimatePresence } from 'motion/react';
import { Globe, Menu, X, MessageCircle } from 'lucide-react';
import logoImage from '@/assets/sm-logo.png';
import { AR } from './utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';

interface NavBarProps {
  lang: 'ar' | 'en';
  onLanguageToggle: () => void;
  onBookNow: () => void;
}

export function NavBar({ lang, onLanguageToggle, onBookNow }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [upcomingOpen, setUpcomingOpen] = useState(false);
  const { scrollY } = useScroll();

  // ✅ useMotionTemplate makes border reactive to scroll — fixes the .get() bug
  const bg = useTransform(scrollY, [0, 80], ['rgba(8,8,8,0)', 'rgba(8,8,8,0.95)']);
  const borderOp = useTransform(scrollY, [0, 80], [0, 0.15]);
  const borderColor = useMotionTemplate`rgba(198,160,76,${borderOp})`;

  // Close menu on scroll
  useEffect(() => {
    const unsub = scrollY.on('change', v => { if (v > 50) setMenuOpen(false); });
    return unsub;
  }, [scrollY]);

  // ✅ Language toggle also closes the mobile menu
  const handleLanguageToggle = useCallback(() => {
    onLanguageToggle();
    setMenuOpen(false);
  }, [onLanguageToggle]);

  const handleBookNow = useCallback(() => {
    onBookNow();
    setMenuOpen(false);
  }, [onBookNow]);

  const handleUpcoming = useCallback(() => {
    setUpcomingOpen(true);
    setMenuOpen(false);
  }, []);

  const t = lang === 'ar'
    ? {
        tickets: 'التذاكر',
        book: 'احجز تذكرتك الآن',
        switchLang: 'EN',
        upcoming: 'الفعاليات القادمة',
        waUrl: 'https://wa.me/201015656650?text=مرحبا%20أنا%20مهتم%20بمعرفة%20المزيد%20عن%20الفعاليات%20القادمة',
        waLabel: 'تواصل عبر واتس',
        upcomingTitle: 'الفعاليات القادمة',
        upcomingDesc: 'تواصل معنا للاستفسار عن الفعاليات والعروض الخاصة',
        upcomingBody: 'قريباً سيكون لدينا فعاليات وعروض حصرية',
      }
    : {
        tickets: 'Tickets',
        book: 'Book Your Ticket Now',
        switchLang: 'ع',
        upcoming: 'Upcoming Events',
        // ✅ English WhatsApp message for English users
        waUrl: 'https://wa.me/201015656650?text=Hello%2C%20I%20am%20interested%20in%20learning%20more%20about%20upcoming%20events',
        waLabel: 'Contact via WhatsApp',
        upcomingTitle: 'Upcoming Events',
        upcomingDesc: 'Contact us to inquire about upcoming events and special offers',
        upcomingBody: 'Coming soon we will have exclusive events and offers',
      };

  return (
    <>
      <motion.nav
        style={{ background: bg }}
        className="fixed top-0 inset-x-0 z-40 backdrop-blur-md"
        role="navigation"
        aria-label={lang === 'ar' ? 'القائمة الرئيسية' : 'Main navigation'}
      >
        {/* ✅ borderColor is now a live MotionValue — updates on scroll */}
        <motion.div
          style={{ borderBottomColor: borderColor }}
          className="border-b"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-[#C6A04C]/30 flex-shrink-0">
                <img src={logoImage} alt="Signature Media Logo" className="w-full h-full object-cover" />
              </div>
              <span
                className="text-white/80 text-sm font-semibold block tracking-wide"
                style={{ fontFamily: AR(lang) }}
              >
                Signature Media
              </span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={handleBookNow}
                className="text-white/60 hover:text-white text-sm transition-colors"
                style={{ fontFamily: AR(lang) }}
              >
                {t.tickets}
              </button>
              <button
                onClick={handleUpcoming}
                className="text-white/60 hover:text-white text-sm transition-colors"
                style={{ fontFamily: AR(lang) }}
              >
                {t.upcoming}
              </button>
              <button
                onClick={handleLanguageToggle}
                className="flex items-center gap-1.5 text-[#C6A04C]/70 hover:text-[#C6A04C] text-sm transition-colors"
                style={{ fontFamily: AR(lang) }}
                aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
              >
                <Globe className="w-3.5 h-3.5" />
                {t.switchLang}
              </button>
              <button
                onClick={handleBookNow}
                className="bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] px-5 py-2 rounded-full text-sm font-black hover:opacity-90 transition-opacity"
                style={{ fontFamily: AR(lang) }}
              >
                {t.book}
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-white/60 hover:text-white transition-colors"
              onClick={() => setMenuOpen(p => !p)}
              // ✅ aria-label reflects actual state
              aria-label={menuOpen
                ? (lang === 'ar' ? 'إغلاق القائمة' : 'Close menu')
                : (lang === 'ar' ? 'فتح القائمة' : 'Open menu')
              }
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>
      </motion.nav>

      {/* ✅ AnimatePresence enables exit animation on mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="fixed top-16 inset-x-0 z-30 bg-[#0D0D0D]/98 backdrop-blur-xl border-b border-[#C6A04C]/10 py-6 px-6 flex flex-col gap-4 md:hidden"
          >
            <button
              onClick={handleBookNow}
              className="text-white/70 text-base text-start"
              style={{ fontFamily: AR(lang) }}
            >
              {t.tickets}
            </button>
            <button
              onClick={handleUpcoming}
              className="text-white/70 text-base text-start"
              style={{ fontFamily: AR(lang) }}
            >
              {t.upcoming}
            </button>
            <button
              onClick={handleLanguageToggle}
              className="text-[#C6A04C]/70 text-base flex items-center gap-2"
              style={{ fontFamily: AR(lang) }}
            >
              <Globe className="w-4 h-4" />
              {t.switchLang}
            </button>
            <button
              onClick={handleBookNow}
              className="bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] px-6 py-3 rounded-full font-black text-sm w-full"
              style={{ fontFamily: AR(lang) }}
            >
              {t.book}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming Events Modal */}
      <Dialog open={upcomingOpen} onOpenChange={setUpcomingOpen}>
        <DialogContent className="max-w-md bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border border-[#C6A04C]/20 rounded-2xl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: AR(lang) }} className="text-white text-2xl mb-2">
              {t.upcomingTitle}
            </DialogTitle>
            <DialogDescription style={{ fontFamily: AR(lang) }} className="text-white/60 text-base">
              {t.upcomingDesc}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="bg-[#C6A04C]/10 border border-[#C6A04C]/20 rounded-lg p-4">
              <p style={{ fontFamily: AR(lang) }} className="text-white/80 text-sm">
                {t.upcomingBody}
              </p>
            </div>

            {/* ✅ WhatsApp URL matches the current language */}
            <a
              href={t.waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] px-6 py-3 rounded-full font-black text-sm hover:opacity-90 transition-opacity"
              style={{ fontFamily: AR(lang) }}
            >
              <MessageCircle className="w-4 h-4" />
              {t.waLabel}
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
