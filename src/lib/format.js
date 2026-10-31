const DAY = 86400000;

/* "today", "3 days ago", "2 weeks ago", "5 months ago"... in the current language */
function fromNow(iso, rtf) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / DAY);
  if (days < 1) return rtf.format(0, "day");
  if (days < 7) return rtf.format(-days, "day");
  if (days < 30) return rtf.format(-Math.floor(days / 7), "week");
  if (days < 365) return rtf.format(-Math.floor(days / 30), "month");
  return rtf.format(-Math.floor(days / 365), "year");
}

/* Locale-aware formatters, created once per language */
export function makeFormatters(locale) {
  let regionNames = null;
  try { regionNames = new Intl.DisplayNames([locale], { type: "region" }); } catch { /* older browsers: fall back to codes */ }
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  return {
    nf: new Intl.NumberFormat(locale),
    money: new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
    percent: new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }),
    date: new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }),
    month: new Intl.DateTimeFormat(locale, { month: "short" }),
    region: (code) => regionNames?.of(code) ?? code,
    fromNow: (iso) => fromNow(iso, relative),
  };
}