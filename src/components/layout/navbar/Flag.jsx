/* Small round flags drawn in SVG (emoji flags do not render on Windows). */
const stripes = (n, colors) =>
  Array.from({ length: n }, (_, i) => (
    <rect key={i} y={(i * 24) / n} width="24" height={24 / n + 0.2} fill={colors[i % colors.length]} />
  ));
 
const FLAGS = {
  en: (
    <>
      {stripes(13, ["#d52b1e", "#ffffff"])}
      <rect width="11" height={(24 * 7) / 13} fill="#3c3b6e" />
    </>
  ),
  ar: (
    <>
      {stripes(3, ["#ce1126", "#ffffff", "#000000"])}
      <circle cx="12" cy="12" r="2" fill="#c09300" />
    </>
  ),
};
 
export default function Flag({ lang = "en", className = "size-5" }) {
  return (
    <span aria-hidden="true" className={`inline-block overflow-hidden rounded-full ring-1 ring-black/10 ${className}`}>
      <svg viewBox="0 0 24 24" className="size-full" preserveAspectRatio="xMidYMid slice">
        {FLAGS[lang]}
      </svg>
    </span>
  );
}
 