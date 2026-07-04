// ============================================================
// RAWBY — app shell. Slim top bar (logo + profile / settings / admin)
// and a floating liquid-glass dock at the bottom for the 6 core
// destinations. Hosts the aurora background, grain, animated routes.
// ============================================================
import { Suspense, useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Spinner } from "../ui/Bits";
import { FilmGrain } from "../ui/FilmGrain";
import { AuroraBuddy } from "../ui/AuroraBuddy";
import { AuroraPanel } from "../aurora/AuroraPanel";
import { CommandPalette } from "../CommandPalette";
import { ThemeBackground } from "../ui/ThemeBackground";
import { Icon, type IconName } from "../ui/Icon";
import { Logo } from "../ui/Logo";
import { ModeToggle } from "../ui/ThemeControls";
import { Onboarding } from "../Onboarding";
import { Dock } from "./Dock";
import { SideNav } from "./SideNav";
import { NAV_ITEMS } from "./nav";
import { useAuth } from "../../store/auth";
import { useSettings } from "../../store/settings";

// ⌘ on Apple hardware, Ctrl everywhere else.
const IS_MAC =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? "");
export const PALETTE_KEY_LABEL = IS_MAC ? "⌘K" : "Ctrl K";

function TopIcon({ to, icon, label }: { to: string; icon: IconName; label: string }) {
  return (
    <NavLink
      to={to}
      title={label}
      aria-label={label}
      className={({ isActive }) =>
        `flex h-9 w-9 items-center justify-center rounded-full border border-hairline transition-colors ${
          isActive ? "bg-glass-hover text-cinema-500" : "text-text-dim hover:bg-glass hover:text-text-hi"
        }`
      }
    >
      <Icon name={icon} size={18} />
    </NavLink>
  );
}

export function Shell() {
  const location = useLocation();
  const user = useAuth((s) => s.user);
  const initial = user?.displayName?.[0]?.toUpperCase() ?? "?";
  const [auroraOpen, setAuroraOpen] = useState(false);
  const leftNav = useSettings((s) => s.navSide) === "left";
  const shift = leftNav ? "md:pl-[64px]" : "";

  // The full studio page supersedes the mini panel.
  useEffect(() => {
    if (location.pathname === "/assistant") setAuroraOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen">
      <ThemeBackground />
      <FilmGrain />
      <Onboarding />

      {/* Left rail (opt-in, desktop) — collapsed icons, hover types the names */}
      {leftNav && <SideNav items={NAV_ITEMS} />}

      {/* Wide top dock — glass bar matching the bottom dock */}
      <header className={`sticky top-0 z-nav px-3 pt-3 md:px-5 md:pt-4 ${shift}`}>
        <div className="dock mx-auto flex w-full max-w-6xl items-center justify-between rounded-[22px] border border-white/[0.07] bg-[rgb(var(--dock))] px-3 py-2 md:px-4">
          <Logo size="md" />
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
              title={`Command palette (${PALETTE_KEY_LABEL})`}
              aria-label="Open command palette"
              className="hidden h-9 items-center gap-1.5 rounded-lg border border-hairline bg-chip px-2.5 text-[11px] font-semibold text-text-dim transition-colors hover:text-text-hi md:flex"
            >
              <kbd className="tracking-wide">{PALETTE_KEY_LABEL}</kbd>
            </button>
            <ModeToggle />
            <TopIcon to="/settings" icon="settings" label="Settings" />
            {user?.isAdmin && <TopIcon to="/admin" icon="shield" label="Admin" />}
            {user && (
              <NavLink to="/profile" aria-label="Profile" title={user.displayName} className="ml-1">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cinema-500 to-cinema-700 text-sm font-bold text-[#16161a] ring-1 ring-cinema-500/20">
                  {initial}
                </span>
              </NavLink>
            )}
          </div>
        </div>
      </header>

      {/* Routed content — page chunks load inside the shell (dock stays put) */}
      <AnimatePresence mode="wait">
        <div key={location.pathname} className={`relative z-base ${shift}`}>
          <Suspense
            fallback={
              <div className="flex min-h-[50vh] items-center justify-center">
                <Spinner />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </AnimatePresence>

      {/* Bottom dock — always on phones; on desktop only when the rail is off */}
      <Dock items={NAV_ITEMS} className={leftNav ? "md:hidden" : ""} />

      {/* Aurora — chat head + pinned panel (her only entry; not in the dock) */}
      <AuroraBuddy open={auroraOpen} onToggle={() => setAuroraOpen((o) => !o)} />
      <AuroraPanel open={auroraOpen} onClose={() => setAuroraOpen(false)} />

      {/* ⌘K — jump anywhere */}
      <CommandPalette />
    </div>
  );
}
