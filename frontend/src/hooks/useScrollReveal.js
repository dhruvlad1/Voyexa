import { useEffect, useState } from 'react';

/**
 * Reveals an element when it enters the viewport.
 * @param {import('react').RefObject<HTMLElement | null>} ref
 * @param {number} [threshold=0.15]
 * @returns {boolean} revealed
 */
export default function useScrollReveal(ref, threshold = 0.15) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref?.current;
    if (!el || revealed) return;

    // Fallback for older browsers / test environments.
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold, revealed]);

  return revealed;
}

