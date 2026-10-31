import { useEffect } from "react";
 
/* Calls `handler` when a pointer press lands outside `ref`. Only listens while `active`. */
export default function useClickOutside(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler(e);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [ref, handler, active]);
}
 
