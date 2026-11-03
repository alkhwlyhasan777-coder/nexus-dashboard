import { useState } from "react";
import useElementWidth from "../../../hooks/useElementWidth";
import Icon from "../../layout/navbar/Icon";
import IconButton from "../../layout/navbar/IconButton";
import { accent, canvas, card, focusRing, hairline, hoverBg, muted } from "../../ui/tokens";
import Avatar from "../../layout/navbar/Avatar";
import Dropdown from "./Dropdown";
import Flag from "../../layout/navbar/Flag";
import SearchBox from "../../layout/navbar/SearchBox";
// import { DesktopNav, MobileNav, SubLink } from "../../layout/navbar/NavMenu";
import { NAV_BREAKPOINTS, NAV_TEXT, USER_MENU } from "./navbar.config";
export default function Navbar({
  lang = "en", onToggleLang,
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
 
            <IconButton label={t.switchLang} onClick={onToggleLang}>
              <Flag lang={lang} />
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