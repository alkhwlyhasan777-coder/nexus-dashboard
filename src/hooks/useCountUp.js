import { useEffect, useRef, useState } from "react";

/* Animates a number from its previous value to target, respecting reduced-motion preferences. */
export default function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const from = current.current;
    const start = performance.now();
    const animationDuration = reduceMotion ? 0 : Math.max(0, duration);
    let raf;

    const tick = (now) => {
      const progress =
        animationDuration === 0
          ? 1
          : Math.min(1, (now - start) / animationDuration);
      const next =
        from + (target - from) * (1 - Math.pow(1 - progress, 3));

      current.current = next;
      setValue(next);

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
