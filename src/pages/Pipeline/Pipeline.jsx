import { useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../../components/ui/motion.css";
import Icon from "../../components/layout/navbar/Icon";
import IconButton from "../../components/layout/navbar/IconButton";
import { LANGS } from "../../components/ui/Sidebar";
import { accent, button, card, field, muted } from "../../components/ui/tokens";
import { useUI } from "../../context/UIcontext";
import { isValidDate } from "../../lib/dates";
import { makeFormatters } from "../../lib/format";
import { getOwner, OWNERS } from "../../lib/team";
import DataNotice from "../Deals/DataNotice";
import DealCard from "../Deals/DealCard";
import DealModals from "../Deals/DealModals";
import { useDealsCtx } from "../Deals/DealsLayout";
import DealsBoard from "../Deals/DealsBoard";
import { computeStats, isOpen, isOverdue, needsAttention, pipelineByStage, STAGES } from "../Deals/deals.data";
import PipelineSummary from "./PipelineSummary";
import { T } from "./pipeline.i18n";

const STATUSES = ["open", "won", "lost", "overdue", "attention"];
const DEFAULT_DIR = { expectedClose: "asc", value: "desc" };

const matchesStatus = (deal, status, today) => {
  switch (status) {
    case "open": return isOpen(deal);
    case "won": return deal.stage === "won";
    case "lost": return deal.stage === "lost";
    case "overdue": return isOverdue(deal, today);
    case "attention": return needsAttention(deal);
    default: return true;
  }
};

export default function Pipeline() {
  const { lang } = useUI();
  const { locale } = LANGS[lang];
  const t = T[lang];
  const fmt = useMemo(() => makeFormatters(locale), [locale]);

  /*
    The same deals as the Deals page: one shared store (DealsLayout), no copies.
    Moving, editing, creating or deleting here changes that store, so the Deals page shows it immediately.
  */
  const { deals, status: dataStatus, acknowledge, resetToSample, clients, resolve, today, create, edit, move, destroy } = useDealsCtx();

  /* Search, filters and sort live in the URL */
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const owner = params.get("owner") === "none" || OWNERS.some((o) => o.id === params.get("owner")) ? params.get("owner") : "all";
  const status = STATUSES.includes(params.get("status")) ? params.get("status") : "all";
  const sortId = params.get("sort") === "value" ? "value" : "expectedClose";
  const sortDir = ["asc", "desc"].includes(params.get("dir")) ? params.get("dir") : DEFAULT_DIR[sortId];

  const patch = useCallback((changes) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      const sortKey = changes.sort ?? next.get("sort") ?? "expectedClose";
      Object.entries(changes).forEach(([key, value]) => {
        const isDefault = key === "sort" ? value === "expectedClose" : key === "dir" ? value === DEFAULT_DIR[sortKey] : false;
        if (value === "" || value == null || value === "all" || isDefault) next.delete(key);
        else next.set(key, String(value));
      });
      return next;
    }, { replace: true });
  }, [setParams]);

  const [modal, setModal] = useState(null); // { type: "add" | "edit" | "delete", ... }
  const closeModal = useCallback(() => setModal(null), []);
  const openEdit = useCallback((deal) => setModal({ type: "edit", deal }), []);
  const openDelete = useCallback((deal) => setModal({ type: "delete", deal }), []);
  const openAdd = useCallback((stage) => setModal({ type: "add", defaults: stage ? { stage } : undefined }), []);

  /* Search + owner + status filters, then sort */
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sign = sortDir === "asc" ? 1 : -1;
    return deals
      .filter((d) => {
        if (q) {
          const haystack = [d.title, resolve(d).name, getOwner(d.ownerId)?.name ?? ""].join(" ").toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        if (owner === "none" ? getOwner(d.ownerId) : owner !== "all" && d.ownerId !== owner) return false;
        return matchesStatus(d, status, today);
      })
      .sort((a, b) => {
        if (sortId === "value") return sign * (a.value - b.value);
        const av = isValidDate(a.expectedClose), bv = isValidDate(b.expectedClose);
        if (!av || !bv) return av === bv ? 0 : av ? -1 : 1; // no valid date: always last
        return sign * a.expectedClose.localeCompare(b.expectedClose);
      });
  }, [deals, query, owner, status, sortId, sortDir, today, resolve]);

  const byStage = useMemo(() => Object.fromEntries(STAGES.map((s) => [s, rows.filter((d) => d.stage === s)])), [rows]);
  const stats = useMemo(() => computeStats(rows, today), [rows, today]);
  const stages = useMemo(() => pipelineByStage(rows), [rows]);
  const attention = useMemo(() => deals.filter(needsAttention).length, [deals]);

  const filtering = query.trim() !== "" || owner !== "all" || status !== "all";
  const clearFilters = () => patch({ q: "", owner: "all", status: "all" });

  const handleSave = (values) => {
    if (modal.type === "edit") edit(values);
    else { create(values); patch({ q: "", owner: "all", status: "all" }); }
    closeModal();
  };
  const handleDelete = () => { destroy(modal.deal); closeModal(); };

  const renderCard = (deal) => (
    <DealCard
      deal={deal} client={resolve(deal)} owner={getOwner(deal.ownerId)} showOwner showAge
      t={t} fmt={fmt} today={today} query={query} onEdit={openEdit} onDelete={openDelete} onMove={move}
    />
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="anim-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t.pipelineTitle}</h1>
          <p className={`mt-1 text-sm ${muted}`}>{t.pipelineSubtitle}</p>
        </div>
        <button type="button" onClick={() => openAdd()} className={`${button.base} ${button.primary}`}>
          <Icon name="plus" size={16} strokeWidth={2.2} />
          {t.add}
        </button>
      </div>

      <DataNotice
        status={dataStatus} attention={attention} t={t} fmt={fmt}
        onReview={() => patch({ status: "attention" })} onAcknowledge={acknowledge} onReset={resetToSample}
      />

      {deals.length === 0 ? (
        /* Nothing saved at all */
        <div className={`${card} flex flex-col items-center gap-3 px-4 py-14 text-center`}>
          <span className={`grid size-12 place-items-center rounded-full ${accent.soft}`}><Icon name="pipeline" size={22} /></span>
          <div>
            <p className="font-semibold">{t.emptyPipeline}</p>
            <p className={`mt-1 max-w-md text-sm ${muted}`}>{t.emptyPipelineHint}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => openAdd()} className={`${button.base} ${button.primary}`}><Icon name="plus" size={16} strokeWidth={2.2} />{t.add}</button>
            <Link to="/deals" className={`${button.base} ${button.secondary} no-underline`}>{t.goToDeals}</Link>
          </div>
        </div>
      ) : (
        <>
          <PipelineSummary stats={stats} stages={stages} fmt={fmt} t={t} />

          {/* Toolbar: search, owner, status, sort */}
          <section className={`${card} p-4`}>
            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
              <div className="relative lg:w-72">
                <Icon name="search" size={15} className={`pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 ${muted}`} />
                <input
                  type="search" value={query} onChange={(e) => patch({ q: e.target.value })}
                  placeholder={t.search} aria-label={t.searchLabel} className={`${field} ps-9`}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="pipe-owner">{t.ownerFilter}</label>
                <select id="pipe-owner" value={owner} onChange={(e) => patch({ owner: e.target.value })} className={`${field} lg:w-auto`}>
                  <option value="all">{t.allOwners}</option>
                  <option value="none">{t.unassigned}</option>
                  {OWNERS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>

                <label className="sr-only" htmlFor="pipe-status">{t.statusFilter}</label>
                <select id="pipe-status" value={status} onChange={(e) => patch({ status: e.target.value })} className={`${field} lg:w-auto`}>
                  <option value="all">{t.allStatuses}</option>
                  {STATUSES.map((s) => <option key={s} value={s}>{t[`status_${s}`]}</option>)}
                </select>

                {filtering && (
                  <button type="button" onClick={clearFilters} className={`${button.base} ${button.secondary}`}>
                    <Icon name="x" size={14} />{t.clear}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 lg:ms-auto">
                <p aria-live="polite" className={`me-2 hidden text-xs sm:block ${muted}`}>{t.resultCount(fmt.nf.format(rows.length), fmt.nf.format(deals.length))}</p>
                <label className="sr-only" htmlFor="pipe-sort">{t.sortBy}</label>
                <select id="pipe-sort" value={sortId} onChange={(e) => patch({ sort: e.target.value, dir: DEFAULT_DIR[e.target.value] })} className={`${field} lg:w-auto`}>
                  <option value="expectedClose">{t.sortBy}: {t.sort_expectedClose}</option>
                  <option value="value">{t.sortBy}: {t.sort_value}</option>
                </select>
                <IconButton variant="outline" label={t.toggleDirection} onClick={() => patch({ sort: sortId, dir: sortDir === "asc" ? "desc" : "asc" })}>
                  <Icon name={sortDir === "asc" ? "arrowUp" : "arrowDown"} size={16} />
                </IconButton>
              </div>
            </div>
          </section>

          {rows.length === 0 ? (
            /* Deals exist, but none match the filters */
            <div className={`${card} flex flex-col items-center gap-3 px-4 py-14 text-center`}>
              <span className={`grid size-12 place-items-center rounded-full ${accent.soft}`}><Icon name="pipeline" size={22} /></span>
              <div>
                <p className="font-semibold">{t.noResults}</p>
                <p className={`mt-1 text-sm ${muted}`}>{t.noResultsHint}</p>
              </div>
              <button type="button" onClick={clearFilters} className={`${button.base} ${button.secondary}`}>{t.clear}</button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className={`text-xs ${muted}`}>{t.dragHint}</p>
              <DealsBoard byStage={byStage} t={t} fmt={fmt} renderCard={renderCard} onMove={move} onAdd={openAdd} showWeighted />
            </div>
          )}
        </>
      )}

      <DealModals modal={modal} onClose={closeModal} clients={clients} t={t} fmt={fmt} locale={locale} onSave={handleSave} onDelete={handleDelete} />
    </div>
  );
}