import { focusRing, hoverBg } from "./styles";
 
/* Square icon-only button. `label` is required: it becomes the accessible name and tooltip. */
export default function IconButton({ label, badge = false, className = "", children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`relative grid size-9 shrink-0 place-items-center rounded-lg text-neutral-600 dark:text-neutral-300 ${hoverBg} ${focusRing} ${className}`}
      {...props}
    >
      {children}
      {badge && (
        <span aria-hidden="true" className="absolute end-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-neutral-900" />
      )}
    </button>
  );
}
 