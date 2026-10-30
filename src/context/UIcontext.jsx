/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDirection } from "../components/ui/Sidebar";

const UIContext = createContext(null);

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};

export function UIProvider({ children }) {
  const [lang, setLang] = useState(() => read("lang", "en"));
  const [collapsed, setCollapsed] = useState(() => read("sidebar-collapsed", false));
  const [mobileOpen, setMobileOpen] = useState(false);

  useDirection(lang); // keeps <html lang/dir> in sync

  useEffect(() => { localStorage.setItem("lang", JSON.stringify(lang)); }, [lang]);
  useEffect(() => { localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed)); }, [collapsed]);

  const toggleLang = useCallback(() => setLang((l) => (l === "en" ? "ar" : "en")), []);
  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, collapsed, toggleCollapsed, mobileOpen, openMobile, closeMobile }),
    [lang, collapsed, mobileOpen, toggleLang, toggleCollapsed, openMobile, closeMobile]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <UIProvider>");
  return ctx;
};
