const COLORS = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"];

/* Round avatar with initials; the color is derived from the name so it stays stable. */
export default function PersonAvatar({ name, size = "size-10", className = "" }) {
  const hash = [...name].reduce((h, ch) => (h * 31 + ch.codePointAt(0)) >>> 0, 7);
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <span aria-hidden="true" className={`grid ${size} shrink-0 place-items-center rounded-full text-xs font-semibold text-white ${COLORS[hash % COLORS.length]} ${className}`}>
      {initials}
    </span>
  );
}