import { useMemo } from "react";
import "../../components/ui/motion.css";
import ChartCanvas from "../../components/ui/ChartCanvas";
import { card, chartColors, muted } from "../../components/ui/tokens";
import useDarkMode from "../../hooks/useDarkMode";
import { countByStatus, monthlyNew, STATUSES, topCountries } from "./customers.data";

/* Draws the total in the middle of the doughnut (reads its text/colors from chart options) */
const centerText = {
  id: "centerText",
  afterDraw(chart, _args, opts) {
    if (!opts?.text) return;
    const { ctx, chartArea: { left, right, top, bottom } } = chart;
    const x = (left + right) / 2;
    const y = (top + bottom) / 2;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = opts.color;
    ctx.font = "600 26px Inter, system-ui, sans-serif";
    ctx.fillText(opts.text, x, y - 6);
    ctx.fillStyle = opts.subColor;
    ctx.font = "12px Inter, system-ui, sans-serif";
    ctx.fillText(opts.sub, x, y + 16);
    ctx.restore();
  },
};
const DOUGHNUT_PLUGINS = [centerText];

function ChartCard({ title, hint, className = "", delay = 0, children }) {
  return (
    <section className={`${card} anim-fade-up p-4 ${className}`} style={{ "--delay": `${delay}ms` }}>
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className={`text-xs ${muted}`}>{hint}</p>
      <div className="mt-4 h-64">{children}</div>
    </section>
  );
}

export default function CustomerCharts({ customers, fmt, t, dir }) {
  const dark = useDarkMode();
  const rtl = dir === "rtl";

  const theme = useMemo(() => {
    const tick = dark ? "#a3a3a3" : "#737373";
    return {
      tick,
      grid: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
      text: dark ? "#f5f5f5" : "#171717",
      dir: rtl ? "rtl" : "ltr",
    };
  }, [dark, rtl]);

  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Options shared by the line and bar charts. Axes mirror in RTL. */
  const axisOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: reduce ? 0 : 900, easing: "easeOutQuart" },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: { rtl, textDirection: theme.dir, padding: 10, cornerRadius: 8 },
    },
    scales: {
      x: { reverse: rtl, grid: { display: false }, border: { display: false }, ticks: { color: theme.tick } },
      y: {
        position: rtl ? "right" : "left", beginAtZero: true, border: { display: false },
        grid: { color: theme.grid }, ticks: { color: theme.tick, precision: 0 },
      },
    },
  }), [rtl, theme, reduce]);

  /* 1. New customers per month (line) */
  const growthData = useMemo(() => {
    const months = monthlyNew(customers, 12);
    return {
      labels: months.map((m) => fmt.month.format(m.date)),
      datasets: [{
        label: t.customersLabel,
        data: months.map((m) => m.count),
        borderColor: chartColors.primary,
        backgroundColor: (context) => {
          const { chart } = context;
          if (!chart.chartArea) return chartColors.primarySoft;
          const gradient = chart.ctx.createLinearGradient(0, chart.chartArea.top, 0, chart.chartArea.bottom);
          gradient.addColorStop(0, "rgba(59,130,246,0.32)");
          gradient.addColorStop(1, "rgba(59,130,246,0)");
          return gradient;
        },
        fill: true, tension: 0.35, borderWidth: 2, pointRadius: 3, pointHoverRadius: 6,
        pointBackgroundColor: chartColors.primary,
      }],
    };
  }, [customers, fmt, t]);

  /* 2. By status (doughnut) */
  const statusData = useMemo(() => ({
    labels: STATUSES.map((s) => t[s]),
    datasets: [{
      data: countByStatus(customers),
      backgroundColor: [chartColors.positive, chartColors.neutral, chartColors.warning],
      borderWidth: 0, hoverOffset: 6,
    }],
  }), [customers, t]);

  const statusOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    animation: { duration: reduce ? 0 : 1000, easing: "easeOutQuart" },
    plugins: {
      legend: {
        position: "bottom", rtl, textDirection: theme.dir,
        labels: {
          color: theme.tick, usePointStyle: true, boxWidth: 8, padding: 14,
          // "Active · 22" so the numbers are readable without hovering
          generateLabels: (chart) => {
            const dataset = chart.data.datasets[0];
            return chart.data.labels.map((label, i) => ({
              text: `${label} · ${fmt.nf.format(dataset.data[i])}`,
              fillStyle: dataset.backgroundColor[i], strokeStyle: dataset.backgroundColor[i],
              fontColor: theme.tick, pointStyle: "circle", hidden: !chart.getDataVisibility(i), index: i,
            }));
          },
        },
      },
      tooltip: { rtl, textDirection: theme.dir, padding: 10, cornerRadius: 8 },
      centerText: { text: fmt.nf.format(customers.length), sub: t.totalLabel, color: theme.text, subColor: theme.tick },
    },
  }), [customers.length, fmt, t, rtl, theme, reduce]);

  /* 3. Top countries (bar) */
  const countriesData = useMemo(() => {
    const top = topCountries(customers, 6);
    return {
      labels: top.map((c) => fmt.region(c.code)),
      datasets: [{
        label: t.customersLabel,
        data: top.map((c) => c.count),
        backgroundColor: chartColors.primary,
        borderRadius: 6, maxBarThickness: 40,
      }],
    };
  }, [customers, fmt, t]);

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <ChartCard title={t.chartGrowth} hint={t.chartGrowthHint} className="xl:col-span-2" delay={0}>
        <ChartCanvas type="line" data={growthData} options={axisOptions} label={t.growthAlt} />
      </ChartCard>
      <ChartCard title={t.chartStatus} hint={t.customersLabel} delay={80}>
        <ChartCanvas type="doughnut" data={statusData} options={statusOptions} plugins={DOUGHNUT_PLUGINS} label={t.statusAlt} />
      </ChartCard>
      <ChartCard title={t.chartCountries} hint={t.chartCountriesHint} className="xl:col-span-3" delay={160}>
        <ChartCanvas type="bar" data={countriesData} options={axisOptions} label={t.countriesAlt} />
      </ChartCard>
    </div>
  );
}

// import { useMemo } from "react";
// import "../../components/ui/motion.css";
// import ChartCanvas from "../../components/ui/ChartCanvas";
// import { card, chartColors, muted } from "../../components/ui/tokens";
// import useDarkMode from "../../hooks/useDarkMode";
// import { countByStatus, monthlyNew, STATUSES, topCountries } from "./customers.data";

// /* Draws the total in the middle of the doughnut (reads its text/colors from chart options) */
// const centerText = {
//   id: "centerText",
//   afterDraw(chart, _args, opts) {
//     if (!opts?.text) return;
//     const { ctx, chartArea: { left, right, top, bottom } } = chart;
//     const x = (left + right) / 2;
//     const y = (top + bottom) / 2;
//     ctx.save();
//     ctx.textAlign = "center";
//     ctx.textBaseline = "middle";
//     ctx.fillStyle = opts.color;
//     ctx.font = "600 26px Inter, system-ui, sans-serif";
//     ctx.fillText(opts.text, x, y - 6);
//     ctx.fillStyle = opts.subColor;
//     ctx.font = "12px Inter, system-ui, sans-serif";
//     ctx.fillText(opts.sub, x, y + 16);
//     ctx.restore();
//   },
// };
// const DOUGHNUT_PLUGINS = [centerText];

// function ChartCard({ title, hint, className = "", delay = 0, children }) {
//   return (
//     <section className={`${card} anim-fade-up p-4 ${className}`} style={{ "--delay": `${delay}ms` }}>
//       <h2 className="text-sm font-semibold">{title}</h2>
//       <p className={`text-xs ${muted}`}>{hint}</p>
//       <div className="mt-4 h-64">{children}</div>
//     </section>
//   );
// }

// export default function CustomerCharts({ customers, fmt, t, dir }) {
//   const dark = useDarkMode();
//   const rtl = dir === "rtl";

//   const theme = useMemo(() => {
//     const tick = dark ? "#a3a3a3" : "#737373";
//     return {
//       tick,
//       grid: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
//       text: dark ? "#f5f5f5" : "#171717",
//       dir: rtl ? "rtl" : "ltr",
//     };
//   }, [dark, rtl]);

//   const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

//   /* Options shared by the line and bar charts. Axes mirror in RTL. */
//   const axisOptions = useMemo(() => ({
//     responsive: true,
//     maintainAspectRatio: false,
//     animation: { duration: reduce ? 0 : 900, easing: "easeOutQuart" },
//     interaction: { mode: "index", intersect: false },
//     plugins: {
//       legend: { display: false },
//       tooltip: { rtl, textDirection: theme.dir, padding: 10, cornerRadius: 8 },
//     },
//     scales: {
//       x: { reverse: rtl, grid: { display: false }, border: { display: false }, ticks: { color: theme.tick } },
//       y: {
//         position: rtl ? "right" : "left", beginAtZero: true, border: { display: false },
//         grid: { color: theme.grid }, ticks: { color: theme.tick, precision: 0 },
//       },
//     },
//   }), [rtl, theme, reduce]);

//   /* 1. New customers per month (line) */
//   const growthData = useMemo(() => {
//     const months = monthlyNew(customers, 12);
//     return {
//       labels: months.map((m) => fmt.month.format(m.date)),
//       datasets: [{
//         label: t.customersLabel,
//         data: months.map((m) => m.count),
//         borderColor: chartColors.primary,
//         backgroundColor: chartColors.primarySoft,
//         fill: true, tension: 0.35, borderWidth: 2, pointRadius: 3, pointHoverRadius: 6,
//         pointBackgroundColor: chartColors.primary,
//       }],
//     };
//   }, [customers, fmt, t]);

//   /* 2. By status (doughnut) */
//   const statusData = useMemo(() => ({
//     labels: STATUSES.map((s) => t[s]),
//     datasets: [{
//       data: countByStatus(customers),
//       backgroundColor: [chartColors.positive, chartColors.neutral, chartColors.warning],
//       borderWidth: 0, hoverOffset: 6,
//     }],
//   }), [customers, t]);

//   const statusOptions = useMemo(() => ({
//     responsive: true,
//     maintainAspectRatio: false,
//     cutout: "68%",
//     animation: { duration: reduce ? 0 : 1000, easing: "easeOutQuart" },
//     plugins: {
//       legend: { position: "bottom", rtl, textDirection: theme.dir, labels: { color: theme.tick, usePointStyle: true, boxWidth: 8, padding: 14 } },
//       tooltip: { rtl, textDirection: theme.dir, padding: 10, cornerRadius: 8 },
//       centerText: { text: fmt.nf.format(customers.length), sub: t.totalLabel, color: theme.text, subColor: theme.tick },
//     },
//   }), [customers.length, fmt, t, rtl, theme, reduce]);

//   /* 3. Top countries (bar) */
//   const countriesData = useMemo(() => {
//     const top = topCountries(customers, 6);
//     return {
//       labels: top.map((c) => fmt.region(c.code)),
//       datasets: [{
//         label: t.customersLabel,
//         data: top.map((c) => c.count),
//         backgroundColor: chartColors.primary,
//         borderRadius: 6, maxBarThickness: 40,
//       }],
//     };
//   }, [customers, fmt, t]);

//   return (
//     <div className="grid gap-4 xl:grid-cols-3">
//       <ChartCard title={t.chartGrowth} hint={t.chartGrowthHint} className="xl:col-span-2" delay={0}>
//         <ChartCanvas type="line" data={growthData} options={axisOptions} label={t.growthAlt} />
//       </ChartCard>
//       <ChartCard title={t.chartStatus} hint={t.customersLabel} delay={80}>
//         <ChartCanvas type="doughnut" data={statusData} options={statusOptions} plugins={DOUGHNUT_PLUGINS} label={t.statusAlt} />
//       </ChartCard>
//       <ChartCard title={t.chartCountries} hint={t.chartCountriesHint} className="xl:col-span-3" delay={160}>
//         <ChartCanvas type="bar" data={countriesData} options={axisOptions} label={t.countriesAlt} />
//       </ChartCard>
//     </div>
//   );
// }