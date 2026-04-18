import React, { useRef } from 'react';
import { MapPin, Brain, Share2 } from 'lucide-react';
import useScrollReveal from '@/hooks/useScrollReveal';

const steps = [
  {
    number: '01',
    icon: MapPin,
    title: 'Tell us your trip',
    description: 'Share your origin, destination, travel dates, budget, preferred pace, and interests. The more details, the better your itinerary.'
  },
  {
    number: '02',
    icon: Brain,
    title: 'AI builds your itinerary',
    description: 'Our AI analyzes your preferences and creates a complete day-by-day plan with morning, afternoon, and evening activities tailored to you.'
  },
  {
    number: '03',
    icon: Share2,
    title: 'Adjust and share',
    description: 'Reorder days with drag-and-drop, swap activities for alternatives, create trip variations, and share your itinerary via a simple link.'
  }
];

const LandingHowItWorks = () => {
  const sectionRef = useRef(null);
  const revealed = useScrollReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      aria-label="How Voyexa works"
      className={
        `py-20 sm:py-24 transition-all duration-700 ` +
        (revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            How it works
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            From idea to itinerary in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const delayClass = index === 0 ? 'delay-100' : index === 1 ? 'delay-200' : 'delay-300';
            return (
              <div
                key={index}
                data-testid={`how-it-works-step-${index + 1}`}
                className={
                  `relative group transition-all duration-700 ${delayClass} ` +
                  (revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')
                }
              >
                {/* Connecting line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent -translate-y-1/2 z-0" />
                )}

                {/* Card */}
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 h-full">
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon aria-hidden="true" className="w-7 h-7 text-indigo-400" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3">
                    {step.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LandingHowItWorks;
