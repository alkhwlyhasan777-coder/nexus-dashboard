import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDirection } from "../components/ui/Sidebar";

const UIContext = createContext(null);

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};

export function UIProvider({ children }) {
  const [lang, setLang] = useState(() => read("lang", "en"));
  const [theme, setTheme] = useState(() => read("theme", "light"));
  const [collapsed, setCollapsed] = useState(() => read("sidebar-collapsed", false));
  const [mobileOpen, setMobileOpen] = useState(false);

  useDirection(lang); // keeps <html lang/dir> in sync

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
    root.style.colorScheme = theme;
    localStorage.setItem("theme", JSON.stringify(theme));
  }, [theme]);

  useEffect(() => { localStorage.setItem("lang", JSON.stringify(lang)); }, [lang]);
  useEffect(() => { localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed)); }, [collapsed]);

  const toggleLang = useCallback(() => setLang((l) => (l === "en" ? "ar" : "en")), []);
  const toggleTheme = useCallback(() => setTheme((current) => (current === "dark" ? "light" : "dark")), []);
  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, theme, toggleTheme, collapsed, toggleCollapsed, mobileOpen, openMobile, closeMobile }),
    [lang, theme, collapsed, mobileOpen, toggleLang, toggleTheme, toggleCollapsed, openMobile, closeMobile]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <UIProvider>");
  return ctx;
};
