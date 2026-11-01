import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar, { mainOffset } from "../components/ui/Sidebar";
import Navbar from "../components/layout/navbar/Navbar";
import { canvas, text } from "../components/ui/tokens";
import { useUI } from "../context/UIcontext";

export const pathFor = (id) => (id === "dashboard" ? "/" : `/${id}`);

// Replace with your real signed-in user
const USERS = {
  en: { name: "John Doe", role: "Admin" },
  ar: { name: "جون دو", role: "مسؤول" },
};
const SKIP = { en: "Skip to content", ar: "تخطَّ إلى المحتوى" };

export default function AppLayout() {
  const { lang, toggleLang, collapsed, toggleCollapsed, mobileOpen, openMobile, closeMobile } = useUI();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // The URL is the source of truth for which sidebar item is active
  const activeId = pathname.split("/")[1] || "dashboard";

  return (
    <div className={`min-h-screen ${canvas} ${text.base}`}>
      {/* Keyboard users can jump past the sidebar and navbar */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg dark:focus:bg-neutral-900"
      >
        {SKIP[lang]}
      </a>

      <Sidebar
        lang={lang}
        activeId={activeId}
        onSelect={(id) => navigate(pathFor(id))}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
        isOpen={mobileOpen}
        onClose={closeMobile}
      />
      <div className={mainOffset(collapsed)}>
        <Navbar
          lang={lang}
          onToggleLang={toggleLang}
          collapsed={collapsed}
          onCollapse={toggleCollapsed}
          onOpenSidebar={openMobile}
          user={USERS[lang]}
          hasUnread
          onCreate={() => navigate("/deals?new=1")}
        />
        <main id="main" tabIndex={-1} className="px-3 pb-6 pt-1 outline-none md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// import { Outlet, useLocation, useNavigate } from "react-router-dom";
// import Sidebar, { mainOffset } from "../components/ui/Sidebar";
// import Navbar from "../components/layout/navbar/Navbar";
// import { canvas, text } from "../components/ui/tokens";
// import { useUI } from "../context/UIcontext";
 
// export const pathFor = (id) => (id === "dashboard" ? "/" : `/${id}`);
 
// // Replace with your real signed-in user
// const USERS = {
//   en: { name: "John Doe", role: "Admin" },
//   ar: { name: "جون دو", role: "مسؤول" },
// };
// const SKIP = { en: "Skip to content", ar: "تخطَّ إلى المحتوى" };
 
// export default function AppLayout() {
//   const { lang, toggleLang, collapsed, toggleCollapsed, mobileOpen, openMobile, closeMobile } = useUI();
//   const { pathname } = useLocation();
//   const navigate = useNavigate();
 
//   // The URL is the source of truth for which sidebar item is active
//   const activeId = pathname.split("/")[1] || "dashboard";
 
//   return (
//     <div className={`min-h-screen ${canvas} ${text.base}`}>
//       {/* Keyboard users can jump past the sidebar and navbar */}
//       <a
//         href="#main"
//         className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg dark:focus:bg-neutral-900"
//       >
//         {SKIP[lang]}
//       </a>
 
//       <Sidebar
//         lang={lang}
//         activeId={activeId}
//         onSelect={(id) => navigate(pathFor(id))}
//         collapsed={collapsed}
//         onToggleCollapse={toggleCollapsed}
//         isOpen={mobileOpen}
//         onClose={closeMobile}
//       />
//       <div className={mainOffset(collapsed)}>
//         <Navbar
//           lang={lang}
//           onToggleLang={toggleLang}
//           collapsed={collapsed}
//           onCollapse={toggleCollapsed}
//           onOpenSidebar={openMobile}
//           user={USERS[lang]}
//           hasUnread
//           onCreate={() => navigate("/deals")}
//         />
//         <main id="main" tabIndex={-1} className="px-3 pb-6 pt-1 outline-none md:px-6">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }

