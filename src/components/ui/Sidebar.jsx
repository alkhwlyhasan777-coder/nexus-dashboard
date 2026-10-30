/* eslint-disable react-refresh/only-export-components */
import { useEffect } from "react";
 
/* ---------- Languages ---------- */
export const LANGS = {
  en: { dir: "ltr", locale: "en" },
  ar: { dir: "rtl", locale: "ar-EG" }, // use "ar-u-nu-latn" for 1 2 3 digits instead of ١ ٢ ٣
};
 
/* Sets <html lang> and <html dir> so the page layout flips too */
export function useDirection(lang) {
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGS[lang].dir;
  }, [lang]);
}
 
/* ---------- Translations (key = item id / group id) ---------- */
export const TEXT = {
  en: {
    plan: "Growth Plan", nav: "Main navigation", toggle: "Toggle sidebar",
    upgrade: "Upgrade & unlock all features",
    g_main: "Main menu", g_sales: "Sales", g_tools: "Tools", g_team: "Team & collaboration",
    dashboard: "Dashboard", leads: "Leads", deals: "Deals", customers: "Customers", pipeline: "Pipeline", tasks: "Tasks",
    analytics: "Analytics", revenue: "Revenue", reports: "Reports", forecast: "Forecast",
    automation: "Automation", campaigns: "Campaigns", email: "Email Marketing", integrations: "Integrations",
    team: "Team Members", roles: "Roles & Permissions",
    help: "Help Center", feedback: "Feedback", settings: "Settings",
  },
  ar: {
    plan: "خطة النمو", nav: "التنقل الرئيسي", toggle: "تبديل الشريط الجانبي",
    upgrade: "رقِّ حسابك وافتح جميع الميزات",
    g_main: "القائمة الرئيسية", g_sales: "المبيعات", g_tools: "الأدوات", g_team: "الفريق والتعاون",
    dashboard: "لوحة التحكم", leads: "العملاء المحتملون", deals: "الصفقات", customers: "العملاء", pipeline: "مسار المبيعات", tasks: "المهام",
    analytics: "التحليلات", revenue: "الإيرادات", reports: "التقارير", forecast: "التوقعات",
    automation: "الأتمتة", campaigns: "الحملات", email: "التسويق عبر البريد", integrations: "التكاملات",
    team: "أعضاء الفريق", roles: "الأدوار والصلاحيات",
    help: "مركز المساعدة", feedback: "الملاحظات", settings: "الإعدادات",
  },
};
 
/* ---------- Icons (stroke paths, 24x24) ---------- */
const ICONS = {
  logo: ["M5 5h10M5 12h14M5 19h8"],
  panel: ["M6 4h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z", "M9 4v16"],
  chevron: ["m9 6 6 6-6 6"],
  dashboard: ["M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"],
  leads: ["M12 3 3 8l9 5 9-5-9-5Z", "m3 13 9 5 9-5"],
  deals: ["M6 3h9l4 4v14H6z", "M9 12h7M9 16h7"],
  customers: ["M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z", "M4 21c1-4 4-6 8-6s7 2 8 6"],
  pipeline: ["M5 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z", "M19 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z", "M12 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z", "M7 6h10M6 8l5 8M18 8l-5 8"],
  tasks: ["M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z", "m8.5 12 2.5 2.5 4.5-5"],
  analytics: ["M4 4v16h16", "M8 16v-5M12 16V8M16 16v-3"],
  revenue: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M14.5 9.5c-.6-.8-1.6-1.2-2.6-1.2-1.4 0-2.4.8-2.4 1.8s1 1.5 2.5 1.9 2.5.9 2.5 1.9-1 1.8-2.5 1.8c-1.1 0-2.1-.4-2.7-1.2M12 6.5v1.8M12 15.7v1.8"],
  reports: ["M6 20V10M12 20V4M18 20v-7"],
  forecast: ["M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z", "m7 15 3.5-4 3 2.5L17 8"],
  automation: ["M6 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z", "M6 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z", "M18 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z", "M6 7v10M6 12h10"],
  campaigns: ["M3 10v4h4l7 4V6L7 10H3Z", "M17 9c1.3 1.6 1.3 4.4 0 6"],
  email: ["M6 5h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z", "m4 8 8 5 8-5"],
  integrations: ["M5 4v6h5", "M5 20v-6h5", "M14 7h5M14 12h5M14 17h5"],
  team: ["M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z", "M17 6.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z", "M2 20c.6-3.5 3-5 6-5s5.4 1.5 6 5", "M15 15c3 0 5 1.2 6 4"],
  roles: ["M6 4h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z", "M9 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z", "M6 17c.5-2 1.7-3 3-3s2.5 1 3 3M15 10h3M15 14h3"],
  help: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"],
  feedback: ["M4 5h16v11H9l-5 4V5Z", "M12 8.5v3M12 13.5h.01"],
  settings: ["M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z", "M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.2-1.3L14 3h-4l-.4 2.4a7 7 0 0 0-2.2 1.3l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.6l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.2 1.3L10 21h4l.4-2.4a7 7 0 0 0 2.2-1.3l2.3.9 2-3.4-2-1.5c.1-.4.1-.9.1-1.3Z"],
  rocket: ["M5 19c0-3 1-4 3-4l-2-2c-2 0-3 1-3 4 0 0 0 2 2 2Zm3-4 5 5c1-3 4-5 6-12-7 2-9 5-11 7Z", "M15 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"],
};
 
function Icon({ name, size = 16, className = "" }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {ICONS[name].map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
 
/* ---------- Menu structure (text comes from TEXT by id) ---------- */
export const MENU = [
  { id: "g_main", items: [
    { id: "dashboard", icon: "dashboard" },
    { id: "leads", icon: "leads" },
    { id: "deals", icon: "deals" },
    { id: "customers", icon: "customers" },
    { id: "pipeline", icon: "pipeline" },
    { id: "tasks", icon: "tasks", badge: 20 },
  ]},
  { id: "g_sales", items: [
    { id: "analytics", icon: "analytics" },
    { id: "revenue", icon: "revenue" },
    { id: "reports", icon: "reports" },
    { id: "forecast", icon: "forecast" },
  ]},
  { id: "g_tools", items: [
    { id: "automation", icon: "automation" },
    { id: "campaigns", icon: "campaigns" },
    { id: "email", icon: "email", badge: 65 },
    { id: "integrations", icon: "integrations" },
  ]},
  { id: "g_team", items: [
    { id: "team", icon: "team", badge: 12 },
    { id: "roles", icon: "roles", badge: 4 },
  ]},
];
 
export const FOOTER_MENU = [
  { id: "help", icon: "help" },
  { id: "feedback", icon: "feedback" },
  { id: "settings", icon: "settings" },
];
 
/* Use on your content wrapper so it clears the sidebar (works in LTR and RTL) */
export const mainOffset = (collapsed) =>
  `transition-[margin] duration-200 ${collapsed ? "md:ms-[76px]" : "md:ms-[260px]"}`;
 
/* ---------- Shared classes ---------- */
const panel = "rounded-2xl border border-neutral-200  bg-white dark:border-neutral-800 dark:bg-neutral-900";
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500";
 
function NavItem({ item, label, badge, active, collapsed, onSelect }) {
  return (
    <a
      href={item.id === "dashboard" ? "/" : `/${item.id}`}
      title={label}
      aria-current={active ? "page" : undefined}
      onClick={(e) => { e.preventDefault(); onSelect(item.id); }}
      className={[
        "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium no-underline transition-colors",
        focusRing,
        collapsed ? "md:justify-center" : "",
        active
          ? "bg-orange-50 text-neutral-900 dark:bg-orange-500/15 dark:text-neutral-100 before:absolute before:-start-2 before:bottom-1.5 before:top-1.5 before:w-[3px] before:rounded-full before:bg-orange-500"
          : "text-neutral-800 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800",
      ].join(" ")}
    >
      <Icon name={item.icon} />
      <span className={`flex-1 truncate ${collapsed ? "md:hidden" : ""}`}>{label}</span>
      {badge != null && (
        <span className={`rounded-md bg-neutral-100 px-1.5 py-px text-[11px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 ${collapsed ? "md:hidden" : ""}`}>
          {badge}
        </span>
      )}
    </a>
  );
}
 
/* ---------- Component ---------- */
export default function Sidebar({
  lang = "en",                // "en" | "ar"
  activeId = "dashboard",
  onSelect = () => {},
  collapsed = false,          // desktop icon-only mode
  onToggleCollapse = () => {},
  isOpen = false,             // mobile drawer
  onClose = () => {},
  brandName = "Adminex",
  menu = MENU,
  footerMenu = FOOTER_MENU,
  text = TEXT,
}) {
  const t = text[lang];
  const { dir, locale } = LANGS[lang];
  const num = (n) => new Intl.NumberFormat(locale).format(n);
 
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
 
  const select = (id) => { onSelect(id); onClose(); };
  const hideWhenCollapsed = collapsed ? "md:hidden" : "";
 
  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-20 bg-black/40 transition-opacity md:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
 
      <aside
        dir={dir}
        lang={lang}
        aria-label={t.nav}
        className={[
          "fixed inset-y-0 start-0 z-30 flex w-[280px] flex-col gap-1.5 overflow-y-auto bg-neutral-100 p-3.5",
          "pt-[calc(14px+env(safe-area-inset-top,0px))] md:pt-3.5 dark:bg-neutral-950",
          "font-sans text-neutral-900 transition-[transform,width] duration-200 dark:text-neutral-100",
          collapsed ? "md:w-[76px]" : "md:w-[260px]",
          isOpen
            ? "translate-x-0"
            : "-translate-x-full rtl:translate-x-full md:translate-x-0 md:rtl:translate-x-0",
        ].join(" ")}
      >
        {/* Brand */}
        <div className={`flex items-center gap-2.5 p-2.5 px-5 ${panel} ${collapsed ? "md:flex-wrap md:justify-center " : ""}`}>
          <div className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-orange-500 text-white">
            <Icon name="logo" size={20} className="rtl:-scale-x-100 [stroke-width:2.4]" />
          </div>
          <div className={`min-w-0 flex-1 leading-tight ${hideWhenCollapsed}`}>
            <b className="block text-base">{brandName}</b>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{t.plan}</span>
          </div>
          <button
            onClick={isOpen ? onClose : onToggleCollapse}
            aria-label={t.toggle}
            className={`grid size-7 shrink-0 place-items-center rounded-lg border border-neutral-200 text-inherit hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-800 ${focusRing}`}
          >
            <Icon name="panel" size={14} className="rtl:-scale-x-100" />
          </button>
        </div>
 
        {/* Main nav */}
        <nav className={`mt-1.5 px-2 pb-2.5 pt-1.5 ${panel}`}>
          {menu.map((group, i) => (
            <div
              key={group.id}
              className={i > 0 ? "mt-2 border-t border-neutral-200 pt-1 dark:border-neutral-800" : ""}
            >
              <h6 className={`m-0 px-2.5 pb-1.5 pt-2.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 ${lang === "en" ? "tracking-wide" : ""} ${hideWhenCollapsed}`}>
                {t[group.id]}
              </h6>
              {group.items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  label={t[item.id]}
                  badge={item.badge != null ? num(item.badge) : null}
                  active={item.id === activeId}
                  collapsed={collapsed}
                  onSelect={select}
                />
              ))}
            </div>
          ))}
        </nav>
 
        <div className="min-h-3 flex-1" />
 
        {/* Footer links */}
        <div className={`px-2 py-1.5 ${panel}`}>
          {footerMenu.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              label={t[item.id]}
              active={item.id === activeId}
              collapsed={collapsed}
              onSelect={select}
            />
          ))}
        </div>
 
        {/* Upgrade card */}
        <a
          href="/upgrade"
          onClick={(e) => { e.preventDefault(); select("upgrade"); }}
          className={`mt-1.5 flex items-center gap-2.5 p-2.5 text-[13px] font-medium leading-tight no-underline ${panel} ${focusRing} ${collapsed ? "md:justify-center" : ""}`}
        >
          <div className="grid size-[30px] shrink-0 place-items-center rounded-lg bg-orange-500 text-white">
            <Icon name="rocket" />
          </div>
          <span className={`flex-1 ${hideWhenCollapsed}`}>{t.upgrade}</span>
          <Icon name="chevron" className={`rtl:rotate-180 ${hideWhenCollapsed}`} />
        </a>
      </aside>
    </>
  );
}
 
