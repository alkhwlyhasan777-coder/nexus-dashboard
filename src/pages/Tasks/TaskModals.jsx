import Icon from "../../components/layout/navbar/Icon";
import Modal from "../../components/ui/Modal";
import { button, text } from "../../components/ui/tokens";
import TaskForm from "./TaskForm";

export default function TaskModals({ modal, t, onClose, onSave, onDelete }) {
  if (!modal) return null;
  if (modal.type === "delete") {
    return (
      <Modal title={t.deleteTitle} onClose={onClose} closeLabel={t.close} size="max-w-md">
        <div className="flex gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400"><Icon name="trash" size={18} /></span>
          <p className={`text-sm leading-6 ${text.body}`}>{t.deleteBody(modal.task.title)}</p>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={`${button.base} ${button.secondary}`}>{t.cancel}</button>
          <button type="button" onClick={onDelete} className={`${button.base} ${button.danger}`}>{t.confirmDelete}</button>
        </div>
      </Modal>
    );
  }
  return (
    <Modal title={modal.type === "edit" ? t.editTitle : t.addTitle} onClose={onClose} closeLabel={t.close}>
      <TaskForm initial={modal.type === "edit" ? modal.task : undefined} t={t} onSubmit={onSave} onCancel={onClose} />
    </Modal>
  );
}
