import { useState, useEffect } from 'react';
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
  const [selectedTicket, setSelectedTicket] = useState<'vip' | 'standard' | null>(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    document.body.style.overflow = showBookingFlow ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showBookingFlow]);

  const toggleLanguage = () => setLang(p => p === 'ar' ? 'en' : 'ar');

  const handleBookNow = () => {
    document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectTicket = (type: 'vip' | 'standard') => {
    setSelectedTicket(type);
    setShowBookingFlow(true);
  };

  const handleClose = () => {
    setShowBookingFlow(false);
    setSelectedTicket(null);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
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
      {showBookingFlow && selectedTicket && (
        <BookingFlow lang={lang} selectedTicket={selectedTicket} onClose={handleClose} />
      )}
    </div>
  );
}
