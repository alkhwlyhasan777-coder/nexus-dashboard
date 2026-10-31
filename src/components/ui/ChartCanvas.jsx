import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

Chart.defaults.font.family = "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif";

/*
  Thin Chart.js wrapper. Give the parent a height (e.g. h-64); the chart fills it.
  `data` and `options` update the chart in place; `type` and `plugins` are read once per type.
  `label` is the text alternative for screen readers.
*/
export default function ChartCanvas({ type, data, options, plugins, label }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const first = useRef(true);

  useEffect(() => {
    chartRef.current = new Chart(canvasRef.current, { type, data, options, plugins });
    first.current = true;
    return () => { chartRef.current?.destroy(); chartRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const chart = chartRef.current;
    if (!chart) return;
    chart.data = data;
    chart.options = options;
    chart.update();
  }, [data, options]);

  return (
    <div className="relative size-full">
      <canvas ref={canvasRef} role="img" aria-label={label}>{label}</canvas>
    </div>
  );
}