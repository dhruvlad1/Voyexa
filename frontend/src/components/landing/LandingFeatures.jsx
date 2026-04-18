import React, { useRef } from 'react';
import {
  Search,
  TrendingUp,
  Loader2,
  GripVertical,
  Shuffle,
  GitBranch,
  Link2,
  Save,
  User,
  Heart,
  Users,
  Briefcase,
} from 'lucide-react';
import useScrollReveal from '@/hooks/useScrollReveal';

const featureDelayClasses = [
  'delay-[100ms]',
  'delay-[250ms]',
  'delay-[400ms]',
  'delay-[550ms]',
  'delay-[700ms]',
  'delay-[850ms]',
  'delay-[1000ms]',
  'delay-[1150ms]',
];

const useCaseDelayClasses = [
  'delay-[120ms]',
  'delay-[300ms]',
  'delay-[480ms]',
  'delay-[660ms]',
];

const features = [
  {
    icon: Search,
    title: 'Place autocomplete search',
    description: 'Smart location search with instant suggestions for destinations worldwide.',
    iconBgClass: 'bg-indigo-500/20',
    iconColorClass: 'text-indigo-400',
    hoverAccentClass: 'before:bg-indigo-500/50',
  },
  {
    icon: TrendingUp,
    title: 'Trending destinations feed',
    description: 'Discover popular travel spots and get inspired by what others are exploring.',
    iconBgClass: 'bg-violet-500/20',
    iconColorClass: 'text-violet-400',
    hoverAccentClass: 'before:bg-violet-500/50',
  },
  {
    icon: Loader2,
    title: 'Flight-style loading screen',
    description: 'Engaging loading experience while your personalized itinerary is being generated.',
    iconBgClass: 'bg-blue-500/20',
    iconColorClass: 'text-blue-400',
    hoverAccentClass: 'before:bg-blue-500/50',
  },
  {
    icon: GripVertical,
    title: 'Drag-and-drop day reordering',
    description: 'Easily rearrange your itinerary days to match your preferred travel flow.',
    iconBgClass: 'bg-purple-500/20',
    iconColorClass: 'text-purple-400',
    hoverAccentClass: 'before:bg-purple-500/50',
  },
  {
    icon: Shuffle,
    title: 'Activity alternatives per slot',
    description: 'Not happy with a suggestion? Swap activities for alternatives that fit your style.',
    iconBgClass: 'bg-cyan-500/20',
    iconColorClass: 'text-cyan-400',
    hoverAccentClass: 'before:bg-cyan-500/50',
  },
  {
    icon: GitBranch,
    title: 'Fork trip variations',
    description: 'Create multiple versions of your trip to compare different itinerary options.',
    iconBgClass: 'bg-emerald-500/20',
    iconColorClass: 'text-emerald-400',
    hoverAccentClass: 'before:bg-emerald-500/50',
  },
  {
    icon: Link2,
    title: 'Shareable itinerary links',
    description: 'Generate a unique link to share your complete itinerary with travel companions.',
    iconBgClass: 'bg-sky-500/20',
    iconColorClass: 'text-sky-400',
    hoverAccentClass: 'before:bg-sky-500/50',
  },
  {
    icon: Save,
    title: 'Save trips to My Trips',
    description: 'Access all your planned and past itineraries from one organized dashboard.',
    iconBgClass: 'bg-indigo-500/20',
    iconColorClass: 'text-indigo-400',
    hoverAccentClass: 'before:bg-indigo-500/50',
  }
];

const useCases = [
  {
    title: 'Solo traveler',
    tag: 'Any pace',
    icon: User,
    description: 'Self-paced adventures tailored to individual interests and flexible schedules.'
  },
  {
    title: 'Couple',
    tag: 'Romantic',
    icon: Heart,
    description: 'Romantic getaways and shared experiences designed for two.'
  },
  {
    title: 'Group',
    tag: 'Coordinated',
    icon: Users,
    description: 'Coordinated itineraries that accommodate diverse preferences and group dynamics.'
  },
  {
    title: 'Work trip',
    tag: 'Efficient',
    icon: Briefcase,
    description: 'Efficient business travel plans that balance meetings with local exploration.'
  }
];

const LandingFeatures = () => {
  const sectionRef = useRef(null);
  const revealed = useScrollReveal(sectionRef);
  const featuresRef = useRef(null);
  const featuresRevealed = useScrollReveal(featuresRef);
  const useCasesRef = useRef(null);
  const useCasesRevealed = useScrollReveal(useCasesRef);

  return (
    <section
      ref={sectionRef}
      aria-label="Features"
      className={
        `py-20 sm:py-24 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent transition-all duration-700 ` +
        (revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Grid */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Everything you need
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Real features built for modern travelers
          </p>
        </div>

        <div ref={featuresRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const revealDelayClass = featureDelayClasses[index] || featureDelayClasses[featureDelayClasses.length - 1];
            return (
              <div
                key={index}
                data-testid={`feature-card-${index}`}
                className={
                  `relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 ` +
                  `hover:bg-white/10 hover:border-white/20 transition-all duration-700 group ${revealDelayClass} ` +
                  `before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-px before:opacity-0 ` +
                  `before:transition-opacity before:duration-300 group-hover:before:opacity-100 ` +
                  (feature.hoverAccentClass || '') +
                  ` ` +
                  (featuresRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')
                }
              >
                <div
                  className={
                    `w-12 h-12 rounded-lg flex items-center justify-center mb-4 ` +
                    `group-hover:scale-110 transition-transform duration-300 ` +
                    (feature.iconBgClass || 'bg-indigo-500/20')
                  }
                >
                  <Icon aria-hidden="true" className={`w-6 h-6 ${feature.iconColorClass || 'text-indigo-400'}`} />
                </div>
                <h3 className="font-bold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Use Cases */}
        <div ref={useCasesRef} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Built for every traveler
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            const delayClass = useCaseDelayClasses[index] || useCaseDelayClasses[useCaseDelayClasses.length - 1];
            return (
              <div
                key={index}
                data-testid={`use-case-card-${index}`}
                className={
                  `bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center ` +
                  `hover:bg-white/10 hover:border-white/20 transition-all duration-700 ${delayClass} ` +
                  `hover:shadow-lg hover:shadow-indigo-500/10 ` +
                  (useCasesRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')
                }
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-5">
                  <Icon aria-hidden="true" className="w-6 h-6 text-white/80" />
                </div>

                <h3 className="font-bold text-lg mb-2">{useCase.title}</h3>

                <div className="mb-3">
                  <span className="inline-flex text-xs bg-indigo-500/20 text-indigo-300 rounded-full px-3 py-1 font-semibold">
                    {useCase.tag}
                  </span>
                </div>

                <p className="text-sm text-white/70 leading-relaxed">{useCase.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
