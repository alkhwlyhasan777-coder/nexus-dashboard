import Icon from "./Icon";
import { border, focusRing, muted } from "./styles";
 
export default function SearchBox({ label, placeholder, onSearch, autoFocus = false, className = "" }) {
  const submit = (e) => {
    e.preventDefault();
    onSearch?.(new FormData(e.currentTarget).get("q"));
  };
 
  return (
    <form role="search" onSubmit={submit} className={`relative ${className}`}>
      <Icon name="search" size={15} className={`pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 ${muted}`} />
      <input
        name="q"
        type="search"
        aria-label={label}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`h-9 w-full rounded-lg border bg-white ps-9 pe-3 text-sm placeholder:text-neutral-400 dark:bg-neutral-900 ${border} ${focusRing}`}
      />
    </form>
  );
}
 