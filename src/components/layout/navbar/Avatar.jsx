import { accent } from "../../ui/tokens";
 
const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
 
export default function Avatar({ name, src, className = "size-9" }) {
  if (src) return <img src={src} alt="" className={`${className} rounded-full object-cover`} />;
  return (
    <span aria-hidden="true" className={`${className} grid shrink-0 place-items-center rounded-full text-xs font-semibold text-white ${accent.bg}`}>
      {initials(name)}
    </span>
  );
}
 