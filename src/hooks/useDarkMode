import { useEffect, useState } from "react";

const read = () =>
  document.documentElement.classList.contains("dark") ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches &&
    !document.documentElement.classList.contains("light"));

/* true while the page is in dark mode (works with the `dark` class or the OS setting) */
export default function useDarkMode() {
  const [dark, setDark] = useState(read);

  useEffect(() => {
    const update = () => setDark(read());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => { mq.removeEventListener("change", update); observer.disconnect(); };
  }, []);

  return dark;
}