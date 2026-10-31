import { useEffect, useId, useRef } from "react";
import "./motion.css";
import Icon from "../layout/navbar/Icon";
import IconButton from "../layout/navbar/IconButton";
import { hairline } from "./tokens";

/*
  Accessible modal built on the native <dialog> element: focus is trapped, Escape closes it,
  the page behind is inert, and focus returns to the button that opened it.
  Mount it only while it is open:  {open && <Modal ...>}
  Put data-autofocus on the element that should receive focus first.
*/
export default function Modal({ title, onClose, closeLabel = "Close", size = "max-w-lg", children }) {
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
      onClick={(e) => { if (e.target === ref.current) onClose(); }} // click on the backdrop
      className={`anim-pop m-auto w-[calc(100%-1.5rem)] ${size} overflow-hidden rounded-2xl border bg-white p-0 text-neutral-900 shadow-2xl backdrop:bg-black/40 dark:bg-neutral-900 dark:text-neutral-100 ${hairline}`}
    >
      <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col">
        <div className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${hairline}`}>
          <h2 id={titleId} className="text-base font-semibold">{title}</h2>
          <IconButton size="sm" label={closeLabel} onClick={onClose}>
            <Icon name="x" size={16} />
          </IconButton>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </dialog>
  );
}