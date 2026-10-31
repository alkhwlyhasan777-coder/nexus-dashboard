/* Wraps the first match of `query` inside `text` in a <mark>. Renders plain text when there is no match. */
export default function Highlight({ text, query }) {
  const q = (query ?? "").trim();
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-yellow-200/70 px-0.5 text-inherit dark:bg-yellow-400/30">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}