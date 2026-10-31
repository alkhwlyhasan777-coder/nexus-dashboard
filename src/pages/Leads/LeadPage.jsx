import {  useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import "../../components/ui/motion.css";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/layout/navbar/Icon";
import PersonAvatar from "../../components/ui/PersonAvatar";
import { LANGS } from "../../components/ui/Sidebar";
import { accent, button, card, focusRing, hairline, hoverBg, muted, text, textarea } from "../../components/ui/tokens";
import { useUI } from "../../context/UIcontext";
import { makeFormatters } from "../../lib/format";
import LeadModals from "./LeadModals";
import { useLeadsCtx } from "./LeadsLayout";
import { STATUS_TONE, STATUSES } from "./leads.data";
import { T } from "./leads.i18n";

const Ltr = ({ children }) => <bdi dir="ltr">{children}</bdi>;
const link = `${focusRing} rounded-sm font-medium underline-offset-2 hover:underline`;

function Card({ title, delay = 0, className = "", children }) {
  return (
    <section className={`${card} anim-fade-up p-5 ${className}`} style={{ "--delay": `${delay}ms` }}>
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Item({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className={`text-xs ${muted}`}>{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium">{children}</dd>
    </div>
  );
}

export default function LeadPage() {
  const { leadId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { lang } = useUI();
  const { locale } = LANGS[lang];
  const t = T[lang];
  const fmt = useMemo(() => makeFormatters(locale), [locale]);

  const { leads, update, remove, restore, notify } = useLeadsCtx();
  const lead = leads.find((l) => l.id === leadId);
  const back = `/leads${state?.from ?? ""}`; // returns to the list with the same search, filters and page

  const [modal, setModal] = useState(null);
  const [notes, setNotes] = useState(lead?.notes ?? "");
  // useEffect(() => { setNotes(lead?.notes ?? ""); }, [lead?.notes]);
// 
  const backLink = (
    <Link to={back} className={`inline-flex items-center gap-1.5 text-sm font-medium ${muted} hover:text-neutral-900 dark:hover:text-neutral-100 ${focusRing} rounded-md`}>
      <Icon name="chevronLeft" size={16} className="rtl:rotate-180" />
      {t.backToLeads}
    </Link>
  );

  if (!lead) {
    return (
      <div className="space-y-6">
        {backLink}
        <div className={`${card} flex flex-col items-center gap-3 px-4 py-14 text-center`}>
          <span className={`grid size-12 place-items-center rounded-full ${accent.soft}`}><Icon name="leads" size={22} /></span>
          <div>
            <h1 className="font-semibold">{t.notFound}</h1>
            <p className={`mt-1 text-sm ${muted}`}>{t.notFoundHint}</p>
          </div>
        </div>
      </div>
    );
  }

  const changeStatus = (next) => {
    update({ ...lead, status: next });
    notify(t.statusChanged(lead.name, t[`s_${next}`]));
  };

  const saveNotes = () => {
    update({ ...lead, notes: notes.trim() });
    notify(t.notesSaved);
  };

  const handleSave = (values) => {
    update(values);
    notify(t.updated(values.name));
    setModal(null);
  };

  const handleDelete = () => {
    const removed = remove(lead.id);
    setModal(null);
    navigate(back, { replace: true });
    notify(t.deleted(removed.lead.name), {
      actionLabel: t.undo,
      onAction: () => { restore(removed); notify(t.restored(removed.lead.name)); },
    });
  };

  const events = [...(lead.activity ?? [])].reverse(); // newest first
  const action = `${button.base} no-underline`;

  return (
    <div className="space-y-6">
      {backLink}

      {/* Header: who, status, actions, pipeline */}
      <section className={`${card} anim-fade-up p-5`}>
        <div className="flex flex-wrap items-start gap-4">
          <PersonAvatar name={lead.name} size="size-14" className="text-base" />
          <div className="min-w-0 flex-1 basis-56">
            <h1 className="truncate text-2xl font-semibold">{lead.name}</h1>
            <p className={`mt-0.5 truncate text-sm ${muted}`}>{lead.company || "—"}</p>
            <div className="mt-3"><Badge tone={STATUS_TONE[lead.status]}>{t[`s_${lead.status}`]}</Badge></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`mailto:${lead.email}`} className={`${action} ${button.primary} ${focusRing}`}>
              <Icon name="email" size={15} />{t.sendEmail}
            </a>
            {lead.phone && (
              <a href={`tel:${lead.phone.replace(/\s/g, "")}`} className={`${action} ${button.secondary} ${focusRing}`}>
                <Icon name="phone" size={15} />{t.call}
              </a>
            )}
            <button type="button" onClick={() => setModal({ type: "edit", lead })} className={`${button.base} ${button.secondary}`}>
              <Icon name="edit" size={15} />{t.edit}
            </button>
            <button type="button" onClick={() => setModal({ type: "delete", lead })} className={`${button.base} ${button.dangerGhost}`}>
              <Icon name="trash" size={15} />{t.delete}
            </button>
          </div>
        </div>

        <div className={`mt-5 border-t pt-4 ${hairline}`}>
          <p id="lead-pipeline" className={`mb-2 text-xs font-medium ${muted}`}>{t.changeStatus}</p>
          <div role="group" aria-labelledby="lead-pipeline" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-1">
            {(STATUSES ?? []).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={lead.status === s}
                onClick={() => lead.status !== s && changeStatus(s)}
                className={`inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full border px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.ring} ${lead.status === s ? `border-transparent ${accent.soft}` : `${hairline} ${text.body} ${hoverBg}`}`}
              >
                {t[`s_${s}`]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title={t.overview} delay={80}>
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Item label={t.email}><a href={`mailto:${lead.email}`} className={link}><Ltr>{lead.email}</Ltr></a></Item>
              <Item label={t.phone}>
                {lead.phone ? <a href={`tel:${lead.phone.replace(/\s/g, "")}`} className={link}><Ltr>{lead.phone}</Ltr></a> : "—"}
              </Item>
              <Item label={t.company}>{lead.company || "—"}</Item>
              <Item label={t.source}>{t[`src_${lead.source}`]}</Item>
              <Item label={t.value}>{fmt.money.format(lead.value)}</Item>
              <Item label={t.created}>
                <time dateTime={lead.createdAt}>{fmt.fromNow(lead.createdAt)} · {fmt.date.format(new Date(lead.createdAt))}</time>
              </Item>
            </dl>
          </Card>

          <Card title={t.notes} delay={160}>
            <label htmlFor="lead-notes" className="sr-only">{t.notes}</label>
            <textarea
              id="lead-notes"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.notesPlaceholder}
              className={textarea}
            />
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" disabled={notes === lead.notes} onClick={() => setNotes(lead.notes)} className={`${button.base} ${button.secondary}`}>{t.discard}</button>
              <button type="button" disabled={notes.trim() === lead.notes} onClick={saveNotes} className={`${button.base} ${button.primary}`}>{t.saveNotes}</button>
            </div>
          </Card>
        </div>

        <Card title={t.activity} delay={240} className="self-start">
          <ol>
            {events.map((ev, i) => (
              <li key={`${ev.type}-${ev.at}-${i}`} className="relative pb-5 ps-6 last:pb-0">
                <span aria-hidden="true" className="absolute start-0 top-1.5 size-2.5 rounded-full bg-neutral-300 ring-4 ring-white dark:bg-neutral-600 dark:ring-neutral-900" />
                {i < events.length - 1 && <span aria-hidden="true" className="absolute bottom-0 start-[4.5px] top-4 w-px bg-neutral-200 dark:bg-neutral-800" />}
                <p className="text-sm">{ev.type === "status" ? t.evStatus(t[`s_${ev.from}`], t[`s_${ev.to}`]) : t.evCreated}</p>
                <time dateTime={ev.at} title={fmt.date.format(new Date(ev.at))} className={`text-xs ${muted}`}>{fmt.fromNow(ev.at)}</time>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <LeadModals modal={modal} onClose={() => setModal(null)} leads={leads} t={t} onSave={handleSave} onDelete={handleDelete} />
    </div>
  );
}