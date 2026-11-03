import { useMemo, useState } from "react";
import Icon from "../../components/layout/navbar/Icon";
import { accent, button, card, field, hairline, hoverBg, muted, text } from "../../components/ui/tokens";
import { useUI } from "../../context/UIcontext";

const COPY = {
  en: {
    title: "Automation", subtitle: "Build workflows that keep your team moving while you focus on what matters.",
    create: "Create automation", active: "Active workflows", runs: "Total runs", success: "Success rate", timeSaved: "Time saved",
    all: "All workflows", enabled: "Active", paused: "Paused", search: "Search automations...",
    trigger: "When this happens", action: "Then do this", name: "Workflow name", description: "Description",
    triggerLead: "A new lead is created", triggerStage: "A deal changes stage", triggerTask: "A task becomes overdue",
    triggerCustomer: "A customer is created", actionTask: "Create a follow-up task", actionEmail: "Send an email notification",
    actionStage: "Update deal stage", actionAssign: "Assign to a team member",
    save: "Save workflow", cancel: "Cancel", edit: "Edit", delete: "Delete", pause: "Pause", activate: "Activate",
    noResults: "No workflows found", empty: "Your automation workspace is ready", emptyHint: "Create your first workflow to automate repetitive work.",
    runsLabel: "runs", updated: "Updated just now", confirmDelete: "Delete this workflow?",
    activity: "Recent activity", activityHint: "Latest workflow executions", workflow: "Workflow",
    status: "Status", lastRun: "Last run", never: "Never", justNow: "Just now", minutes: " min ago",
    draft: "Draft", live: "Live", howItWorks: "How automation works",
    step1: "Choose a trigger", step1d: "Select the event that starts your workflow.",
    step2: "Add an action", step2d: "Choose what Nexus should do automatically.",
    step3: "Turn it on", step3d: "Activate the workflow and track every run.",
    sample1: "Welcome new leads", sample1d: "Create a follow-up task when a new lead arrives.",
    sample2: "Deal stage follow-up", sample2d: "Notify the owner when a deal moves to negotiation.",
    sample3: "Overdue task reminder", sample3d: "Send a reminder when a task passes its due date.",
    sample4: "New customer onboarding", sample4d: "Assign an onboarding task when a customer is added.",
    lead: "New lead created", stage: "Deal stage changed", overdue: "Task overdue", customer: "New customer",
    createTask: "Create follow-up task", notify: "Send notification", updateStage: "Update deal stage", assign: "Assign owner",
    justCreated: "Workflow created", saved: "Workflow saved", removed: "Workflow deleted",
  },
  ar: {
    title: "الأتمتة", subtitle: "أنشئ تدفقات عمل تنجز المهام المتكررة تلقائيًا وتمنح فريقك وقتًا أكبر للتركيز.",
    create: "إنشاء أتمتة", active: "التدفقات النشطة", runs: "إجمالي التشغيلات", success: "معدل النجاح", timeSaved: "الوقت المُوفّر",
    all: "كل التدفقات", enabled: "نشطة", paused: "متوقفة", search: "ابحث عن أتمتة...",
    trigger: "عند حدوث هذا", action: "نفّذ هذا الإجراء", name: "اسم التدفق", description: "الوصف",
    triggerLead: "إضافة عميل محتمل جديد", triggerStage: "تغيير مرحلة صفقة", triggerTask: "تجاوز موعد مهمة",
    triggerCustomer: "إضافة عميل جديد", actionTask: "إنشاء مهمة متابعة", actionEmail: "إرسال إشعار بالبريد",
    actionStage: "تحديث مرحلة الصفقة", actionAssign: "تعيين عضو بالفريق",
    save: "حفظ التدفق", cancel: "إلغاء", edit: "تعديل", delete: "حذف", pause: "إيقاف", activate: "تفعيل",
    noResults: "لا توجد تدفقات مطابقة", empty: "مساحة الأتمتة جاهزة", emptyHint: "أنشئ أول تدفق عمل لأتمتة المهام المتكررة.",
    runsLabel: "تشغيلات", updated: "تم التحديث الآن", confirmDelete: "هل تريد حذف هذا التدفق؟",
    activity: "النشاط الأخير", activityHint: "أحدث عمليات تشغيل التدفقات", workflow: "التدفق",
    status: "الحالة", lastRun: "آخر تشغيل", never: "لم يعمل بعد", justNow: "الآن", minutes: " دقيقة مضت",
    draft: "مسودة", live: "يعمل", howItWorks: "كيف تعمل الأتمتة؟",
    step1: "اختر محفزًا", step1d: "حدد الحدث الذي يبدأ تدفق العمل.",
    step2: "أضف إجراءً", step2d: "اختر ما سينفذه Nexus تلقائيًا.",
    step3: "فعّل التدفق", step3d: "شغّل التدفق وتابع جميع عمليات التنفيذ.",
    sample1: "الترحيب بالعملاء المحتملين", sample1d: "إنشاء مهمة متابعة عند وصول عميل محتمل جديد.",
    sample2: "متابعة مرحلة الصفقة", sample2d: "إخطار المسؤول عند انتقال الصفقة إلى التفاوض.",
    sample3: "تذكير بالمهام المتأخرة", sample3d: "إرسال تذكير عند تجاوز موعد المهمة.",
    sample4: "تهيئة العملاء الجدد", sample4d: "تعيين مهمة تهيئة عند إضافة عميل جديد.",
    lead: "إضافة عميل محتمل", stage: "تغيير مرحلة صفقة", overdue: "تأخر مهمة", customer: "إضافة عميل",
    createTask: "إنشاء مهمة متابعة", notify: "إرسال إشعار", updateStage: "تحديث مرحلة الصفقة", assign: "تعيين المسؤول",
    justCreated: "تم إنشاء التدفق", saved: "تم حفظ التعديلات", removed: "تم حذف التدفق",
  },
};
const TRIGGERS = ["lead", "stage", "overdue", "customer"];
const ACTIONS = ["createTask", "notify", "updateStage", "assign"];
const SEED = [
  { id: "auto-1", nameKey: "sample1", descriptionKey: "sample1d", trigger: "lead", action: "createTask", enabled: true, runs: 128, lastRun: "justNow" },
  { id: "auto-2", nameKey: "sample2", descriptionKey: "sample2d", trigger: "stage", action: "notify", enabled: true, runs: 86, lastRun: "minutes" },
  { id: "auto-3", nameKey: "sample3", descriptionKey: "sample3d", trigger: "overdue", action: "notify", enabled: false, runs: 42, lastRun: "minutes" },
  { id: "auto-4", nameKey: "sample4", descriptionKey: "sample4d", trigger: "customer", action: "assign", enabled: true, runs: 64, lastRun: "minutes" },
];
const STORAGE_KEY = "nexus:automations";
function readWorkflows() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : SEED;
  } catch { return SEED; }
}
const IconBadge = ({ name, tone = "orange" }) => (
  <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone === "blue" ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" : tone === "green" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"}`}>
    <Icon name={name} size={18} />
  </span>
);
export default function Automation() {
  const { lang } = useUI();
  const t = COPY[lang] || COPY.en;
  const [workflows, setWorkflows] = useState(readWorkflows);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [draft, setDraft] = useState({ name: "", description: "", trigger: "lead", action: "createTask" });
  const [notice, setNotice] = useState("");
  const saveList = (next) => {
    setWorkflows(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };
  const activeCount = workflows.filter((item) => item.enabled).length;
  const totalRuns = workflows.reduce((sum, item) => sum + item.runs, 0);
  const filtered = useMemo(() => workflows.filter((item) => {
    const label = t[item.nameKey] || item.name || "";
    const matchesQuery = `${label} ${item.description || t[item.descriptionKey] || ""}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (filter === "all" || (filter === "enabled" ? item.enabled : !item.enabled));
  }), [workflows, filter, query, t]);
  const openCreate = () => { setDraft({ name: "", description: "", trigger: "lead", action: "createTask" }); setModal({ type: "create" }); };
  const openEdit = (item) => { setDraft({ name: item.name || t[item.nameKey], description: item.description || t[item.descriptionKey], trigger: item.trigger, action: item.action }); setModal({ type: "edit", id: item.id }); };
  const submit = (event) => {
    event.preventDefault();
    if (!draft.name.trim()) return;
    const next = modal.type === "edit"
      ? workflows.map((item) => item.id === modal.id ? { ...item, name: draft.name.trim(), description: draft.description.trim(), nameKey: null, descriptionKey: null, trigger: draft.trigger, action: draft.action } : item)
      : [{ id: `auto-${Date.now()}`, name: draft.name.trim(), description: draft.description.trim(), nameKey: null, descriptionKey: null, trigger: draft.trigger, action: draft.action, enabled: false, runs: 0, lastRun: null }, ...workflows];
    saveList(next);
    setModal(null);
    setNotice(modal.type === "edit" ? t.saved : t.justCreated);
    window.setTimeout(() => setNotice(""), 2600);
  };
  const toggle = (id) => saveList(workflows.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item));
  const remove = (id) => {
    if (!window.confirm(t.confirmDelete)) return;
    saveList(workflows.filter((item) => item.id !== id));
    setNotice(t.removed);
    window.setTimeout(() => setNotice(""), 2600);
  };
  const triggerLabel = (key) => t[{ lead: "lead", stage: "stage", overdue: "overdue", customer: "customer" }[key]];
  const actionLabel = (key) => t[{ createTask: "createTask", notify: "notify", updateStage: "updateStage", assign: "assign" }[key]];
  const filters = [{ id: "all", label: t.all, count: workflows.length }, { id: "enabled", label: t.enabled, count: activeCount }, { id: "paused", label: t.paused, count: workflows.length - activeCount }];
  const stats = [
    { label: t.active, value: activeCount, hint: `${workflows.length} ${lang === "ar" ? "إجمالي التدفقات" : "total workflows"}`, icon: "automation", tone: "orange" },
    { label: t.runs, value: totalRuns.toLocaleString(lang === "ar" ? "ar-EG" : "en-US"), hint: lang === "ar" ? "عبر جميع التدفقات" : "Across all workflows", icon: "activity", tone: "blue" },
    { label: t.success, value: "98.4%", hint: lang === "ar" ? "آخر 30 يومًا" : "Last 30 days", icon: "check", tone: "green" },
    { label: t.timeSaved, value: lang === "ar" ? "12.5 س" : "12.5 hrs", hint: lang === "ar" ? "وقت مقدّر تم توفيره" : "Estimated time saved", icon: "clock", tone: "orange" },
  ];
  return (
    <div className="space-y-6">
      <div className="anim-fade-up flex flex-wrap items-end justify-between gap-3">
        <div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-500/10 dark:text-orange-300"><Icon name="automation" size={14}/>{lang === "ar" ? "مركز تدفقات العمل" : "Workflow center"}</div><h1 className="text-2xl font-semibold">{t.title}</h1><p className={`mt-1 max-w-2xl text-sm ${muted}`}>{t.subtitle}</p></div>
        <button type="button" onClick={openCreate} className={`${button.base} ${button.primary}`}><Icon name="plus" size={16}/>{t.create}</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => <section key={stat.label} className={`${card} anim-fade-up flex items-center gap-3 p-4`} style={{ "--delay": `${index * 60}ms` }}><IconBadge name={stat.icon} tone={stat.tone}/><div className="min-w-0"><p className={`text-xs ${muted}`}>{stat.label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{stat.value}</p><p className={`mt-0.5 text-[11px] ${muted}`}>{stat.hint}</p></div></section>)}
      </div>
      <section className={`${card} overflow-hidden`}>
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center" style={{ borderColor: "var(--hairline, currentColor)" }}>
          <div className="relative min-w-0 flex-1 sm:max-w-xs"><Icon name="search" size={15} className={`pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 ${muted}`}/><input value={query} onChange={(e) => setQuery(e.target.value)} className={`${field} ps-9`} placeholder={t.search} aria-label={t.search}/></div>
          <div className="flex gap-1.5 overflow-x-auto">{filters.map((item) => <button key={item.id} type="button" onClick={() => setFilter(item.id)} aria-pressed={filter === item.id} className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${filter === item.id ? `border-transparent ${accent.soft}` : `${hairline} ${text.body} ${hoverBg}`}`}>{item.label}<span className="text-xs opacity-60">{item.count}</span></button>)}</div>
        </div>
        {filtered.length === 0 ? <div className="flex flex-col items-center px-4 py-14 text-center"><IconBadge name="automation"/><p className="mt-3 font-semibold">{workflows.length ? t.noResults : t.empty}</p><p className={`mt-1 text-sm ${muted}`}>{t.emptyHint}</p><button type="button" onClick={openCreate} className={`mt-4 ${button.base} ${button.primary}`}><Icon name="plus" size={15}/>{t.create}</button></div> : <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {filtered.map((item) => <article key={item.id} className="flex flex-col gap-3 p-4 transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30 sm:flex-row sm:items-center">
            <IconBadge name={item.trigger === "lead" ? "leads" : item.trigger === "stage" ? "deals" : item.trigger === "customer" ? "customers" : "alert"} tone={item.enabled ? "green" : "orange"}/>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{item.name || t[item.nameKey]}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.enabled ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"}`}>{item.enabled ? t.live : t.draft}</span></div><p className={`mt-1 truncate text-sm ${muted}`}>{item.description || t[item.descriptionKey]}</p><div className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${muted}`}><span className="inline-flex items-center gap-1"><Icon name="zap" size={12}/>{triggerLabel(item.trigger)}</span><Icon name="arrowRight" size={12}/><span>{actionLabel(item.action)}</span><span>· {item.runs} {t.runsLabel}</span></div></div>
            <div className="flex items-center justify-between gap-3 sm:justify-end"><div className="text-end"><p className={`text-xs ${muted}`}>{t.lastRun}</p><p className="mt-1 text-xs font-medium">{item.lastRun === "justNow" ? t.justNow : item.lastRun === "minutes" ? (lang === "ar" ? "15 دقيقة مضت" : "15 min ago") : t.never}</p></div><button type="button" role="switch" aria-checked={item.enabled} aria-label={item.enabled ? t.pause : t.activate} onClick={() => toggle(item.id)} className={`relative h-6 w-11 rounded-full transition-colors ${item.enabled ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-700"}`}><span className={`absolute top-1 size-4 rounded-full bg-white shadow transition-transform ${item.enabled ? "start-6" : "start-1"}`}/></button><div className="flex items-center"><button type="button" onClick={() => openEdit(item)} aria-label={t.edit} title={t.edit} className={`grid size-9 place-items-center rounded-lg ${hoverBg}`}><Icon name="edit" size={15}/></button><button type="button" onClick={() => remove(item.id)} aria-label={t.delete} title={t.delete} className="grid size-9 place-items-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"><Icon name="trash" size={15}/></button></div></div>
          </article>)}
        </div>}
      </section>
      <section className={`${card} p-4 sm:p-5`}><div className="mb-4"><h2 className="font-semibold">{t.howItWorks}</h2><p className={`mt-1 text-sm ${muted}`}>{lang === "ar" ? "ثلاث خطوات بسيطة لبناء تدفق عمل." : "Three simple steps to build a workflow."}</p></div><div className="grid gap-4 md:grid-cols-3">{[["zap",t.step1,t.step1d],["workflow",t.step2,t.step2d],["play",t.step3,t.step3d]].map(([icon,title,desc],index)=><div key={title} className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"><Icon name={icon} size={17}/></span><div><p className="text-sm font-semibold">{index+1}. {title}</p><p className={`mt-1 text-xs leading-5 ${muted}`}>{desc}</p></div></div>)}</div></section>
      {notice && <div role="status" className="fixed bottom-5 end-5 z-50 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white shadow-xl dark:bg-white dark:text-neutral-900">{notice}</div>}
      {modal && <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(null); }}><form onSubmit={submit} className={`my-auto w-full max-w-lg space-y-4 rounded-2xl border p-5 shadow-2xl ${card}`}><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{modal.type === "edit" ? t.edit : t.create}</h2><button type="button" onClick={() => setModal(null)} className={`grid size-8 place-items-center rounded-lg ${hoverBg}`} aria-label={t.cancel}><Icon name="x" size={18}/></button></div><label className="block space-y-1.5"><span className="text-sm font-medium">{t.name}</span><input required maxLength={70} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={field} placeholder={t.name}/></label><label className="block space-y-1.5"><span className="text-sm font-medium">{t.description}</span><textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={`${field} resize-y`} placeholder={t.description}/></label><div className="grid gap-4 sm:grid-cols-2"><label className="block space-y-1.5"><span className="text-sm font-medium">{t.trigger}</span><select value={draft.trigger} onChange={(e) => setDraft({ ...draft, trigger: e.target.value })} className={field}>{TRIGGERS.map((key) => <option key={key} value={key}>{triggerLabel(key)}</option>)}</select></label><label className="block space-y-1.5"><span className="text-sm font-medium">{t.action}</span><select value={draft.action} onChange={(e) => setDraft({ ...draft, action: e.target.value })} className={field}>{ACTIONS.map((key) => <option key={key} value={key}>{actionLabel(key)}</option>)}</select></label></div><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setModal(null)} className={`${button.base} ${button.secondary}`}>{t.cancel}</button><button type="submit" className={`${button.base} ${button.primary}`}><Icon name="check" size={15}/>{t.save}</button></div></form></div>}
    </div>
  );
}
