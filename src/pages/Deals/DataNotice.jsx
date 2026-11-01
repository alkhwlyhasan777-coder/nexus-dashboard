import Icon from "../../components/layout/navbar/Icon";
import { button } from "../../components/ui/tokens";

/*
  Tells the user about data problems instead of hiding them.
  status: { corrupt, dropped }   attention: number of deals with a missing/invalid date or client
*/
export default function DataNotice({ status, attention = 0, t, fmt, onReview, onAcknowledge, onReset }) {
  const box = "flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm";
  const amber = `${box} border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200`;
  const red = `${box} border-red-200 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200`;
  const small = `${button.base} ${button.secondary} h-8`;

  if (!status.corrupt && !status.dropped && !attention) return null;
  return (
    <div className="space-y-2">
      {status.corrupt && (
        <div role="alert" className={red}>
          <Icon name="alert" size={18} />
          <p className="min-w-0 flex-1">{t.dataCorrupt}</p>
          <button type="button" onClick={onReset} className={small}>{t.loadSample}</button>
        </div>
      )}
      {status.dropped > 0 && (
        <div role="status" className={amber}>
          <Icon name="alert" size={18} />
          <p className="min-w-0 flex-1">{t.dataDropped(status.dropped, fmt.nf.format(status.dropped))}</p>
          <button type="button" onClick={onAcknowledge} className={small}>{t.dismiss}</button>
        </div>
      )}
      {attention > 0 && (
        <div role="status" className={amber}>
          <Icon name="alert" size={18} />
          <p className="min-w-0 flex-1"><strong className="font-semibold">{t.needsAttention(attention, fmt.nf.format(attention))}.</strong> {t.needsAttentionHint}</p>
          <button type="button" onClick={onReview} className={small}>{t.review}</button>
        </div>
      )}
    </div>
  );
}