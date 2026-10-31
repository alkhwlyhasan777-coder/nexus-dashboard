import { useEffect, useId, useRef } from "react";
import "./motion.css";
import Icon from "../layout/navbar/Icon";
import IconButton from "../layout/navbar/IconButton";
import { hairline } from "./tokens";

/*
  Side panel built on the native <dialog>: focus is trapped, Escape closes it, the page behind is inert.
  It opens on the inline-end edge (right in LTR, left in RTL). Mount it only while it is open.
*/
export default function Drawer({ title, onClose, closeLabel = "Close", children }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog.open) dialog.showModal();
    dialog.querySelector("[data-autofocus]")?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className={`anim-drawer m-0 ms-auto h-dvh max-h-none w-full max-w-md overflow-hidden border-s bg-white p-0 text-neutral-900 shadow-2xl backdrop:bg-black/40 dark:bg-neutral-900 dark:text-neutral-100 ${hairline}`}
    >
      <div className="flex h-full flex-col">
        <div className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${hairline}`}>
          <h2 id={titleId} className="text-base font-semibold">{title}</h2>
          <IconButton size="sm" label={closeLabel} onClick={onClose}>
            <Icon name="x" size={16} />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </dialog>
  );
}