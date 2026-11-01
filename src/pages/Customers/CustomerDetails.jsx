import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icon from "../../components/layout/navbar/Icon";
import { LANGS } from "../../components/ui/Sidebar";
import { accent, button, card, hairline, muted } from "../../components/ui/tokens";
import { useUI } from "../../context/UIcontext";
import { makeFormatters } from "./customers.data";
import { T } from "./customers.i18n";
import { StatusBadge } from "./customerTable.jsx";
import useCustomers from "./useCustomers";

function DetailItem({ icon, label, value, href, dir }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${accent.soft}`}><Icon name={icon} size={16} /></span>
      <div className="min-w-0">
        <p className={`text-xs ${muted}`}>{label}</p>
        {href ? <a href={href} dir={dir} className="mt-1 block truncate text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">{value}</a> : <p dir={dir} className="mt-1 truncate text-sm font-medium">{value || "—"}</p>}
      </div>
    </div>
  );
}

function Metric({ icon, label, value, hint }) {
  return (
    <div className={`rounded-xl border p-4 ${hairline}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-sm ${muted}`}>{label}</span>
        <Icon name={icon} size={17} className={muted} />
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className={`mt-1 text-xs ${muted}`}>{hint}</p>}
    </div>
  );
}

export default function CustomerDetails() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { lang } = useUI();
  const { locale } = LANGS[lang];
  const t = T[lang];
  const fmt = useMemo(() => makeFormatters(locale), [locale]);
  const { customers } = useCustomers();
  const customer = customers.find((item) => item.id === customerId);

  if (!customer) {
    return (
      <section className={`${card} mx-auto flex max-w-xl flex-col items-center p-8 text-center`}>
        <span className={`grid size-14 place-items-center rounded-full ${accent.soft}`}><Icon name="customers" size={24} /></span>
        <h1 className="mt-4 text-xl font-semibold">{t.notFoundTitle}</h1>
        <p className={`mt-2 text-sm ${muted}`}>{t.notFoundBody}</p>
        <button type="button" onClick={() => navigate("/customers")} className={`mt-5 ${button.base} ${button.primary}`}>{t.backCustomers}</button>
      </section>
    );
  }

  const initials = customer.name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const average = customer.orders > 0 ? customer.spent / customer.orders : 0;
  const joinedDate = fmt.date.format(new Date(customer.joined));
  const phoneHref = customer.phone ? `tel:${customer.phone.replace(/[^+\d]/g, "")}` : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/customers" className={`inline-flex items-center gap-1.5 text-sm ${muted} hover:text-neutral-900 dark:hover:text-white`}>
            <Icon name="chevronLeft" size={15} className="rtl:rotate-180" />{t.backCustomers}
          </Link>
          <h1 className="mt-3 text-2xl font-semibold">{t.customerDetails}</h1>
          <p className={`mt-1 text-sm ${muted}`}>{t.customerDetailsSubtitle}</p>
        </div>
        <button type="button" onClick={() => navigate("/customers", { state: { editCustomerId: customer.id } })} className={`${button.base} ${button.secondary}`}>
          <Icon name="edit" size={15} />{t.edit}
        </button>
      </div>

      <section className={`${card} overflow-hidden`}>
        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-blue-600 text-xl font-semibold text-white">{initials}</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">{customer.name}</h2>
              <StatusBadge status={customer.status} label={t[customer.status]} />
            </div>
            <p className={`mt-1 text-sm ${muted}`}>{customer.company || t.noCompany}</p>
            <p className={`mt-1 text-xs ${muted}`}>{t.customerSince} {joinedDate}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {customer.email && <a href={`mailto:${customer.email}`} className={`${button.base} ${button.secondary}`}><Icon name="email" size={15} />{t.emailAction}</a>}
            {customer.phone && <a href={phoneHref} className={`${button.base} ${button.secondary}`}><Icon name="phone" size={15} />{t.callAction}</a>}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon="customers" label={t.totalOrders} value={fmt.nf.format(customer.orders)} hint={t.ordersMetricHint} />
        <Metric icon="revenue" label={t.totalSpent} value={fmt.money.format(customer.spent)} hint={t.spentMetricHint} />
        <Metric icon="analytics" label={t.averageOrder} value={fmt.money.format(average)} hint={t.averageOrderHint} />
        <Metric icon="calendar" label={t.customerSince} value={joinedDate} hint={fmt.fromNow(customer.joined)} />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={`${card} p-5 sm:p-6`}>
          <div className="mb-5 flex items-center gap-2"><Icon name="customers" size={18} /><h2 className="font-semibold">{t.contactInformation}</h2></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <DetailItem icon="email" label={t.email} value={customer.email} href={customer.email ? `mailto:${customer.email}` : undefined} dir="ltr" />
            <DetailItem icon="phone" label={t.phone} value={customer.phone} href={phoneHref} dir="ltr" />
            <DetailItem icon="deals" label={t.company} value={customer.company} />
            <DetailItem icon="pipeline" label={t.country} value={fmt.region(customer.country)} />
          </div>
        </section>

        <section className={`${card} p-5 sm:p-6`}>
          <div className="mb-5 flex items-center gap-2"><Icon name="activity" size={18} /><h2 className="font-semibold">{t.customerActivity}</h2></div>
          <div className="relative ms-2 border-s border-neutral-200 pb-1 dark:border-neutral-700">
            <div className="relative pb-5 ps-6">
              <span className="absolute -start-[7px] top-1 size-3 rounded-full border-2 border-white bg-emerald-500 dark:border-neutral-900" />
              <p className="text-sm font-medium">{t.customerAdded}</p>
              <p className={`mt-1 text-xs ${muted}`}>{t.customerAddedHint}</p>
              <time dateTime={customer.joined} className={`mt-2 block text-xs ${muted}`}>{joinedDate}</time>
            </div>
            <div className="relative ps-6">
              <span className="absolute -start-[7px] top-1 size-3 rounded-full border-2 border-white bg-blue-500 dark:border-neutral-900" />
              <p className="text-sm font-medium">{t.customerStatus}</p>
              <p className={`mt-1 text-xs ${muted}`}>{t.status}: {t[customer.status]}</p>
            </div>
          </div>
          <p className={`mt-5 rounded-lg bg-neutral-50 p-3 text-xs leading-5 ${muted} dark:bg-neutral-800/60`}>{t.activityDataNote}</p>
        </section>
      </div>
      <p className={`text-xs ${muted}`}>{t.customerId}: <bdi dir="ltr">{customer.id}</bdi></p>
    </div>
  );
}
