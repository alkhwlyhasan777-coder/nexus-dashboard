import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { FOOTER_MENU, MENU } from "./components/ui/Sidebar";
import AppLayout from "./layouts/AppLayout";
import DealsLayout from "./pages/Deals/DealsLayout";
import LeadsLayout from "./pages/Leads/LeadsLayout";
import { useUI } from "./context/UIcontext";

const Customers = lazy(() => import("./pages/Customers/Customers"));
const Deals = lazy(() => import("./pages/Deals/Deals"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Placeholder = lazy(() => import("./pages/Dashboard/Placeholder"));
const LeadPage = lazy(() => import("./pages/Leads/LeadPage"));
const Leads = lazy(() => import("./pages/Leads/Leads"));
const Pipeline = lazy(() => import("./pages/Pipeline/Pipeline"));
const Tasks = lazy(() => import("./pages/Tasks/Tasks"));

/* Real pages go here. Any menu id not listed falls back to <Placeholder />. */
const PAGES = { customers: Customers, tasks: Tasks };

// Routes are generated from the same menu data the sidebar uses,
// so adding a menu item automatically adds its route. (Leads, Deals and Pipeline share data through layouts.)
const ids = [...MENU.flatMap((g) => g.items), ...FOOTER_MENU]
  .map((i) => i.id)
  .filter((id) => !["dashboard", "leads", "deals", "pipeline"].includes(id))
  .concat("upgrade", "pages");

function PageFallback() {
  const { lang } = useUI();
  const label = lang === "ar" ? "جارٍ تحميل الصفحة..." : "Loading page…";

  return (
    <div
      className="grid min-h-56 place-items-center rounded-2xl border border-neutral-200 bg-white text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
      role="status"
      aria-live="polite"
    >
      <span className="flex items-center gap-2">
        <span className="size-4 animate-spin rounded-full border-2 border-current border-e-transparent motion-reduce:animate-none" aria-hidden="true" />
        {label}
      </span>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="leads" element={<LeadsLayout />}>
            <Route index element={<Leads />} />
            <Route path=":leadId" element={<LeadPage />} />
          </Route>

          {/* Deals and Pipeline use ONE shared store, so a change on one page is on the other */}
          <Route element={<DealsLayout />}>
            <Route path="deals" element={<Deals />} />
            <Route path="pipeline" element={<Pipeline />} />
          </Route>

          {ids.map((id) => {
            const Page = PAGES[id];
            return <Route key={id} path={id} element={Page ? <Page /> : <Placeholder id={id} />} />;
          })}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
