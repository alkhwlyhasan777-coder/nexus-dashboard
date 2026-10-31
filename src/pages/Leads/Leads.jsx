// import { useCallback, useEffect, useMemo, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import "../../components/ui/motion.css";
// import DataTable from "../../components/ui/DataTable";
// import Drawer from "../../components/ui/Drawer";
// import Icon from "../../components/layout/navbar/Icon.jsx";
// import Modal from "../../components/ui/Modal";
// import Pagination from "../../components/ui/Pagination";
// import { LANGS } from "../../components/ui/Sidebar";
// import StatCard from "../../components/ui/StatCard";
// import Toast from "../../components/ui/Toast";
// import { accent, button, card, field, hairline, hoverBg, muted, text } from "../../components/ui/tokens";
// import { useUI } from "../../context/UIcontext";
// import { makeFormatters } from "../../lib/format";
// import LeadDetails from "./LeadDetails";
// import LeadForm from "./LeadForm";
// import useLeadTable from "./leadTable.jsx";
// import { computeStats, SOURCES, STATUSES } from "./leads.data";
// import { T } from "./leads.i18n";
// import useLeads from "./useLeads";

// const PAGE_SIZES = [8, 15, 25];
// const STATUS_ORDER = Object.fromEntries(STATUSES.map((s, i) => [s, i]));
// const DEFAULT_DIR = { name: "asc", company: "asc", source: "asc", status: "asc" }; // other columns start descending

// export default function Leads() {
//   const { lang } = useUI();
//   const { locale } = LANGS[lang];
//   const t = T[lang];
//   const fmt = useMemo(() => makeFormatters(locale), [locale]);

//   const { leads, add, update, remove, restore } = useLeads();

//   /* Filters, page and the open lead live in the URL, so a view can be shared and Back closes the details */
//   const [params, setParams] = useSearchParams();
//   const query = params.get("q") ?? "";
//   const status = STATUSES.includes(params.get("status")) ? params.get("status") : "all";
//   const source = SOURCES.includes(params.get("source")) ? params.get("source") : "all";
//   const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);
//   const openId = params.get("lead");

//   const patch = useCallback((changes, { push = false } = {}) => {
//     setParams((prev) => {
//       const next = new URLSearchParams(prev);
//       Object.entries(changes).forEach(([key, value]) => {
//         const empty = value === "" || value == null || value === "all" || (key === "page" && value === 1);
//         if (empty) next.delete(key); else next.set(key, String(value));
//       });
//       return next;
//     }, { replace: !push });
//   }, [setParams]);

//   const [sort, setSort] = useState({ id: "createdAt", dir: "desc" });
//   const [pageSize, setPageSize] = useState(() => {
//     const saved = Number(localStorage.getItem("leads:pageSize"));
//     return PAGE_SIZES.includes(saved) ? saved : PAGE_SIZES[0];
//   });
//   useEffect(() => { try { localStorage.setItem("leads:pageSize", String(pageSize)); } catch { /* storage unavailable */ } }, [pageSize]);

//   const [modal, setModal] = useState(null); // { type: "add" | "edit" | "delete", lead? }
//   const [toast, setToast] = useState(null);

//   const closeModal = useCallback(() => setModal(null), []);
//   const dismissToast = useCallback(() => setToast(null), []);
//   const notify = useCallback((message, extra = {}) => setToast({ id: Date.now(), message, ...extra }), []);
//   const openDetails = useCallback((lead) => patch({ lead: lead.id }, { push: true }), [patch]);
//   const closeDetails = useCallback(() => patch({ lead: "" }), [patch]);
//   const openEdit = useCallback((lead) => setModal({ type: "edit", lead }), []);
//   const openDelete = useCallback((lead) => setModal({ type: "delete", lead }), []);

//   const stats = useMemo(() => computeStats(leads), [leads]);
//   const openLead = leads.find((l) => l.id === openId);

//   /* Search + source first, so the status counts always match what the other filters leave */
//   const searched = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     return leads.filter((l) =>
//       (source === "all" || l.source === source) &&
//       (!q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q))
//     );
//   }, [leads, query, source]);

//   const counts = useMemo(() => ({
//     all: searched.length,
//     ...Object.fromEntries(STATUSES.map((s) => [s, searched.filter((l) => l.status === s).length])),
//   }), [searched]);

//   const rows = useMemo(() => {
//     const list = status === "all" ? searched : searched.filter((l) => l.status === status);
//     const compare = {
//       name: (a, b) => a.name.localeCompare(b.name, locale),
//       company: (a, b) => a.company.localeCompare(b.company, locale),
//       source: (a, b) => t[`src_${a.source}`].localeCompare(t[`src_${b.source}`], locale),
//       status: (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
//       value: (a, b) => a.value - b.value,
//       createdAt: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
//     }[sort.id];
//     return compare ? [...list].sort((a, b) => (sort.dir === "asc" ? 1 : -1) * compare(a, b)) : list;
//   }, [searched, status, sort, locale, t]);

//   const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
//   const current = Math.min(page, pageCount);
//   const pageRows = rows.slice((current - 1) * pageSize, current * pageSize);
//   const filtering = query.trim() !== "" || status !== "all" || source !== "all";

//   const onSort = (id) => {
//     setSort((s) => (s.id === id ? { id, dir: s.dir === "asc" ? "desc" : "asc" } : { id, dir: DEFAULT_DIR[id] ?? "desc" }));
//     patch({ page: 1 });
//   };
//   const clearFilters = () => patch({ q: "", status: "all", source: "all", page: 1 });

//   /* Create / update / delete */
//   const handleSave = (values) => {
//     if (modal.type === "edit") {
//       update(values);
//       notify(t.updated(values.name));
//     } else {
//       const lead = add(values);
//       setSort({ id: "createdAt", dir: "desc" });
//       clearFilters();
//       notify(t.added(values.name), { actionLabel: t.view, onAction: () => openDetails(lead) });
//     }
//     closeModal();
//   };

//   const handleStatusChange = (lead, next) => {
//     update({ ...lead, status: next });
//     notify(t.statusChanged(lead.name, t[`s_${next}`]));
//   };

//   const handleDelete = () => {
//     const removed = remove(modal.lead.id);
//     closeModal();
//     notify(t.deleted(removed.lead.name), {
//       actionLabel: t.undo,
//       onAction: () => { restore(removed); notify(t.restored(removed.lead.name)); },
//     });
//   };

//   const takenEmails = useMemo(() => {
//     const editingId = modal?.type === "edit" ? modal.lead.id : null;
//     return new Set(leads.filter((l) => l.id !== editingId).map((l) => l.email.toLowerCase()));
//   }, [leads, modal]);

//   const { columns, renderCard } = useLeadTable({ t, fmt, query, onOpen: openDetails, onEdit: openEdit, onDelete: openDelete });

//   const filters = [{ id: "all", label: t.all }, ...STATUSES.map((s) => ({ id: s, label: t[`s_${s}`] }))];

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="anim-fade-up flex flex-wrap items-end justify-between gap-3">
//         <div>
//           <h1 className="text-2xl font-semibold">{t.title}</h1>
//           <p className={`mt-1 text-sm ${muted}`}>{t.subtitle}</p>
//         </div>
//         <button type="button" onClick={() => setModal({ type: "add" })} className={`${button.base} ${button.primary}`}>
//           <Icon name="plus" size={16} strokeWidth={2.2} />
//           {t.add}
//         </button>
//       </div>

//       {/* Summary */}
//       <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         <StatCard index={0} icon="leads" label={t.statTotal} value={stats.total} format={(v) => fmt.nf.format(Math.round(v))} caption={t.openLeads(fmt.nf.format(stats.openCount))} />
//         <StatCard index={1} icon="revenue" label={t.statPipeline} value={stats.pipeline} format={(v) => fmt.money.format(Math.round(v))} caption={t.pipelineHint} />
//         <StatCard index={2} icon="tasks" label={t.statWinRate} value={stats.winRate * 100} format={(v) => fmt.percent.format(Math.round(v) / 100)} caption={t.wonLost(fmt.nf.format(stats.won), fmt.nf.format(stats.lost))} />
//         <StatCard index={3} icon="customers" label={t.statNew} value={stats.newThisWeek} format={(v) => fmt.nf.format(Math.round(v))} caption={t.last7} />
//       </div>

//       {/* Table card */}
//       <section className={`${card} anim-fade-up overflow-hidden`} style={{ "--delay": "160ms" }}>
//         <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
//           <div className="relative lg:w-72">
//             <Icon name="search" size={15} className={`pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 ${muted}`} />
//             <input
//               type="search"
//               value={query}
//               onChange={(e) => patch({ q: e.target.value, page: 1 })}
//               placeholder={t.search}
//               aria-label={t.searchLabel}
//               className={`${field} ps-9`}
//             />
//           </div>

//           <div role="group" aria-label={t.filterStatus} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-1 lg:flex-1">
//             {filters.map((f) => (
//               <button
//                 key={f.id}
//                 type="button"
//                 aria-pressed={status === f.id}
//                 onClick={() => patch({ status: f.id, page: 1 })}
//                 className={`inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.ring} ${status === f.id ? `border-transparent ${accent.soft}` : `${hairline} ${text.body} ${hoverBg}`}`}
//               >
//                 {f.label}
//                 <span className="text-xs tabular-nums opacity-70">{fmt.nf.format(counts[f.id])}</span>
//               </button>
//             ))}
//           </div>

//           <div className="flex items-center gap-2">
//             <label htmlFor="lead-source" className="sr-only">{t.sourceLabel}</label>
//             <select id="lead-source" value={source} onChange={(e) => patch({ source: e.target.value, page: 1 })} className={`${field} lg:w-44`}>
//               <option value="all">{t.allSources}</option>
//               {SOURCES.map((s) => <option key={s} value={s}>{t[`src_${s}`]}</option>)}
//             </select>
//             {filtering && (
//               <button type="button" onClick={clearFilters} className={`${button.base} ${button.secondary}`}>
//                 <Icon name="x" size={14} />{t.clear}
//               </button>
//             )}
//           </div>
//         </div>

//         {rows.length === 0 ? (
//           <div className={`flex flex-col items-center gap-3 border-t px-4 py-14 text-center ${hairline}`}>
//             <span className={`grid size-12 place-items-center rounded-full ${accent.soft}`}><Icon name="leads" size={22} /></span>
//             <div>
//               <p className="font-semibold">{filtering ? t.noResults : t.emptyAll}</p>
//               <p className={`mt-1 text-sm ${muted}`}>{filtering ? t.noResultsHint : t.emptyAllHint}</p>
//             </div>
//             {filtering ? (
//               <button type="button" onClick={clearFilters} className={`${button.base} ${button.secondary}`}>{t.clear}</button>
//             ) : (
//               <button type="button" onClick={() => setModal({ type: "add" })} className={`${button.base} ${button.primary}`}>
//                 <Icon name="plus" size={16} strokeWidth={2.2} />{t.add}
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className={`border-t ${hairline}`}>
//             <DataTable
//               columns={columns}
//               rows={pageRows}
//               rowKey={(l) => l.id}
//               sort={sort}
//               onSort={onSort}
//               renderCard={renderCard}
//               onRowClick={openDetails}
//               label={t.tableLabel}
//               labels={{ sortBy: t.sortBy, toggleDirection: t.toggleDirection }}
//             />
//             <Pagination
//               page={current}
//               pageCount={pageCount}
//               total={rows.length}
//               pageSize={pageSize}
//               pageSizeOptions={PAGE_SIZES}
//               onPageSizeChange={(n) => { setPageSize(n); patch({ page: 1 }); }}
//               onPage={(p) => patch({ page: p })}
//               format={fmt.nf.format}
//               t={t}
//             />
//           </div>
//         )}
//       </section>

//       {/* Lead details */}
//       {openLead && (
//         <Drawer title={t.detailsTitle} onClose={closeDetails} closeLabel={t.close}>
//           <LeadDetails lead={openLead} t={t} fmt={fmt} onEdit={openEdit} onDelete={openDelete} onStatusChange={handleStatusChange} />
//         </Drawer>
//       )}

//       {/* Add / edit */}
//       {(modal?.type === "add" || modal?.type === "edit") && (
//         <Modal title={modal.type === "edit" ? t.editTitle : t.addTitle} onClose={closeModal} closeLabel={t.close}>
//           <LeadForm
//             t={t}
//             initial={modal.type === "edit" ? modal.lead : undefined}
//             takenEmails={takenEmails}
//             onSubmit={handleSave}
//             onCancel={closeModal}
//           />
//         </Modal>
//       )}

//       {/* Delete confirmation */}
//       {modal?.type === "delete" && (
//         <Modal title={t.deleteTitle} onClose={closeModal} closeLabel={t.close} size="max-w-md">
//           <div className="flex gap-4">
//             <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400">
//               <Icon name="trash" size={18} />
//             </span>
//             <p className={`text-sm leading-6 ${text.body}`}>{t.deleteBody(modal.lead.name)}</p>
//           </div>
//           <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
//             <button type="button" data-autofocus onClick={closeModal} className={`${button.base} ${button.secondary}`}>{t.cancel}</button>
//             <button type="button" onClick={handleDelete} className={`${button.base} ${button.danger}`}>{t.confirmDelete}</button>
//           </div>
//         </Modal>
//       )}

//       <Toast toast={toast} onDismiss={dismissToast} dismissLabel={t.dismiss} />
//     </div>
//   );
// }

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "../../components/ui/motion.css";
import DataTable from "../../components/ui/DataTable";
import Icon from "../../components/layout/navbar/Icon.jsx";
import Pagination from "../../components/ui/Pagination";
import { LANGS } from "../../components/ui/Sidebar";
import StatCard from "../../components/ui/StatCard";
import { accent, button, card, field, hairline, hoverBg, muted, text } from "../../components/ui/tokens";
import { useUI } from "../../context/UIcontext";
import { makeFormatters } from "../../lib/format";
import LeadModals from "./LeadModals";
import { useLeadsCtx } from "./LeadsLayout";
import useLeadTable from "./LeadTable.jsx";
import { computeStats, SOURCES, STATUSES } from "./leads.data";
import { T } from "./leads.i18n";

const PAGE_SIZES = [8, 15, 25];
const STATUS_ORDER = Object.fromEntries(STATUSES.map((s, i) => [s, i]));
const DEFAULT_DIR = { name: "asc", company: "asc", source: "asc", status: "asc" }; // other columns start descending

export default function Leads() {
  const { lang } = useUI();
  const { locale } = LANGS[lang];
  const t = T[lang];
  const fmt = useMemo(() => makeFormatters(locale), [locale]);
  const navigate = useNavigate();
  const { search } = useLocation();

  const { leads, add, update, remove, restore, notify } = useLeadsCtx();

  /* Search, filters and page live in the URL, so a view can be shared and survives going to a lead and back */
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const status = STATUSES.includes(params.get("status")) ? params.get("status") : "all";
  const source = SOURCES.includes(params.get("source")) ? params.get("source") : "all";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);

  const patch = useCallback((changes) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(changes).forEach(([key, value]) => {
        const empty = value === "" || value == null || value === "all" || (key === "page" && value === 1);
        if (empty) next.delete(key); else next.set(key, String(value));
      });
      return next;
    }, { replace: true });
  }, [setParams]);

  const [sort, setSort] = useState({ id: "createdAt", dir: "desc" });
  const [pageSize, setPageSize] = useState(() => {
    const saved = Number(localStorage.getItem("leads:pageSize"));
    return PAGE_SIZES.includes(saved) ? saved : PAGE_SIZES[0];
  });
  useEffect(() => { try { localStorage.setItem("leads:pageSize", String(pageSize)); } catch { /* storage unavailable */ } }, [pageSize]);

  const [modal, setModal] = useState(null); // { type: "add" | "edit" | "delete", lead? }
  const closeModal = useCallback(() => setModal(null), []);
  const openEdit = useCallback((lead) => setModal({ type: "edit", lead }), []);
  const openDelete = useCallback((lead) => setModal({ type: "delete", lead }), []);
  const openDetails = useCallback((lead) => navigate(`/${lead.id}`, { state: { from: search } }), [navigate, search]);
console.log(openDetails)
  const stats = useMemo(() => computeStats(leads), [leads]);

  /* Search + source first, so the status counts always match what the other filters leave */
  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) =>
      (source === "all" || l.source === source) &&
      (!q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q))
    );
  }, [leads, query, source]);

  const counts = useMemo(() => ({
    all: searched.length,
    ...Object.fromEntries(STATUSES.map((s) => [s, searched.filter((l) => l.status === s).length])),
  }), [searched]);

  const rows = useMemo(() => {
    const list = status === "all" ? searched : searched.filter((l) => l.status === status);
    const compare = {
      name: (a, b) => a.name.localeCompare(b.name, locale),
      company: (a, b) => a.company.localeCompare(b.company, locale),
      source: (a, b) => t[`src_${a.source}`].localeCompare(t[`src_${b.source}`], locale),
      status: (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
      value: (a, b) => a.value - b.value,
      createdAt: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    }[sort.id];
    return compare ? [...list].sort((a, b) => (sort.dir === "asc" ? 1 : -1) * compare(a, b)) : list;
  }, [searched, status, sort, locale, t]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pageCount);
  const pageRows = rows.slice((current - 1) * pageSize, current * pageSize);
  const filtering = query.trim() !== "" || status !== "all" || source !== "all";

  const onSort = (id) => {
    setSort((s) => (s.id === id ? { id, dir: s.dir === "asc" ? "desc" : "asc" } : { id, dir: DEFAULT_DIR[id] ?? "desc" }));
    patch({ page: 1 });
  };
  const clearFilters = () => patch({ q: "", status: "all", source: "all", page: 1 });

  /* Create / update / delete */
  const handleSave = (values) => {
    if (modal.type === "edit") {
      update(values);
      notify(t.updated(values.name));
    } else {
      const lead = add(values);
      setSort({ id: "createdAt", dir: "desc" });
      clearFilters();
      notify(t.added(values.name), { actionLabel: t.view, onAction: () => navigate(`/leads/${lead.id}`, { state: { from: "" } }) });
    }
    closeModal();
  };

  const handleDelete = () => {
    const removed = remove(modal.lead.id);
    closeModal();
    notify(t.deleted(removed.lead.name), {
      actionLabel: t.undo,
      onAction: () => { restore(removed); notify(t.restored(removed.lead.name)); },
    });
  };

  const { columns, renderCard } = useLeadTable({ t, fmt, query, search, onEdit: openEdit, onDelete: openDelete });

  const filters = [{ id: "all", label: t.all }, ...STATUSES.map((s) => ({ id: s, label: t[`s_${s}`] }))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="anim-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <p className={`mt-1 text-sm ${muted}`}>{t.subtitle}</p>
        </div>
        <button type="button" onClick={() => setModal({ type: "add" })} className={`${button.base} ${button.primary}`}>
          <Icon name="plus" size={16} strokeWidth={2.2} />
          {t.add}
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} icon="leads" label={t.statTotal} value={stats.total} format={(v) => fmt.nf.format(Math.round(v))} caption={t.openLeads(fmt.nf.format(stats.openCount))} />
        <StatCard index={1} icon="revenue" label={t.statPipeline} value={stats.pipeline} format={(v) => fmt.money.format(Math.round(v))} caption={t.pipelineHint} />
        <StatCard index={2} icon="tasks" label={t.statWinRate} value={stats.winRate * 100} format={(v) => fmt.percent.format(Math.round(v) / 100)} caption={t.wonLost(fmt.nf.format(stats.won), fmt.nf.format(stats.lost))} />
        <StatCard index={3} icon="customers" label={t.statNew} value={stats.newThisWeek} format={(v) => fmt.nf.format(Math.round(v))} caption={t.last7} />
      </div>

      {/* Table card */}
      <section className={`${card} anim-fade-up overflow-hidden`} style={{ "--delay": "160ms" }}>
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative lg:w-72">
            <Icon name="search" size={15} className={`pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 ${muted}`} />
            <input
              type="search"
              value={query}
              onChange={(e) => patch({ q: e.target.value, page: 1 })}
              placeholder={t.search}
              aria-label={t.searchLabel}
              className={`${field} ps-9`}
            />
          </div>

          <div role="group" aria-label={t.filterStatus} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-1 lg:flex-1">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={status === f.id}
                onClick={() => patch({ status: f.id, page: 1 })}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.ring} ${status === f.id ? `border-transparent ${accent.soft}` : `${hairline} ${text.body} ${hoverBg}`}`}
              >
                {f.label}
                <span className="text-xs tabular-nums opacity-70">{fmt.nf.format(counts[f.id])}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="lead-source" className="sr-only">{t.sourceLabel}</label>
            <select id="lead-source" value={source} onChange={(e) => patch({ source: e.target.value, page: 1 })} className={`${field} lg:w-44`}>
              <option value="all">{t.allSources}</option>
              {SOURCES.map((s) => <option key={s} value={s}>{t[`src_${s}`]}</option>)}
            </select>
            {filtering && (
              <button type="button" onClick={clearFilters} className={`${button.base} ${button.secondary}`}>
                <Icon name="x" size={14} />{t.clear}
              </button>
            )}
          </div>
        </div>

        {rows.length === 0 ? (
          <div className={`flex flex-col items-center gap-3 border-t px-4 py-14 text-center ${hairline}`}>
            <span className={`grid size-12 place-items-center rounded-full ${accent.soft}`}><Icon name="leads" size={22} /></span>
            <div>
              <p className="font-semibold">{filtering ? t.noResults : t.emptyAll}</p>
              <p className={`mt-1 text-sm ${muted}`}>{filtering ? t.noResultsHint : t.emptyAllHint}</p>
            </div>
            {filtering ? (
              <button type="button" onClick={clearFilters} className={`${button.base} ${button.secondary}`}>{t.clear}</button>
            ) : (
              <button type="button" onClick={() => setModal({ type: "add" })} className={`${button.base} ${button.primary}`}>
                <Icon name="plus" size={16} strokeWidth={2.2} />{t.add}
              </button>
            )}
          </div>
        ) : (
          <div className={`border-t ${hairline}`}>
            <DataTable
              columns={columns}
              rows={pageRows}
              rowKey={(l) => l.id}
              sort={sort}
              onSort={onSort}
              renderCard={renderCard}
              onRowClick={openDetails}
              label={t.tableLabel}
              labels={{ sortBy: t.sortBy, toggleDirection: t.toggleDirection }}
            />
            <Pagination
              page={current}
              pageCount={pageCount}
              total={rows.length}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZES}
              onPageSizeChange={(n) => { setPageSize(n); patch({ page: 1 }); }}
              onPage={(p) => patch({ page: p })}
              format={fmt.nf.format}
              t={t}
            />
          </div>
        )}
      </section>

      <LeadModals modal={modal} onClose={closeModal} leads={leads} t={t} onSave={handleSave} onDelete={handleDelete} />
    </div>
  );
}