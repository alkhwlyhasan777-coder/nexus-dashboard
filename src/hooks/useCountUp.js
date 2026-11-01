import { useEffect, useRef, useState } from "react";

/* Animates a number from its previous value to target, respecting reduced-motion preferences. */
export default function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let raf;

    if (prefersReducedMotion) {
      current.current = target;
      raf = requestAnimationFrame(() => {
        setValue(target);
      });
      return () => cancelAnimationFrame(raf);
    }

    const from = current.current;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      const next = from + (target - from) * eased;

      current.current = next;
      setValue(next);

      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        current.current = target;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
