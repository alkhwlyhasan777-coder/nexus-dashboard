import { useEffect } from "react";
import "./motion.css";
import Icon from "../layout/navbar/Icon";

/*
  toast: { id, message, actionLabel?, onAction? } or null.  Dismisses itself after `duration` ms.
  The wrapper is a polite live region, so screen readers announce each new message.
*/
export default function Toast({ toast, onDismiss, dismissLabel = "Dismiss", duration = 6000 }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [toast, duration, onDismiss]);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-3">
      {toast && (
        <div key={toast.id} className="anim-slide-up pointer-events-auto flex max-w-md items-center gap-3 rounded-xl bg-neutral-900 py-2.5 ps-4 pe-2.5 text-sm text-white shadow-lg dark:bg-white dark:text-neutral-900">
          <span className="min-w-0 flex-1">{toast.message}</span>
          {toast.actionLabel && (
            <button
              type="button"
              onClick={() => { onDismiss(); toast.onAction?.(); }} /* dismiss first, so a message set by the action is not cleared */
              className="rounded-md px-2 py-1 font-semibold underline underline-offset-2 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-white dark:focus-visible:outline-neutral-900"
            >
              {toast.actionLabel}
            </button>
          )}
          <button
            type="button"
            aria-label={dismissLabel}
            onClick={onDismiss}
            className="grid size-7 place-items-center rounded-md hover:bg-white/10 dark:hover:bg-neutral-900/10"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      )}
    </div>
  );
}