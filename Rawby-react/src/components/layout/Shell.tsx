// ============================================================
// RAWBY — app shell. Slim top bar (logo + controls) + a floating
// liquid-glass dock at the bottom for navigation. Hosts the aurora
// background, grain, and animated routes.
// ============================================================
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { FilmGrain } from "../ui/FilmGrain";
import { AuroraBackground } from "../ui/AuroraBackground";
import { Logo } from "../ui/Logo";
import { ModeToggle } from "../ui/ThemeControls";
import { Onboarding } from "../Onboarding";
import { Dock } from "./Dock";
import { NAV_ITEMS, SECONDARY_ITEMS, ADMIN_ITEM, type NavItem } from "./nav";
import { useAuth } from "../../store/auth";

function Avatar({ initial }: { initial: string }) {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cinema-300 to-cinema-600 text-sm font-bold text-[#16161a] ring-1 ring-cinema-300/30">
      {initial}
    </div>
  );
}

export function Shell() {
  const location = useLocation();
  const user = useAuth((s) => s.user);
  const navItems: NavItem[] = [
    ...NAV_ITEMS,
    ...SECONDARY_ITEMS,
    ...(user?.isAdmin ? [ADMIN_ITEM] : []),
  ];
  const initial = user?.displayName?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <FilmGrain />
      <Onboarding />

      {/* Slim top bar */}
      <header className="sticky top-0 z-nav flex items-center justify-between border-b border-hairline/60 bg-[rgb(var(--bg)/0.55)] px-4 py-3 backdrop-blur-xl md:px-8">
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <ModeToggle />
          {user && (
            <NavLink to="/profile" aria-label="Profile" title={user.displayName}>
              <Avatar initial={initial} />
            </NavLink>
          )}
        </div>
      </header>

      {/* Routed content */}
      <AnimatePresence mode="wait">
        <div key={location.pathname} className="relative z-base">
          <Outlet />
        </div>
      </AnimatePresence>

      {/* Floating liquid-glass dock */}
      <Dock items={navItems} />
    </div>
  );
}
