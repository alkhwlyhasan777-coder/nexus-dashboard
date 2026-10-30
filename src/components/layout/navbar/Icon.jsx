const PATHS = {
  chevronLeft: ["m15 6-6 6 6 6"],
  chevronDown: ["m6 9 6 6 6-6"],
  search: ["M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z", "m20 20-3.5-3.5"],
  plusCircle: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M12 8v8M8 12h8"],
  bell: ["M6 9a6 6 0 1 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7Z", "M10 20a2 2 0 0 0 4 0"],
  menu: ["M4 7h16M4 12h16M4 17h16"],
  grid: ["M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"],
};
 
export default function Icon({ name, size = 16, className = "" }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {PATHS[name].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}
 