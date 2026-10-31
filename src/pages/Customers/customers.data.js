// /* Seed data, constants and pure helpers for the Customers page. No React in here. */

// export const STATUSES = ["active", "inactive", "pending"];
// export const COUNTRIES = ["EG", "SA", "AE", "KW", "QA", "JO", "US", "GB", "DE", "FR"];

// const DIAL = { EG: "+20 10", SA: "+966 5", AE: "+971 50", US: "+1 415", GB: "+44 7700", KW: "+965 5", QA: "+974 55", JO: "+962 79", DE: "+49 151", FR: "+33 6" };

// // name, email, company, country, status, orders, spent (USD), joined N days ago
// const ROWS = [
//   ["Ahmed Hassan", "ahmed.hassan@nilesoft.example", "NileSoft", "EG", "active", 42, 18240, 380],
//   ["Sara Mahmoud", "sara.mahmoud@deltafoods.example", "Delta Foods", "EG", "active", 27, 9120, 340],
//   ["ليلى إبراهيم", "layla.ibrahim@gulftrade.example", "Gulf Trade", "AE", "active", 15, 22760, 310],
//   ["John Carter", "john.carter@brightwave.example", "Brightwave", "US", "inactive", 9, 2310, 300],
//   ["Fatima Al-Sayed", "fatima.alsayed@najdlabs.example", "Najd Labs", "SA", "active", 33, 15480, 270],
//   ["Omar Khalil", "omar.khalil@petratech.example", "Petra Tech", "JO", "pending", 0, 0, 5],
//   ["Emily Davis", "emily.davis@northwind.example", "Northwind", "GB", "active", 21, 8740, 250],
//   ["يوسف كريم", "yusuf.karim@kuwaitretail.example", "Kuwait Retail", "KW", "active", 18, 12100, 235],
//   ["Nour Aziz", "nour.aziz@dohadigital.example", "Doha Digital", "QA", "inactive", 4, 980, 220],
//   ["Hans Weber", "hans.weber@rheinlogistics.example", "Rhein Logistics", "DE", "active", 29, 17320, 205],
//   ["Mariam Fouad", "mariam.fouad@cairoclinics.example", "Cairo Clinics", "EG", "active", 12, 4560, 190],
//   ["Lucas Martin", "lucas.martin@atelierlumiere.example", "Atelier Lumière", "FR", "pending", 1, 150, 12],
//   ["خالد منصور", "khaled.mansour@riyadhbuild.example", "Riyadh Build", "SA", "active", 37, 26890, 175],
//   ["Aya Nasser", "aya.nasser@gizastudio.example", "Giza Studio", "EG", "active", 8, 2890, 160],
//   ["Michael Brown", "michael.brown@summit.example", "Summit Ltd", "US", "inactive", 6, 1740, 150],
//   ["Huda Saleh", "huda.saleh@dubaimoda.example", "Dubai Moda", "AE", "active", 24, 13650, 140],
//   ["Tarek Adel", "tarek.adel@alexmarine.example", "Alex Marine", "EG", "active", 14, 6120, 125],
//   ["Sophie Laurent", "sophie.laurent@maisonverte.example", "Maison Verte", "FR", "active", 11, 5430, 110],
//   ["Ali Rahman", "ali.rahman@gulfenergy.example", "Gulf Energy", "KW", "pending", 2, 420, 20],
//   ["Dina Samir", "dina.samir@pyramidmedia.example", "Pyramid Media", "EG", "active", 19, 7980, 95],
//   ["Chris Wilson", "chris.wilson@harborco.example", "Harbor & Co", "GB", "active", 16, 9640, 85],
//   ["Reem Abdullah", "reem.abdullah@jeddahfoods.example", "Jeddah Foods", "SA", "active", 22, 11270, 70],
//   ["Mostafa Ali", "mostafa.ali@nilemotors.example", "Nile Motors", "EG", "inactive", 3, 890, 62],
//   ["Julia Fischer", "julia.fischer@bavariatools.example", "Bavaria Tools", "DE", "active", 13, 6840, 48],
//   ["Salma Youssef", "salma.youssef@deltapharma.example", "Delta Pharma", "EG", "active", 7, 3150, 40],
//   ["Rami Haddad", "rami.haddad@ammangroup.example", "Amman Group", "JO", "active", 10, 4720, 26],
//   ["Noura Hamad", "noura.hamad@pearltrading.example", "Pearl Trading", "QA", "active", 5, 2260, 15],
//   ["David Lee", "david.lee@orbitsystems.example", "Orbit Systems", "US", "pending", 0, 0, 8],
//   ["Hana Mostafa", "hana.mostafa@sphinxhotels.example", "Sphinx Hotels", "EG", "active", 6, 1980, 18],
//   ["Ibrahim Saad", "ibrahim.saad@marinarealty.example", "Marina Realty", "AE", "active", 2, 3400, 3],
// ];

// const DAY = 86400000;

// export function buildSeed() {
//   const now = Date.now();
//   return ROWS.map(([name, email, company, country, status, orders, spent, daysAgo], i) => {
//     const n = 2000000 + ((i * 137531) % 7000000);
//     return {
//       id: `seed-${i + 1}`,
//       name, email, company, country, status, orders, spent,
//       phone: `${DIAL[country]} ${String(n).slice(0, 3)} ${String(n).slice(3, 7)}`,
//       joined: new Date(now - daysAgo * DAY).toISOString(),
//     };
//   });
// }

// /* Locale-aware formatters, created once per language */
// export function makeFormatters(locale) {
//   let regionNames = null;
//   try { regionNames = new Intl.DisplayNames([locale], { type: "region" }); } catch { /* older browsers: fall back to codes */ }
//   return {
//     nf: new Intl.NumberFormat(locale),
//     money: new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
//     percent: new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }),
//     date: new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }),
//     month: new Intl.DateTimeFormat(locale, { month: "short" }),
//     region: (code) => regionNames?.of(code) ?? code,
//   };
// }

// /* KPI numbers */
// export function computeStats(customers) {
//   const now = Date.now();
//   const age = (c) => (now - new Date(c.joined).getTime()) / DAY;
//   const total = customers.length;
//   const active = customers.filter((c) => c.status === "active").length;
//   const last30 = customers.filter((c) => age(c) <= 30).length;
//   const prev30 = customers.filter((c) => age(c) > 30 && age(c) <= 60).length;
//   const trend = prev30 === 0 ? (last30 > 0 ? 100 : 0) : Math.round(((last30 - prev30) / prev30) * 100);
//   const revenue = customers.reduce((sum, c) => sum + c.spent, 0);
//   return { total, active, activeRate: total ? active / total : 0, last30, trend, revenue, avg: total ? revenue / total : 0 };
// }

// /* [{ date, count }] for the last `months` months, oldest first */
// export function monthlyNew(customers, months = 12) {
//   const now = new Date();
//   const out = Array.from({ length: months }, (_, i) => ({
//     date: new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1),
//     count: 0,
//   }));
//   const first = out[0].date;
//   customers.forEach((c) => {
//     const j = new Date(c.joined);
//     const idx = (j.getFullYear() - first.getFullYear()) * 12 + (j.getMonth() - first.getMonth());
//     if (idx >= 0 && idx < months) out[idx].count += 1;
//   });
//   return out;
// }

// export const countByStatus = (customers) =>
//   STATUSES.map((s) => customers.filter((c) => c.status === s).length);

// export function topCountries(customers, limit = 6) {
//   const map = new Map();
//   customers.forEach((c) => map.set(c.country, (map.get(c.country) ?? 0) + 1));
//   return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([code, count]) => ({ code, count }));
// }

/* Seed data, constants and pure helpers for the Customers page. No React in here. */

export const STATUSES = ["active", "inactive", "pending"];
export const COUNTRIES = ["EG", "SA", "AE", "KW", "QA", "JO", "US", "GB", "DE", "FR"];

const DIAL = { EG: "+20 10", SA: "+966 5", AE: "+971 50", US: "+1 415", GB: "+44 7700", KW: "+965 5", QA: "+974 55", JO: "+962 79", DE: "+49 151", FR: "+33 6" };

// name, email, company, country, status, orders, spent (USD), joined N days ago
const ROWS = [
  ["Ahmed Hassan", "ahmed.hassan@nilesoft.example", "NileSoft", "EG", "active", 42, 18240, 380],
  ["Sara Mahmoud", "sara.mahmoud@deltafoods.example", "Delta Foods", "EG", "active", 27, 9120, 340],
  ["ليلى إبراهيم", "layla.ibrahim@gulftrade.example", "Gulf Trade", "AE", "active", 15, 22760, 310],
  ["John Carter", "john.carter@brightwave.example", "Brightwave", "US", "inactive", 9, 2310, 300],
  ["Fatima Al-Sayed", "fatima.alsayed@najdlabs.example", "Najd Labs", "SA", "active", 33, 15480, 270],
  ["Omar Khalil", "omar.khalil@petratech.example", "Petra Tech", "JO", "pending", 0, 0, 5],
  ["Emily Davis", "emily.davis@northwind.example", "Northwind", "GB", "active", 21, 8740, 250],
  ["يوسف كريم", "yusuf.karim@kuwaitretail.example", "Kuwait Retail", "KW", "active", 18, 12100, 235],
  ["Nour Aziz", "nour.aziz@dohadigital.example", "Doha Digital", "QA", "inactive", 4, 980, 220],
  ["Hans Weber", "hans.weber@rheinlogistics.example", "Rhein Logistics", "DE", "active", 29, 17320, 205],
  ["Mariam Fouad", "mariam.fouad@cairoclinics.example", "Cairo Clinics", "EG", "active", 12, 4560, 190],
  ["Lucas Martin", "lucas.martin@atelierlumiere.example", "Atelier Lumière", "FR", "pending", 1, 150, 12],
  ["خالد منصور", "khaled.mansour@riyadhbuild.example", "Riyadh Build", "SA", "active", 37, 26890, 175],
  ["Aya Nasser", "aya.nasser@gizastudio.example", "Giza Studio", "EG", "active", 8, 2890, 160],
  ["Michael Brown", "michael.brown@summit.example", "Summit Ltd", "US", "inactive", 6, 1740, 150],
  ["Huda Saleh", "huda.saleh@dubaimoda.example", "Dubai Moda", "AE", "active", 24, 13650, 140],
  ["Tarek Adel", "tarek.adel@alexmarine.example", "Alex Marine", "EG", "active", 14, 6120, 125],
  ["Sophie Laurent", "sophie.laurent@maisonverte.example", "Maison Verte", "FR", "active", 11, 5430, 110],
  ["Ali Rahman", "ali.rahman@gulfenergy.example", "Gulf Energy", "KW", "pending", 2, 420, 20],
  ["Dina Samir", "dina.samir@pyramidmedia.example", "Pyramid Media", "EG", "active", 19, 7980, 95],
  ["Chris Wilson", "chris.wilson@harborco.example", "Harbor & Co", "GB", "active", 16, 9640, 85],
  ["Reem Abdullah", "reem.abdullah@jeddahfoods.example", "Jeddah Foods", "SA", "active", 22, 11270, 70],
  ["Mostafa Ali", "mostafa.ali@nilemotors.example", "Nile Motors", "EG", "inactive", 3, 890, 62],
  ["Julia Fischer", "julia.fischer@bavariatools.example", "Bavaria Tools", "DE", "active", 13, 6840, 48],
  ["Salma Youssef", "salma.youssef@deltapharma.example", "Delta Pharma", "EG", "active", 7, 3150, 40],
  ["Rami Haddad", "rami.haddad@ammangroup.example", "Amman Group", "JO", "active", 10, 4720, 26],
  ["Noura Hamad", "noura.hamad@pearltrading.example", "Pearl Trading", "QA", "active", 5, 2260, 15],
  ["David Lee", "david.lee@orbitsystems.example", "Orbit Systems", "US", "pending", 0, 0, 8],
  ["Hana Mostafa", "hana.mostafa@sphinxhotels.example", "Sphinx Hotels", "EG", "active", 6, 1980, 18],
  ["Ibrahim Saad", "ibrahim.saad@marinarealty.example", "Marina Realty", "AE", "active", 2, 3400, 3],
];

const DAY = 86400000;

export function buildSeed() {
  const now = Date.now();
  return ROWS.map(([name, email, company, country, status, orders, spent, daysAgo], i) => {
    const n = 2000000 + ((i * 137531) % 7000000);
    return {
      id: `seed-${i + 1}`,
      name, email, company, country, status, orders, spent,
      phone: `${DIAL[country]} ${String(n).slice(0, 3)} ${String(n).slice(3, 7)}`,
      joined: new Date(now - daysAgo * DAY).toISOString(),
    };
  });
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

/* KPI numbers */
export function computeStats(customers) {
  const now = Date.now();
  const age = (c) => (now - new Date(c.joined).getTime()) / DAY;
  const total = customers.length;
  const active = customers.filter((c) => c.status === "active").length;
  const last30 = customers.filter((c) => age(c) <= 30).length;
  const prev30 = customers.filter((c) => age(c) > 30 && age(c) <= 60).length;
  const trend = prev30 === 0 ? (last30 > 0 ? 100 : 0) : Math.round(((last30 - prev30) / prev30) * 100);
  const revenue = customers.reduce((sum, c) => sum + c.spent, 0);
  return { total, active, activeRate: total ? active / total : 0, last30, trend, revenue, avg: total ? revenue / total : 0 };
}

/* [{ date, count }] for the last `months` months, oldest first */
export function monthlyNew(customers, months = 12) {
  const now = new Date();
  const out = Array.from({ length: months }, (_, i) => ({
    date: new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1),
    count: 0,
  }));
  const first = out[0].date;
  customers.forEach((c) => {
    const j = new Date(c.joined);
    const idx = (j.getFullYear() - first.getFullYear()) * 12 + (j.getMonth() - first.getMonth());
    if (idx >= 0 && idx < months) out[idx].count += 1;
  });
  return out;
}

export const countByStatus = (customers) =>
  STATUSES.map((s) => customers.filter((c) => c.status === s).length);

export function topCountries(customers, limit = 6) {
  const map = new Map();
  customers.forEach((c) => map.set(c.country, (map.get(c.country) ?? 0) + 1));
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([code, count]) => ({ code, count }));
}

/* "today", "3 days ago", "2 weeks ago", "5 months ago"... in the current language */
function fromNow(iso, rtf) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / DAY);
  if (days < 1) return rtf.format(0, "day");
  if (days < 7) return rtf.format(-days, "day");
  if (days < 30) return rtf.format(-Math.floor(days / 7), "week");
  if (days < 365) return rtf.format(-Math.floor(days / 30), "month");
  return rtf.format(-Math.floor(days / 365), "year");
}

export const isNew = (c, days = 7) => (Date.now() - new Date(c.joined).getTime()) / DAY <= days;

/* Monthly series for the KPI sparklines: new per month, cumulative customers, cumulative revenue */
export function monthlySeries(customers, months = 12) {
  const buckets = monthlyNew(customers, months);
  const times = customers.map((c) => ({ at: new Date(c.joined).getTime(), spent: c.spent }));
  const start = buckets[0].date.getTime();
  let total = times.filter((x) => x.at < start).length;
  let revenue = times.filter((x) => x.at < start).reduce((sum, x) => sum + x.spent, 0);
  const counts = [], cumulative = [], revenueSeries = [];
  buckets.forEach((b, i) => {
    const from = b.date.getTime();
    const to = i + 1 < months ? buckets[i + 1].date.getTime() : Infinity;
    const inMonth = times.filter((x) => x.at >= from && x.at < to);
    total += inMonth.length;
    revenue += inMonth.reduce((sum, x) => sum + x.spent, 0);
    counts.push(inMonth.length);
    cumulative.push(total);
    revenueSeries.push(revenue);
  });
  return { counts, cumulative, revenue: revenueSeries };
}

/* CSV text for a list of customers. Opens correctly in Excel, including Arabic (UTF-8 BOM). */
export function buildCsv(rows, { headers, region, statusLabel }) {
  const esc = (value, guard = false) => {
    let v = String(value ?? "");
    // Stop spreadsheet apps from running text that starts like a formula
    if (guard && /^[=+\-@\t\r]/.test(v) && !/^\+[\d\s()-]+$/.test(v)) v = `'${v}`;
    return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  };
  const lines = [headers.map((h) => esc(h)).join(",")];
  rows.forEach((c) => lines.push([
    esc(c.name, true), esc(c.email, true), esc(c.phone, true), esc(c.company, true),
    esc(region(c.country)), esc(statusLabel(c.status)), esc(c.orders), esc(c.spent), esc(c.joined.slice(0, 10)),
  ].join(",")));
  return "\uFEFF" + lines.join("\r\n");
}