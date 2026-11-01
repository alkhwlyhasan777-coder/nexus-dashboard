import { T as DEALS } from "../Deals/deals.i18n";

/* The Pipeline page reuses every Deals string (stages, cards, forms) and adds its own */
export const T = {
  en: {
    ...DEALS.en,
    pipelineTitle: "Pipeline", pipelineSubtitle: "Track every deal across your sales stages. Drag a card to another column to update it.",
    ownerFilter: "Owner", allOwners: "All owners", statusFilter: "Status", allStatuses: "All statuses",
    status_open: "Open", status_won: "Won", status_lost: "Lost", status_overdue: "Overdue", status_attention: "Needs attention",
    summaryOpen: "Open value", summaryDeals: "Open deals", summaryOverdue: "Overdue",
    funnelLabel: "Open pipeline by stage", funnelEmpty: "No open deals to show",
    resultCount: (n, total) => `${n} of ${total} deals`,
    emptyPipeline: "Your pipeline is empty", emptyPipelineHint: "Create a deal and it will appear in the first stage. Deals from the Deals page show up here automatically.", goToDeals: "Go to Deals",
  },
  ar: {
    ...DEALS.ar,
    pipelineTitle: "مسار المبيعات", pipelineSubtitle: "تابع كل صفقة عبر مراحل البيع. اسحب البطاقة إلى عمود آخر لتحديثها.",
    ownerFilter: "المسؤول", allOwners: "كل المسؤولين", statusFilter: "الحالة", allStatuses: "كل الحالات",
    status_open: "مفتوحة", status_won: "ناجحة", status_lost: "خاسرة", status_overdue: "متأخرة", status_attention: "تحتاج إلى مراجعة",
    summaryOpen: "القيمة المفتوحة", summaryDeals: "الصفقات المفتوحة", summaryOverdue: "المتأخرة",
    funnelLabel: "المسار المفتوح حسب المرحلة", funnelEmpty: "لا توجد صفقات مفتوحة لعرضها",
    resultCount: (n, total) => `${n} من ${total} صفقة`,
    emptyPipeline: "مسار المبيعات فارغ", emptyPipelineHint: "أنشئ صفقة وستظهر في المرحلة الأولى. الصفقات الموجودة في صفحة الصفقات تظهر هنا تلقائيًا.", goToDeals: "الانتقال إلى الصفقات",
  },
};