
import { useId, useRef, useState } from "react";
import useClickOutside from "../../../hooks/useClickOutside";
import { popover } from "./styles";
export default function Dropdown({ trigger, children, align = "start", className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const panelId = useId();
  const close = () => setOpen(false);
 
  useClickOutside(ref, close, open);
 
  return (
    <div ref={ref} className="relative" onKeyDown={(e) => e.key === "Escape" && close()}>
      {trigger({
        open,
        toggle: () => setOpen((o) => !o),
        props: { "aria-expanded": open, "aria-controls": panelId },
      })}
      {open && (
        <div
          id={panelId}
          className={`absolute top-full z-40 mt-2 min-w-48 ${popover} ${align === "end" ? "end-0" : "start-0"} ${className}`}
        >
          {typeof children === "function" ? children(close) : children}
        </div>
      )}
    </div>
  );
}
 