import { TEXT } from "./Sidebar";
import { useUI } from "../../context/UIcontext";

const btn =
  "grid size-9 place-items-center rounded-lg border border-neutral-200 hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-800";

export default function Topbar({ activeId }) {
  const { lang, toggleLang, toggleCollapsed, openMobile } = useUI();
  const title = TEXT[lang][activeId] ?? "";

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-neutral-200 bg-white/80 px-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80 md:px-6">
      {/* Mobile: opens the drawer */}
      <button className={`${btn} md:hidden`} onClick={openMobile} aria-label="Menu">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      {/* Desktop: collapses the sidebar */}
      <button className={`${btn} hidden md:grid`} onClick={toggleCollapsed} aria-label="Collapse sidebar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="rtl:-scale-x-100"><path d="M6 4h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z" /><path d="M9 4v16" /></svg>
      </button>

      <h1 className="flex-1 truncate text-base font-semibold">{title}</h1>

      <button
        onClick={toggleLang}
        className="h-9 rounded-lg border border-neutral-200 px-3 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-800"
      >
        {lang === "en" ? "العربية" : "English"}
      </button>
    </header>
  );
}
