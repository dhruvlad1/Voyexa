import React, { useRef } from 'react';
import { Sparkles, Share2, GitBranch } from 'lucide-react';
import useScrollReveal from '@/hooks/useScrollReveal';

const chips = [
  {
    Icon: Sparkles,
    text: 'AI-generated, day-by-day plans',
  },
  {
    Icon: Share2,
    text: 'Shareable with one link',
  },
  {
    Icon: GitBranch,
    text: 'Fork and compare variations',
  },
];

const LandingTrustStrip = () => {
  const sectionRef = useRef(null);
  const revealed = useScrollReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      aria-label="Key benefits"
      className={
        `relative z-10 -mt-10 pb-10 transition-all duration-700 ` +
        (revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {chips.map(({ Icon, text }) => (
            <div
              key={text}
              className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-5 py-2 text-sm text-white/70"
            >
              <Icon aria-hidden="true" className="w-4 h-4 text-white/60" />
              <span className="font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingTrustStrip;

