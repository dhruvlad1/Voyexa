import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SCROLL_DURATION = 40;

/**
 * Data source (same as Dashboard.jsx):
 * GET http://localhost:8080/api/dashboard/trending
 * Shape (DestinationDto): { city, country, description, budget, imageUrl }
 */
const TRENDING_ENDPOINT = 'http://localhost:8080/api/dashboard/trending';

const LandingDestinations = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchTrending = async () => {
      try {
        const res = await fetch(TRENDING_ENDPOINT);
        if (!res.ok) {
          if (active) setDestinations([]);
          return;
        }

        const data = await res.json();
        if (active) setDestinations(Array.isArray(data) ? data : []);
      } catch {
        if (active) setDestinations([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchTrending();
    return () => {
      active = false;
    };
  }, []);

  const loopDestinations = useMemo(() => {
    if (!destinations?.length) return [];
    return [...destinations, ...destinations];
  }, [destinations]);

  return (
    <section aria-label="Trending destinations" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-center mb-2">Where people are going right now</h2>
        <p className="text-white/50 text-sm text-center mb-10">Live trending destinations from the Voyexa feed</p>

        <div
          className="group overflow-hidden w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        >
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : loopDestinations.length === 0 ? (
            <div className="text-center text-white/60 text-sm py-10">
              Unable to load trending destinations right now.
            </div>
          ) : (
            <div
              className="flex gap-4 w-max animate-marquee group-hover:[animation-play-state:paused]"
              style={{ animationDuration: SCROLL_DURATION + 's' }}
            >
              {loopDestinations.map((place, idx) => {
                const city = place?.city ?? '';
                const country = place?.country ?? '';
                const image = place?.imageUrl;

                return (
                  <button
                    key={`${city}-${country}-${idx}`}
                    type="button"
                    onClick={() => navigate('/create-trip', { state: { prefilledDestination: `${city}, ${country}` } })}
                    className="w-44 h-28 sm:w-72 sm:h-44 md:w-80 md:h-48 flex-shrink-0 rounded-2xl overflow-hidden relative cursor-pointer transition-transform duration-300 hover:scale-105 hover:ring-1 hover:ring-white/20 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] focus-visible:outline-none"
                    style={
                      typeof image === 'string' && image.length > 0
                        ? { backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : undefined
                    }
                    aria-label={city && country ? `${city}, ${country}` : 'Trending destination'}
                  >
                    {typeof image !== 'string' && image ? (
                      <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : null}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {place?.rank !== undefined && place?.rank !== null ? (
                      <div className="absolute top-3 right-3 bg-indigo-500/80 text-white text-xs rounded-full px-2 py-0.5">
                        #{String(place.rank)}
                      </div>
                    ) : null}

                    <div className="absolute left-4 bottom-3 text-left">
                      <div className="font-semibold text-white text-sm leading-tight">{city}</div>
                      <div className="text-white/60 text-xs">{country}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LandingDestinations;


