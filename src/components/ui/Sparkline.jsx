import "./motion.css";

/*
  Tiny inline chart for cards and tables. Decorative (hidden from screen readers), so always
  show the number it illustrates next to it.
  variant: "line" (area under a line) | "bars" (last bar highlighted)
  Color comes from the parent's text color, e.g. className="text-blue-500". Mirrors in RTL.
*/
export default function Sparkline({ values, variant = "line", className = "h-10 w-24" }) {
  const w = 100, h = 32, pad = 2;
  const max = Math.max(...values, 1);
  const min = variant === "bars" ? 0 : Math.min(...values);
  const span = max - min || 1;
  const base = `anim-reveal rtl:-scale-x-100 ${className}`;

  if (variant === "bars") {
    const bw = w / values.length;
    return (
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true" className={base}>
        {values.map((v, i) => {
          const bh = Math.max(2, ((v - min) / span) * (h - pad));
          return <rect key={i} x={i * bw + bw * 0.15} y={h - bh} width={bw * 0.7} height={bh} rx="1.5" fill="currentColor" opacity={i === values.length - 1 ? 1 : 0.4} />;
        })}
      </svg>
    );
  }

  const pts = values.map((v, i) => [(i / (values.length - 1 || 1)) * w, h - pad - ((v - min) / span) * (h - pad * 2)]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true" className={base}>
      <path d={`${d} L${w} ${h} L0 ${h} Z`} fill="currentColor" opacity="0.12" />
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}