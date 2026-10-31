import Icon from "../layout/navbar/Icon";
import { accent, button, hairline, hoverBg, muted, text } from "./tokens";

const windowPages = (page, count, size = 5) => {
  const start = Math.max(1, Math.min(page - 2, count - size + 1));
  return Array.from({ length: Math.min(size, count) }, (_, i) => start + i);
};

/*
  t: { pagination, showing(from, to, total), prev, next, pageOf(page, count) }
  format: number formatter (e.g. Intl.NumberFormat#format) so digits match the language
*/
export default function Pagination({ page, pageCount, total, pageSize, onPage, format = String, t }) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const nav = `${button.base} ${button.secondary} px-2.5 sm:px-3.5`;

  return (
    <nav aria-label={t.pagination} className={`flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${hairline}`}>
      <p className={`text-sm ${muted}`}>{t.showing(format(from), format(to), format(total))}</p>
      <div className="flex items-center justify-between gap-1 sm:justify-end">
        <button type="button" className={nav} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label={t.prev}>
          <Icon name="chevronLeft" size={14} className="rtl:rotate-180" />
          <span className="hidden sm:inline">{t.prev}</span>
        </button>

        <span className={`px-2 text-sm md:hidden ${muted}`}>{t.pageOf(format(page), format(pageCount))}</span>
        <ul className="hidden items-center gap-1 md:flex">
          {windowPages(page, pageCount).map((p) => (
            <li key={p}>
              <button
                type="button"
                onClick={() => onPage(p)}
                aria-current={p === page ? "page" : undefined}
                className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium tabular-nums transition-colors duration-200 ${p === page ? accent.soft : `${text.body} ${hoverBg}`}`}
              >
                {format(p)}
              </button>
            </li>
          ))}
        </ul>

        <button type="button" className={nav} disabled={page >= pageCount} onClick={() => onPage(page + 1)} aria-label={t.next}>
          <span className="hidden sm:inline">{t.next}</span>
          <Icon name="chevron" size={14} className="rtl:rotate-180" />
        </button>
      </div>
    </nav>
  );
}