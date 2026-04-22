import React, { useEffect } from 'react';
import FloatingLines from '@/components/FloatingLines';
import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import LandingTrustStrip from '@/components/landing/LandingTrustStrip';
import LandingDestinations from '@/components/landing/LandingDestinations';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingCTA from '@/components/landing/LandingCTA';

const LandingPage = () => {
  useEffect(() => {
    const previousTitle = document.title;
    const title = 'Voyexa — AI-powered travel itineraries';
    document.title = title;

    const metaDefs = [
      {
        property: 'og:title',
        content: title,
      },
      {
        property: 'og:description',
        content: 'Plan detailed, day-by-day itineraries with AI. Tailored to your budget, pace, and interests.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
    ];

    const touched = [];

    metaDefs.forEach(({ property, content }) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (el) {
        touched.push({ el, created: false, previousContent: el.getAttribute('content') });
        el.setAttribute('content', content);
        return;
      }

      el = document.createElement('meta');
      el.setAttribute('property', property);
      el.setAttribute('content', content);
      document.head.appendChild(el);
      touched.push({ el, created: true });
    });

    return () => {
      document.title = previousTitle;
      touched.forEach((t) => {
        if (t.created) {
          t.el.remove();
          return;
        }

        if (t.previousContent === null) {
          t.el.removeAttribute('content');
        } else {
          t.el.setAttribute('content', t.previousContent);
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white relative">
      <FloatingLines />

      <LandingNav />

      <main className="relative z-10">
        <section aria-label="Introduction" style={{ display: 'contents' }}>
          <LandingHero />
        </section>
        <section aria-label="Key benefits" style={{ display: 'contents' }}>
          <LandingTrustStrip />
        </section>
        <section aria-label="Trending destinations" style={{ display: 'contents' }}>
          <LandingDestinations />
        </section>
        <section aria-label="How Voyexa works" style={{ display: 'contents' }}>
          <LandingHowItWorks />
        </section>
        <section aria-label="Features" style={{ display: 'contents' }}>
          <LandingFeatures />
        </section>
        <section aria-label="Get started" style={{ display: 'contents' }}>
          <LandingCTA />
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-[#020617]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold">Voyexa</h3>
              <p className="text-white/60 text-sm mt-1">Your itinerary, built in seconds.</p>
            </div>
            <nav className="flex gap-6 text-sm">
              <a
                href="/dashboard"
                className="text-white/80 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] focus-visible:outline-none"
              >
                Dashboard
              </a>
              <a
                href="/create-trip"
                className="text-white/80 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] focus-visible:outline-none"
              >
                Create Trip
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
