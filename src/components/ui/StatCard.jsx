import "./motion.css";
import useCountUp from "../../hooks/useCountUp";
import Icon from "../layout/navbar/Icon";
import { accent, card, muted } from "./tokens";

/* Summary number with an icon and a caption. The number counts up when it appears. */
export default function StatCard({ index = 0, icon, label, value, format = String, caption }) {
  const animated = useCountUp(value);
  return (
    <div className={`${card} anim-fade-up p-4`} style={{ "--delay": `${index * 80}ms` }}>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-sm ${muted}`}>{label}</p>
        <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${accent.soft}`}>
          <Icon name={icon} size={16} />
        </span>
      </div>
      <p className="mt-2 truncate text-2xl font-semibold tabular-nums">{format(animated)}</p>
      <p className={`mt-1 text-xs ${muted}`}>{caption}</p>
    </div>
  );
}