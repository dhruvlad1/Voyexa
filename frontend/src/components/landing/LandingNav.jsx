import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingNav = () => {
  const navigate = useNavigate();
  const [hasShadow, setHasShadow] = useState(false);

  useEffect(() => {
    const updateShadow = () => {
      setHasShadow(window.scrollY > 20);
    };

    updateShadow();
    window.addEventListener('scroll', updateShadow, { passive: true });
    return () => window.removeEventListener('scroll', updateShadow);
  }, []);

  return (
    <header
      role="banner"
      className={
        `sticky top-0 z-50 border-b border-white/10 bg-[#020617]/80 backdrop-blur-md ` +
        (hasShadow ? 'shadow-lg shadow-black/20' : '')
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-3 text-white hover:text-white/90 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] focus-visible:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <Plane aria-hidden="true" className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Voyexa</span>
        </button>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => navigate('/')}
            className="bg-transparent hover:bg-white/5 text-white/90 border border-white/10 hover:border-white/20 rounded-xl px-4 py-2 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] focus-visible:outline-none"
          >
            Sign in
          </Button>
          <Button
            type="button"
            onClick={() => navigate('/')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-5 py-2 font-semibold shadow-lg hover:shadow-indigo-500/25 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] focus-visible:outline-none"
          >
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default LandingNav;

