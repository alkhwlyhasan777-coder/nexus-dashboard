// import { useId } from "react";
// import useElementWidth from "../../hooks/useElementWidth";
// import "./motion.css";
// import Icon from "../layout/navbar/Icon";
// import IconButton from "../layout/navbar/IconButton";
// import { field, focusRing, hairline, muted } from "./tokens";

// /*
//   Responsive data table. It adapts to the width it actually gets (so it reacts to the sidebar).

//   columns   [{ id, header, cell(row), min?, sortable?, align?: "end", hideHeader? }]
//             `min` = narrowest table width (px) at which the column is still shown
//   rows      array of row objects          rowKey(row) -> unique key
//   sort      { id, dir: "asc" | "desc" }   onSort(columnId) -> toggles / changes the sort
//   renderCard(row)    card layout, used for the grid view and when the table is too narrow
//   layout    "auto"  table that turns into a list of cards below `cardBelow` px   (default)
//             "cards" always a grid of cards (1, 2 or 3 columns depending on the width)
//   labels    { sortBy, toggleDirection }   label  accessible table name
// */
// export default function DataTable({
//   columns, rows, rowKey, sort, onSort,onRowClick, renderCard, layout = "auto", cardBelow = 540, label, labels,
// }) {
//   const [ref, width] = useElementWidth();
//   const selectId = useId();
//   const gridMode = layout === "cards";
//   const asCards = gridMode || (width > 0 && width < cardBelow);
//   const visible = columns.filter((c) => width === 0 || width >= (c.min ?? 0));
//   const sortable = columns.filter((c) => c.sortable);
//   const columnsInGrid = width >= 1000 ? 3 : width >= 640 ? 2 : 1;
//   const divider = "divide-y divide-neutral-200 dark:divide-neutral-800";

//   return (
//     <div ref={ref}>
//       {asCards ? (
//         <>
//           {sortable.length > 0 && (
//             <div className={`flex items-center gap-2 border-b px-4 py-3 ${hairline}`}>
//               <label htmlFor={selectId} className="sr-only">{labels.sortBy}</label>
//               <select id={selectId} value={sort.id} onChange={(e) => onSort(e.target.value)} className={`${field} flex-1 sm:max-w-xs sm:flex-none`}>
//                 {sortable.map((c) => <option key={c.id} value={c.id}>{c.header}</option>)}
//               </select>
//               <IconButton variant="outline" label={labels.toggleDirection} onClick={() => onSort(sort.id)}>
//                 <Icon name={sort.dir === "asc" ? "arrowUp" : "arrowDown"} size={16} />
//               </IconButton>
//             </div>
//           )}
//           {gridMode ? (
//             <ul aria-label={label} className="grid gap-3 p-4" style={{ gridTemplateColumns: `repeat(${columnsInGrid}, minmax(0, 1fr))` }}>
//               {rows.map((row, i) => (
//                 <li
//                   key={rowKey(row)}
//                   className={`anim-row overflow-hidden rounded-xl border bg-neutral-50/60 transition-colors hover:border-neutral-300 dark:bg-neutral-950/40 dark:hover:border-neutral-700 ${hairline}`}
//                   style={{ "--delay": `${i * 35}ms` }}
//                 >
//                   {renderCard(row)}
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <ul aria-label={label} className={divider}>
//               {rows.map((row, i) => (
//                 <li key={rowKey(row)} className="anim-row" style={{ "--delay": `${i * 35}ms` }}>
//                   {renderCard(row)}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </>
//       ) : (
//         <div className="overflow-x-auto">
//           <table aria-label={label} className="w-full border-collapse text-sm">
//             <thead>
//               <tr className={`border-b bg-neutral-50/70 dark:bg-neutral-950/30 ${hairline}`}>
//                 {visible.map((c) => {
//                   const active = sort?.id === c.id;
//                   const ariaSort = c.sortable ? (active ? (sort.dir === "asc" ? "ascending" : "descending") : "none") : undefined;
//                   return (
//                     <th
//                       key={c.id}
//                       scope="col"
//                       aria-sort={ariaSort}
//                       className={`whitespace-nowrap px-4 py-3 text-xs font-medium ${muted} ${c.align === "end" ? "text-end" : "text-start"}`}
//                     >
//                       {c.hideHeader ? (
//                         <span className="sr-only">{c.header}</span>
//                       ) : c.sortable ? (
//                         <button
//                           type="button"
//                           onClick={() => onSort(c.id)}
//                           className={`group inline-flex items-center gap-1 rounded-md ${focusRing} ${active ? "text-neutral-900 dark:text-neutral-100" : ""}`}
//                         >
//                           {c.header}
//                           <Icon
//                             name={active ? (sort.dir === "asc" ? "chevronUp" : "chevronDown") : "sort"}
//                             size={14}
//                             className={active ? "" : "opacity-40 group-hover:opacity-100"}
//                           />
//                         </button>
//                       ) : (
//                         c.header
//                       )}
//                     </th>
//                   );
//                 })}
//               </tr>
//             </thead>
//             <tbody className={divider}>
//               {rows.map((row, i) => (
//                 <tr
//                   key={rowKey(row)}
//                   className="anim-row transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
//                   style={{ "--delay": `${i * 35}ms` }}
//                 >
//                   {visible.map((c) => (
//                     <td key={c.id} className={`whitespace-nowrap px-4 py-3 align-middle ${c.align === "end" ? "text-end" : "text-start"}`}>
//                       {c.cell(row)}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }


import { useId } from "react";
import useElementWidth from "../../hooks/useElementWidth";
import "./motion.css";
import Icon from "../layout/navbar/Icon";
import IconButton from "../layout/navbar/IconButton";
import { field, focusRing, hairline, muted } from "./tokens";

/*
  Responsive data table. It adapts to the width it actually gets (so it reacts to the sidebar).

  columns   [{ id, header, cell(row), min?, sortable?, align?: "end", hideHeader? }]
            `min` = narrowest table width (px) at which the column is still shown
  rows      array of row objects          rowKey(row) -> unique key
  sort      { id, dir: "asc" | "desc" }
  onSort(columnId) -> toggles / changes the sort
  onRowClick(row)  -> opens row details
  renderCard(row)  card layout
  layout    "auto" | "cards"
  labels    { sortBy, toggleDirection }
*/

export default function DataTable({
  columns,
  rows,
  rowKey,
  sort,
  onSort,
  onRowClick,
  renderCard,
  layout = "auto",
  cardBelow = 540,
  label,
  labels,
}) {
  const [ref, width] = useElementWidth();
  const selectId = useId();

  const gridMode = layout === "cards";
  const asCards = gridMode || (width > 0 && width < cardBelow);

  const visible = columns.filter(
    (c) => width === 0 || width >= (c.min ?? 0)
  );

  const sortable = columns.filter((c) => c.sortable);

  const columnsInGrid = width >= 1000 ? 3 : width >= 640 ? 2 : 1;

  const divider = "divide-y divide-neutral-200 dark:divide-neutral-800";

  // Prevent Edit / Delete buttons from opening row details
  const stopRowClick = (e) => {
    e.stopPropagation();
  };

  const handleRowKeyDown = (e, row) => {
    // Ignore keyboard events originating from interactive children
    if (e.target !== e.currentTarget) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRowClick(row);
    }
  };

  const rowClickProps = (row) =>
    onRowClick
      ? {
          onClick: () => onRowClick(row),
          onKeyDown: (e) => handleRowKeyDown(e, row),
          tabIndex: 0,
          role: "button",
        }
      : {};

  return (
    <div ref={ref}>
      {asCards ? (
        <>
          {sortable.length > 0 && (
            <div
              className={`flex items-center gap-2 border-b px-4 py-3 ${hairline}`}
            >
              <label htmlFor={selectId} className="sr-only">
                {labels.sortBy}
              </label>

              <select
                id={selectId}
                value={sort.id}
                onChange={(e) => onSort(e.target.value)}
                className={`${field} flex-1 sm:max-w-xs sm:flex-none`}
              >
                {sortable.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.header}
                  </option>
                ))}
              </select>

              <IconButton
                variant="outline"
                label={labels.toggleDirection}
                onClick={() => onSort(sort.id)}
              >
                <Icon
                  name={sort.dir === "asc" ? "arrowUp" : "arrowDown"}
                  size={16}
                />
              </IconButton>
            </div>
          )}

          {gridMode ? (
            <ul
              aria-label={label}
              className="grid gap-3 p-4"
              style={{
                gridTemplateColumns: `repeat(${columnsInGrid}, minmax(0, 1fr))`,
              }}
            >
              {rows.map((row, i) => (
                <li
                  key={rowKey(row)}
                  {...rowClickProps(row)}
                  className={`anim-row overflow-hidden rounded-xl border bg-neutral-50/60 transition-colors hover:border-neutral-300 dark:bg-neutral-950/40 dark:hover:border-neutral-700 ${hairline} ${
                    onRowClick
                      ? "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      : ""
                  }`}
                  style={{ "--delay": `${i * 35}ms` }}
                >
                  {renderCard(row)}
                </li>
              ))}
            </ul>
          ) : (
            <ul aria-label={label} className={divider}>
              {rows.map((row, i) => (
                <li
                  key={rowKey(row)}
                  {...rowClickProps(row)}
                  className={`anim-row ${
                    onRowClick
                      ? "cursor-pointer focus-visible:outline focus-visible:outline-2"
                      : ""
                  }`}
                  style={{ "--delay": `${i * 35}ms` }}
                >
                  {renderCard(row)}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <div className="overflow-x-auto">
          <table
            aria-label={label}
            className="w-full border-collapse text-sm"
          >
            <thead>
              <tr
                className={`border-b bg-neutral-50/70 dark:bg-neutral-950/30 ${hairline}`}
              >
                {visible.map((c) => {
                  const active = sort?.id === c.id;

                  const ariaSort = c.sortable
                    ? active
                      ? sort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                    : undefined;

                  return (
                    <th
                      key={c.id}
                      scope="col"
                      aria-sort={ariaSort}
                      className={`whitespace-nowrap px-4 py-3 text-xs font-medium ${muted} ${
                        c.align === "end" ? "text-end" : "text-start"
                      }`}
                    >
                      {c.hideHeader ? (
                        <span className="sr-only">{c.header}</span>
                      ) : c.sortable ? (
                        <button
                          type="button"
                          onClick={() => onSort(c.id)}
                          className={`group inline-flex items-center gap-1 rounded-md ${focusRing} ${
                            active
                              ? "text-neutral-900 dark:text-neutral-100"
                              : ""
                          }`}
                        >
                          {c.header}

                          <Icon
                            name={
                              active
                                ? sort.dir === "asc"
                                  ? "chevronUp"
                                  : "chevronDown"
                                : "sort"
                            }
                            size={14}
                            className={
                              active
                                ? ""
                                : "opacity-40 group-hover:opacity-100"
                            }
                          />
                        </button>
                      ) : (
                        c.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className={divider}>
              {rows.map((row, i) => (
                <tr
                  key={rowKey(row)}
                  {...rowClickProps(row)}
                  className={`anim-row transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${
                    onRowClick
                      ? "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset"
                      : ""
                  }`}
                  style={{ "--delay": `${i * 35}ms` }}
                >
                  {visible.map((c) => (
                    <td
                      key={c.id}
                      onClick={(e) => {
                        // Keep interactive action cells independent
                        if (
                          e.target.closest(
                            "button, a, input, select, textarea"
                          )
                        ) {
                          stopRowClick(e);
                        }
                      }}
                      className={`whitespace-nowrap px-4 py-3 align-middle ${
                        c.align === "end" ? "text-end" : "text-start"
                      }`}
                    >
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
