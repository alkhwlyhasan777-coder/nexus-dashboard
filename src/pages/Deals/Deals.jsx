import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../../components/ui/motion.css";
import DataTable from "../../components/ui/DataTable";
import Icon from "../../components/layout/navbar/Icon";
import IconButton from "../../components/layout/navbar/IconButton";
import Pagination from "../../components/ui/Pagination";
import { LANGS } from "../../components/ui/Sidebar";
import Toast from "../../components/ui/Toast";
import { accent, button, card, field, hairline, hoverBg, muted, text } from "../../components/ui/tokens";
import { useUI } from "../../context/UIcontext";
import useToday from "../../hooks/useToday";
import { addDays } from "../../lib/dates";
import { makeFormatters } from "../../lib/format";
import { T as LEAD_T } from "../Leads/leads.i18n";
import DealCard from "./DealCard";
import DealModals from "./DealModals";
import DealsBoard from "./DealsBoard";
import DealStats from "./DealStats";
import useDealTable from "./dealTable.jsx";
import { computeStats, isOpen, STAGE_ORDER, STAGES } from "./deals.data";
import { T } from "./deals.i18n";
import useClients from "./useClients";
import useDeals from "./useDeals";

const PAGE_SIZES = [8, 15, 25];
const SORTS = ["expectedClose", "value", "title", "createdAt", "stage"];
const DEFAULT_DIR = { title: "asc", expectedClose: "asc", stage: "asc" }; // other columns start descending
const URL_DEFAULTS = { view: "board", sort: "expectedClose", page: 1 };

export default function Deals() {
  const { lang } = useUI();
  const { locale, dir } = LANGS[lang];
  const t = T[lang];
  const fmt = useMemo(() => makeFormatters(locale), [locale]);
  const today = useToday();

  /* The view, search, filters, sort and page live in the URL, so a view can be shared and bookmarked */
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const view = params.get("view") === "list" ? "list" : "board";
  const stage = ["open", ...STAGES].includes(params.get("stage")) ? params.get("stage") : "all";
  const type = ["lead", "customer"].includes(params.get("type")) ? params.get("type") : "all";
  const closing = ["overdue", "week", "month"].includes(params.get("closing")) ? params.get("closing") : "all";
  const sortId = SORTS.includes(params.get("sort")) ? params.get("sort") : URL_DEFAULTS.sort;
  const sortDir = ["asc", "desc"].includes(params.get("dir")) ? params.get("dir") : DEFAULT_DIR[sortId] ?? "desc";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);
  const wantsNew = params.get("new") === "1"; // the navbar "Create" button links here

  const patch = useCallback((changes) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      // The direction is only left out of the URL when it is the natural direction of the chosen sort
      const sortKey = changes.sort ?? next.get("sort") ?? URL_DEFAULTS.sort;
      Object.entries(changes).forEach(([key, value]) => {
        const isDefault = key === "dir" ? value === (DEFAULT_DIR[sortKey] ?? "desc") : value === URL_DEFAULTS[key];
        if (value === "" || value == null || value === "all" || isDefault) next.delete(key);
        else next.set(key, String(value));
      });
      return next;
    }, { replace: true });
  }, [setParams]);

  const [pageSize, setPageSize] = useState(() => {
    const saved = Number(localStorage.getItem("deals:pageSize"));
    return PAGE_SIZES.includes(saved) ? saved : PAGE_SIZES[0];
  });
  useEffect(() => { try { localStorage.setItem("deals:pageSize", String(pageSize)); } catch { /* storage unavailable */ } }, [pageSize]);

  const [modalState, setModal] = useState(null); // { type: "add" | "edit" | "delete", ... }
  const modal = modalState ?? (wantsNew ? { type: "add" } : null);
  const closeModal = useCallback(() => { setModal(null); if (wantsNew) patch({ new: "" }); }, [wantsNew, patch]);

  const [toast, setToast] = useState(null);
  const dismissToast = useCallback(() => setToast(null), []);
  const notify = useCallback((message, extra = {}) => setToast({ id: Date.now(), message, ...extra }), []);

  const { deals, add, update, remove, restore } = useDeals({ onExternalChange: () => notify(t.syncedFromTab) });
  const clients = useClients();

  /* A deal shows its client's CURRENT name; if the client was deleted it falls back to the saved name */
  const byKey = useMemo(() => new Map(clients.map((c) => [c.key, c])), [clients]);
  const resolve = useCallback((deal) => byKey.get(`${deal.clientType}:${deal.clientId}`)
    ?? { type: deal.clientType, id: deal.clientId, name: deal.clientName, missing: true }, [byKey]);

  /* The dashboard always reflects the whole pipeline and recalculates on every change */
  const stats = useMemo(() => computeStats(deals, today), [deals, today]);

  /* Search, filter, sort */
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const horizon = addDays(today, 7);
    const compare = {
      title: (a, b) => a.title.localeCompare(b.title, locale),
      value: (a, b) => a.value - b.value,
      expectedClose: (a, b) => a.expectedClose.localeCompare(b.expectedClose),
      createdAt: (a, b) => a.createdAt.localeCompare(b.createdAt),
      stage: (a, b) => STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage],
    }[sortId];
    return deals
      .filter((d) => {
        if (q && !d.title.toLowerCase().includes(q) && !resolve(d).name.toLowerCase().includes(q)) return false;
        if (stage === "open" ? !isOpen(d) : stage !== "all" && d.stage !== stage) return false;
        if (type !== "all" && d.clientType !== type) return false;
        if (closing === "overdue" && !(isOpen(d) && d.expectedClose < today)) return false;
        if (closing === "week" && !(d.expectedClose >= today && d.expectedClose <= horizon)) return false;
        if (closing === "month" && d.expectedClose.slice(0, 7) !== today.slice(0, 7)) return false;
        return true;
      })
      .sort((a, b) => (sortDir === "asc" ? 1 : -1) * compare(a, b));
  }, [deals, query, stage, type, closing, sortId, sortDir, today, locale, resolve]);

  const byStage = useMemo(() => Object.fromEntries(STAGES.map((s) => [s, rows.filter((d) => d.stage === s)])), [rows]);
  const filtering = query.trim() !== "" || stage !== "all" || type !== "all" || closing !== "all";
  const clearFilters = () => patch({ q: "", stage: "all", type: "all", closing: "all", page: 1 });

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pageCount);
  const pageRows = rows.slice((current - 1) * pageSize, current * pageSize);

  const onSort = (id) => {
    if (id === sortId) patch({ dir: sortDir === "asc" ? "desc" : "asc", sort: id, page: 1 });
    else patch({ sort: id, dir: DEFAULT_DIR[id] ?? "desc", page: 1 });
  };

  /* Create / edit / move / delete. Every change flows into `deals`, so the dashboard and board update by themselves. */
  const leadNote = (lead) => (lead ? t.leadSynced(lead.name, LEAD_T[lang][`s_${lead.status}`]) : null);

  const handleSave = (values) => {
    if (modal.type === "edit") {
      const { lead } = update(values);
      notify([t.updated(values.title), leadNote(lead)].filter(Boolean).join(" · "));
    } else {
      const { lead } = add(values);
      patch({ q: "", stage: "all", type: "all", closing: "all", page: 1 });
      notify([t.added(values.title), leadNote(lead)].filter(Boolean).join(" · "));
    }
    closeModal();
  };

  const handleMove = useCallback((deal, next) => {
    if (next === deal.stage) return;
    const { lead } = update({ ...deal, stage: next });
    notify(
      [t.movedTo(deal.title, t[`st_${next}`]), leadNote(lead)].filter(Boolean).join(" · "),
      lead ? {} : { actionLabel: t.undo, onAction: () => update({ ...deal, stage: deal.stage }) }
    );
  }, [update, notify, t, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = () => {
    const removed = remove(modal.deal.id);
    closeModal();
    notify(t.deleted(removed.deal.title), {
      actionLabel: t.undo,
      onAction: () => { restore(removed); notify(t.restored(removed.deal.title)); },
    });
  };

  const openEdit = useCallback((deal) => setModal({ type: "edit", deal }), []);
  const openDelete = useCallback((deal) => setModal({ type: "delete", deal }), []);
  const openAdd = useCallback((defaultStage) => setModal({ type: "add", defaults: defaultStage ? { stage: defaultStage } : undefined }), []);

  const renderBoardCard = (deal) => (
    <DealCard deal={deal} client={resolve(deal)} t={t} fmt={fmt} today={today} query={query} onEdit={openEdit} onDelete={openDelete} onMove={handleMove} />
  );
  const { columns, renderCard } = useDealTable({ t, fmt, today, query, resolve, onEdit: openEdit, onDelete: openDelete, onMove: handleMove });

  const select = `${field} lg:w-auto`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="anim-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <p className={`mt-1 text-sm ${muted}`}>{t.subtitle}</p>
        </div>
        <button type="button" onClick={() => openAdd()} className={`${button.base} ${button.primary}`}>
          <Icon name="plus" size={16} strokeWidth={2.2} />
          {t.add}
        </button>
      </div>

      <DealStats deals={deals} stats={stats} today={today} fmt={fmt} t={t} dir={dir} />

      {/* Toolbar: search, filters, sort, view */}
      <section className={`${card} anim-fade-up p-4`} style={{ "--delay": "300ms" }}>
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="relative lg:w-72">
            <Icon name="search" size={15} className={`pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 ${muted}`} />
            <input
              type="search" value={query} onChange={(e) => patch({ q: e.target.value, page: 1 })}
              placeholder={t.search} aria-label={t.searchLabel} className={`${field} ps-9`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="deal-stage">{t.filterStage}</label>
            <select id="deal-stage" value={stage} onChange={(e) => patch({ stage: e.target.value, page: 1 })} className={select}>
              <option value="all">{t.allStages}</option>
              <option value="open">{t.openStages}</option>
              {STAGES.map((s) => <option key={s} value={s}>{t[`st_${s}`]}</option>)}
            </select>

            <label className="sr-only" htmlFor="deal-type">{t.filterClient}</label>
            <select id="deal-type" value={type} onChange={(e) => patch({ type: e.target.value, page: 1 })} className={select}>
              <option value="all">{t.allClients}</option>
              <option value="lead">{t.clientLeads}</option>
              <option value="customer">{t.clientCustomers}</option>
            </select>

            <label className="sr-only" htmlFor="deal-closing">{t.filterClosing}</label>
            <select id="deal-closing" value={closing} onChange={(e) => patch({ closing: e.target.value, page: 1 })} className={select}>
              <option value="all">{t.anyClosing}</option>
              <option value="overdue">{t.closingOverdue}</option>
              <option value="week">{t.closingWeek}</option>
              <option value="month">{t.closingMonth}</option>
            </select>

            {filtering && (
              <button type="button" onClick={clearFilters} className={`${button.base} ${button.secondary}`}>
                <Icon name="x" size={14} />{t.clear}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 lg:ms-auto">
            <label className="sr-only" htmlFor="deal-sort">{t.sortBy}</label>
            <select id="deal-sort" value={sortId} onChange={(e) => patch({ sort: e.target.value, dir: DEFAULT_DIR[e.target.value] ?? "desc", page: 1 })} className={select}>
              {SORTS.map((s) => <option key={s} value={s}>{t.sortBy}: {t[`sort_${s}`]}</option>)}
            </select>
            <IconButton variant="outline" label={t.toggleDirection} onClick={() => patch({ dir: sortDir === "asc" ? "desc" : "asc", sort: sortId })}>
              <Icon name={sortDir === "asc" ? "arrowUp" : "arrowDown"} size={16} />
            </IconButton>

            <div role="group" aria-label={t.viewLabel} className={`inline-flex rounded-lg border p-0.5 ${hairline}`}>
              {[["board", "board", t.viewBoard], ["list", "list", t.viewList]].map(([id, icon, label]) => (
                <button
                  key={id} type="button" aria-pressed={view === id} aria-label={label} title={label}
                  onClick={() => patch({ view: id, page: 1 })}
                  className={`grid size-8 place-items-center rounded-md transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.ring} ${view === id ? accent.soft : `${text.body} ${hoverBg}`}`}
                >
                  <Icon name={icon} size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Board or list */}
      {rows.length === 0 ? (
        <div className={`${card} flex flex-col items-center gap-3 px-4 py-14 text-center`}>
          <span className={`grid size-12 place-items-center rounded-full ${accent.soft}`}><Icon name="deals" size={22} /></span>
          <div>
            <p className="font-semibold">{filtering ? t.noResults : t.emptyAll}</p>
            <p className={`mt-1 text-sm ${muted}`}>{filtering ? t.noResultsHint : t.emptyAllHint}</p>
          </div>
          {filtering ? (
            <button type="button" onClick={clearFilters} className={`${button.base} ${button.secondary}`}>{t.clear}</button>
          ) : (
            <button type="button" onClick={() => openAdd()} className={`${button.base} ${button.primary}`}><Icon name="plus" size={16} strokeWidth={2.2} />{t.add}</button>
          )}
        </div>
      ) : view === "board" ? (
        <div className="space-y-2">
          <p className={`text-xs ${muted}`}>{t.dragHint}</p>
          <DealsBoard byStage={byStage} t={t} fmt={fmt} renderCard={renderBoardCard} onMove={handleMove} onAdd={openAdd} />
        </div>
      ) : (
        <section className={`${card} overflow-hidden`}>
          <DataTable
            columns={columns} rows={pageRows} rowKey={(d) => d.id}
            sort={{ id: sortId, dir: sortDir }} onSort={onSort}
            renderCard={renderCard} onRowClick={openEdit}
            label={t.tableLabel} labels={{ sortBy: t.sortBy, toggleDirection: t.toggleDirection }}
          />
          <Pagination
            page={current} pageCount={pageCount} total={rows.length} pageSize={pageSize}
            pageSizeOptions={PAGE_SIZES} onPageSizeChange={(n) => { setPageSize(n); patch({ page: 1 }); }}
            onPage={(p) => patch({ page: p })} format={fmt.nf.format} t={t}
          />
        </section>
      )}

      <DealModals modal={modal} onClose={closeModal} clients={clients} t={t} fmt={fmt} locale={locale} onSave={handleSave} onDelete={handleDelete} />
      <Toast toast={toast} onDismiss={dismissToast} dismissLabel={t.dismiss} />
    </div>
  );
}