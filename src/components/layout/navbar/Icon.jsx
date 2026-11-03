/* One icon set for the whole app (24x24 stroke paths, one stroke width). */
const ICONS = {
  logo: ["M5 5h10M5 12h14M5 19h8"],
  panel: ["M6 4h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z", "M9 4v16"],
  chevron: ["m9 6 6 6-6 6"],
  chevronLeft: ["m15 6-6 6 6 6"],
  chevronDown: ["m6 9 6 6 6-6"],
  menu: ["M4 7h16M4 12h16M4 17h16"],
  grid: ["M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"],
  search: ["M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z", "m20 20-3.5-3.5"],
  plusCircle: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M12 8v8M8 12h8"],
  bell: ["M6 9a6 6 0 1 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7Z", "M10 20a2 2 0 0 0 4 0"],
  globe: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M3 12h18", "M12 3a15 15 0 0 1 0 18", "M12 3a15 15 0 0 0 0 18"],
  activity: ["M3 12h4l3-8 4 16 3-8h4"],
  clock: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M12 7v5l3 2"],
  zap: ["m13 2-3 8h7l-6 12 2-9H6l7-11Z"],
  arrowRight: ["M5 12h14", "m12 5 7 7-7 7"],
  workflow: ["M6 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z", "M18 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z", "M6 8v4a4 4 0 0 0 4 4h6", "m13 13 3 3-3 3"],
  play: ["m8 5 12 7-12 7V5Z"],
  sun: ["M12 3v2M12 19v2M3 12h2M19 12h2", "m5.6 5.6 1.4 1.4m10 10 1.4 1.4m0-12.8L17 7m-10 10-1.4 1.4", "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"],
  moon: ["M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z"],
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
  plus: ["M12 5v14M5 12h14"],
  x: ["M6 6l12 12M18 6 6 18"],
  edit: ["M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z", "m13.5 6.5 4 4"],
  trash: ["M4 7h16", "M10 11v6M14 11v6", "m6 7 1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12", "M9 7V4h6v3"],
  arrowUp: ["M12 19V5M6 11l6-6 6 6"],
  arrowDown: ["M12 5v14M6 13l6 6 6-6"],
  chevronUp: ["m6 15 6-6 6 6"],
  sort: ["m8 9 4-4 4 4", "m8 15 4 4 4-4"],
  table: ["M4 5h16v14H4z", "M4 10h16M4 15h16M10 5v14"],
  download: ["M12 4v11", "m7 11 5 5 5-5", "M5 20h14"],
  phone: ["M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z"],
  check: ["m5 12 5 5 9-10"],
  board: ["M4 5h4v14H4z", "M10 5h4v9h-4z", "M16 5h4v12h-4z"],
  list: ["M8 6h12M8 12h12M8 18h12", "M4 6h.01M4 12h.01M4 18h.01"],
  alert: ["M12 4 3 20h18L12 4Z", "M12 10v4M12 17h.01"],
  calendar: ["M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z", "M4 10h16M8 4v4M16 4v4"],
};

export default function Icon({ name, size = 16, strokeWidth = 1.75, className = "" }) {
  const paths = ICONS[name];
  if (!paths) {
    // A missing icon should never take the whole page down
    if (import.meta.env?.DEV) console.warn(`Icon "${name}" does not exist in Icon.jsx`);
    return null;
  }
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {paths.map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

















// const ICONS = {
//   logo: ["M5 5h10M5 12h14M5 19h8"],
//   panel: ["M6 4h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z", "M9 4v16"],
//   chevron: ["m9 6 6 6-6 6"],
//   chevronLeft: ["m15 6-6 6 6 6"],
//   chevronDown: ["m6 9 6 6 6-6"],
//   menu: ["M4 7h16M4 12h16M4 17h16"],
//   grid: ["M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"],
//   search: ["M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z", "m20 20-3.5-3.5"],
//   plusCircle: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M12 8v8M8 12h8"],
//   bell: ["M6 9a6 6 0 1 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7Z", "M10 20a2 2 0 0 0 4 0"],
//   dashboard: ["M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"],
//   leads: ["M12 3 3 8l9 5 9-5-9-5Z", "m3 13 9 5 9-5"],
//   deals: ["M6 3h9l4 4v14H6z", "M9 12h7M9 16h7"],
//   customers: ["M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z", "M4 21c1-4 4-6 8-6s7 2 8 6"],
//   pipeline: ["M5 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z", "M19 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z", "M12 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z", "M7 6h10M6 8l5 8M18 8l-5 8"],
//   tasks: ["M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z", "m8.5 12 2.5 2.5 4.5-5"],
//   analytics: ["M4 4v16h16", "M8 16v-5M12 16V8M16 16v-3"],
//   revenue: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M14.5 9.5c-.6-.8-1.6-1.2-2.6-1.2-1.4 0-2.4.8-2.4 1.8s1 1.5 2.5 1.9 2.5.9 2.5 1.9-1 1.8-2.5 1.8c-1.1 0-2.1-.4-2.7-1.2M12 6.5v1.8M12 15.7v1.8"],
//   reports: ["M6 20V10M12 20V4M18 20v-7"],
//   forecast: ["M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z", "m7 15 3.5-4 3 2.5L17 8"],
//   automation: ["M6 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z", "M6 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z", "M18 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z", "M6 7v10M6 12h10"],
//   campaigns: ["M3 10v4h4l7 4V6L7 10H3Z", "M17 9c1.3 1.6 1.3 4.4 0 6"],
//   email: ["M6 5h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z", "m4 8 8 5 8-5"],
//   integrations: ["M5 4v6h5", "M5 20v-6h5", "M14 7h5M14 12h5M14 17h5"],
//   team: ["M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z", "M17 6.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z", "M2 20c.6-3.5 3-5 6-5s5.4 1.5 6 5", "M15 15c3 0 5 1.2 6 4"],
//   roles: ["M6 4h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z", "M9 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z", "M6 17c.5-2 1.7-3 3-3s2.5 1 3 3M15 10h3M15 14h3"],
//   help: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"],
//   feedback: ["M4 5h16v11H9l-5 4V5Z", "M12 8.5v3M12 13.5h.01"],
//   settings: ["M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z", "M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.2-1.3L14 3h-4l-.4 2.4a7 7 0 0 0-2.2 1.3l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.6l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.2 1.3L10 21h4l.4-2.4a7 7 0 0 0 2.2-1.3l2.3.9 2-3.4-2-1.5c.1-.4.1-.9.1-1.3Z"],
//   rocket: ["M5 19c0-3 1-4 3-4l-2-2c-2 0-3 1-3 4 0 0 0 2 2 2Zm3-4 5 5c1-3 4-5 6-12-7 2-9 5-11 7Z", "M15 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"],
//   plus: ["M12 5v14M5 12h14"],
//   x: ["M6 6l12 12M18 6 6 18"],
//   edit: ["M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z", "m13.5 6.5 4 4"],
//   trash: ["M4 7h16", "M10 11v6M14 11v6", "m6 7 1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12", "M9 7V4h6v3"],
//   arrowUp: ["M12 19V5M6 11l6-6 6 6"],
//   arrowDown: ["M12 5v14M6 13l6 6 6-6"],
//   chevronUp: ["m6 15 6-6 6 6"],
//   sort: ["m8 9 4-4 4 4", "m8 15 4 4 4-4"],
//   table: ["M4 5h16v14H4z", "M4 10h16M4 15h16M10 5v14"],
//   download: ["M12 4v11", "m7 11 5 5 5-5", "M5 20h14"],
//   phone: ["M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z"],
//   check: ["m5 12 5 5 9-10"],
//   board: ["M4 5h4v14H4z", "M10 5h4v9h-4z", "M16 5h4v12h-4z"],
//   list: ["M8 6h12M8 12h12M8 18h12", "M4 6h.01M4 12h.01M4 18h.01"],
//   calendar: ["M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z", "M4 10h16M8 4v4M16 4v4"],
//   activity: ["M3 12h4l3-8 4 16 3-8h4"],
// };

// export default function Icon({ name, size = 16, strokeWidth = 1.75, className = "" }) {
//   const paths = ICONS[name];
//   if (!paths) {
//     // A missing icon should never take the whole page down
//     if (import.meta.env?.DEV) console.warn(`Icon "${name}" does not exist in Icon.jsx`);
//     return null;
//   }
//   return (
//     <svg
//       width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
//       fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
//       className={`shrink-0 ${className}`}
//     >
//       {paths.map((d) => <path key={d} d={d} />)}
//     </svg>
//   );
// }