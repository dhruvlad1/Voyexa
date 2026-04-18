import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useScrollReveal from '@/hooks/useScrollReveal';

const LandingCTA = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const revealed = useScrollReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      aria-label="Get started"
      className={
        `py-20 sm:py-32 transition-all duration-700 ` +
        (revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 rounded-3xl p-12 sm:p-16 text-center">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-normal filter blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500 rounded-full mix-blend-normal filter blur-3xl opacity-20" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Start planning your next adventure
            </h2>
            <p className="text-lg sm:text-xl text-white/80 font-medium max-w-2xl mx-auto">
              Create your first AI-powered itinerary in seconds. No credit card required.
            </p>
            <div className="pt-4">
              <Button
                data-testid="final-cta-btn"
                onClick={() => navigate('/auth')}
                size="lg"
                className="bg-white text-indigo-600 hover:bg-white/90 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl group focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] focus-visible:outline-none"
              >
                Get started now
                <ArrowRight aria-hidden="true" className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingCTA;

