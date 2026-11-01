import Icon from "../../components/layout/navbar/Icon";
import Modal from "../../components/ui/Modal";
import { button, text } from "../../components/ui/tokens";
import DealForm from "./DealForm";

/*
  modal: null | { type: "add", defaults? } | { type: "edit", deal } | { type: "delete", deal }
  onSave(values) is called by the form, onDelete() by the confirmation.
*/
export default function DealModals({ modal, onClose, clients, t, fmt, locale, onSave, onDelete }) {
  if (!modal) return null;

  if (modal.type === "delete") {
    return (
      <Modal title={t.deleteTitle} onClose={onClose} closeLabel={t.close} size="max-w-md">
        <div className="flex gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400">
            <Icon name="trash" size={18} />
          </span>
          <p className={`text-sm leading-6 ${text.body}`}>{t.deleteBody(modal.deal.title)}</p>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" data-autofocus onClick={onClose} className={`${button.base} ${button.secondary}`}>{t.cancel}</button>
          <button type="button" onClick={onDelete} className={`${button.base} ${button.danger}`}>{t.confirmDelete}</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={modal.type === "edit" ? t.editTitle : t.addTitle} onClose={onClose} closeLabel={t.close}>
      <DealForm
        t={t} fmt={fmt} locale={locale} clients={clients}
        initial={modal.type === "edit" ? modal.deal : undefined}
        defaults={modal.type === "add" ? modal.defaults : undefined}
        onSubmit={onSave} onCancel={onClose}
      />
    </Modal>
  );
}