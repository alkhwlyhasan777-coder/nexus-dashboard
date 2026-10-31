const TONES = {
  neutral: ["bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300", "bg-neutral-400"],
  blue: ["bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300", "bg-blue-500"],
  violet: ["bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300", "bg-violet-500"],
  amber: ["bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300", "bg-amber-500"],
  cyan: ["bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300", "bg-cyan-500"],
  emerald: ["bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300", "bg-emerald-500"],
  red: ["bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300", "bg-red-500"],
};

/* Small status pill with a colored dot. The text carries the meaning, color only reinforces it. */
export default function Badge({ tone = "neutral", children }) {
  const [style, dot] = TONES[tone] ?? TONES.neutral;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${dot}`} />
      {children}
    </span>
  );
}