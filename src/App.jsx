import { Navigate, Route, Routes } from "react-router-dom";
import { FOOTER_MENU, MENU } from "./components/ui/Sidebar";
import AppLayout from "./layouts/AppLayout";
import Customers from "./pages/Customers/Customers";
import Dashboard from "./pages/Dashboard/Dashboard";
import Placeholder from "./pages/Dashboard/Placeholder";


import LeadPage from "./pages/Leads/LeadPage";
import Leads from "./pages/Leads/Leads";
import LeadsLayout from "./pages/Leads/LeadsLayout";

/* Real pages go here. Any menu id not listed falls back to <Placeholder />. */
const PAGES = { customers: Customers };

// Routes are generated from the same menu data the sidebar uses,
// so adding a menu item automatically adds its route. (Leads has nested routes, so it is declared below.)
const ids = [...MENU.flatMap((g) => g.items), ...FOOTER_MENU]
  .map((i) => i.id)
  .filter((id) => id !== "dashboard" && id !== "leads")
  .concat("upgrade", "pages");

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />

        <Route path="leads" element={<LeadsLayout />}>
          <Route index element={<Leads />} />
          <Route path=":leadId" element={<LeadPage />} />
        </Route>

        {ids.map((id) => {
          const Page = PAGES[id];
          return <Route key={id} path={id} element={Page ? <Page /> : <Placeholder id={id} />} />;
        })}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
// import { lazy, Suspense } from "react";
// import { Navigate, Route, Routes } from "react-router-dom";
// import Leads from "./pages/Leads/Leads";
// import { FOOTER_MENU, MENU } from "./components/ui/Sidebar";
// import AppLayout from "./layouts/AppLayout";

// // Lazy-loaded pages
// const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
// const Customers = lazy(() => import("./pages/Customers/Customers"));
// const Placeholder = lazy(() => import("./pages/Dashboard/Placeholder"));

// const PAGES = {
//   customers: Customers,
//   leads: Leads
// };

// // Generate routes from sidebar menu data
// const ids = [...MENU.flatMap((g) => g.items), ...FOOTER_MENU]
//   .map((item) => item.id)
//   .filter((id) => id !== "dashboard")
//   .concat("upgrade", "pages");

// function PageLoader() {
//   return (
//     <div className="flex min-h-[300px] items-center justify-center">
//       <div className="flex items-center gap-3">
//         <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
//         <span className="text-sm text-neutral-500">
//           Loading page...
//         </span>
//       </div>
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <Suspense fallback={<PageLoader />}>
//       <Routes>
//         <Route element={<AppLayout />}>
//           <Route index element={<Dashboard />} />

//           {ids.map((id) => {
//             const Page = PAGES[id];

//             return (
//               <Route
//                 key={id}
//                 path={id}
//                 element={
//                   Page ? <Page /> : <Placeholder id={id} />
//                 }
//               />
//             );
//           })}

//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Route>
//       </Routes>
//     </Suspense>
//   );
// }

































// import { Navigate, Route, Routes } from "react-router-dom";
// import { FOOTER_MENU, MENU } from "./components/ui/Sidebar";
// import AppLayout from "./layouts/AppLayout";
// import Customers from "./pages/Customers/Customers";
// import Dashboard from "./pages/Dashboard/Dashboard";
// import Leads from "./pages/Leads/Leads";
// import Placeholder from "./pages/Dashboard/Placeholder";

// /* Real pages go here. Any menu id not listed falls back to <Placeholder />. */
// const PAGES = { customers: Customers, leads: Leads };

// // Routes are generated from the same menu data the sidebar uses,
// // so adding a menu item automatically adds its route.
// const ids = [...MENU.flatMap((g) => g.items), ...FOOTER_MENU]
//   .map((i) => i.id)
//   .filter((id) => id !== "dashboard")
//   .concat("upgrade", "pages");

// export default function App() {
//   return (
//     <Routes>
//       <Route element={<AppLayout />}>
//         <Route index element={<Dashboard />} />
//         {ids.map((id) => {
//           const Page = PAGES[id];
//           return <Route key={id} path={id} element={Page ? <Page /> : <Placeholder id={id} />} />;
//         })}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Route>
//     </Routes>
//   );
// }