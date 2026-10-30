import { Navigate, Route, Routes } from "react-router-dom";
import { FOOTER_MENU, MENU } from "./components/ui/Sidebar";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Placeholder from "./pages/Dashboard/Placeholder";
// import Navbar from "./components/layout/navbar/Navbar";

/* Real pages go here. Any menu id not listed falls back to <Placeholder />.
   import Leads from "./pages/Leads";  ->  const PAGES = { leads: Leads }; */
const PAGES = {};

// Routes are generated from the same menu data the sidebar uses,
// so adding a menu item automatically adds its route.
const ids = [...MENU.flatMap((g) => g.items), ...FOOTER_MENU]
  .map((i) => i.id)
  .filter((id) => id !== "dashboard");

export default function App() {
  return (
    <>
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        {ids.map((id) => {
          const Page = PAGES[id];
          return <Route key={id} path={id} element={Page ? <Page /> : <Placeholder id={id} />} />;
        })}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    </>
  );
}
