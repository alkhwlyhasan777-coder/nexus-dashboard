import { useLayoutEffect, useRef, useState } from "react";
 
/*
  Returns [ref, width]: the live width of the element the ref is attached to.
  Updates whenever the element resizes, including when the sidebar opens, closes
  or changes size. Use it for layout decisions that depend on the space a
  component actually has, not on the screen width.
*/
export default function useElementWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
 
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width); // measured before first paint
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
 
  return [ref, width];
}