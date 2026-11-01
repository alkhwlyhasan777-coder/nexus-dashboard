
const PALETTES = {
  blue: {
    solid: "bg-blue-500 text-white hover:bg-blue-600",
    bg: "bg-blue-500",
    soft: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    bar: "before:bg-blue-500",
    ring: "focus-visible:outline-blue-500",
    text: "text-blue-500",
  },
  orange: {
    solid: "bg-orange-500 text-white hover:bg-orange-600",
    bg: "bg-orange-500",
    soft: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    bar: "before:bg-orange-500",
    ring: "focus-visible:outline-orange-500",
    text: "text-orange-500",
  },
};
export const accent = PALETTES.blue;

/* Surfaces */
export const canvas = "bg-neutral-100 dark:bg-neutral-950";
export const hairline = "border-neutral-200 dark:border-neutral-800"; // colors only, add `border` yourself
export const card = `rounded-2xl border bg-white dark:bg-neutral-900 ${hairline}`;
export const popover = `rounded-xl border bg-white p-1.5 shadow-lg dark:bg-neutral-900 ${hairline}`;
export const textarea  = `rounded-xl`
/* Text */
export const text = {
  base: "text-neutral-900 dark:text-neutral-100",
  body: "text-neutral-700 dark:text-neutral-300",
  muted: "text-neutral-500 dark:text-neutral-400",
};
export const muted = text.muted;

/* Interaction */
export const hoverBg = "hover:bg-neutral-100 dark:hover:bg-neutral-800";
export const focusRing = `focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.ring}`;

/* Navigation item: identical in the sidebar and in the navbar */
export const navItem = {
  base: "flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm font-medium no-underline transition-colors duration-200",
  idle: `${text.body} ${hoverBg}`,
  active: accent.soft,
};

/* Forms and buttons (shared by the navbar, tables, modals and forms) */
export const field = `h-9 w-full rounded-lg border bg-neutral-50 px-3 text-sm transition-colors duration-200 placeholder:text-neutral-400 aria-invalid:border-red-500 dark:bg-neutral-950 ${hairline} ${focusRing}`;
export const button = {
  base: "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg px-3.5 text-sm font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50",
  primary: accent.solid,
  secondary: `border ${hairline} ${text.body} ${hoverBg}`,
  danger: "bg-red-600 text-white hover:bg-red-700",
  dangerGhost: `border ${hairline} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10`,
};

/* Chart colors (keep the primary in sync with the accent palette above) */
export const chartColors = {
  primary: "#3b82f6",
  primarySoft: "rgba(59,130,246,0.14)",
  positive: "#10b981",
  warning: "#f59e0b",
  neutral: "#94a3b8",
};