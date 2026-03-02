import { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'sonner';
import { HeroSection } from './components/hero-section';
import { TicketsSection } from './components/tickets-section';
import { OrganizerSection } from './components/organizer-section';
import { TestimonialsSection } from './components/testimonials-section';
import { BookingFlow } from './components/booking-flow';
import { Footer } from './components/footer';
import { NavBar } from './components/navbar';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [selectedTicket, setSelectedTicket] = useState<'vip' | 'classic' | null>(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);

  // ✅ Single source of truth for dir/lang — removed redundant dir prop on the div
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // ✅ Also lock horizontal scroll to prevent shifts during modal open
  useEffect(() => {
    document.body.style.overflow = showBookingFlow ? 'hidden' : '';
    document.body.style.overflowX = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.body.style.overflowX = '';
    };
  }, [showBookingFlow]);

  const toggleLanguage = useCallback(() => setLang(p => p === 'ar' ? 'en' : 'ar'), []);

  // ✅ Guard against scroll attempt while booking flow is open
  const handleBookNow = useCallback(() => {
    if (showBookingFlow) return;
    document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' });
  }, [showBookingFlow]);

  const handleSelectTicket = useCallback((type: 'vip' | 'classic') => {
    setSelectedTicket(type);
    setShowBookingFlow(true);
  }, []);

  // ✅ Close flow first, then clear ticket after exit animation window (300ms)
  const handleClose = useCallback(() => {
    setShowBookingFlow(false);
    setTimeout(() => setSelectedTicket(null), 300);
  }, []);

  return (
    // ✅ dir removed here — already set on documentElement via useEffect
    <div className="min-h-screen bg-[#080808] text-white">
      <Toaster
        position={lang === 'ar' ? 'top-left' : 'top-right'}
        theme="dark"
        toastOptions={{
          style: {
            background: '#111',
            color: '#fff',
            border: '1px solid rgba(198,160,76,0.3)',
            fontFamily: lang === 'ar' ? 'Cairo, sans-serif' : "'Cormorant Garamond', serif",
            fontSize: '14px',
          },
        }}
      />
      <NavBar lang={lang} onLanguageToggle={toggleLanguage} onBookNow={handleBookNow} />
      <HeroSection lang={lang} onBookNowClick={handleBookNow} />
      <TicketsSection lang={lang} onSelectTicket={handleSelectTicket} />
      <OrganizerSection lang={lang} />
      <TestimonialsSection lang={lang} />
      <Footer lang={lang} onLanguageToggle={toggleLanguage} />

      {/* ✅ selectedTicket stays mounted during exit animation */}
      {selectedTicket && (
        <BookingFlow
          lang={lang}
          selectedTicket={selectedTicket}
          onClose={handleClose}
          isOpen={showBookingFlow}
        />
      )}
    </div>
  );
}
