import { useState } from "react";
import useElementWidth from "../../../hooks/useElementWidth";
import Icon from "../../layout/navbar/Icon";
import IconButton from "../../layout/navbar/IconButton";
import { accent, canvas, card, focusRing, hairline, hoverBg, muted } from "../../ui/tokens";
import Avatar from "../../layout/navbar/Avatar";
import Dropdown from "./Dropdown";
import SearchBox from "../../layout/navbar/SearchBox";
// import { DesktopNav, MobileNav, SubLink } from "../../layout/navbar/NavMenu";
import { NAV_BREAKPOINTS, NAV_TEXT, USER_MENU } from "./navbar.config";
export default function Navbar({
  lang = "en", onToggleLang, theme = "light", onToggleTheme,
  collapsed = false, onCollapse, onOpenSidebar,
  user = USER_MENU, text = NAV_TEXT, breakpoints = NAV_BREAKPOINTS,
  hasUnread = false, onNotifications, onCreate, onSearch, onSignOut,
}) {
  const t = text[lang];
  const [ref, width] = useElementWidth();
  const [searchOpen, setSearchOpen] = useState(false);
 
  // const showLinks = width >= breakpoints.inlineLinks;
  const wideSearch = width >= breakpoints.wideSearch;
  const showSearch = width >= breakpoints.inlineSearch;
  const showUserText = width >= breakpoints.userText;
  const showCreateLabel = width >= breakpoints.createLabel;
 
  return (
    <div className={`sticky top-0 z-10 px-3 py-3 md:px-6 ${canvas}`}>
      <header ref={ref} className={`${card} px-3 md:px-4`}>
        <div className="flex h-14 items-center gap-2">
          <IconButton label={t.openSidebar} onClick={onOpenSidebar} className="md:hidden">
            <Icon name="menu" size={18} />
          </IconButton>
          <IconButton label={t.toggleSidebar} onClick={onCollapse} className="hidden md:grid">
            <Icon
              name="chevronLeft"
              size={18}
              className={`transition-transform duration-200 ${collapsed ? "rotate-180 rtl:rotate-0" : "rtl:rotate-180"}`}
            />
          </IconButton>
          <div className="ms-auto flex items-center gap-2">
            {showSearch ? (
              <>
                <SearchBox
                  label={t.search}
                  placeholder={t.searchPlaceholder}
                  onSearch={onSearch}
                  shortcut={wideSearch ? "/" : undefined}
                  className={wideSearch ? "w-64" : "w-48"}
                />
                <span aria-hidden="true" className="mx-1 h-6 w-px bg-neutral-200 dark:bg-neutral-800" />
              </>
            ) : (
              <IconButton label={t.search} aria-expanded={searchOpen} onClick={() => setSearchOpen((o) => !o)}>
                <Icon name="search" size={18} />
              </IconButton>
            )}
 
            <button
              type="button"
              onClick={onCreate}
              aria-label={t.create}
              className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-200 ${accent.solid} ${focusRing}`}
            >
              <Icon name="plusCircle" size={16} />
              {showCreateLabel && <span>{t.create}</span>}
            </button>
 
            <IconButton label={lang === "ar" ? (theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن") : (theme === "dark" ? "Switch to light mode" : "Switch to dark mode")} onClick={onToggleTheme}>
              <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
            </IconButton>

            <IconButton label={t.switchLang} onClick={onToggleLang}>
              <Icon name="globe" size={19} />
            </IconButton>
 
            <IconButton
              label={hasUnread ? `${t.notifications} (${t.unread})` : t.notifications}
              badge={hasUnread}
              onClick={onNotifications}
            >
              <Icon name="bell" size={18} />
            </IconButton>
 
            {user && (
              <Dropdown
                align="end"
                trigger={({ toggle, props }) => (
                  <button
                    type="button"
                    onClick={toggle}
                    {...props}
                    aria-label={`${t.account}: ${user.name}`}
                    className={`flex items-center gap-2.5 rounded-lg p-1 transition-colors duration-200 ${hoverBg} ${focusRing}`}
                  >
                    {showUserText && (
                      <span className="text-end leading-tight">
                        <span className="block text-[13px] font-medium">{user.name}</span>
                        <span className={`block text-[11px] ${muted}`}>{user.role}</span>
                      </span>
                    )}
                    <Avatar name={user.name} src={user.avatar} />
                  </button>
                )}
              >
                <div className="space-y-1 p-1">
                  <a href="/settings/security" className="block rounded-lg px-3 py-2 text-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-800">{lang === "ar" ? "إعدادات الأمان" : "Security settings"}</a>
                  <button type="button" onClick={onSignOut} className="w-full rounded-lg px-3 py-2 text-start text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">{lang === "ar" ? "تسجيل الخروج" : "Sign out"}</button>
                </div>
              </Dropdown>
            )}
          </div>
        </div>
            {searchOpen && !showSearch && (
          <div className={`border-t py-3 ${hairline}`}>
            <SearchBox label={t.search} placeholder={t.searchPlaceholder} onSearch={onSearch} autoFocus />
          </div>
        )}
      </header>
    </div>
  );
}