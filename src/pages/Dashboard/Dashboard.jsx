import { useUI } from "../../context/UIcontext";
import { LANGS } from "../../components/ui/Sidebar";
import { card, muted } from "../../components/ui/tokens";
 
const T = {
  en: { sample: "Sample data. Replace it with your API data.", deals: "Open deals", leads: "New leads", revenue: "Revenue", tasks: "Tasks due" },
  ar: { sample: "بيانات تجريبية. استبدلها ببيانات الـ API الخاصة بك.", deals: "الصفقات المفتوحة", leads: "عملاء محتملون جدد", revenue: "الإيرادات", tasks: "مهام مستحقة" },
};
 
export default function Dashboard() {
  const { lang } = useUI();
  const t = T[lang];
  const n = new Intl.NumberFormat(LANGS[lang].locale);
  const money = new Intl.NumberFormat(LANGS[lang].locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
 
  const stats = [
    [t.deals, n.format(48)],
    [t.leads, n.format(126)],
    [t.revenue, money.format(82400)],
    [t.tasks, n.format(20)],
  ];
 
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className={`${card} p-4`}>
            <p className={`text-sm ${muted}`}>{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <p className={`text-sm ${muted}`}>{t.sample}</p>
    </div>
  );
}