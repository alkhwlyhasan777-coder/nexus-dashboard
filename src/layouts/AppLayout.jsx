import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar, { mainOffset } from "../components/ui/Sidebar";
import Navbar from "../components/layout/navbar/Navbar";
import { canvas, text } from "../components/ui/tokens";
import { useUI } from "../context/UIcontext";
import { useAuth } from "../context/AuthContext";

export const pathFor = (id) => (id === "dashboard" ? "/" : `/${id}`);
const SKIP = { en: "Skip to content", ar: "تخطَّ إلى المحتوى" };

export default function AppLayout() {
  const { lang, toggleLang, collapsed, toggleCollapsed, mobileOpen, openMobile, closeMobile } = useUI();
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeId = pathname.split("/")[1] || "dashboard";
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Account";

  async function handleSignOut() {
    const { error } = await signOut();
    if (error) console.error("Sign out failed:", error.message);
    else navigate("/login", { replace: true });
  }

  return (
    <div className={`min-h-screen ${canvas} ${text.base}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg dark:focus:bg-neutral-900">{SKIP[lang]}</a>
      <Sidebar lang={lang} activeId={activeId} onSelect={(id) => navigate(pathFor(id))} collapsed={collapsed} onToggleCollapse={toggleCollapsed} isOpen={mobileOpen} onClose={closeMobile} />
      <div className={mainOffset(collapsed)}>
        <Navbar lang={lang} onToggleLang={toggleLang} collapsed={collapsed} onCollapse={toggleCollapsed} onOpenSidebar={openMobile} user={{ name: displayName, role: user?.email || "Member" }} hasUnread onCreate={() => navigate("/deals?new=1")} onSignOut={handleSignOut} />
        <main id="main" tabIndex={-1} className="px-3 pb-6 pt-1 outline-none md:px-6"><Outlet /></main>
      </div>
    </div>
  );
}
