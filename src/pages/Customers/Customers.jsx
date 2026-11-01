// import { useCallback, useMemo, useState } from "react";
// import "../../components/ui/motion.css";
// import DataTable from "../../components/ui/DataTable";
// import Icon from "../../components/layout/navbar/Icon";
// import Modal from "../../components/ui/Modal";
// import Pagination from "../../components/ui/Pagination";
// import { LANGS } from "../../components/ui/Sidebar";
// import Toast from "../../components/ui/Toast";
// import { accent, button, card, field, hairline, hoverBg, muted, text } from "../../components/ui/tokens";
// import { useUI } from "../../context/UIcontext";
// import CustomerCharts from "./CustomerCharts";
// import CustomerForm from "./CustomerForm";
// import useCustomerTable from "./customerTable.jsx";
// import KpiCards from "./KpiCards";
// import { computeStats, makeFormatters, STATUSES } from "./customers.data";
// import { T } from "./customers.i18n";
// import useCustomers from "./useCustomers";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../components/ui/motion.css";
import DataTable from "../../components/ui/DataTable";
import Icon from "../../components/layout/navbar/Icon";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import { LANGS } from "../../components/ui/Sidebar";
import Toast from "../../components/ui/Toast";
import { accent, button, card, field, hairline, hoverBg, muted, text } from "../../components/ui/tokens";
import { useUI } from "../../context/UIcontext";
import CustomerCharts from "./CustomerCharts";
import CustomerForm from "./CustomerForm";
import useCustomerTable from "./customerTable.jsx";
import KpiCards from "./KpiCards";
import { buildCsv, computeStats, makeFormatters, STATUSES } from "./customers.data";
import { T } from "./customers.i18n";
import useCustomers from "./useCustomers";

const PAGE_SIZE = 8;
const STATUS_ORDER = Object.fromEntries(STATUSES.map((s, i) => [s, i]));
const DEFAULT_DIR = { name: "asc", status: "asc", country: "asc" }; // other columns start descending

export default function Customers() {
  const { lang } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const { locale, dir } = LANGS[lang];
  const t = T[lang];
  const fmt = useMemo(() => makeFormatters(locale), [locale]);

  const { customers, add, update, remove, restore } = useCustomers();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState({ id: "joined", dir: "desc" });
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { type: "add" | "edit" | "delete", customer? }
  const [toast, setToast] = useState(null);
  const [view, setView] = useState(() => {
    try { return localStorage.getItem("customers:view") === "cards" ? "cards" : "table"; } catch { return "table"; }
  });
  useEffect(() => {
    try { localStorage.setItem("customers:view", view); } catch { /* storage unavailable */ }
  }, [view]);

  const closeModal = useCallback(() => setModal(null), []);
  const dismissToast = useCallback(() => setToast(null), []);
  const notify = useCallback((message, extra = {}) => setToast({ id: Date.now(), message, ...extra }), []);
  const openEdit = useCallback((customer) => setModal({ type: "edit", customer }), []);
  const openView = useCallback((customer) => navigate(`/customers/${customer.id}`), [navigate]);

  useEffect(() => {
    const customerId = location.state?.editCustomerId;
    if (!customerId) return;
    const customer = customers.find((item) => item.id === customerId);
    if (customer) openEdit(customer);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, customers, navigate, openEdit]);
  const openDelete = useCallback((customer) => setModal({ type: "delete", customer }), []);

  const stats = useMemo(() => computeStats(customers), [customers]);
  const maxSpent = useMemo(() => Math.max(1, ...customers.map((c) => c.spent)), [customers]);
  const counts = useMemo(() => ({
    all: customers.length,
    ...Object.fromEntries(STATUSES.map((s) => [s, customers.filter((c) => c.status === s).length])),
  }), [customers]);

  /* Filter, sort, paginate */
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = customers.filter((c) =>
      (status === "all" || c.status === status) &&
      (!q || [c.name, c.email, c.company].some((v) => v.toLowerCase().includes(q)))
    );
    const compare = {
      name: (a, b) => a.name.localeCompare(b.name, locale),
      country: (a, b) => fmt.region(a.country).localeCompare(fmt.region(b.country), locale),
      status: (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
      orders: (a, b) => a.orders - b.orders,
      spent: (a, b) => a.spent - b.spent,
      joined: (a, b) => new Date(a.joined) - new Date(b.joined),
    }[sort.id];
    return compare ? [...list].sort((a, b) => (sort.dir === "asc" ? 1 : -1) * compare(a, b)) : list;
  }, [customers, query, status, sort, locale, fmt]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const pageRows = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const filtering = query.trim() !== "" || status !== "all";

  const onSort = (id) => {
    setSort((s) => (s.id === id ? { id, dir: s.dir === "asc" ? "desc" : "asc" } : { id, dir: DEFAULT_DIR[id] ?? "desc" }));
    setPage(1);
  };
  const clearFilters = () => { setQuery(""); setStatus("all"); setPage(1); };

  /* Create / update / delete */
  const handleSave = (values) => {
    if (modal.type === "edit") {
      update(values);
      notify(t.updated(values.name));
    } else {
      add(values);
      // Make sure the new customer is visible: newest first, no filters
      setSort({ id: "joined", dir: "desc" });
      clearFilters();
      notify(t.added(values.name));
    }
    closeModal();
  };

  const handleDelete = () => {
    const removed = remove(modal.customer.id);
    closeModal();
    notify(t.deleted(removed.customer.name), {
      actionLabel: t.undo,
      onAction: () => { restore(removed); notify(t.restored(removed.customer.name)); },
    });
  };

  const takenEmails = useMemo(() => {
    const editingId = modal?.type === "edit" ? modal.customer.id : null;
    return new Set(customers.filter((c) => c.id !== editingId).map((c) => c.email.toLowerCase()));
  }, [customers, modal]);

  const { columns, renderCard } = useCustomerTable({ t, fmt, query, maxSpent, onView: openView, onEdit: openEdit, onDelete: openDelete });

  /* Download what the table is currently showing (all pages of the filtered, sorted list) */
  const exportCsv = () => {
    const csv = buildCsv(rows, {
      headers: [t.name, t.email, t.phone, t.company, t.country, t.status, t.orders, t.spent, t.joined],
      region: fmt.region,
      statusLabel: (s) => t[s],
    });
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify(t.exported(fmt.nf.format(rows.length)));
  };

  const filters = [{ id: "all", label: t.all }, ...STATUSES.map((s) => ({ id: s, label: t[s] }))];

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

      <KpiCards stats={stats} customers={customers} fmt={fmt} t={t} />
      <CustomerCharts customers={customers} fmt={fmt} t={t} dir={dir} />

      {/* Table card */}
      <section className={`${card} anim-fade-up overflow-hidden`} style={{ "--delay": "240ms" }}>
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative lg:w-72">
            <Icon name="search" size={15} className={`pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 ${muted}`} />
            <input
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder={t.search}
              aria-label={t.searchLabel}
              className={`${field} ps-9`}
            />
          </div>
          <div role="group" aria-label={t.filterBy} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-1 lg:flex-1">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={status === f.id}
                onClick={() => { setStatus(f.id); setPage(1); }}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.ring} ${status === f.id ? `border-transparent ${accent.soft}` : `${hairline} ${text.body} ${hoverBg}`}`}
              >
                {f.label}
                <span className="text-xs tabular-nums opacity-70">{fmt.nf.format(counts[f.id])}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 lg:ms-auto">
            <button type="button" onClick={exportCsv} disabled={rows.length === 0} className={`${button.base} ${button.secondary}`}>
              <Icon name="download" size={15} />
              {t.export}
            </button>
            <div role="group" aria-label={t.viewLabel} className={`inline-flex rounded-lg border p-0.5 ${hairline}`}>
              {[["table", "table", t.viewTable], ["cards", "grid", t.viewCards]].map(([id, icon, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={view === id}
                  aria-label={label}
                  title={label}
                  onClick={() => setView(id)}
                  className={`grid size-8 place-items-center rounded-md transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.ring} ${view === id ? accent.soft : `${text.body} ${hoverBg}`}`}
                >
                  <Icon name={icon} size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className={`flex flex-col items-center gap-3 border-t px-4 py-14 text-center ${hairline}`}>
            <span className={`grid size-12 place-items-center rounded-full ${accent.soft}`}><Icon name="customers" size={22} /></span>
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
              rowKey={(c) => c.id}
              sort={sort}
              onSort={onSort}
              renderCard={renderCard}
              layout={view === "cards" ? "cards" : "auto"}
              label={t.tableLabel}
              labels={{ sortBy: t.sortBy, toggleDirection: t.toggleDirection }}
            />
            <Pagination
              page={current}
              pageCount={pageCount}
              total={rows.length}
              pageSize={PAGE_SIZE}
              onPage={setPage}
              format={fmt.nf.format}
              t={t}
            />
          </div>
        )}
      </section>

      {/* Add / edit */}
      {(modal?.type === "add" || modal?.type === "edit") && (
        <Modal title={modal.type === "edit" ? t.editTitle : t.addTitle} onClose={closeModal} closeLabel={t.close}>
          <CustomerForm
            t={t}
            fmt={fmt}
            locale={locale}
            initial={modal.type === "edit" ? modal.customer : undefined}
            takenEmails={takenEmails}
            onSubmit={handleSave}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {/* Delete confirmation */}
      {modal?.type === "delete" && (
        <Modal title={t.deleteTitle} onClose={closeModal} closeLabel={t.close} size="max-w-md">
          <div className="flex gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <Icon name="trash" size={18} />
            </span>
            <p className={`text-sm leading-6 ${text.body}`}>{t.deleteBody(modal.customer.name)}</p>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" data-autofocus onClick={closeModal} className={`${button.base} ${button.secondary}`}>{t.cancel}</button>
            <button type="button" onClick={handleDelete} className={`${button.base} ${button.danger}`}>{t.confirmDelete}</button>
          </div>
        </Modal>
      )}

      <Toast toast={toast} onDismiss={dismissToast} dismissLabel={t.dismiss} />
    </div>
  );
}

