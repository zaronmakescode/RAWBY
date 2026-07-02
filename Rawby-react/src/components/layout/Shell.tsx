// ============================================================
// RAWBY — app shell. Slim top bar (logo + profile / settings / admin)
// and a floating liquid-glass dock at the bottom for the 6 core
// destinations. Hosts the aurora background, grain, animated routes.
// ============================================================
import { Suspense } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Spinner } from "../ui/Bits";
import { FilmGrain } from "../ui/FilmGrain";
import { AuroraBuddy } from "../ui/AuroraBuddy";
import { CommandPalette } from "../CommandPalette";
import { ThemeBackground } from "../ui/ThemeBackground";
import { Icon, type IconName } from "../ui/Icon";
import { Logo } from "../ui/Logo";
import { ModeToggle } from "../ui/ThemeControls";
import { Onboarding } from "../Onboarding";
import { Dock } from "./Dock";
import { NAV_ITEMS } from "./nav";
import { useAuth } from "../../store/auth";

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

  return (
    <div className="relative min-h-screen">
      <ThemeBackground />
      <FilmGrain />
      <Onboarding />

      {/* Wide top dock — glass bar matching the bottom dock */}
      <header className="sticky top-0 z-nav px-3 pt-3 md:px-5 md:pt-4">
        <div className="dock mx-auto flex w-full max-w-6xl items-center justify-between rounded-[22px] border border-white/[0.07] bg-[rgb(var(--dock))] px-3 py-2 md:px-4">
          <Logo size="md" />
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
              title="Command palette (Ctrl+K)"
              aria-label="Open command palette"
              className="hidden h-9 items-center gap-1.5 rounded-lg border border-hairline bg-chip px-2.5 text-[11px] font-semibold text-text-dim transition-colors hover:text-text-hi md:flex"
            >
              <Icon name="sparkles" size={13} />
              <kbd className="tracking-wide">⌘K</kbd>
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
        <div key={location.pathname} className="relative z-base">
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

      {/* Floating liquid-glass dock — core destinations */}
      <Dock items={NAV_ITEMS} />

      {/* Aurora's chat head — eyes on you, one tap away */}
      <AuroraBuddy />

      {/* ⌘K — jump anywhere */}
      <CommandPalette />
    </div>
  );
}
