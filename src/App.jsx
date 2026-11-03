import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { FOOTER_MENU, MENU } from "./components/ui/Sidebar";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import DealsLayout from "./pages/Deals/DealsLayout";
import LeadsLayout from "./pages/Leads/LeadsLayout";
import { useUI } from "./context/UIcontext";

const Login = lazy(() => import("./pages/Auth/Login"));
const Signup = lazy(() => import("./pages/Auth/Signup"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));
const Security = lazy(() => import("./pages/Settings/Security"));
const Customers = lazy(() => import("./pages/Customers/Customers"));
const Deals = lazy(() => import("./pages/Deals/Deals"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Placeholder = lazy(() => import("./pages/Dashboard/Placeholder"));
const LeadPage = lazy(() => import("./pages/Leads/LeadPage"));
const Leads = lazy(() => import("./pages/Leads/Leads"));
const Pipeline = lazy(() => import("./pages/Pipeline/Pipeline"));
const Tasks = lazy(() => import("./pages/Tasks/Tasks"));
const Analytics = lazy(() => import("./pages/Analytics/Analytics"));
const Revenue = lazy(() => import("./pages/Revenue/Revenue"));
const Automation = lazy(() => import("./pages/Automation/Automation"));
const Reports = lazy(() => import("./pages/Reports/Reports"));

const PAGES = { customers: Customers, tasks: Tasks, revenue: Revenue, automation: Automation };
const ids = [...MENU.flatMap((g) => g.items), ...FOOTER_MENU]
  .map((item) => item.id)
  .filter((id) => !["dashboard", "leads", "deals", "pipeline", "analytics", "revenue", "reports", "forecast"].includes(id))
  .concat("upgrade", "pages");

function PageFallback() {
  const { lang } = useUI();
  const label = lang === "ar" ? "جارٍ تحميل الصفحة..." : "Loading page…";
  return <div className="grid min-h-56 place-items-center rounded-2xl border border-neutral-200 bg-white text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400" role="status" aria-live="polite"><span className="flex items-center gap-2"><span className="size-4 animate-spin rounded-full border-2 border-current border-e-transparent motion-reduce:animate-none" aria-hidden="true" />{label}</span></div>;
}

export default function App() {
  return <Suspense fallback={<PageFallback />}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="settings/security" element={<Security />} />
          <Route path="leads" element={<LeadsLayout />}>
            <Route index element={<Leads />} />
            <Route path=":leadId" element={<LeadPage />} />
          </Route>
          <Route element={<DealsLayout />}>
            <Route path="deals" element={<Deals />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="reports" element={<Reports />} />
            <Route path="forecast" element={<Reports />} />
          </Route>
          {ids.map((id) => {
            const Page = PAGES[id];
            return <Route key={id} path={id} element={Page ? <Page /> : <Placeholder id={id} />} />;
          })}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>;
}
