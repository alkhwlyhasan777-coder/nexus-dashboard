import { useState } from "react";
import Icon from "../../components/layout/navbar/Icon";
import IconButton from "../../components/layout/navbar/IconButton";
import { accent, hairline, muted } from "../../components/ui/tokens";
import { STAGE_COLOR, STAGES } from "./deals.data";

/*
  Kanban board: one column per stage. Drag a card to another column to move it.
  Dragging is mouse-only, so every card also has a stage menu (keyboard and touch).
  byStage: { [stage]: deal[] }   renderCard(deal) -> node   onMove(deal, stage)   onAdd(stage)
*/
export default function DealsBoard({ byStage, t, fmt, renderCard, onMove, onAdd }) {
  const [dragId, setDragId] = useState(null);
  const [overStage, setOverStage] = useState(null);
  const all = Object.values(byStage).flat();

  const drop = (stage) => (e) => {
    e.preventDefault();
    const id = e.dataTransfer?.getData("text/plain") || dragId;
    const deal = all.find((d) => d.id === id);
    setOverStage(null);
    setDragId(null);
    if (deal && deal.stage !== stage) onMove(deal, stage);
  };

  return (
    <div role="region" aria-label={t.boardLabel} tabIndex={0} className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40">
      {STAGES.map((stage) => {
        const deals = byStage[stage] ?? [];
        const total = deals.reduce((sum, d) => sum + d.value, 0);
        const isOver = overStage === stage && dragId;
        return (
          <section
            key={stage}
            aria-labelledby={`stage-${stage}`}
            onDragOver={(e) => { e.preventDefault(); if (overStage !== stage) setOverStage(stage); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOverStage(null); }}
            onDrop={drop(stage)}
            className={`flex w-72 shrink-0 snap-start flex-col rounded-2xl border bg-neutral-50/70 transition-colors duration-200 dark:bg-neutral-950/40 ${hairline} ${isOver ? "border-blue-500 bg-blue-50/60 dark:bg-blue-500/10" : ""}`}
          >
            <header className="flex items-center gap-2 p-3 pb-2">
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: STAGE_COLOR[stage] }} />
              <h3 id={`stage-${stage}`} className="min-w-0 flex-1 truncate text-sm font-semibold">{t[`st_${stage}`]}</h3>
              <span className={`rounded-full bg-white px-2 py-0.5 text-xs font-medium tabular-nums dark:bg-neutral-900 ${muted}`}>{fmt.nf.format(deals.length)}</span>
              <IconButton size="sm" label={t.addToStage(t[`st_${stage}`])} onClick={() => onAdd(stage)}><Icon name="plus" size={14} /></IconButton>
            </header>
            <p className={`px-3 pb-2 text-xs tabular-nums ${muted}`}>{fmt.money.format(total)}</p>

            <ul className="flex min-h-28 flex-1 flex-col gap-2 p-2 pt-0">
              {deals.map((deal) => (
                <li
                  key={deal.id}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.setData("text/plain", deal.id); e.dataTransfer.effectAllowed = "move"; setDragId(deal.id); }}
                  onDragEnd={() => { setDragId(null); setOverStage(null); }}
                  className={`cursor-grab rounded-xl border bg-white shadow-sm transition-[opacity,box-shadow] duration-200 hover:shadow-md active:cursor-grabbing dark:bg-neutral-900 ${hairline} ${dragId === deal.id ? "opacity-40" : ""}`}
                >
                  {renderCard(deal)}
                </li>
              ))}
              {deals.length === 0 && (
                <li className={`grid flex-1 place-items-center rounded-xl border border-dashed p-4 text-center text-xs ${hairline} ${muted} ${isOver ? accent.soft : ""}`}>
                  {t.dropHere}
                </li>
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}