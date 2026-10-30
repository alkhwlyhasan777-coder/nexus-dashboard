import { TEXT } from "../../components/ui/Sidebar";
import { muted } from "../../components/ui/tokens";
import { useUI } from "../../context/UIcontext";
 
const MSG = { en: "This page is ready to build.", ar: "هذه الصفحة جاهزة للبناء." };
 
export default function Placeholder({ id }) {
  const { lang } = useUI();
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
      <h2 className="text-lg font-semibold">{TEXT[lang][id] ?? id}</h2>
      <p className={`mt-1 text-sm ${muted}`}>{MSG[lang]}</p>
    </div>
  );
}
 